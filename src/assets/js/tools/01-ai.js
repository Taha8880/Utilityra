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

  /* ----- chat assistant: streaming, memory (saved in this browser), source-grounding, regenerate ----- */
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } } };
  UT.def('ai-assistant', {
    mount(root, h) {
      // Each visit starts a clean chat. The previous chat is archived into compact "past" memory that is sent to the AI (not shown here).
      const old = store.get('ur-chat', []).filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string');
      let past = store.get('ur-past', []);
      if (old.length) { const sess = []; for (let i = 0; i < old.length; i++) if (old[i].role === 'user') sess.push({ q: old[i].content.slice(0, 220), a: ((old[i + 1] && old[i + 1].role === 'assistant' ? old[i + 1].content : '') || '').slice(0, 260) }); past = past.concat(sess).slice(-24); store.set('ur-past', past); store.set('ur-chat', []); }
      let hist = [];
      const pastText = () => past.length ? 'EARLIER CONVERSATIONS (oldest first):\n' + past.map((x) => '- User: ' + x.q + (x.a ? ' | You: ' + x.a : '')).join('\n').slice(-2000) : '';
      root.innerHTML = `<div class="chat">
        <div class="chat-log" aria-live="polite"></div>
        <div class="chips">${[['لخّص لي فكرة التضخم ببساطة', 'Explain inflation simply'], ['اكتب دالة JavaScript تحذف التكرار من مصفوفة', 'Write a JS function that removes duplicates from an array'], ['ساعدني في خطة مذاكرة لمدة أسبوعين', 'Help me plan a two-week study schedule']].map((x) => `<button type="button" class="chip" data-q="${h.esc(x[0])}" data-qe="${h.esc(x[1])}">${h.L(h.esc(x[0]), h.esc(x[1]))}</button>`).join('')}</div>
        <form class="chat-form"><textarea rows="2" maxlength="6000" dir="auto" data-ph-ar="اكتب سؤالك…" data-ph-en="Type your question…" placeholder="${h.t('اكتب سؤالك…', 'Type your question…')}"></textarea>
        <button class="btn primary" type="submit">${h.L('إرسال', 'Send')}</button></form>
        <div class="btnrow" style="align-items:center;gap:12px;flex-wrap:wrap"><small class="hint cnt" dir="ltr">0 / 6000</small>
          <label class="ck"><input type="checkbox" class="gr"> ${h.L('تحقق من مصادر (ويكيبيديا) للأسئلة المعلوماتية', 'Check sources (Wikipedia) for factual questions')}</label>
          <button type="button" class="btn ghost rg">${h.L('إعادة توليد', 'Regenerate')}</button><button type="button" class="btn ghost nw">${h.L('محادثة جديدة', 'New chat')}</button><button type="button" class="btn ghost fg">${h.L('مسح ذاكرة المساعد', 'Clear assistant memory')}</button><small class="hint pmsg"></small></div>
        <details class="memo"><summary>${h.L('ذاكرتي (ملاحظات يتذكرها المساعد دائمًا)', 'My memory (notes the assistant always keeps in mind)')}</summary><textarea class="mem" rows="3" maxlength="1500" dir="auto" data-ph-ar="مثال: أنا طالب هندسة، أفضّل الشرح المختصر، أعمل بـ JavaScript" data-ph-en="e.g. I'm an engineering student, I prefer short answers, I use JavaScript" placeholder="${h.t('مثال: أنا طالب هندسة، أفضّل الشرح المختصر', "e.g. I'm an engineering student, I prefer short answers")}"></textarea><small class="hint">${h.L('تُحفظ في متصفحك فقط وتُرسل مع كل سؤال. لا تكتب فيها أسرارًا.', 'Stored only in your browser and sent with each question. Do not put secrets here.')}</small></details>
        <p class="hint">${h.L('لا ترسل كلمات مرور أو بيانات حساسة. قد تحتوي الإجابات على أخطاء؛ للمعلومات المهمة راجع المصادر المعروضة.', 'Never send passwords or sensitive data. Answers can contain mistakes; for important facts check the sources shown.')}</p></div>`;
      const log = h.$('.chat-log', root), box = h.$('.chat-form textarea', root), form = h.$('form', root), mem = h.$('.mem', root), gr = h.$('.gr', root), cnt = h.$('.cnt', root);
      mem.value = store.get('ur-mem', ''); gr.checked = store.get('ur-ground', true);
      mem.addEventListener('input', () => store.set('ur-mem', mem.value)); gr.addEventListener('change', () => store.set('ur-ground', gr.checked));
      box.addEventListener('input', () => { cnt.textContent = box.value.length + ' / 6000'; });
      const decorate = (el) => { h.$$('pre', el).forEach((pre) => { if (pre.querySelector('.cpy')) return; pre.style.position = 'relative'; const b = document.createElement('button'); b.type = 'button'; b.className = 'mini cpy'; b.textContent = h.t('نسخ', 'Copy'); b.style.cssText = 'position:absolute;top:6px;inset-inline-end:6px'; b.addEventListener('click', () => { h.copy(pre.innerText.replace(new RegExp(b.textContent + '$'), '').trim()); b.textContent = '✓'; setTimeout(() => { b.textContent = h.t('نسخ', 'Copy'); }, 1200); }); pre.appendChild(b); }); };
      const srcHtml = (src) => (src && src.length ? `<div class="srcs"><b>${h.t('المصادر:', 'Sources:')}</b> ${src.map((x, i) => `[${i + 1}] <a href="${h.esc(x.url)}" target="_blank" rel="noopener noreferrer">${h.esc(x.title)}</a>`).join(' · ')}</div>` : '');
      const add = (who, html) => { const m = document.createElement('div'); m.className = 'msg ' + who; m.innerHTML = '<div class="bubble">' + html + '</div>'; log.appendChild(m); log.scrollTop = log.scrollHeight; return m; };
      const render = () => { log.innerHTML = ''; add('bot', h.L('أهلًا! اسألني عن أي شيء، داخل الموقع أو خارجه. أتذكّر محادثاتنا السابقة دون عرضها هنا، وأستخدم مصادر موثّقة عند الإمكان، وأقول بصراحة عندما لا أعرف.', "Hi! Ask me anything, on this site or beyond. I remember our earlier chats without listing them here, use cited sources when possible, and say so when I don't know.")); hist.forEach((m) => { const e = add(m.role === 'user' ? 'user' : 'bot', m.role === 'user' ? h.esc(m.content).replace(/\n/g, '<br>') : h.md(m.content) + srcHtml(m.sources)); decorate(e); }); };
      render();
      h.$$('.chip', root).forEach((c) => c.addEventListener('click', () => { box.value = h.lang() === 'en' ? c.dataset.qe : c.dataset.q; form.requestSubmit(); }));
      box.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
      let busy = false;
      async function ask(q) {
        busy = true; const wait = add('bot', '<span class="dots"><i></i><i></i><i></i></span>'); const bub = wait.querySelector('.bubble'); let src = [];
        try {
          const a = await h.aiStream({ tool: 'ai-assistant', message: q, history: hist.slice(0, -1).slice(-16).map((m) => ({ role: m.role, content: m.content })), memory: [mem.value.trim(), pastText()].filter(Boolean).join('\n\n'), ground: gr.checked, tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC') }, (txt) => { bub.innerHTML = h.md(txt); log.scrollTop = log.scrollHeight; }, (s) => { src = s; });
          bub.innerHTML = h.md(a) + srcHtml(src); decorate(bub); hist.push({ role: 'assistant', content: a, sources: src.length ? src : undefined });
        } catch (err) { bub.innerHTML = '<span class="err">' + h.esc(err.message) + '</span>'; hist.pop(); }
        store.set('ur-chat', hist.slice(-40)); busy = false; log.scrollTop = log.scrollHeight;
      }
      form.addEventListener('submit', (e) => { e.preventDefault(); const q = box.value.trim(); if (!q || busy) return; box.value = ''; cnt.textContent = '0 / 6000'; hist.push({ role: 'user', content: q }); add('user', h.esc(q).replace(/\n/g, '<br>')); ask(q); });
      h.$('.rg', root).addEventListener('click', () => { if (busy) return; while (hist.length && hist[hist.length - 1].role === 'assistant') hist.pop(); const last = hist[hist.length - 1]; if (!last) return; render(); ask(last.content); });
      h.$('.nw', root).addEventListener('click', () => { if (busy) return; if (hist.length) { hist.forEach((m, i) => { if (m.role === 'user') past.push({ q: m.content.slice(0, 220), a: ((hist[i + 1] && hist[i + 1].content) || '').slice(0, 260) }); }); past = past.slice(-24); store.set('ur-past', past); } hist = []; store.set('ur-chat', []); render(); });
      h.$('.fg', root).addEventListener('click', () => { past = []; store.set('ur-past', []); store.set('ur-mem', ''); mem.value = ''; h.$('.pmsg', root).textContent = h.t('تم مسح الذاكرة.', 'Memory cleared.'); });
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
