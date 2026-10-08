# مستشار التغذية العلاجية (HELTH)

مساعد رقمي لتقييم الأطعمة وإرشادات فترة النقاهة بعد استئصال المرارة وارتجاع المريء المزمن، مبني بـ React + Vite + Express ويستخدم Gemini.

## التشغيل محلياً

```bash
npm install
cp .env.example .env   # ثم ضع GEMINI_API_KEY
npm run dev            # http://localhost:3000
```

## متغيرات البيئة

| المتغير | مطلوب | الوصف |
| --- | --- | --- |
| `GEMINI_API_KEY` | نعم | مفتاح Gemini API |
| `GEMINI_MODEL` | لا | الموديل المستخدم (الافتراضي `gemini-2.5-flash`) |
| `PORT` | لا | بورت السيرفر (الافتراضي `3000`) |
| `RATE_LIMIT_PER_MINUTE` | لا | أقصى عدد طلبات ذكاء اصطناعي لكل IP في الدقيقة (الافتراضي `20`) |

## البناء والتشغيل للإنتاج

```bash
npm run build
NODE_ENV=production node dist/server.cjs
```

مسار فحص الحالة: `GET /api/health`.

## الرفع على السيرفر (Docker / Portainer)

الريبو فيه `Dockerfile` و`docker-compose.yml` جاهزين للعمل خلف Traefik على الشبكة `automation-stack_automation-network` والدومين `helth.aaaaaaaaa9000.cloud`.

1. في Portainer: **Stacks → Add stack → Repository**، الريبو `https://github.com/aaaaaaaaa9000/HELTH`، الفرع `refs/heads/main`، ملف `docker-compose.yml`.
2. أضف متغير البيئة `GEMINI_API_KEY` في إعدادات الستاك (لا تضعه في الكود).
3. Deploy. وللتحديث بعد أي تعديل على `main`: **Pull and redeploy**.
