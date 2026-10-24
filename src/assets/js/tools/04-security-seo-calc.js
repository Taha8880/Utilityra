(function () {
  const { ta, tx, nm, sel, ck, esc } = UT.H;
  const def = UT.def;
  const rnd = (n) => { const lim = Math.floor(0x100000000 / n) * n; let x; do { x = crypto.getRandomValues(new Uint32Array(1))[0]; } while (x >= lim); return x % n; };

  /* ---------- Security ---------- */
  def('password-generator', {
    button: ['توليد كلمات المرور', 'Generate passwords'],
    fields: [{ id: 'len', type: 'range', label: ['الطول', 'Length'], value: 16, min: 6, max: 64 }, nm('n', 'العدد', 'How many', 5, { min: 1, max: 50 }), ck('lower', 'أحرف صغيرة a-z', 'Lowercase a-z', true), ck('upper', 'أحرف كبيرة A-Z', 'Uppercase A-Z', true), ck('digits', 'أرقام 0-9', 'Digits 0-9', true), ck('sym', 'رموز !@#$%', 'Symbols !@#$%', true), ck('amb', 'استبعاد الأحرف المتشابهة (O 0 l 1 I)', 'Avoid look-alike characters (O 0 l 1 I)', true)],
    run(v, h) {
      let sets = []; const cl = (s) => (v.amb ? s.replace(/[O0lI1]/g, '') : s);
      if (v.lower) sets.push(cl('abcdefghijklmnopqrstuvwxyz')); if (v.upper) sets.push(cl('ABCDEFGHIJKLMNOPQRSTUVWXYZ')); if (v.digits) sets.push(cl('0123456789')); if (v.sym) sets.push('!@#$%^&*()-_=+[]{};:,.?/');
      if (!sets.length) return { error: h.t('اختر نوعًا واحدًا على الأقل من الأحرف.', 'Choose at least one character type.') };
      const len = Math.max(Math.min(+v.len || 16, 64), sets.length), all = sets.join(''); const list = [];
      for (let k = 0; k < Math.min(50, Math.max(1, v.n || 1)); k++) {
        const c = sets.map((s) => s[rnd(s.length)]); while (c.length < len) c.push(all[rnd(all.length)]);
        for (let i = c.length - 1; i > 0; i--) { const j = rnd(i + 1); [c[i], c[j]] = [c[j], c[i]]; } list.push(c.join(''));
      }
      return { text: list.join('\n'), note: h.t(`قوة تقريبية: ${Math.round(len * Math.log2(all.length))} بت — تُولَّد داخل متصفحك فقط.`, `≈ ${Math.round(len * Math.log2(all.length))} bits of entropy — generated only in your browser.`) };
    }
  });

  const COMMON = new Set('123456 password 12345678 qwerty 123456789 12345 1234 111111 1234567 dragon 123123 baseball abc123 football monkey letmein 696969 shadow master 666666 qwertyuiop 123321 mustang 1234567890 michael 654321 superman 1qaz2wsx 7777777 121212 000000 qazwsx 123qwe killer trustno1 jordan jennifer zxcvbnm asdfgh hunter buster soccer harley batman andrew tigger sunshine iloveyou 2000 charlie robert thomas hockey ranger daniel starwars klaster 112233 george computer michelle jessica pepper 1111 zxcvbn 555555 11111111 131313 freedom 777777 pass maggie 159753 aaaaaa ginger princess joshua cheese amanda summer love ashley nicole chelsea biteme matthew access yankees 987654321 dallas austin thunder taylor matrix admin welcome password1 p@ssw0rd 00000000'.split(' '));
  def('password-strength-checker', {
    fields: [Object.assign(tx('pw', 'كلمة المرور', 'Password', { mono: true }), { type: 'password', ph: ['اكتب كلمة المرور (لا تُرسل لأي مكان)', 'Type a password (never sent anywhere)'] })],
    run(v, h) {
      const p = v.pw; if (!p) return null; let pool = 0;
      if (/[a-z]/.test(p)) pool += 26; if (/[A-Z]/.test(p)) pool += 26; if (/\d/.test(p)) pool += 10; if (/[^\w\s]/.test(p)) pool += 32; if (/\s/.test(p)) pool += 1; if (/[^\x00-\x7F]/.test(p)) pool += 100;
      let bits = p.length * Math.log2(Math.max(pool, 2)); const tips = [];
      if (COMMON.has(p.toLowerCase())) { bits = Math.min(bits, 10); tips.push(h.t('كلمة مرور شائعة جدًا.', 'Extremely common password.')); }
      if (/(.)\1{2,}/.test(p)) { bits -= 8; tips.push(h.t('تكرار نفس الحرف.', 'Repeated characters.')); }
      if (/(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwer|asdf|zxcv)/i.test(p)) { bits -= 10; tips.push(h.t('تسلسل سهل التخمين.', 'Easy-to-guess sequence.')); }
      if (/^[a-zA-Z]+\d{1,4}$/.test(p)) { bits -= 6; tips.push(h.t('كلمة متبوعة بأرقام نمط شائع.', 'Word + digits is a common pattern.')); }
      if (p.length < 12) tips.push(h.t('استخدم 12 حرفًا على الأقل.', 'Use at least 12 characters.')); if (pool < 62) tips.push(h.t('امزج الأحرف الكبيرة والصغيرة والأرقام والرموز.', 'Mix upper, lower, digits and symbols.'));
      bits = Math.max(0, bits); const secs = Math.pow(2, bits) / 2 / 1e10;
      const dur = (s) => { if (s < 1) return h.t('فورًا', 'Instantly'); const u = [[31557600 * 1e9, 'مليار سنة', 'billion years'], [31557600 * 1e6, 'مليون سنة', 'million years'], [31557600 * 1e3, 'ألف سنة', 'thousand years'], [31557600, 'سنة', 'years'], [86400, 'يوم', 'days'], [3600, 'ساعة', 'hours'], [60, 'دقيقة', 'minutes'], [1, 'ثانية', 'seconds']].find((x) => s >= x[0]); return Math.round(s / u[0]).toLocaleString('en-US') + ' ' + h.t(u[1], u[2]); };
      const lvl = bits < 28 ? ['ضعيفة جدًا', 'Very weak'] : bits < 40 ? ['ضعيفة', 'Weak'] : bits < 60 ? ['متوسطة', 'Fair'] : bits < 80 ? ['قوية', 'Strong'] : ['قوية جدًا', 'Very strong'];
      return { cards: [['التقييم', 'Rating', h.t(lvl[0], lvl[1])], ['الإنتروبيا', 'Entropy', Math.round(bits) + ' bits'], ['زمن الكسر التقريبي*', 'Approx. crack time*', dur(secs)], ['الطول', 'Length', p.length]], html: tips.length ? '<ul>' + tips.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '', note: h.t('*بافتراض 10 مليار محاولة/ثانية على بصمة سريعة. تقدير تقريبي فقط.', '*Assumes 10 billion guesses/s against a fast hash. Rough estimate only.') };
    }
  });

  const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  def('sha256-hash', {
    layout: 'stack',
    fields: [ta('text', 'النص', 'Text', { rows: 6, mono: true }), UT.H.fl('file', 'أو اختر ملفًا', 'Or choose a file'), sel('fmt', 'الصيغة', 'Output', [['hex', 'Hex', 'Hex'], ['b64', 'Base64', 'Base64']], 'hex'), ck('up', 'أحرف كبيرة (Hex)', 'Uppercase (hex)', false)],
    sample: { text: 'Utilityra' },
    async run(v, h) {
      let data;
      if (v.file && v.file[0]) { if (v.file[0].size > 200 * 1024 * 1024) return { error: h.t('الملف كبير (الحد 200MB).', 'File too large (limit 200MB).') }; data = await v.file[0].arrayBuffer(); } else if (v.text) data = new TextEncoder().encode(v.text); else return null;
      const out = [];
      for (const a of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) { const d = await crypto.subtle.digest(a, data); let s = v.fmt === 'hex' ? hex(d) : b64(d); if (v.fmt === 'hex' && v.up) s = s.toUpperCase(); out.push([a, a, s]); }
      return { cards: out, note: v.file && v.file[0] ? h.t('تم حساب بصمة الملف محليًا.', 'File hashed locally.') : null };
    }
  });

  def('random-number-generator', {
    button: ['توليد', 'Generate'],
    fields: [nm('min', 'من', 'Min', 1), nm('max', 'إلى', 'Max', 100), nm('n', 'العدد', 'Count', 1, { min: 1, max: 1000 }), ck('uniq', 'بدون تكرار', 'No duplicates', false), ck('dec', 'أعداد عشرية (حتى منزلتين)', 'Decimals (2 places)', false), sel('sep', 'الفاصل', 'Separator', [['\n', 'سطر جديد', 'New line'], [', ', 'فاصلة', 'Comma'], [' ', 'مسافة', 'Space']], ', ')],
    run(v, h) {
      let { min, max } = v; const n = Math.min(1000, Math.max(1, Math.floor(v.n) || 1)); if (!Number.isFinite(min) || !Number.isFinite(max)) return { error: h.t('أدخل حدين صحيحين.', 'Enter valid bounds.') };
      if (min > max) [min, max] = [max, min]; const out = [];
      if (v.dec) { for (let i = 0; i < n; i++) out.push((min + (crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000) * (max - min)).toFixed(2)); }
      else { min = Math.ceil(min); max = Math.floor(max); const range = max - min + 1; if (v.uniq && n > range) return { error: h.t(`لا يمكن توليد ${n} رقمًا فريدًا من ${range} احتمال.`, `Cannot make ${n} unique numbers from ${range} possibilities.`) }; const seen = new Set(); while (out.length < n) { const x = min + rnd(range); if (v.uniq) { if (seen.has(x)) continue; seen.add(x); } out.push(x); } }
      return { text: out.join(v.sep), out: { rows: 6 } };
    }
  });

  def('binary-hex-converter', {
    layout: 'stack',
    fields: [ta('text', 'المدخل', 'Input', { rows: 6, mono: true }), sel('mode', 'التحويل', 'Convert', [['t2b', 'نص → ثنائي', 'Text → Binary'], ['b2t', 'ثنائي → نص', 'Binary → Text'], ['t2h', 'نص → Hex', 'Text → Hex'], ['h2t', 'Hex → نص', 'Hex → Text']], 't2b')],
    sample: { text: 'Hi مرحبا' },
    run(v, h) {
      if (!v.text) return null; const bad = { error: h.t('مدخل غير صالح لهذا التحويل.', 'Invalid input for this conversion.') };
      try {
        const enc = (s) => Array.from(new TextEncoder().encode(s));
        if (v.mode === 't2b') return enc(v.text).map((b) => b.toString(2).padStart(8, '0')).join(' ');
        if (v.mode === 't2h') return enc(v.text).map((b) => b.toString(16).padStart(2, '0')).join(' ');
        const clean = v.text.replace(/0x/gi, '').replace(/[\s,]+/g, ''); const isB = v.mode === 'b2t';
        if (!(isB ? /^[01]+$/ : /^[0-9a-f]+$/i).test(clean) || clean.length % (isB ? 8 : 2)) return bad;
        const bytes = clean.match(isB ? /.{8}/g : /.{2}/g).map((x) => parseInt(x, isB ? 2 : 16)); return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
      } catch (e) { return bad; }
    }
  });

  def('number-base-converter', {
    fields: [tx('num', 'الرقم', 'Number', { mono: true, value: '255' }), sel('from', 'من نظام', 'From base', [['2', 'ثنائي (2)', 'Binary (2)'], ['8', 'ثماني (8)', 'Octal (8)'], ['10', 'عشري (10)', 'Decimal (10)'], ['16', 'ست عشري (16)', 'Hex (16)'], ['32', '32', '32'], ['36', '36', '36']], '10'), nm('to', 'نظام مخصص (2-36)', 'Custom base (2-36)', 7, { min: 2, max: 36, step: 1 })],
    run(v, h) {
      const s = v.num.trim().toLowerCase().replace(/^0[xbo]/, ''); if (!s) return null; const b = +v.from; const digs = '0123456789abcdefghijklmnopqrstuvwxyz';
      if ([...s].some((c) => digs.indexOf(c) < 0 || digs.indexOf(c) >= b)) return { error: h.t('الرقم يحتوي على رموز غير صالحة لهذا النظام.', 'The number has digits not valid in this base.') };
      let n = 0n; for (const c of s) n = n * BigInt(b) + BigInt(digs.indexOf(c));
      const to = Math.min(36, Math.max(2, Math.floor(v.to) || 2));
      return [['ثنائي (2)', 'Binary (2)', n.toString(2)], ['ثماني (8)', 'Octal (8)', n.toString(8)], ['عشري (10)', 'Decimal (10)', n.toString(10)], ['ست عشري (16)', 'Hex (16)', n.toString(16).toUpperCase()], ['النظام 36', 'Base 36', n.toString(36).toUpperCase()], ['النظام ' + to, 'Base ' + to, n.toString(to).toUpperCase()]];
    }
  });

  /* ---------- SEO ---------- */
  def('meta-tag-generator', {
    layout: 'stack',
    fields: [tx('title', 'عنوان الصفحة', 'Page title'), ta('desc', 'الوصف', 'Description', { rows: 3 }), tx('url', 'الرابط الأساسي (Canonical)', 'Canonical URL', { mono: true, ph: ['https://example.com/page', 'https://example.com/page'] }), tx('img', 'رابط صورة المشاركة', 'Share image URL', { mono: true }), tx('site', 'اسم الموقع', 'Site name'), tx('tw', 'حساب تويتر/X (اختياري)', 'X/Twitter handle (optional)', { mono: true, ph: ['@name', '@name'] }), sel('lang', 'اللغة', 'Language', [['ar', 'العربية', 'Arabic'], ['en', 'الإنجليزية', 'English']], 'ar'), ck('noindex', 'منع الفهرسة (noindex)', 'Block indexing (noindex)', false)],
    sample: { title: 'ضغط الصور أونلاين | Utilityra', desc: 'اضغط صورك دون فقدان الجودة وبدون رفعها لأي خادم.', url: 'https://example.com/tools/image-compressor/', img: 'https://example.com/og.png', site: 'Utilityra' },
    out: { name: 'meta.html', ext: 'html' },
    run(v, h) {
      if (!v.title.trim()) return null; const a = (s) => esc(s.trim()); const L = [];
      L.push('<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">', `<title>${a(v.title)}</title>`);
      if (v.desc.trim()) L.push(`<meta name="description" content="${a(v.desc)}">`);
      L.push(`<meta name="robots" content="${v.noindex ? 'noindex, nofollow' : 'index, follow'}">`);
      if (v.url.trim()) L.push(`<link rel="canonical" href="${a(v.url)}">`);
      L.push(`<meta property="og:type" content="website">`, `<meta property="og:title" content="${a(v.title)}">`); if (v.desc.trim()) L.push(`<meta property="og:description" content="${a(v.desc)}">`); if (v.url.trim()) L.push(`<meta property="og:url" content="${a(v.url)}">`); if (v.img.trim()) L.push(`<meta property="og:image" content="${a(v.img)}">`); if (v.site.trim()) L.push(`<meta property="og:site_name" content="${a(v.site)}">`); L.push(`<meta property="og:locale" content="${v.lang === 'ar' ? 'ar_AR' : 'en_US'}">`);
      L.push(`<meta name="twitter:card" content="${v.img.trim() ? 'summary_large_image' : 'summary'}">`, `<meta name="twitter:title" content="${a(v.title)}">`); if (v.desc.trim()) L.push(`<meta name="twitter:description" content="${a(v.desc)}">`); if (v.img.trim()) L.push(`<meta name="twitter:image" content="${a(v.img)}">`); if (v.tw.trim()) L.push(`<meta name="twitter:site" content="${a(v.tw)}">`);
      const warn = []; if (v.title.length > 60) warn.push(h.t('العنوان أطول من 60 حرفًا وقد يُقتطع.', 'Title is over 60 characters and may be truncated.')); if (v.desc.length > 160) warn.push(h.t('الوصف أطول من 160 حرفًا وقد يُقتطع.', 'Description is over 160 characters and may be truncated.'));
      return { text: L.join('\n'), cards: [['طول العنوان', 'Title length', v.title.length + ' / 60'], ['طول الوصف', 'Description length', v.desc.length + ' / 160']], note: warn.join(' ') || null };
    }
  });

  def('robots-txt-generator', {
    layout: 'stack',
    fields: [sel('ua', 'الزاحف', 'Crawler', [['*', 'كل الزواحف (*)', 'All crawlers (*)'], ['Googlebot', 'Googlebot', 'Googlebot'], ['Bingbot', 'Bingbot', 'Bingbot']], '*'), ta('dis', 'مسارات ممنوعة (Disallow) — سطر لكل مسار', 'Disallowed paths — one per line', { rows: 3, mono: true, value: '/admin/' }), ta('allow', 'مسارات مسموحة (Allow)', 'Allowed paths (Allow)', { rows: 2, mono: true }), tx('sitemap', 'رابط sitemap', 'Sitemap URL', { mono: true, ph: ['https://example.com/sitemap.xml', 'https://example.com/sitemap.xml'] }), nm('delay', 'Crawl-delay (ثوانٍ، اختياري)', 'Crawl-delay (seconds, optional)', '', { min: 0 }), ck('ai', 'منع زواحف تدريب الذكاء الاصطناعي (GPTBot, CCBot…)', 'Block AI-training crawlers (GPTBot, CCBot…)', false), ck('all', 'السماح لكل شيء (بدون منع)', 'Allow everything', false)],
    sample: { sitemap: 'https://example.com/sitemap.xml' },
    out: { name: 'robots.txt' },
    run(v) {
      const L = [`User-agent: ${v.ua}`]; const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
      if (v.all) L.push('Disallow:'); else { lines(v.dis).forEach((x) => L.push('Disallow: ' + x)); if (!lines(v.dis).length) L.push('Disallow:'); }
      lines(v.allow).forEach((x) => L.push('Allow: ' + x)); if (v.delay > 0) L.push('Crawl-delay: ' + v.delay);
      if (v.ai) ['GPTBot', 'ChatGPT-User', 'CCBot', 'Google-Extended', 'anthropic-ai', 'ClaudeBot', 'PerplexityBot', 'Bytespider'].forEach((b) => L.push('', `User-agent: ${b}`, 'Disallow: /'));
      if (v.sitemap.trim()) L.push('', 'Sitemap: ' + v.sitemap.trim());
      return L.join('\n');
    }
  });

  def('sitemap-generator', {
    layout: 'stack',
    fields: [ta('urls', 'الروابط (رابط في كل سطر)', 'URLs (one per line)', { rows: 8, mono: true }), sel('freq', 'معدل التغيير', 'Change frequency', [['', 'بدون', 'None'], ['daily', 'يوميًا', 'Daily'], ['weekly', 'أسبوعيًا', 'Weekly'], ['monthly', 'شهريًا', 'Monthly'], ['yearly', 'سنويًا', 'Yearly']], 'weekly'), nm('prio', 'الأولوية (0.0 - 1.0)', 'Priority (0.0 - 1.0)', 0.8, { min: 0, max: 1, step: 0.1 }), ck('last', 'إضافة تاريخ اليوم lastmod', 'Add today as lastmod', true)],
    sample: { urls: 'https://example.com/\nhttps://example.com/about/\nhttps://example.com/tools/' },
    out: { name: 'sitemap.xml', ext: 'xml' },
    run(v, h) {
      const urls = v.urls.split('\n').map((x) => x.trim()).filter(Boolean); if (!urls.length) return null;
      const bad = urls.filter((u) => { try { return !/^https?:$/.test(new URL(u).protocol); } catch (e) { return true; } }); if (bad.length) return { error: h.t('رابط غير صالح: ', 'Invalid URL: ') + bad[0] };
      if (urls.length > 50000) return { error: h.t('الحد الأقصى 50,000 رابط.', 'Maximum 50,000 URLs.') };
      const today = new Date().toISOString().slice(0, 10);
      const body = [...new Set(urls)].map((u) => `  <url>\n    <loc>${xmlEscape(u)}</loc>${v.last ? `\n    <lastmod>${today}</lastmod>` : ''}${v.freq ? `\n    <changefreq>${v.freq}</changefreq>` : ''}${Number.isFinite(v.prio) ? `\n    <priority>${Math.min(1, Math.max(0, v.prio)).toFixed(1)}</priority>` : ''}\n  </url>`).join('\n');
      return { text: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`, note: h.t('عدد الروابط: ' + new Set(urls).size, 'URLs: ' + new Set(urls).size) };
    }
  });
  const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

  def('serp-preview', {
    layout: 'stack',
    fields: [tx('title', 'العنوان', 'Title'), tx('url', 'الرابط', 'URL', { mono: true, value: 'https://example.com/page' }), ta('desc', 'الوصف', 'Description', { rows: 3 })],
    sample: { title: 'ضغط الصور أونلاين مجانًا بدون رفع | Utilityra', url: 'https://utilityra.example/tools/image-compressor/', desc: 'اضغط صور JPG وPNG وWebP مباشرة داخل متصفحك، تحكم في الجودة وحمّل النتيجة فورًا دون رفع ملفاتك لأي خادم.' },
    run(v, h) {
      if (!v.title.trim() && !v.desc.trim()) return null; const cut = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
      let host = v.url, crumb = '';
      try { const u = new URL(v.url); host = u.hostname; crumb = u.pathname.split('/').filter(Boolean).join(' › '); } catch (e) { /* keep raw */ }
      const card = (w) => `<div class="serp" style="max-width:${w}px" dir="auto"><div class="serp-url">${esc(host)}${crumb ? ' › ' + esc(crumb) : ''}</div><div class="serp-title">${esc(cut(v.title, 60))}</div><div class="serp-desc">${esc(cut(v.desc, 160))}</div></div>`;
      return { html: `<p class="hint">${h.L('سطح المكتب', 'Desktop')}</p>${card(600)}<p class="hint">${h.L('الجوال', 'Mobile')}</p>${card(360)}`, cards: [['طول العنوان', 'Title length', v.title.length + ' / 60'], ['طول الوصف', 'Description length', v.desc.length + ' / 160']], copy: v.title + '\n' + v.desc };
    }
  });

  def('utm-builder', {
    layout: 'stack',
    fields: [tx('url', 'رابط الصفحة', 'Page URL', { mono: true, ph: ['https://example.com/landing', 'https://example.com/landing'] }), tx('source', 'المصدر utm_source *', 'Source utm_source *', { mono: true, ph: ['facebook', 'facebook'] }), tx('medium', 'الوسيط utm_medium *', 'Medium utm_medium *', { mono: true, ph: ['social', 'social'] }), tx('campaign', 'الحملة utm_campaign *', 'Campaign utm_campaign *', { mono: true, ph: ['spring_sale', 'spring_sale'] }), tx('term', 'utm_term', 'utm_term', { mono: true }), tx('content', 'utm_content', 'utm_content', { mono: true })],
    sample: { url: 'https://example.com/landing', source: 'newsletter', medium: 'email', campaign: 'launch_2026' },
    run(v, h) {
      if (!v.url.trim()) return null; let u; try { u = new URL(v.url.trim()); } catch (e) { return { error: h.t('رابط غير صالح (أضف https://).', 'Invalid URL (add https://).') }; }
      if (!v.source.trim() || !v.medium.trim() || !v.campaign.trim()) return { error: h.t('الحقول المطلوبة: المصدر والوسيط والحملة.', 'Required: source, medium and campaign.') };
      [['source', 'utm_source'], ['medium', 'utm_medium'], ['campaign', 'utm_campaign'], ['term', 'utm_term'], ['content', 'utm_content']].forEach(([k, p]) => { if (v[k].trim()) u.searchParams.set(p, v[k].trim()); });
      return { text: u.toString(), out: { rows: 4 } };
    }
  });

  /* ---------- Calculators ---------- */
  def('percentage-calculator', {
    fields: [nm('a', 'النسبة / القيمة الأولى (A)', 'Value A', 20), nm('b', 'القيمة الثانية (B)', 'Value B', 150)],
    run(v, h) {
      const { a, b } = v; if (!Number.isFinite(a) || !Number.isFinite(b)) return null; const f = h.fmtNum;
      return [[`${f(a)}% من ${f(b)}`, `${f(a)}% of ${f(b)}`, f(a / 100 * b)], [`${f(a)} تمثل كم % من ${f(b)}`, `${f(a)} is what % of ${f(b)}`, b === 0 ? '—' : f(a / b * 100) + '%'], [`التغيّر من ${f(a)} إلى ${f(b)}`, `Change from ${f(a)} to ${f(b)}`, a === 0 ? '—' : f((b - a) / Math.abs(a) * 100) + '%'], [`${f(b)} + ${f(a)}%`, `${f(b)} + ${f(a)}%`, f(b * (1 + a / 100))], [`${f(b)} − ${f(a)}%`, `${f(b)} − ${f(a)}%`, f(b * (1 - a / 100))]];
    }
  });

  def('vat-calculator', {
    fields: [nm('amt', 'المبلغ', 'Amount', 1000, { min: 0 }), nm('rate', 'نسبة الضريبة %', 'VAT rate %', 14, { min: 0 }), sel('mode', 'الحالة', 'Mode', [['add', 'المبلغ قبل الضريبة (أضف الضريبة)', 'Amount excludes VAT (add VAT)'], ['ext', 'المبلغ شامل الضريبة (استخرج الضريبة)', 'Amount includes VAT (extract VAT)']], 'add')],
    run(v, h) {
      if (!Number.isFinite(v.amt) || !Number.isFinite(v.rate)) return null; const r = v.rate / 100;
      const net = v.mode === 'add' ? v.amt : v.amt / (1 + r), gross = v.mode === 'add' ? v.amt * (1 + r) : v.amt;
      return [['المبلغ قبل الضريبة', 'Net (excl. VAT)', h.money(net)], ['قيمة الضريبة', 'VAT amount', h.money(gross - net)], ['المبلغ شامل الضريبة', 'Gross (incl. VAT)', h.money(gross)]];
    }
  });

  def('discount-calculator', {
    fields: [nm('price', 'السعر الأصلي', 'Original price', 500, { min: 0 }), nm('d1', 'الخصم %', 'Discount %', 20, { min: 0, max: 100 }), nm('d2', 'خصم إضافي % (اختياري)', 'Extra discount % (optional)', 0, { min: 0, max: 100 })],
    run(v, h) {
      if (!Number.isFinite(v.price) || !Number.isFinite(v.d1)) return null; const d2 = Number.isFinite(v.d2) ? v.d2 : 0; const final = v.price * (1 - v.d1 / 100) * (1 - d2 / 100);
      return [['السعر بعد الخصم', 'Final price', h.money(final)], ['قيمة التوفير', 'You save', h.money(v.price - final)], ['نسبة الخصم الفعلية', 'Effective discount', h.fmtNum(v.price ? (1 - final / v.price) * 100 : 0, 2) + '%']];
    }
  });

  def('hourly-pay-calculator', {
    fields: [nm('amt', 'المبلغ', 'Amount', 100, { min: 0 }), sel('per', 'لكل', 'Per', [['h', 'ساعة', 'Hour'], ['d', 'يوم', 'Day'], ['w', 'أسبوع', 'Week'], ['m', 'شهر', 'Month'], ['y', 'سنة', 'Year']], 'h'), nm('hpd', 'ساعات العمل يوميًا', 'Hours per day', 8, { min: 0.5, max: 24 }), nm('dpw', 'أيام العمل أسبوعيًا', 'Days per week', 5, { min: 1, max: 7 })],
    run(v, h) {
      if (!Number.isFinite(v.amt) || !(v.hpd > 0) || !(v.dpw > 0)) return null; const hw = v.hpd * v.dpw, hm = hw * 52 / 12, hy = hw * 52;
      const hourly = { h: v.amt, d: v.amt / v.hpd, w: v.amt / hw, m: v.amt / hm, y: v.amt / hy }[v.per];
      return [['بالساعة', 'Hourly', h.money(hourly)], ['باليوم', 'Daily', h.money(hourly * v.hpd)], ['بالأسبوع', 'Weekly', h.money(hourly * hw)], ['بالشهر', 'Monthly', h.money(hourly * hm)], ['بالسنة', 'Yearly', h.money(hourly * hy)]];
    }
  });

  def('loan-calculator', {
    layout: 'stack',
    fields: [nm('p', 'مبلغ القرض', 'Loan amount', 100000, { min: 0 }), nm('r', 'الفائدة السنوية %', 'Annual interest %', 15, { min: 0 }), nm('y', 'المدة (سنوات)', 'Term (years)', 5, { min: 0.1 })],
    run(v, h) {
      const { p, r, y } = v; if (!(p > 0) || !(r >= 0) || !(y > 0)) return null; const n = Math.round(y * 12), i = r / 1200;
      const pay = i === 0 ? p / n : p * i / (1 - Math.pow(1 + i, -n)); let bal = p; const rows = [];
      for (let k = 1; k <= n; k++) { const int = bal * i, pr = pay - int; bal = Math.max(0, bal - pr); if (k <= 24 || k === n) rows.push([k, pay, pr, int, bal]); }
      const html = `<table class="tbl"><thead><tr><th>#</th><th>${h.L('القسط', 'Payment')}</th><th>${h.L('أصل', 'Principal')}</th><th>${h.L('فائدة', 'Interest')}</th><th>${h.L('المتبقي', 'Balance')}</th></tr></thead><tbody>${rows.map((x) => `<tr><td>${x[0]}</td>${x.slice(1).map((c) => `<td>${h.money(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      return { cards: [['القسط الشهري', 'Monthly payment', h.money(pay)], ['إجمالي المدفوع', 'Total paid', h.money(pay * n)], ['إجمالي الفوائد', 'Total interest', h.money(pay * n - p)], ['عدد الأقساط', 'Payments', n]], html, note: h.t('يعرض الجدول أول 24 قسطًا وآخر قسط.', 'Table shows the first 24 payments and the last one.') };
    }
  });

  def('compound-interest', {
    layout: 'stack',
    fields: [nm('p', 'المبلغ الابتدائي', 'Initial amount', 10000, { min: 0 }), nm('d', 'الإيداع الشهري', 'Monthly deposit', 500, { min: 0 }), nm('r', 'العائد السنوي %', 'Annual return %', 8, { min: 0 }), nm('y', 'المدة (سنوات)', 'Years', 10, { min: 1, max: 80, step: 1 }), sel('f', 'تكرار احتساب الفائدة', 'Compounding', [['12', 'شهريًا', 'Monthly'], ['1', 'سنويًا', 'Yearly'], ['4', 'ربع سنوي', 'Quarterly'], ['365', 'يوميًا', 'Daily']], '12')],
    run(v, h) {
      if (!(v.p >= 0) || !(v.r >= 0) || !(v.y > 0)) return null; const years = Math.floor(v.y), mr = Math.pow(1 + v.r / 100 / v.f, v.f / 12) - 1; let bal = v.p, dep = v.p; const rows = [];
      for (let m = 1; m <= years * 12; m++) { bal = bal * (1 + mr) + (v.d || 0); dep += v.d || 0; if (m % 12 === 0) rows.push([m / 12, dep, bal - dep, bal]); }
      const html = `<table class="tbl"><thead><tr><th>${h.L('السنة', 'Year')}</th><th>${h.L('المساهمات', 'Contributions')}</th><th>${h.L('الفوائد', 'Interest')}</th><th>${h.L('الرصيد', 'Balance')}</th></tr></thead><tbody>${rows.map((x) => `<tr><td>${x[0]}</td>${x.slice(1).map((c) => `<td>${h.money(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      return { cards: [['الرصيد النهائي', 'Final balance', h.money(bal)], ['إجمالي المساهمات', 'Total contributed', h.money(dep)], ['إجمالي الفوائد', 'Total interest', h.money(bal - dep)]], html, note: h.t('تقدير نظري، العوائد الفعلية تتغير ولا تُضمن.', 'A theoretical estimate; real returns vary and are not guaranteed.') };
    }
  });

  def('bmi-calculator', {
    fields: [sel('u', 'الوحدات', 'Units', [['m', 'متري (كجم / سم)', 'Metric (kg / cm)'], ['i', 'إمبراطوري (رطل / بوصة)', 'Imperial (lb / in)']], 'm'), nm('w', 'الوزن', 'Weight', 70, { min: 1 }), nm('hgt', 'الطول', 'Height', 175, { min: 30 })],
    run(v, h) {
      let w = v.w, hm = v.hgt; if (!(w > 0) || !(hm > 0)) return null; if (v.u === 'i') { w *= 0.45359237; hm *= 2.54; } hm /= 100;
      const bmi = w / (hm * hm); const c = bmi < 18.5 ? ['نقص في الوزن', 'Underweight'] : bmi < 25 ? ['وزن طبيعي', 'Normal weight'] : bmi < 30 ? ['زيادة في الوزن', 'Overweight'] : ['سمنة', 'Obesity'];
      const lo = 18.5 * hm * hm, hi = 24.9 * hm * hm; const conv = (x) => (v.u === 'i' ? x / 0.45359237 : x);
      return { cards: [['مؤشر كتلة الجسم', 'BMI', bmi.toFixed(1)], ['التصنيف', 'Category', h.t(c[0], c[1])], ['الوزن الصحي التقريبي', 'Healthy weight range', conv(lo).toFixed(1) + ' – ' + conv(hi).toFixed(1) + (v.u === 'i' ? ' lb' : ' kg')]], note: h.t('مؤشر عام للبالغين وليس تشخيصًا طبيًا. استشر طبيبك.', 'A general adult screening index, not a medical diagnosis. Consult your doctor.') };
    }
  });

  /* scientific calculator: safe recursive-descent parser */
  function calcEval(src, deg) {
    const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/\s+/g, '').toLowerCase();
    let i = 0; const toRad = (x) => (deg ? x * Math.PI / 180 : x), fromRad = (x) => (deg ? x * 180 / Math.PI : x);
    const fact = (n) => { if (n < 0 || n !== Math.floor(n) || n > 170) throw new Error('fact'); let r = 1; for (let k = 2; k <= n; k++) r *= k; return r; };
    const F = { sin: (x) => Math.sin(toRad(x)), cos: (x) => Math.cos(toRad(x)), tan: (x) => Math.tan(toRad(x)), asin: (x) => fromRad(Math.asin(x)), acos: (x) => fromRad(Math.acos(x)), atan: (x) => fromRad(Math.atan(x)), ln: Math.log, log: Math.log10, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, exp: Math.exp, fact, floor: Math.floor, ceil: Math.ceil, round: Math.round };
    function expr() { let v = term(); while (s[i] === '+' || s[i] === '-') { const o = s[i++]; const r = term(); v = o === '+' ? v + r : v - r; } return v; }
    function term() { let v = pow(); while (s[i] === '*' || s[i] === '/' || s[i] === '%') { const o = s[i++]; const r = pow(); v = o === '*' ? v * r : o === '/' ? v / r : v % r; } return v; }
    function pow() { const b = unary(); if (s[i] === '^') { i++; return Math.pow(b, pow()); } return b; }
    function unary() { if (s[i] === '-') { i++; return -unary(); } if (s[i] === '+') { i++; return unary(); } return post(); }
    function post() { let v = atom(); while (s[i] === '!') { i++; v = fact(v); } return v; }
    function atom() {
      if (s[i] === '(') { i++; const v = expr(); if (s[i] !== ')') throw new Error('paren'); i++; return v; }
      const m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/); if (m) { i += m[0].length; return parseFloat(m[0]); }
      const id = s.slice(i).match(/^[a-z]+/); if (id) { const name = id[0]; i += name.length; if (name === 'pi') return Math.PI; if (name === 'e') return Math.E; if (F[name]) { if (s[i] !== '(') { return F[name](unary()); } i++; const v = expr(); if (s[i] !== ')') throw new Error('paren'); i++; return F[name](v); } }
      throw new Error('syntax');
    }
    const out = expr(); if (i < s.length) throw new Error('syntax'); return out;
  }
  def('scientific-calculator', {
    mount(root, h) {
      const keys = [['sin(', 'sin'], ['cos(', 'cos'], ['tan(', 'tan'], ['ln(', 'ln'], ['log(', 'log'], ['sqrt(', '√'], ['^', 'xʸ'], ['!', 'n!'], ['pi', 'π'], ['e', 'e'], ['(', '('], [')', ')'], ['7'], ['8'], ['9'], ['/', '÷'], ['4'], ['5'], ['6'], ['*', '×'], ['1'], ['2'], ['3'], ['-', '−'], ['0'], ['.'], ['%', 'mod'], ['+']];
      root.innerHTML = `<div class="calc"><div class="calc-top"><label class="ck"><input type="checkbox" id="sc-deg" checked> <span>${h.L('درجات (Deg)', 'Degrees (Deg)')}</span></label><button class="btn ghost" id="sc-hist-clear" type="button">${h.L('مسح السجل', 'Clear history')}</button></div>
        <input class="calc-display" id="sc-in" dir="ltr" inputmode="none" autocomplete="off" placeholder="0"><div class="calc-result" id="sc-out" dir="ltr">0</div>
        <div class="calc-keys">${keys.map((k) => `<button type="button" class="key${/^\d$|^\.$/.test(k[0]) ? '' : ' op'}" data-k="${h.esc(k[0])}">${h.esc(k[1] || k[0])}</button>`).join('')}<button type="button" class="key op" id="sc-ac">AC</button><button type="button" class="key op" id="sc-del">⌫</button><button type="button" class="key eq" id="sc-eq">=</button></div>
        <ol class="calc-hist" id="sc-hist" dir="ltr"></ol></div>`;
      const inp = h.$('#sc-in', root), out = h.$('#sc-out', root), hist = h.$('#sc-hist', root); let last = '';
      const show = () => { if (!inp.value.trim()) { out.textContent = '0'; return; } try { const r = calcEval(inp.value, h.$('#sc-deg', root).checked); out.textContent = Number.isFinite(r) ? String(+r.toPrecision(14)) : h.t('غير معرّف', 'Undefined'); last = out.textContent; } catch (e) { out.textContent = '…'; } };
      inp.addEventListener('input', show); h.$('#sc-deg', root).addEventListener('change', show);
      h.$$('[data-k]', root).forEach((b) => b.addEventListener('click', () => { const p = inp.selectionStart == null ? inp.value.length : inp.selectionStart; inp.value = inp.value.slice(0, p) + b.dataset.k + inp.value.slice(inp.selectionEnd == null ? p : inp.selectionEnd); inp.focus(); inp.setSelectionRange(p + b.dataset.k.length, p + b.dataset.k.length); show(); }));
      h.$('#sc-ac', root).onclick = () => { inp.value = ''; show(); inp.focus(); };
      h.$('#sc-del', root).onclick = () => { inp.value = inp.value.slice(0, -1); show(); };
      const eq = () => { if (!inp.value.trim()) return; try { const r = calcEval(inp.value, h.$('#sc-deg', root).checked); if (!Number.isFinite(r)) throw new Error('nan'); const li = document.createElement('li'); li.textContent = inp.value + ' = ' + +r.toPrecision(14); hist.prepend(li); inp.value = String(+r.toPrecision(14)); show(); } catch (e) { out.textContent = h.t('خطأ في التعبير', 'Expression error'); } };
      h.$('#sc-eq', root).onclick = eq; inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); eq(); } });
      h.$('#sc-hist-clear', root).onclick = () => { hist.innerHTML = ''; };
    }
  });
  window.__calcEval = calcEval;

  def('statistics-calculator', {
    fields: [ta('text', 'الأرقام (مفصولة بفاصلة أو مسافة أو سطر)', 'Numbers (comma, space or newline separated)', { rows: 6, mono: true })],
    sample: { text: '12, 15, 15, 18, 22, 25, 25, 25, 30' },
    run(v, h) {
      const raw = v.text.split(/[\s,;،]+/).filter(Boolean); if (!raw.length) return null; const a = raw.map(Number); if (a.some((x) => !Number.isFinite(x))) return { error: h.t('يوجد مدخل غير رقمي: ', 'Non-numeric entry: ') + raw[a.findIndex((x) => !Number.isFinite(x))] };
      const s = [...a].sort((x, y) => x - y), n = s.length, sum = s.reduce((x, y) => x + y, 0), mean = sum / n; const q = (p) => { const k = (n - 1) * p, f = Math.floor(k); return s[f] + (s[Math.min(f + 1, n - 1)] - s[f]) * (k - f); };
      const cnt = new Map(); s.forEach((x) => cnt.set(x, (cnt.get(x) || 0) + 1)); const mx = Math.max(...cnt.values()); const mode = mx === 1 ? h.t('لا يوجد', 'None') : [...cnt].filter((x) => x[1] === mx).map((x) => x[0]).join(', ');
      const ss = s.reduce((x, y) => x + (y - mean) ** 2, 0), f = h.fmtNum;
      return [['العدد', 'Count', n], ['المجموع', 'Sum', f(sum)], ['المتوسط', 'Mean', f(mean)], ['الوسيط', 'Median', f(q(0.5))], ['المنوال', 'Mode', mode], ['أصغر قيمة', 'Min', f(s[0])], ['أكبر قيمة', 'Max', f(s[n - 1])], ['المدى', 'Range', f(s[n - 1] - s[0])], ['الربيع الأول Q1', 'Q1', f(q(0.25))], ['الربيع الثالث Q3', 'Q3', f(q(0.75))], ['التباين (مجتمع)', 'Variance (population)', f(ss / n)], ['الانحراف المعياري (مجتمع)', 'Std dev (population)', f(Math.sqrt(ss / n))], ['التباين (عينة)', 'Variance (sample)', n > 1 ? f(ss / (n - 1)) : '—'], ['الانحراف المعياري (عينة)', 'Std dev (sample)', n > 1 ? f(Math.sqrt(ss / (n - 1))) : '—']];
    }
  });
})();
