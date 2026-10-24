(function () {
  const { ta, tx, nm, sel, ck, esc } = UT.H;
  const def = UT.def;
  const words = (s) => (s.trim() ? s.trim().match(/\S+/gu) || [] : []);
  const wordsOnly = (s) => s.match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu) || [];
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const none = () => null;

  def('word-counter', {
    fields: [ta('text', 'النص', 'Your text', { rows: 12, ph: ['اكتب أو الصق النص هنا…', 'Type or paste your text here…'] })],
    sample: { text: 'Utilityra is a free toolbox.\nIt runs in your browser, so your text stays private.\n\nمرحبًا بك في موقع أدوات مجانية وسريعة.' },
    run(v, h) {
      const s = v.text, w = words(s).length;
      const sentences = s.trim() ? (s.match(/[^.!?؟。！？\n]+[.!?؟。！？]*/gu) || []).filter((x) => x.trim()).length : 0;
      const paragraphs = s.trim() ? s.split(/\n\s*\n/u).filter((p) => p.trim()).length : 0;
      const lines = s ? s.split('\n').length : 0;
      const mins = (n) => { const m = n / 1; return m < 1 ? h.t('أقل من دقيقة', 'under 1 min') : Math.ceil(m) + ' ' + h.t('دقيقة', 'min'); };
      return [['الكلمات', 'Words', w], ['الحروف', 'Characters', s.length], ['الحروف بدون مسافات', 'No spaces', s.replace(/\s/gu, '').length], ['الجمل', 'Sentences', sentences], ['الفقرات', 'Paragraphs', paragraphs], ['الأسطر', 'Lines', lines], ['وقت القراءة', 'Reading time', mins(w / 200)], ['وقت الإلقاء', 'Speaking time', mins(w / 130)]];
    }
  });

  function splitWords(s) {
    return s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').match(/[\p{L}\p{N}]+/gu) || [];
  }
  def('case-converter', {
    fields: [
      ta('text', 'النص', 'Text', { rows: 8, ph: ['اكتب النص هنا…', 'Type your text…'] }),
      sel('mode', 'التحويل إلى', 'Convert to', [['upper', 'أحرف كبيرة UPPERCASE', 'UPPERCASE'], ['lower', 'أحرف صغيرة lowercase', 'lowercase'], ['title', 'Title Case', 'Title Case'], ['sentence', 'Sentence case', 'Sentence case'], ['camel', 'camelCase', 'camelCase'], ['pascal', 'PascalCase', 'PascalCase'], ['snake', 'snake_case', 'snake_case'], ['kebab', 'kebab-case', 'kebab-case'], ['constant', 'CONSTANT_CASE', 'CONSTANT_CASE'], ['toggle', 'عكس الحالة', 'tOGGLE cASE'], ['alt', 'تبادل aLtErNaTiNg', 'aLtErNaTiNg']], 'title')
    ],
    sample: { text: 'hello world from utilityra tools' },
    run(v) {
      const s = v.text; if (!s) return null;
      const per = (fn) => s.split('\n').map(fn).join('\n');
      const m = v.mode;
      const out = { upper: () => s.toUpperCase(), lower: () => s.toLowerCase(),
        title: () => s.toLowerCase().replace(/(^|[\s\-_(\[{"'])(\p{L})/gu, (a, b, c) => b + c.toUpperCase()),
        sentence: () => s.toLowerCase().replace(/(^\s*|[.!?؟]\s+|\n\s*)(\p{L})/gu, (a, b, c) => b + c.toUpperCase()),
        camel: () => per((l) => splitWords(l).map((w, i) => (i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())).join('')),
        pascal: () => per((l) => splitWords(l).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('')),
        snake: () => per((l) => splitWords(l).map((w) => w.toLowerCase()).join('_')),
        kebab: () => per((l) => splitWords(l).map((w) => w.toLowerCase()).join('-')),
        constant: () => per((l) => splitWords(l).map((w) => w.toUpperCase()).join('_')),
        toggle: () => Array.from(s).map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(''),
        alt: () => { let i = 0; return Array.from(s).map((c) => (/\p{L}/u.test(c) ? (i++ % 2 ? c.toUpperCase() : c.toLowerCase()) : c)).join(''); }
      }[m]();
      return out;
    }
  });

  def('text-cleaner', {
    fields: [
      ta('text', 'النص', 'Text', { rows: 10 }),
      ck('trim', 'حذف المسافات من بداية ونهاية كل سطر', 'Trim every line', true),
      ck('spaces', 'دمج المسافات المتكررة', 'Collapse repeated spaces', true),
      ck('blank', 'حذف الأسطر الفارغة', 'Remove blank lines', true),
      ck('join', 'دمج كل الأسطر في فقرة واحدة', 'Join all lines into one paragraph', false),
      ck('tags', 'حذف وسوم HTML', 'Strip HTML tags', false),
      ck('punct', 'حذف علامات الترقيم', 'Remove punctuation', false),
      ck('digits', 'حذف الأرقام', 'Remove digits', false),
      ck('emoji', 'حذف الإيموجي', 'Remove emoji', false),
      ck('quotes', 'تحويل علامات الاقتباس الذكية إلى عادية', 'Straighten smart quotes', false),
      ck('invisible', 'حذف الأحرف غير المرئية', 'Remove invisible characters', true)
    ],
    sample: { text: '  This   is   a  messy   text.  \n\n\n  <b>Second</b> line “quoted”  😀 123  \n' },
    run(v) {
      let s = v.text; if (!s) return null;
      if (v.invisible) s = s.replace(/[​-‍﻿⁠­]/g, '');
      if (v.tags) s = s.replace(/<[^>]*>/g, '');
      if (v.quotes) s = s.replace(/[“”„]/g, '"').replace(/[‘’‚]/g, "'");
      if (v.emoji) s = s.replace(/[\p{Extended_Pictographic}️]/gu, '');
      if (v.digits) s = s.replace(/[\p{Nd}]/gu, '');
      if (v.punct) s = s.replace(/[\p{P}\p{S}]/gu, '');
      let lines = s.split('\n');
      if (v.trim) lines = lines.map((l) => l.trim());
      if (v.spaces) lines = lines.map((l) => l.replace(/[ \t ]{2,}/g, ' '));
      if (v.blank) lines = lines.filter((l) => l.trim() !== '');
      s = v.join ? lines.join(' ').replace(/\s{2,}/g, ' ').trim() : lines.join('\n');
      return s;
    }
  });

  def('line-sorter', {
    fields: [
      ta('text', 'الأسطر', 'Lines', { rows: 10, ph: ['سطر في كل سطر…', 'One item per line…'] }),
      sel('mode', 'الترتيب', 'Order', [['az', 'أبجديًا (أ → ي)', 'A → Z'], ['za', 'عكس أبجدي (ي → أ)', 'Z → A'], ['num', 'رقميًا تصاعديًا', 'Numeric ascending'], ['numd', 'رقميًا تنازليًا', 'Numeric descending'], ['len', 'بالطول (الأقصر أولًا)', 'Length (short first)'], ['lend', 'بالطول (الأطول أولًا)', 'Length (long first)'], ['rev', 'عكس الترتيب الحالي', 'Reverse current order'], ['shuf', 'خلط عشوائي', 'Shuffle']], 'az'),
      ck('blank', 'تجاهل الأسطر الفارغة', 'Drop blank lines', true),
      ck('uniq', 'حذف المكرر', 'Remove duplicates', false)
    ],
    sample: { text: 'banana\napple\nCherry\napple\n10\n2\nمشمش' },
    run(v) {
      let a = v.text.split('\n'); if (!v.text) return null;
      if (v.blank) a = a.filter((x) => x.trim() !== '');
      if (v.uniq) a = a.filter((x, i) => a.indexOf(x) === i);
      const num = (x) => { const n = parseFloat(String(x).replace(/,/g, '')); return Number.isNaN(n) ? Infinity : n; };
      const f = { az: () => a.sort(collator.compare), za: () => a.sort((x, y) => collator.compare(y, x)), num: () => a.sort((x, y) => num(x) - num(y)), numd: () => a.sort((x, y) => num(y) - num(x)), len: () => a.sort((x, y) => x.length - y.length), lend: () => a.sort((x, y) => y.length - x.length), rev: () => a.reverse(), shuf: () => { for (let i = a.length - 1; i > 0; i--) { const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; } }[v.mode];
      f();
      return a.join('\n');
    }
  });

  def('duplicate-line-remover', {
    fields: [
      ta('text', 'الأسطر', 'Lines', { rows: 10 }),
      ck('cs', 'حساس لحالة الأحرف', 'Case-sensitive', false),
      ck('trim', 'تجاهل المسافات الجانبية عند المقارنة', 'Ignore surrounding spaces', true),
      ck('blank', 'حذف الأسطر الفارغة', 'Remove blank lines', false)
    ],
    sample: { text: 'apple\nBanana\napple\n  banana\ncherry\ncherry' },
    run(v, h) {
      if (!v.text) return null;
      const seen = new Set(); const out = []; let removed = 0;
      v.text.split('\n').forEach((l) => {
        if (v.blank && !l.trim()) { removed++; return; }
        let k = v.trim ? l.trim() : l; if (!v.cs) k = k.toLowerCase();
        if (seen.has(k)) { removed++; return; }
        seen.add(k); out.push(l);
      });
      return { text: out.join('\n'), note: h.t('تم حذف ' + removed + ' سطر', removed + ' line(s) removed') };
    }
  });

  def('find-replace', {
    fields: [
      ta('text', 'النص', 'Text', { rows: 8 }),
      tx('find', 'ابحث عن', 'Find', { mono: true }),
      tx('rep', 'استبدل بـ', 'Replace with', { mono: true }),
      ck('re', 'تعبير نمطي Regex', 'Regular expression', false),
      ck('cs', 'حساس لحالة الأحرف', 'Match case', false),
      ck('word', 'الكلمة كاملة فقط', 'Whole word', false)
    ],
    sample: { text: 'The cat sat on the mat. The cat is happy.', find: 'cat', rep: 'dog' },
    run(v, h) {
      if (!v.text || !v.find) return v.text ? { text: v.text } : null;
      let src = v.re ? v.find : v.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (v.word) src = '(?<![\\p{L}\\p{N}_])(?:' + src + ')(?![\\p{L}\\p{N}_])';
      let re; try { re = new RegExp(src, 'gu' + (v.cs ? '' : 'i')); } catch (e) { return { error: h.t('تعبير Regex غير صالح: ', 'Invalid regex: ') + e.message }; }
      let n = 0; const out = v.text.replace(re, (...a) => { n++; return v.re ? v.rep.replace(/\$(\d)/g, (m, d) => (typeof a[+d] === 'string' ? a[+d] : '')) : v.rep; });
      return { text: out, note: h.t('عدد الاستبدالات: ' + n, 'Replacements: ' + n) };
    }
  });

  function lineDiff(a, b) {
    const A = a.split('\n'), B = b.split('\n'); const n = A.length, m = B.length;
    if (n * m > 4_000_000) return null;
    const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const res = []; let i = 0, j = 0;
    while (i < n && j < m) { if (A[i] === B[j]) { res.push(['=', A[i]]); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) { res.push(['-', A[i++]]); } else { res.push(['+', B[j++]]); } }
    while (i < n) res.push(['-', A[i++]]); while (j < m) res.push(['+', B[j++]]);
    return res;
  }
  def('text-compare', {
    layout: 'stack',
    fields: [ta('a', 'النص الأصلي', 'Original', { rows: 8 }), ta('b', 'النص المعدّل', 'Modified', { rows: 8 })],
    sample: { a: 'line one\nline two\nline three', b: 'line one\nline 2\nline three\nline four' },
    run(v, h) {
      if (!v.a && !v.b) return null;
      const d = lineDiff(v.a, v.b); if (!d) return { error: h.t('النصان كبيران جدًا للمقارنة.', 'The texts are too large to compare.') };
      const add = d.filter((x) => x[0] === '+').length, del = d.filter((x) => x[0] === '-').length;
      const html = '<div class="diff" dir="auto">' + d.map((x) => `<div class="d${x[0] === '+' ? ' add' : x[0] === '-' ? ' del' : ''}"><i>${x[0] === '=' ? ' ' : x[0]}</i><span>${esc(x[1]) || '&nbsp;'}</span></div>`).join('') + '</div>';
      return { html, cards: [['أسطر مضافة', 'Added', add], ['أسطر محذوفة', 'Removed', del], ['متطابق', 'Unchanged', d.length - add - del]] };
    }
  });

  const STOP = new Set('the a an and or of to in is are was were be it that this for on with as at by from i you he she we they من في على إلى الى عن مع هذا هذه ذلك التي الذي أن إن كان كانت هو هي هم نحن أنا أنت و أو ثم لا ما قد كل'.split(' '));
  def('word-frequency', {
    fields: [ta('text', 'النص', 'Text', { rows: 10 }), nm('top', 'عدد النتائج', 'Top results', 20, { min: 1, max: 200 }), nm('min', 'أقل طول للكلمة', 'Minimum word length', 2, { min: 1, max: 20 }), ck('stop', 'تجاهل الكلمات الشائعة', 'Ignore common words', true)],
    sample: { text: 'The quick brown fox jumps over the lazy dog. The dog sleeps, the fox runs. هذا هو الاختبار، هذا اختبار جيد.' },
    run(v, h) {
      if (!v.text.trim()) return null;
      const map = new Map();
      wordsOnly(v.text.toLowerCase()).forEach((w) => { if (w.length < (v.min || 1) || (v.stop && STOP.has(w))) return; map.set(w, (map.get(w) || 0) + 1); });
      const rows = [...map.entries()].sort((a, b) => b[1] - a[1] || collator.compare(a[0], b[0])).slice(0, v.top || 20);
      const total = [...map.values()].reduce((a, b) => a + b, 0);
      const html = `<table class="tbl"><thead><tr><th>#</th><th>${h.L('الكلمة', 'Word')}</th><th>${h.L('التكرار', 'Count')}</th><th>%</th></tr></thead><tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td><td dir="auto">${esc(r[0])}</td><td>${r[1]}</td><td>${(r[1] / total * 100).toFixed(1)}</td></tr>`).join('')}</tbody></table>`;
      return { html, copy: rows.map((r) => r[0] + '\t' + r[1]).join('\n'), cards: [['كلمات مختلفة', 'Unique words', map.size], ['إجمالي الكلمات', 'Total words', total]] };
    }
  });

  def('reading-time', {
    fields: [ta('text', 'النص', 'Text', { rows: 10 }), sel('wpm', 'سرعة القراءة', 'Reading speed', [['150', 'بطيئة (150 كلمة/د)', 'Slow (150 wpm)'], ['200', 'متوسطة (200 كلمة/د)', 'Average (200 wpm)'], ['280', 'سريعة (280 كلمة/د)', 'Fast (280 wpm)']], '200')],
    sample: { text: 'Reading time depends on how many words you have and how fast you read. '.repeat(30) },
    run(v, h) {
      const w = words(v.text).length; if (!w) return null;
      const fmt = (min) => { const s = Math.round(min * 60); return Math.floor(s / 60) + h.t(' د ', 'm ') + (s % 60) + h.t(' ث', 's'); };
      return [['عدد الكلمات', 'Words', w], ['وقت القراءة', 'Reading time', fmt(w / +v.wpm)], ['وقت الإلقاء (130 كلمة/د)', 'Speaking time (130 wpm)', fmt(w / 130)], ['قراءة بصوت عالٍ (160 كلمة/د)', 'Aloud (160 wpm)', fmt(w / 160)]];
    }
  });

  const LAT = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
  const ARW = 'هذا النص مثال يمكن أن يستبدل في نفس المساحة وقد تم توليده من مولد النص العربي حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التي يولدها التطبيق إذا كنت تحتاج إلى عدد أكبر من الفقرات فإن هذا المولد سيوفر لك ما تحتاج بسهولة وبدون أي تعقيد الموقع يساعد المصممين على عرض الشكل النهائي للتصميم'.split(' ');
  def('lorem-ipsum-generator', {
    button: ['توليد', 'Generate'],
    fields: [nm('n', 'العدد', 'Amount', 3, { min: 1, max: 100 }), sel('unit', 'الوحدة', 'Unit', [['p', 'فقرات', 'Paragraphs'], ['s', 'جمل', 'Sentences'], ['w', 'كلمات', 'Words']], 'p'), sel('lang', 'اللغة', 'Language', [['la', 'لاتيني', 'Latin'], ['ar', 'عربي', 'Arabic']], 'la'), ck('start', 'ابدأ بعبارة Lorem ipsum الكلاسيكية', 'Start with “Lorem ipsum…”', true)],
    run(v) {
      const W = v.lang === 'ar' ? ARW : LAT; const r = (n) => crypto.getRandomValues(new Uint32Array(1))[0] % n;
      const n = Math.max(1, Math.min(100, Math.floor(v.n) || 1));
      const sentence = () => { const len = 6 + r(10); const a = Array.from({ length: len }, () => W[r(W.length)]); let s = a.join(' '); if (v.lang !== 'ar') s = s[0].toUpperCase() + s.slice(1); return s + (v.lang === 'ar' ? '.' : '.'); };
      const para = () => Array.from({ length: 3 + r(4) }, sentence).join(' ');
      let out;
      if (v.unit === 'w') out = Array.from({ length: n }, () => W[r(W.length)]).join(' ');
      else if (v.unit === 's') out = Array.from({ length: n }, sentence).join(' ');
      else out = Array.from({ length: n }, para).join('\n\n');
      if (v.start && v.lang !== 'ar') out = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + out.replace(/^\S+\s?/, '').replace(/^/, '');
      return { text: out };
    }
  });

  const AR2LAT = { 'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'g', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'ة': 'a', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ء': '', 'ئ': 'e', 'ؤ': 'o', 'پ': 'p', 'چ': 'ch', 'گ': 'g' };
  def('slug-generator', {
    fields: [ta('text', 'العناوين (واحد في كل سطر)', 'Titles (one per line)', { rows: 5 }), sel('arabic', 'الحروف العربية', 'Arabic letters', [['translit', 'تحويل إلى حروف لاتينية', 'Transliterate to Latin'], ['keep', 'إبقاؤها كما هي', 'Keep as is']], 'translit'), sel('sep', 'الفاصل', 'Separator', [['-', 'شرطة -', 'Hyphen -'], ['_', 'شرطة سفلية _', 'Underscore _']], '-'), nm('max', 'أقصى طول (0 = بلا حد)', 'Max length (0 = none)', 0, { min: 0 })],
    sample: { text: 'How to Compress Images Without Losing Quality!\nكيف تضغط الصور بدون فقدان الجودة' },
    run(v) {
      if (!v.text.trim()) return null;
      return v.text.split('\n').filter((l) => l.trim()).map((l) => {
        let s = l.normalize('NFKD').replace(/[ً-ٰٟـ]/g, '').replace(/[̀-ͯ]/g, '').toLowerCase();
        if (v.arabic === 'translit') s = Array.from(s).map((c) => (c in AR2LAT ? AR2LAT[c] : c)).join('');
        s = s.replace(v.arabic === 'keep' ? /[^\p{L}\p{N}]+/gu : /[^a-z0-9]+/g, v.sep).replace(new RegExp('^\\' + v.sep + '+|\\' + v.sep + '+$', 'g'), '');
        if (v.max > 0) s = s.slice(0, v.max).replace(new RegExp('\\' + v.sep + '+$'), '');
        return s;
      }).join('\n');
    }
  });

  def('arabic-diacritics-remover', {
    fields: [ta('text', 'النص العربي', 'Arabic text', { rows: 8, ph: ['اكتب أو الصق النص…', 'Type or paste text…'] }), ck('tashkeel', 'حذف التشكيل (الفتحة والضمة والكسرة…)', 'Remove tashkeel (fatha, damma, kasra…)', true), ck('tatweel', 'حذف التطويل (ـ)', 'Remove tatweel (ـ)', true), ck('alef', 'توحيد الألف (أ إ آ ← ا)', 'Normalize alef (أ إ آ → ا)', false), ck('yeh', 'توحيد الياء (ى ← ي)', 'Normalize yeh (ى → ي)', false), ck('teh', 'التاء المربوطة إلى هاء (ة ← ه)', 'Teh marbuta to heh (ة → ه)', false), ck('digits', 'تحويل الأرقام الهندية إلى 0-9', 'Convert Arabic-Indic digits to 0-9', false)],
    sample: { text: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ ١٢٣' },
    run(v) {
      let s = v.text; if (!s) return null;
      if (v.tashkeel) s = s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭ]/g, '');
      if (v.tatweel) s = s.replace(/ـ/g, '');
      if (v.alef) s = s.replace(/[أإآٱ]/g, 'ا');
      if (v.yeh) s = s.replace(/ى/g, 'ي');
      if (v.teh) s = s.replace(/ة/g, 'ه');
      if (v.digits) s = s.replace(/[٠-٩]/g, (d) => d.charCodeAt(0) - 1632).replace(/[۰-۹]/g, (d) => d.charCodeAt(0) - 1776);
      return { text: s, out: {} };
    }
  });

  /* ----- number to words ----- */
  const AR = { ones: ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'], tens: ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'], hund: ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'], scale: [['', '', ''], ['ألف', 'ألفان', 'آلاف'], ['مليون', 'مليونان', 'ملايين'], ['مليار', 'ملياران', 'مليارات'], ['تريليون', 'تريليونان', 'تريليونات']] };
  function ar999(n) {
    const p = []; const h = Math.floor(n / 100), r = n % 100;
    if (h) p.push(AR.hund[h]);
    if (r) p.push(r < 20 ? AR.ones[r] : (r % 10 ? AR.ones[r % 10] + ' و' : '') + AR.tens[Math.floor(r / 10)]);
    return p.join(' و');
  }
  function arWords(n) {
    if (n === 0) return 'صفر';
    const groups = []; let i = 0;
    while (n > 0) { groups.push(n % 1000); n = Math.floor(n / 1000); i++; }
    const parts = [];
    for (let g = groups.length - 1; g >= 0; g--) {
      const val = groups[g]; if (!val) continue;
      if (g === 0) parts.push(ar999(val));
      else { const sc = AR.scale[g]; parts.push(val === 1 ? sc[0] : val === 2 ? sc[1] : val <= 10 ? ar999(val) + ' ' + sc[2] : ar999(val) + ' ' + sc[0]); }
    }
    return parts.join(' و');
  }
  const EN = { ones: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'], scale: ['', 'thousand', 'million', 'billion', 'trillion'] };
  function en999(n) { const p = []; if (n >= 100) { p.push(EN.ones[Math.floor(n / 100)] + ' hundred'); n %= 100; } if (n) p.push(n < 20 ? EN.ones[n] : EN.tens[Math.floor(n / 10)] + (n % 10 ? '-' + EN.ones[n % 10] : '')); return p.join(' '); }
  function enWords(n) { if (n === 0) return 'zero'; const out = []; let i = 0; while (n > 0) { const g = n % 1000; if (g) out.unshift(en999(g) + (EN.scale[i] ? ' ' + EN.scale[i] : '')); n = Math.floor(n / 1000); i++; } return out.join(' '); }
  const CUR = { none: null, EGP: { ar: ['جنيهًا مصريًا', 'قرشًا'], en: ['Egyptian pounds', 'piastres'] }, SAR: { ar: ['ريالًا سعوديًا', 'هللة'], en: ['Saudi riyals', 'halalas'] }, AED: { ar: ['درهمًا إماراتيًا', 'فلسًا'], en: ['UAE dirhams', 'fils'] }, USD: { ar: ['دولارًا أمريكيًا', 'سنتًا'], en: ['US dollars', 'cents'] } };
  def('number-to-words', {
    fields: [tx('num', 'الرقم', 'Number', { mono: true, ph: ['مثال: 1250.75', 'e.g. 1250.75'] }), sel('lang', 'اللغة', 'Language', [['ar', 'العربية', 'Arabic'], ['en', 'الإنجليزية', 'English']], 'ar'), sel('cur', 'العملة', 'Currency', [['none', 'بدون', 'None'], ['EGP', 'جنيه مصري', 'Egyptian pound'], ['SAR', 'ريال سعودي', 'Saudi riyal'], ['AED', 'درهم إماراتي', 'UAE dirham'], ['USD', 'دولار أمريكي', 'US dollar']], 'none')],
    sample: { num: '1250.75', cur: 'EGP' },
    run(v, h) {
      const s = v.num.trim().replace(/[٠-٩]/g, (d) => d.charCodeAt(0) - 1632).replace(/,/g, ''); if (!s) return null;
      if (!/^\d{1,15}(\.\d+)?$/.test(s)) return { error: h.t('أدخل رقمًا صحيحًا موجبًا (حتى 15 خانة).', 'Enter a positive number (up to 15 digits).') };
      const [ip, fp = ''] = s.split('.'); const I = Number(ip); const W = v.lang === 'ar' ? arWords : enWords; const and = v.lang === 'ar' ? ' و' : ' and ';
      const cur = CUR[v.cur];
      if (cur) {
        const cents = Math.round(Number('0.' + (fp || '0')) * 100); const names = cur[v.lang];
        let out = W(I) + ' ' + names[0]; if (cents) out += and + W(cents) + ' ' + names[1];
        return { text: out + (v.lang === 'ar' ? ' فقط لا غير' : ' only'), out: { mono: false } };
      }
      let out = W(I);
      if (fp) out += (v.lang === 'ar' ? ' فاصلة ' : ' point ') + fp.split('').map((d) => (v.lang === 'ar' ? (d === '0' ? 'صفر' : AR.ones[+d]) : EN.ones[+d])).join(' ');
      return { text: out, out: { mono: false } };
    }
  });

  def('markdown-preview', {
    layout: 'stack',
    fields: [ta('text', 'Markdown', 'Markdown', { rows: 12, mono: true })],
    sample: { text: '# Utilityra\n\nA **free** toolbox with *many* tools.\n\n- Fast\n- Private\n- Bilingual\n\n| Tool | Type |\n|---|---|\n| Word counter | Text |\n| JSON formatter | Dev |\n\n`inline code` and a [link](https://example.com).\n\n```\nconsole.log("hi")\n```' },
    run(v) { if (!v.text.trim()) return null; const html = UT.H.md(v.text); return { html, copy: html, note: null }; }
  });

  def('text-to-speech', {
    mount(root, h) {
      if (!('speechSynthesis' in window)) { root.innerHTML = `<p class="tool-status err">${h.L('متصفحك لا يدعم تحويل النص إلى صوت.', 'Your browser does not support speech synthesis.')}</p>`; return; }
      root.innerHTML = `<div class="tool-grid stack"><form class="tool-in" onsubmit="return false">
        <div class="fld full"><label>${h.L('النص', 'Text')}</label><textarea id="tts-text" rows="8" dir="auto" data-ph-ar="اكتب ما تريد سماعه…" data-ph-en="Type what you want to hear…"></textarea></div>
        <div class="fld"><label>${h.L('الصوت', 'Voice')}</label><select id="tts-voice"></select></div>
        <div class="fld"><label>${h.L('السرعة', 'Speed')}</label><input id="tts-rate" type="range" min="0.5" max="2" step="0.1" value="1"></div>
        <div class="fld"><label>${h.L('درجة الصوت', 'Pitch')}</label><input id="tts-pitch" type="range" min="0.5" max="2" step="0.1" value="1"></div>
        <div class="btnrow"><button class="btn primary" id="tts-play" type="button">${h.L('تشغيل', 'Play')}</button><button class="btn" id="tts-pause" type="button">${h.L('إيقاف مؤقت', 'Pause')}</button><button class="btn ghost" id="tts-stop" type="button">${h.L('إيقاف', 'Stop')}</button></div>
        <p class="hint">${h.L('الأصوات المتاحة تعتمد على جهازك ومتصفحك.', 'Available voices depend on your device and browser.')}</p></form></div>`;
      const vs = h.$('#tts-voice', root); let voices = [];
      const fill = () => { voices = speechSynthesis.getVoices(); vs.innerHTML = voices.map((x, i) => `<option value="${i}">${h.esc(x.name)} (${h.esc(x.lang)})</option>`).join(''); const pref = voices.findIndex((x) => x.lang.toLowerCase().startsWith(h.lang())); if (pref >= 0) vs.value = pref; };
      fill(); speechSynthesis.onvoiceschanged = fill;
      h.$('#tts-play', root).onclick = () => { const txt = h.$('#tts-text', root).value.trim(); if (!txt) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); if (voices[vs.value]) { u.voice = voices[vs.value]; u.lang = voices[vs.value].lang; } u.rate = +h.$('#tts-rate', root).value; u.pitch = +h.$('#tts-pitch', root).value; speechSynthesis.speak(u); };
      let paused = false; h.$('#tts-pause', root).onclick = () => { if (paused) speechSynthesis.resume(); else speechSynthesis.pause(); paused = !paused; };
      h.$('#tts-stop', root).onclick = () => { speechSynthesis.cancel(); paused = false; };
    }
  });
})();
