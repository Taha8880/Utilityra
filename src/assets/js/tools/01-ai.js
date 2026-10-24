/* AI tools — each one calls the Utilityra Worker (/api/ai) with a tool id; prompts live on the server. */
(function () {
  const { ta, tx, sel } = UT.H;
  const TONES = [['professional', 'مهني', 'Professional'], ['friendly', 'ودّي', 'Friendly'], ['formal', 'رسمي', 'Formal'], ['concise', 'مختصر', 'Concise'], ['persuasive', 'مقنع', 'Persuasive'], ['simple', 'بسيط وسهل', 'Simple']];
  const LEVELS = [['beginner', 'مبتدئ', 'Beginner'], ['intermediate', 'متوسط', 'Intermediate'], ['expert', 'خبير', 'Expert']];

  function aiTool(id, fields, sample, o) {
    o = o || {};
    const main = o.main || 'text';
    return {
      fields, sample, layout: 'ai', button: o.button || ['نفّذ بالذكاء الاصطناعي', 'Generate with AI'],
      out: { label: ['الناتج', 'Result'] },
      async run(v, h) {
        const msg = (v[main] || '').trim();
        if (!msg) return { error: h.t('اكتب النص أولًا.', 'Enter some text first.') };
        const options = {};
        Object.keys(v).forEach((k) => { if (k !== main && v[k] !== '' && v[k] != null) options[k] = String(v[k]); });
        const answer = await h.ai({ tool: id, message: msg, options });
        return { md: answer, copy: answer };
      }
    };
  }

  /* ----- chat assistant (custom UI with history) ----- */
  UT.def('ai-assistant', {
    mount(root, h) {
      const hist = [];
      root.innerHTML = `<div class="chat">
        <div class="chat-log" aria-live="polite"><div class="msg bot"><div class="bubble">${h.L('أهلًا! اسألني عن الدراسة أو الشغل أو البرمجة أو أي مشكلة تريد حلها.', 'Hi! Ask me about study, work, coding or any problem you want to solve.')}</div></div></div>
        <div class="chips">${[['لخّص لي فكرة التضخم ببساطة', 'Explain inflation simply'], ['اكتب دالة JavaScript تحذف التكرار من مصفوفة', 'Write a JS function that removes duplicates from an array'], ['ساعدني في خطة مذاكرة لمدة أسبوعين', 'Help me plan two weeks of study']].map((c) => `<button type="button" class="chip" data-q="${h.esc(c[0])}" data-qe="${h.esc(c[1])}">${h.L(h.esc(c[0]), h.esc(c[1]))}</button>`).join('')}</div>
        <form class="chat-form"><textarea rows="2" maxlength="6000" dir="auto" data-ph-ar="اكتب سؤالك…" data-ph-en="Type your question…" placeholder="${h.t('اكتب سؤالك…', 'Type your question…')}"></textarea>
        <button class="btn primary" type="submit">${h.L('إرسال', 'Send')}</button></form>
        <p class="hint">${h.L('لا ترسل كلمات مرور أو بيانات حساسة. قد تحتوي الإجابات على أخطاء، راجعها قبل الاعتماد عليها.', 'Never send passwords or sensitive data. Answers can contain mistakes; verify before relying on them.')}</p></div>`;
      const log = h.$('.chat-log', root), box = h.$('textarea', root), form = h.$('form', root);
      const add = (who, html) => { const m = document.createElement('div'); m.className = 'msg ' + who; m.innerHTML = '<div class="bubble">' + html + '</div>'; log.appendChild(m); log.scrollTop = log.scrollHeight; return m; };
      h.$$('.chip', root).forEach((c) => c.addEventListener('click', () => { box.value = h.lang() === 'en' ? c.dataset.qe : c.dataset.q; form.requestSubmit(); }));
      box.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
      let busy = false;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const q = box.value.trim(); if (!q || busy) return;
        busy = true; box.value = ''; add('user', h.esc(q).replace(/\n/g, '<br>'));
        const wait = add('bot', '<span class="dots"><i></i><i></i><i></i></span>');
        try {
          const a = await h.ai({ tool: 'ai-assistant', message: q, history: hist.slice(-8) });
          hist.push({ role: 'user', content: q }, { role: 'assistant', content: a });
          wait.querySelector('.bubble').innerHTML = h.md(a);
        } catch (err) { wait.querySelector('.bubble').innerHTML = '<span class="err">' + h.esc(err.message) + '</span>'; }
        busy = false; log.scrollTop = log.scrollHeight;
      });
    }
  });

  UT.def('ai-summarizer', aiTool('ai-summarizer', [
    ta('text', 'النص المراد تلخيصه', 'Text to summarize', { rows: 10, ph: ['الصق المقال أو المحاضرة أو التقرير هنا…', 'Paste the article, lecture or report here…'] }),
    sel('length', 'الطول', 'Length', [['short', 'قصير', 'Short'], ['medium', 'متوسط', 'Medium'], ['detailed', 'مفصّل', 'Detailed']], 'medium'),
    sel('format', 'الشكل', 'Format', [['bullets', 'نقاط', 'Bullet points'], ['paragraph', 'فقرة', 'Paragraph'], ['takeaways', 'أهم الأفكار + خلاصة', 'Key takeaways + conclusion']], 'bullets')
  ], { text: 'The Industrial Revolution began in Britain in the late 18th century. It replaced hand production with machines, created factories, and moved populations from farms to cities. Productivity rose sharply, but working conditions were harsh, and cities grew faster than their infrastructure could cope with.' }));

  UT.def('ai-paraphraser', aiTool('ai-paraphraser', [
    ta('text', 'النص الأصلي', 'Original text', { rows: 8, ph: ['اكتب أو الصق النص…', 'Type or paste your text…'] }),
    sel('tone', 'الأسلوب', 'Tone', TONES, 'professional')
  ], { text: 'نحتاج الملف قبل نهاية اليوم لأن العميل مستعجل ولازم نرد عليه.' }));

  UT.def('ai-translator', aiTool('ai-translator', [
    ta('text', 'النص', 'Text', { rows: 8, ph: ['اكتب النص المراد ترجمته…', 'Enter the text to translate…'] }),
    sel('to', 'الترجمة إلى', 'Translate to', [['Arabic', 'العربية', 'Arabic'], ['English', 'الإنجليزية', 'English'], ['French', 'الفرنسية', 'French'], ['German', 'الألمانية', 'German'], ['Spanish', 'الإسبانية', 'Spanish'], ['Turkish', 'التركية', 'Turkish'], ['Italian', 'الإيطالية', 'Italian'], ['Russian', 'الروسية', 'Russian'], ['Chinese', 'الصينية', 'Chinese'], ['Japanese', 'اليابانية', 'Japanese'], ['Urdu', 'الأردية', 'Urdu'], ['Hindi', 'الهندية', 'Hindi']], 'English'),
    sel('style', 'الأسلوب', 'Style', [['natural', 'طبيعي', 'Natural'], ['formal', 'رسمي', 'Formal'], ['literal', 'حرفي', 'Literal']], 'natural')
  ], { text: 'صباح الخير، أود أن أحجز موعدًا يوم الأحد القادم.' }));

  UT.def('ai-grammar-fixer', aiTool('ai-grammar-fixer', [
    ta('text', 'النص', 'Text', { rows: 8, ph: ['الصق النص لتصحيحه…', 'Paste text to correct…'] }),
    sel('mode', 'النتيجة', 'Output', [['fix_explain', 'تصحيح مع شرح التعديلات', 'Corrected text + explanations'], ['fix_only', 'النص المصحح فقط', 'Corrected text only']], 'fix_explain')
  ], { text: 'ana zahab ila almadrasa ams wa kanat al-jaww jameel jiddan' }));

  UT.def('ai-email-writer', aiTool('ai-email-writer', [
    ta('text', 'ماذا تريد أن تقول؟', 'What do you want to say?', { rows: 6, ph: ['مثال: أطلب تأجيل الاجتماع إلى الخميس لأن لدي سفرًا طارئًا', 'e.g. Ask to move the meeting to Thursday because of an urgent trip'] }),
    sel('kind', 'النوع', 'Type', [['request', 'طلب', 'Request'], ['follow_up', 'متابعة', 'Follow-up'], ['apology', 'اعتذار', 'Apology'], ['thanks', 'شكر', 'Thank you'], ['intro', 'تعريف بنفسي', 'Introduction'], ['complaint', 'شكوى', 'Complaint']], 'request'),
    sel('tone', 'الأسلوب', 'Tone', TONES, 'professional'),
    sel('outLang', 'لغة الرسالة', 'Email language', [['auto', 'نفس لغة الطلب', 'Same as request'], ['Arabic', 'العربية', 'Arabic'], ['English', 'الإنجليزية', 'English']], 'auto')
  ], { text: 'أطلب تأجيل الاجتماع إلى الخميس لأن لدي سفرًا طارئًا' }));

  UT.def('ai-code-explainer', aiTool('ai-code-explainer', [
    ta('code', 'الكود', 'Code', { rows: 12, mono: true, ph: ['الصق الكود هنا…', 'Paste code here…'] }),
    sel('level', 'مستواك', 'Your level', LEVELS, 'beginner')
  ], { code: 'const uniq = arr => [...new Set(arr)];\nconsole.log(uniq([1,2,2,3]));' }, { main: 'code' }));

  UT.def('ai-code-debugger', aiTool('ai-code-debugger', [
    ta('code', 'الكود', 'Code', { rows: 11, mono: true, ph: ['الصق الكود الذي به مشكلة…', 'Paste the problematic code…'] }),
    ta('error', 'رسالة الخطأ أو وصف المشكلة', 'Error message or problem description', { rows: 4, mono: true })
  ], { code: 'function sum(a, b) {\n  return a + c;\n}\nconsole.log(sum(1, 2));', error: 'ReferenceError: c is not defined' }, { main: 'code' }));

  UT.def('ai-regex-generator', aiTool('ai-regex-generator', [
    ta('text', 'صف النمط الذي تريده', 'Describe the pattern', { rows: 4, ph: ['مثال: يطابق رقم هاتف مصري يبدأ بـ 01', 'e.g. match an Egyptian phone number starting with 01'] }),
    sel('flavor', 'اللغة', 'Flavor', [['JavaScript', 'JavaScript', 'JavaScript'], ['Python', 'Python', 'Python'], ['PCRE (PHP)', 'PHP / PCRE', 'PHP / PCRE'], ['Java', 'Java', 'Java']], 'JavaScript'),
    ta('examples', 'أمثلة (اختياري)', 'Examples (optional)', { rows: 3 })
  ], { text: 'يطابق رقم هاتف مصري محمول مثل 01012345678' }));

  UT.def('ai-sql-generator', aiTool('ai-sql-generator', [
    ta('text', 'ماذا تريد من قاعدة البيانات؟', 'What do you need from the database?', { rows: 4, ph: ['مثال: أعلى 5 عملاء من حيث إجمالي المشتريات هذا الشهر', 'e.g. top 5 customers by total purchases this month'] }),
    sel('dialect', 'نوع قاعدة البيانات', 'Database', [['MySQL', 'MySQL', 'MySQL'], ['PostgreSQL', 'PostgreSQL', 'PostgreSQL'], ['SQLite', 'SQLite', 'SQLite'], ['SQL Server', 'SQL Server', 'SQL Server']], 'MySQL'),
    ta('schema', 'هيكل الجداول (اختياري)', 'Table schema (optional)', { rows: 5, mono: true, ph: ['customers(id, name)\norders(id, customer_id, total, created_at)', 'customers(id, name)\norders(id, customer_id, total, created_at)'] })
  ], { text: 'أعلى 5 عملاء من حيث إجمالي المشتريات', schema: 'customers(id, name)\norders(id, customer_id, total, created_at)' }));

  UT.def('excel-formula-helper', aiTool('excel-formula-helper', [
    ta('text', 'ماذا تريد أن تحسب؟', 'What do you want to calculate?', { rows: 4, ph: ['مثال: اجمع المبيعات في العمود B إذا كان العمود A يساوي "القاهرة"', 'e.g. sum column B where column A equals "Cairo"'] }),
    sel('app', 'البرنامج', 'Application', [['Excel', 'Excel', 'Excel'], ['Google Sheets', 'Google Sheets', 'Google Sheets'], ['LibreOffice Calc', 'LibreOffice Calc', 'LibreOffice Calc']], 'Excel')
  ], { text: 'اجمع المبيعات في العمود B إذا كان العمود A يساوي القاهرة' }));

  UT.def('ai-quiz-generator', aiTool('ai-quiz-generator', [
    ta('text', 'المادة الدراسية', 'Study material', { rows: 10, ph: ['الصق الدرس أو الملخص هنا…', 'Paste the lesson or summary here…'] }),
    sel('count', 'عدد الأسئلة', 'Questions', [['5', '5', '5'], ['10', '10', '10'], ['15', '15', '15']], '5'),
    sel('kind', 'نوع الأسئلة', 'Question type', [['mcq', 'اختيار من متعدد', 'Multiple choice'], ['tf', 'صح أو خطأ', 'True / False'], ['mixed', 'مختلط', 'Mixed']], 'mcq')
  ], { text: 'Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. It takes place in chloroplasts, uses carbon dioxide and water, and releases oxygen.' }));

  UT.def('ai-study-explainer', aiTool('ai-study-explainer', [
    ta('text', 'الموضوع أو السؤال', 'Topic or question', { rows: 5, ph: ['مثال: ما هو الجهد الكهربائي؟', 'e.g. What is electric potential?'] }),
    sel('level', 'مستوى الشرح', 'Explain it like I am…', [['a 10-year-old', 'طفل في العاشرة', 'a 10-year-old'], ['a high-school student', 'طالب ثانوي', 'a high-school student'], ['a university student', 'طالب جامعي', 'a university student'], ['an expert', 'متخصص', 'an expert']], 'a high-school student')
  ], { text: 'ما هو الجهد الكهربائي؟' }));

  UT.def('ai-blog-writer', aiTool('ai-blog-writer', [
    ta('text', 'موضوع المقال', 'Article topic', { rows: 3, ph: ['مثال: فوائد تنظيم الوقت للطلاب', 'e.g. Benefits of time management for students'] }),
    tx('keywords', 'كلمات مفتاحية (اختياري)', 'Keywords (optional)'),
    sel('tone', 'الأسلوب', 'Tone', TONES, 'friendly'),
    sel('length', 'الطول', 'Length', [['~400 words', 'قصير (~400 كلمة)', 'Short (~400 words)'], ['~800 words', 'متوسط (~800 كلمة)', 'Medium (~800 words)'], ['~1500 words', 'طويل (~1500 كلمة)', 'Long (~1500 words)']], '~800 words')
  ], { text: 'فوائد تنظيم الوقت للطلاب', keywords: 'تنظيم الوقت, المذاكرة' }));

  UT.def('ai-seo-titles', aiTool('ai-seo-titles', [
    ta('text', 'موضوع الصفحة أو ملخصها', 'Page topic or summary', { rows: 5 }),
    tx('keyword', 'الكلمة المفتاحية الرئيسية', 'Main keyword')
  ], { text: 'صفحة تشرح كيفية ضغط الصور دون فقدان الجودة وبدون رفعها لأي موقع', keyword: 'ضغط الصور' }));

  UT.def('ai-social-posts', aiTool('ai-social-posts', [
    ta('text', 'عمّ تريد أن تنشر؟', 'What do you want to post about?', { rows: 5 }),
    sel('platform', 'المنصة', 'Platform', [['X (Twitter)', 'X (تويتر)', 'X (Twitter)'], ['Instagram', 'Instagram', 'Instagram'], ['LinkedIn', 'LinkedIn', 'LinkedIn'], ['Facebook', 'Facebook', 'Facebook'], ['TikTok', 'TikTok', 'TikTok']], 'LinkedIn'),
    sel('tone', 'الأسلوب', 'Tone', TONES, 'friendly')
  ], { text: 'إطلاق موقع أدوات مجانية للطلاب والمبرمجين' }));

  UT.def('ai-resume-writer', aiTool('ai-resume-writer', [
    ta('text', 'خبراتك ومهاراتك', 'Your experience and skills', { rows: 8, ph: ['اكتب ما فعلته بالتفصيل: مهام، أرقام، أدوات…', 'Describe what you did: tasks, numbers, tools…'] }),
    tx('job', 'الوظيفة المستهدفة', 'Target job title'),
    sel('mode', 'المطلوب', 'Output', [['resume bullets', 'نقاط للسيرة الذاتية', 'Resume bullet points'], ['cover letter', 'خطاب تقديم', 'Cover letter'], ['professional summary', 'نبذة مهنية', 'Professional summary']], 'resume bullets')
  ], { text: 'عملت 3 سنوات في خدمة العملاء، رفعت رضا العملاء من 80% إلى 92%، وأدرت فريقًا من 4 أشخاص.', job: 'Customer Success Specialist' }));

  UT.def('ai-product-description', aiTool('ai-product-description', [
    ta('text', 'تفاصيل المنتج', 'Product details', { rows: 6, ph: ['الاسم، المواد، المزايا، الجمهور المستهدف…', 'Name, materials, features, target audience…'] }),
    sel('tone', 'الأسلوب', 'Tone', TONES, 'persuasive'),
    sel('length', 'الطول', 'Length', [['short (40-60 words)', 'قصير', 'Short'], ['medium (100-150 words)', 'متوسط', 'Medium']], 'medium (100-150 words)')
  ], { text: 'حقيبة ظهر مقاومة للماء، 25 لترًا، جيب للابتوب 15 بوصة، للطلاب والمسافرين' }));

  UT.def('ai-name-ideas', aiTool('ai-name-ideas', [
    ta('text', 'لأي مشروع أو منتج؟', 'What is it for?', { rows: 4, ph: ['صف الفكرة والجمهور…', 'Describe the idea and audience…'] }),
    sel('style', 'الطابع', 'Style', [['modern and short', 'عصري وقصير', 'Modern and short'], ['professional', 'احترافي', 'Professional'], ['playful', 'مرح', 'Playful'], ['arabic-inspired', 'عربي الطابع', 'Arabic-inspired']], 'modern and short'),
    sel('count', 'العدد', 'How many', [['10', '10', '10'], ['20', '20', '20']], '10')
  ], { text: 'تطبيق لتنظيم مواعيد المذاكرة للطلاب' }));
})();
