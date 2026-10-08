import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import path from "path";
import { GoogleGenAI, type ContentListUnion } from "@google/genai";
import {
  FOOD_SYSTEM_INSTRUCTION,
  IMAGE_SYSTEM_INSTRUCTION,
  MEAL_PLAN_PROMPTS,
  MEAL_PLAN_SYSTEM_INSTRUCTION,
  imagePrompt,
} from "./prompts";

const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const MAX_FOOD_LENGTH = 200;
const MAX_NOTES_LENGTH = 500;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_PER_MINUTE) || 20;

class MissingApiKeyError extends Error {}

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new MissingApiKeyError("GEMINI_API_KEY is not set");
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function generate(contents: ContentListUnion, systemInstruction: string, temperature: number) {
  const response = await getAi().models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config: { systemInstruction, temperature },
  });
  return response.text;
}

function sendGeminiError(res: Response, error: unknown, label: string, message: string) {
  if (error instanceof MissingApiKeyError) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
  }
  console.error(`Error calling Gemini API (${label}):`, error);
  res.status(500).json({ error: message });
}

// Simple fixed-window, per-IP rate limiter to protect the Gemini quota.
const hits = new Map<string, { count: number; resetAt: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of hits) if (entry.resetAt <= now) hits.delete(ip);
}, RATE_LIMIT_WINDOW_MS).unref();

function rateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || "unknown";
  const now = Date.now();
  let entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    hits.set(ip, entry);
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
    return res.status(429).json({ error: "عدد الطلبات كبير جداً. يرجى الانتظار دقيقة ثم المحاولة مرة أخرى." });
  }
  next();
}

const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

async function startServer() {
  const app = express();

  app.disable("x-powered-by");
  // Behind Traefik / a reverse proxy: trust the first hop so req.ip is the client IP.
  app.set("trust proxy", 1);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api", express.json({ limit: "8mb" }));

  // API route for image / label evaluation
  app.post("/api/evaluate-image", rateLimit, async (req, res) => {
    const { imageBase64, mimeType, userNotes } = req.body ?? {};

    if (!isNonEmptyString(imageBase64)) {
      return res.status(400).json({ error: "Image data is required" });
    }
    const type = typeof mimeType === "string" && mimeType ? mimeType : "image/jpeg";
    if (!ALLOWED_IMAGE_TYPES.has(type)) {
      return res.status(400).json({ error: "نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP." });
    }
    if (userNotes !== undefined && (typeof userNotes !== "string" || userNotes.length > MAX_NOTES_LENGTH)) {
      return res.status(400).json({ error: `الملاحظات يجب ألا تتجاوز ${MAX_NOTES_LENGTH} حرف.` });
    }

    try {
      // Clean base64 string if it contains data URI prefix
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9.+-]+;base64,/i, "");
      const result = await generate(
        [{ inlineData: { data: cleanBase64, mimeType: type } }, imagePrompt(userNotes?.trim())],
        IMAGE_SYSTEM_INSTRUCTION,
        0.2,
      );
      res.json({ result });
    } catch (error) {
      sendGeminiError(res, error, "image", "فشل فحص الصورة بواسطة المساعد الذكي. تأكد من وضوح الصورة وجدول المكونات.");
    }
  });

  // API route for food evaluation
  app.post("/api/evaluate", rateLimit, async (req, res) => {
    const { food } = req.body ?? {};

    if (!isNonEmptyString(food)) {
      return res.status(400).json({ error: "Food name is required" });
    }
    if (food.length > MAX_FOOD_LENGTH) {
      return res.status(400).json({ error: `اسم الأكلة يجب ألا يتجاوز ${MAX_FOOD_LENGTH} حرف.` });
    }

    try {
      // Low temperature for more deterministic/factual clinical answers
      const result = await generate(food.trim(), FOOD_SYSTEM_INSTRUCTION, 0.2);
      res.json({ result });
    } catch (error) {
      sendGeminiError(res, error, "evaluate", "Failed to evaluate food");
    }
  });

  // API route for meal plan generation
  app.post("/api/meal-plan", rateLimit, async (req, res) => {
    const stage = req.body?.stage === "initial" ? "initial" : "post";

    try {
      const result = await generate(MEAL_PLAN_PROMPTS[stage], MEAL_PLAN_SYSTEM_INSTRUCTION, 0.4);
      res.json({ result });
    } catch (error) {
      sendGeminiError(res, error, "meal-plan", "Failed to generate meal plan");
    }
  });

  // Unknown API routes should not fall through to the SPA.
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} (model: ${GEMINI_MODEL})`);
  });
}

startServer();
