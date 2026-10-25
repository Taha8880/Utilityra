# النشر الفعلي (Cloudflare) — خطوة بخطوة

## هل يمكن ربط GitHub بـ Blogger؟
لا. Blogger لا يقرأ من GitHub ولا يشغّل Workers ولا يستضيف ملفات/API. أي "نشر" عليه يكون نسخ HTML يدوي أو عبر API قديمة، ولن تعمل أدوات الذكاء الاصطناعي ولا صفحات الأدوات المستقلة. الحل: **Cloudflare Workers** (يربط GitHub مباشرة) — مجاني للبداية.

## الطريقة (A) من GitHub Actions
1. Cloudflare → My Profile → API Tokens → *Edit Cloudflare Workers* → انسخ التوكن. وانسخ Account ID من صفحة Workers.
2. GitHub → Settings → Secrets and variables → Actions:
   - Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
   - Variable: `SITE_URL` = رابط موقعك (مثلاً `https://utilityra.tavengers16.workers.dev`)
3. ارفع هذا المشروع إلى `main`. يعمل `deploy.yml`: بناء ← اختبارات ← نشر ← فحص الموقع الحي.

## الطريقة (B) من جهازك
```
npm install
npx wrangler login
npm run deploy
```

## الذكاء الاصطناعي
يعمل افتراضيًا عبر Workers AI (binding `AI` في `wrangler.toml`) دون مفتاح. اختياريًا أضف `OPENAI_API_KEY` أو `GEMINI_API_KEY` بـ `npx wrangler secret put`.

## لوحة الإدارة والتحليلات والمهندس التقني (اختياري)
```
npx wrangler d1 create utilityra-data      # ضع الـ id في wrangler.toml وفعّل كتلة d1_databases
npx wrangler d1 execute utilityra-data --remote --file=worker/schema.sql
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET   # نص عشوائي طويل
```
ثم افتح `/admin/`. بدون هذه الخطوات يعمل الموقع كاملًا ما عدا اللوحة.

## نطاق خاص
Workers → Settings → Domains & Routes → Add Custom Domain. ثم غيّر `SITE_URL` وأعد النشر ليتحدث sitemap والـ canonical.

## ما لا أستطيع ضمانه من الكود
قبول AdSense، وفهرسة Google، وتحقق Search Console تتم في حساباتك بعد النشر. ملف التحقق `google1dc3867d61891f77.html` و`ads.txt` مضمّنان.

## جودة الذكاء الاصطناعي (مهم)
الافتراضي Workers AI (نموذج Llama) مجاني لكنه أضعف من نماذج Claude/GPT/Gemini. لرفع الجودة ضع مفتاحًا واحدًا على الأقل في الـ Worker:
```
npx wrangler secret put ANTHROPIC_API_KEY     # الأفضل: يُستخدم تلقائيًا أولًا
npx wrangler secret put OPENAI_API_KEY        # أو
npx wrangler secret put GEMINI_API_KEY
```
(هذا غير سر GitHub بنفس الاسم الذي يستخدمه المهندس الآلي.) ترتيب الاختيار: `AI_PROVIDER` ثم Anthropic ثم Workers AI ثم OpenAI ثم Gemini، مع انتقال تلقائي عند الفشل. تبويب "مساعد المطوّر" في `/admin/` يستخدم نفس المزود.

## النماذج (Anthropic)
- الأدوات الثقيلة (المساعد، شرح/إصلاح الكود، SQL، Regex، Excel، المقالات…) تجرّب بالترتيب: `claude-fable-5-1` ثم `claude-opus-5-5` ثم `claude-sonnet-5-5` وتنتقل للتالي تلقائيًا إن لم يكن النموذج متاحًا لحسابك.
- باقي الأدوات تستخدم `claude-sonnet-5-5` (أرخص وأسرع).
- لتغيير النموذج: `ANTHROPIC_MODEL_STRONG` (للثقيلة) و`ANTHROPIC_MODEL` (للباقي) كمتغيرات في wrangler.toml أو Dashboard. التكلفة تُحسب على حسابك في Anthropic، وكلما قوي النموذج زادت التكلفة.
- افحص المزوّد الفعّال: افتح `/health` وستجد قائمة `ai` فيها `anthropic` إن كان المفتاح مفعّلًا.

## ذكاء اصطناعي مجاني (بدون دفع)
- **Gemini (مجاني):** أنشئ مفتاحًا من Google AI Studio (طبقة مجانية) وأضفه كسرّ في الـ Worker باسم `GEMINI_API_KEY`: `npx wrangler secret put GEMINI_API_KEY`. هذا أفضل بديل مجاني للعربية.
- **Workers AI:** مجاني ضمن حصة يومية، يعمل تلقائيًا ويُستخدم كاحتياطي أخير.
- إن لم تدفع لـ Claude أو OpenAI فاحذف سرّيهما (`ANTHROPIC_API_KEY` و`OPENAI_API_KEY`) من إعدادات الـ Worker. الكود يتجاوز المفتاح غير الصالح تلقائيًا لمدة 10 دقائق، لكن حذفه أنظف.
- ترتيب المزودين: ما عيّنته بـ `AI_PROVIDER` ثم Claude ثم OpenAI ثم Gemini ثم Workers AI.
