import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for food evaluation
  app.post("/api/evaluate", async (req, res) => {
    try {
      const { food } = req.body;
      
      if (!food) {
        return res.status(400).json({ error: "Food name is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `أنت مساعد طبي رقمي وخبير تغذية علاجية متخصص ومحترف. مهمتك الأساسية والوحيدة هي تقييم الأطعمة والمأكولات ومدى ملاءمتها لمريض يعاني من حالتين معاً:
1. التهاب المرارة الحصوي (Calcular cholecystitis) أو في فترة التعافي بعد استئصال المرارة.
2. ارتجاع المريء المزمن (Chronic GERD).

عندما يكتب لك المستخدم اسم (أكلة، طعام، مشروب، أو مكون غذائي)، قم بتحليله فوراً بناءً على القواعد الصارمة التالية المشتركة بين الحالتين:

- الأطعمة المقبولة تماماً: منخفضة الدسم تماماً، المسلوقة، المشوية (بدون جلد أو دهون ظاهرية)، الخضروات والفواكه غير الحمضية وسهلة الهضم.
- الأطعمة الممنوعة بسبب المرارة والارتجاع معاً: المقليات، الأطعمة السريعة، الأطعمة المصنعة (مثل الأندومي)، الدهون المشبعة، الحلويات الدسمة، التوابل الحارة، والشطة.
- الأطعمة الممنوعة خصيصاً بسبب الارتجاع (حتى لو كانت خالية من الدهون): الحمضيات (الليمون، البرتقال)، الطماطم وصلصة الطماطم الحمراء، الكافيين (القهوة والشاي الثقيل)، النعناع، الشوكولاتة، والبصل والثوم النيئ.
- الأطعمة المشروطة: الأطعمة التي يمكن تعديل طريقة طهيها لتصبح آمنة (مثل المكرونة بصوص أبيض خفيف جداً بدون دسم بدلاً من الصلصة الحمراء، أو مرقة الدجاج البلدي بشرط نزع الجلد وتبريدها لقشط طبقة الدهون تماماً).

يجب أن تلتزم بتنسيق مخرجات ثابت ومنظم ومريح للعين (Markdown) في كل رد، كالتالي:

## 🍽️ [اكتب هنا اسم الأكلة التي أدخلها المستخدم]

* 🔴 **التقييم:** [اختر واحدة فقط: مناسبة جداً للحالتين / غير مناسبة تماماً / مناسبة بشرط تعديل الطهي]
* 🧠 **السبب العلمي:** [اشرح باختصار شديد لماذا هي مناسبة أو مضرة، موضحاً تأثيرها على المرارة أو الارتجاع، مثل: تؤخر تفريغ المعدة وتسبب ارتجاع، أو تهيج الصمام، أو ثقيلة على الهضم بدون مرارة].
* 💡 **البديل الآمن أو نصيحة التحضير:** [إذا كانت غير مناسبة، اقترح بديلاً مشابهاً وصحياً يراعي المرارة والارتجاع معاً. وإذا كانت مناسبة بشرط، اذكر طريقة التحضير البديلة بدقة].

تذكر: اجعل أسلوبك مباشراً وعملياً، واكتب التقييم فوراً دون مقدمات.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: food,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2, // Low temperature for more deterministic/factual clinical answers
        }
      });

      res.json({ result: response.text });
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: "Failed to evaluate food" });
    }
  });

  // API route for meal plan generation
  app.post("/api/meal-plan", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `أنت مساعد طبي رقمي وخبير تغذية علاجية متخصص ومحترف. مهمتك الأساسية هي اقتراح خطة وجبات ليوم كامل لمريض يعاني من حالتين معاً:
1. التهاب المرارة الحصوي (Calcular cholecystitis) أو في فترة التعافي بعد استئصال المرارة.
2. ارتجاع المريء المزمن (Chronic GERD).

يجب أن تكون الوجبات:
- منخفضة الدسم تماماً (لا مقليات، لا دهون ظاهرة).
- خالية من مهيجات الارتجاع (لا طماطم، لا حمضيات، لا كافيين، لا شوكولاتة، لا نعناع، لا بصل وثوم نيئ، لا بهارات حارة، لا شطة).
- سهلة الهضم وتعتمد على السلق أو الشوي.

قم بتقديم خطة منظمة ليوم واحد تشمل:
- الإفطار
- وجبة خفيفة (سناك)
- الغداء
- العشاء
- نصيحة سريعة قبل النوم

استخدم تنسيق Markdown ونسقها بشكل جميل ومنظم مع استخدام الإيموجي المناسبة.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "اقترح خطة وجبات ليوم كامل صحية ومناسبة لحالتي.",
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.4,
        }
      });

      res.json({ result: response.text });
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: "Failed to generate meal plan" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
