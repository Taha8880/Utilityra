(function () {
  const { ta, tx, nm, sel, ck, fl, esc } = UT.H;
  const def = UT.def;
  const CFGX = window.UTILITYRA || {};
  const pdfLib = async () => { if (!window.PDFLib) await UT.H.loadScript(UT.H.base + 'vendor/pdf-lib.min.js'); return window.PDFLib; };
  const noFile = (h) => ({ error: h.t('اختر ملفًا أولًا.', 'Choose a file first.') });

  /* ---------- text / html ---------- */
  def('reverse-text', {
    fields: [ta('t', 'النص', 'Text', { ph: ['اكتب النص هنا', 'Type text here'] }), sel('m', 'الطريقة', 'Mode', [['chars', 'عكس الحروف', 'Reverse characters'], ['words', 'عكس ترتيب الكلمات', 'Reverse word order'], ['lines', 'عكس ترتيب الأسطر', 'Reverse line order']], 'chars')],
    run(v) {
      if (!v.t) return null;
      if (v.m === 'words') return v.t.split('\n').map((l) => l.split(/\s+/).filter(Boolean).reverse().join(' ')).join('\n');
      if (v.m === 'lines') return v.t.split('\n').reverse().join('\n');
      return Array.from(v.t).reverse().join('');
    }
  });

  def('html-preview', {
    button: ['معاينة', 'Preview'], layout: 'stack',
    fields: [ta('h', 'كود HTML', 'HTML code', { rows: 10, mono: true, value: '<h1 style="font-family:sans-serif">Hello Utilityra</h1>\n<p>Edit me.</p>' })],
    run(v, h) {
      if (!v.h.trim()) return null;
      const doc = v.h.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      return { html: `<iframe sandbox title="preview" style="width:100%;height:320px;border:1px solid var(--line);border-radius:10px;background:#fff" srcdoc="${doc}"></iframe><p class="hint">${h.t('المعاينة معزولة (sandbox): لا تُنفَّذ السكربتات.', 'Sandboxed preview: scripts do not run.')}</p>` };
    }
  });

  /* ---------- contrast ---------- */
  const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0); };
  def('contrast-checker', {
    fields: [{ id: 'fg', type: 'color', label: ['لون النص', 'Text color'], value: '#252525' }, { id: 'bg', type: 'color', label: ['لون الخلفية', 'Background'], value: '#FFFDFA' }],
    run(v, h) {
      const a = lum(v.fg), b = lum(v.bg); const r = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      const ok = (x) => (r >= x ? h.t('نجح ✓', 'Pass ✓') : h.t('فشل ✗', 'Fail ✗'));
      return { cards: [['نسبة التباين', 'Contrast ratio', r.toFixed(2) + ' : 1'], ['نص عادي AA (4.5)', 'Normal text AA (4.5)', ok(4.5)], ['نص كبير AA (3)', 'Large text AA (3)', ok(3)], ['نص عادي AAA (7)', 'Normal text AAA (7)', ok(7)], ['مكونات الواجهة (3)', 'UI components (3)', ok(3)]], html: `<div style="padding:18px;border-radius:12px;background:${v.bg};color:${v.fg};border:1px solid var(--line);font-size:1.1rem">${h.t('نص تجريبي Aa — Sample text', 'Sample text Aa — نص تجريبي')}</div>` };
    }
  });

  /* ---------- PDF extras ---------- */
  def('pdf-rotate', {
    button: ['تدوير', 'Rotate'], layout: 'stack',
    fields: [fl('f', 'ملف PDF', 'PDF file', { accept: 'application/pdf,.pdf' }), sel('a', 'الزاوية', 'Angle', [['90', '90° مع عقارب الساعة', '90° clockwise'], ['180', '180°', '180°'], ['270', '90° عكس عقارب الساعة', '90° counter-clockwise']], '90'), tx('pages', 'الصفحات (فارغ = الكل، مثال 1-3,5)', 'Pages (empty = all, e.g. 1-3,5)', { mono: true })],
    async run(v, h) {
      const f = v.f[0]; if (!f) return noFile(h); if (f.size > 60 * 1024 * 1024) return { error: h.t('الملف كبير (الحد 60MB).', 'File too large (limit 60MB).') };
      const { PDFDocument, degrees } = await pdfLib(); let doc; try { doc = await PDFDocument.load(await f.arrayBuffer()); } catch (e) { return { error: h.t('تعذّر قراءة الملف.', 'Could not read the file.') }; }
      const n = doc.getPageCount(); let idx = Array.from({ length: n }, (_, i) => i);
      if (v.pages.trim()) { const set = new Set(); for (const part of v.pages.split(/[,،\s]+/).filter(Boolean)) { const m = part.match(/^(\d+)(?:-(\d+))?$/); if (!m) return { error: h.t('نطاق غير صالح.', 'Invalid range.') }; const a = +m[1], b = +(m[2] || m[1]); if (a < 1 || b > n || a > b) return { error: h.t(`نطاق غير صالح. عدد الصفحات ${n}.`, `Invalid range. The file has ${n} pages.`) }; for (let i = a; i <= b; i++) set.add(i - 1); } idx = [...set]; }
      idx.forEach((i) => { const p = doc.getPage(i); p.setRotation(degrees((p.getRotation().angle + +v.a) % 360)); });
      const blob = new Blob([await doc.save()], { type: 'application/pdf' });
      return { note: h.t(`تم تدوير ${idx.length} صفحة.`, `Rotated ${idx.length} page(s).`), downloads: [{ name: f.name.replace(/\.pdf$/i, '') + '-rotated.pdf', blob, label: ['تنزيل PDF', 'Download PDF'] }] };
    }
  });

  def('pdf-to-text', {
    button: ['استخراج النص', 'Extract text'], layout: 'stack',
    fields: [fl('f', 'ملف PDF', 'PDF file', { accept: 'application/pdf,.pdf', hint: ['يعمل مع ملفات PDF النصية. الملفات الممسوحة ضوئيًا (صور) لا تحتوي نصًا.', 'Works on text PDFs. Scanned (image) PDFs contain no text.'] })],
    async run(v, h) {
      const f = v.f[0]; if (!f) return noFile(h); if (f.size > 40 * 1024 * 1024) return { error: h.t('الملف كبير (الحد 40MB).', 'File too large (limit 40MB).') };
      let lib; try { lib = await import(UT.H.base + 'vendor/pdfjs/pdf.min.mjs'); lib.GlobalWorkerOptions.workerSrc = UT.H.base + 'vendor/pdfjs/pdf.worker.min.mjs'; } catch (e) { return { error: h.t('تعذّر تحميل قارئ PDF.', 'Could not load the PDF reader.') }; }
      let pdf; try { pdf = await lib.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise; } catch (e) { return { error: h.t('تعذّر قراءة الملف (تالف أو محمي بكلمة مرور).', 'Could not read the file (damaged or password-protected).') }; }
      const out = []; const max = Math.min(pdf.numPages, 200);
      for (let i = 1; i <= max; i++) { const c = await (await pdf.getPage(i)).getTextContent(); let line = '', y = null; const lines = []; c.items.forEach((it) => { if (y !== null && Math.abs(it.transform[5] - y) > 2) { lines.push(line); line = ''; } line += it.str + (it.hasEOL ? '' : ''); y = it.transform[5]; }); lines.push(line); out.push(lines.join('\n')); }
      const text = out.map((t, i) => `--- ${h.t('صفحة', 'Page')} ${i + 1} ---\n${t}`).join('\n\n');
      if (!text.replace(/--- .*? ---/g, '').trim()) return { error: h.t('لا يوجد نص قابل للاستخراج (الملف ممسوح ضوئيًا غالبًا).', 'No extractable text (probably a scanned PDF).') };
      return { text, note: h.t(`${pdf.numPages} صفحة${pdf.numPages > max ? ` — تم استخراج أول ${max}` : ''}.`, `${pdf.numPages} page(s)${pdf.numPages > max ? ` — first ${max} extracted` : ''}.`) };
    }
  });

  /* ---------- favicon ---------- */
  def('favicon-generator', {
    button: ['توليد', 'Generate'], layout: 'stack',
    fields: [fl('f', 'صورة الشعار (PNG/JPG/SVG)', 'Logo image (PNG/JPG/SVG)', { accept: 'image/*' }), { id: 'bg', type: 'color', label: ['لون الخلفية (للشفافية اتركه أبيض واختر "شفاف")', 'Background'], value: '#ffffff' }, ck('transparent', 'خلفية شفافة', 'Transparent background', true)],
    async run(v, h) {
      const f = v.f[0]; if (!f) return noFile(h);
      let img; try { img = await h.loadImage(f); } catch (e) { return { error: h.t('تعذّر قراءة الصورة.', 'Could not read the image.') }; }
      const sizes = [16, 32, 48, 180, 192, 512]; const dls = [];
      for (const s of sizes) { const c = document.createElement('canvas'); c.width = c.height = s; const x = c.getContext('2d'); if (!v.transparent) { x.fillStyle = v.bg; x.fillRect(0, 0, s, s); } const k = Math.min(s / img.width, s / img.height); x.drawImage(img, (s - img.width * k) / 2, (s - img.height * k) / 2, img.width * k, img.height * k); dls.push({ name: s === 180 ? 'apple-touch-icon.png' : s === 192 || s === 512 ? `android-chrome-${s}.png` : `favicon-${s}.png`, blob: await h.canvasBlob(c, 'image/png'), label: [`${s}×${s}`, `${s}×${s}`] }); }
      const snippet = '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">';
      return { text: snippet, note: h.t('انسخ الأسطر في <head> وارفع الملفات إلى جذر موقعك (غيّر أسماء الملفات لتطابق الروابط).', 'Paste the lines into <head> and upload the files to your site root (rename to match the links).'), downloads: dls };
    }
  });

  /* ---------- API tester (browser-side, subject to CORS) ---------- */
  def('api-tester', {
    button: ['إرسال الطلب', 'Send request'], layout: 'stack',
    fields: [sel('m', 'الطريقة', 'Method', [['GET', 'GET', 'GET'], ['POST', 'POST', 'POST'], ['PUT', 'PUT', 'PUT'], ['PATCH', 'PATCH', 'PATCH'], ['DELETE', 'DELETE', 'DELETE']], 'GET'), tx('u', 'الرابط', 'URL', { mono: true, value: 'https://jsonplaceholder.typicode.com/todos/1' }), ta('hd', 'الترويسات (سطر لكل ترويسة Key: Value)', 'Headers (one per line Key: Value)', { rows: 3, mono: true }), ta('b', 'الجسم (Body)', 'Body', { rows: 5, mono: true })],
    async run(v, h) {
      let u; try { u = new URL(v.u.trim()); if (!/^https?:$/.test(u.protocol)) throw 0; } catch (e) { return { error: h.t('رابط غير صالح (http/https).', 'Invalid URL (http/https).') }; }
      const headers = {}; v.hd.split('\n').forEach((l) => { const i = l.indexOf(':'); if (i > 0) headers[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
      const t0 = performance.now(); let r;
      try { r = await fetch(u.toString(), { method: v.m, headers, body: ['GET', 'DELETE'].includes(v.m) || !v.b ? undefined : v.b }); } catch (e) { return { error: h.t('فشل الطلب: غالبًا بسبب CORS (الخادم لا يسمح بالطلبات من المتصفح) أو انقطاع الاتصال.', 'Request failed — usually CORS (the server blocks browser requests) or a network issue.') }; }
      const ms = Math.round(performance.now() - t0); let body = await r.text(); try { body = JSON.stringify(JSON.parse(body), null, 2); } catch (e) { /* keep text */ }
      const hdrs = []; r.headers.forEach((val, k) => hdrs.push(k + ': ' + val));
      return { cards: [['الحالة', 'Status', r.status + ' ' + r.statusText], ['الزمن', 'Time', ms + ' ms'], ['الحجم', 'Size', h.bytes(new Blob([body]).size)]], text: body.slice(0, 200000), html: `<details><summary>${h.t('الترويسات المستلمة', 'Response headers')}</summary><pre dir="ltr">${esc(hdrs.join('\n'))}</pre></details>` };
    }
  });

  /* ---------- URL inspector family ---------- */
  async function inspect(url, h) {
    let r;
    try { r = await fetch((CFGX.apiBase || '') + '/api/inspect?url=' + encodeURIComponent(url)); } catch (e) { throw new Error(h.t('خدمة الفحص غير متصلة (تحتاج نشر الـ Worker).', 'Inspection service unreachable (the Worker must be deployed).')); }
    const j = await r.json().catch(() => ({}));
    if (r.status === 404 || r.status === 405) throw new Error(h.t('خدمة الفحص غير متصلة بهذا الموقع بعد (تحتاج نشر الـ Worker).', 'Inspection service is not connected yet (deploy the Worker).'));
    if (r.status === 429) throw new Error(h.t('طلبات كثيرة. انتظر دقيقة.', 'Too many requests. Wait a minute.'));
    if (!r.ok) throw new Error(({ INVALID_URL: h.t('رابط غير صالح أو غير مسموح (عناوين عامة فقط).', 'Invalid or disallowed URL (public addresses only).'), FETCH_FAILED: h.t('تعذّر الوصول إلى الموقع.', 'Could not reach the site.'), REDIRECT_BLOCKED: h.t('إعادة توجيه إلى عنوان غير مسموح.', 'Redirect to a disallowed address.') })[j.error] || h.t('فشل الفحص.', 'Inspection failed.'));
    return j;
  }
  const parse = (html) => new DOMParser().parseFromString(html, 'text/html');
  const urlField = [tx('u', 'رابط الصفحة', 'Page URL', { mono: true, ph: ['https://example.com', 'https://example.com'] })];
  const list = (items) => '<ul>' + items.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>';

  def('seo-auditor', {
    button: ['افحص الصفحة', 'Audit page'], layout: 'stack', fields: urlField,
    async run(v, h) {
      if (!v.u.trim()) return null; const j = await inspect(v.u, h).catch((e) => ({ err: e.message })); if (j.err) return { error: j.err };
      const d = parse(j.html), g = (s, a) => { const e = d.querySelector(s); return e ? (a ? e.getAttribute(a) : e.textContent).trim() : ''; };
      const title = g('title'), desc = g('meta[name=description]', 'content'), canon = g('link[rel=canonical]', 'href'), h1 = d.querySelectorAll('h1').length, imgs = [...d.images], noAlt = imgs.filter((i) => !i.hasAttribute('alt')).length;
      const checks = [
        [!!title && title.length >= 15 && title.length <= 65, h.t(`العنوان (${title.length} حرف)`, `Title (${title.length} chars)`), h.t('المثالي 15–65 حرفًا.', 'Ideal 15–65 chars.')],
        [!!desc && desc.length >= 70 && desc.length <= 170, h.t(`الوصف (${desc.length} حرف)`, `Meta description (${desc.length} chars)`), h.t('المثالي 70–170 حرفًا.', 'Ideal 70–170 chars.')],
        [h1 === 1, h.t(`عدد H1: ${h1}`, `H1 count: ${h1}`), h.t('يُفضّل H1 واحد.', 'Exactly one H1 is recommended.')],
        [!!canon, h.t('رابط canonical', 'Canonical link'), h.t('أضف <link rel="canonical">.', 'Add <link rel="canonical">.')],
        [!!g('html', 'lang'), h.t('سمة lang', 'html lang attribute'), h.t('حدد لغة الصفحة.', 'Declare the page language.')],
        [!!g('meta[name=viewport]', 'content'), h.t('وسم viewport', 'Viewport meta'), h.t('ضروري للموبايل.', 'Needed for mobile.')],
        [!!g('meta[property="og:title"]', 'content'), h.t('وسوم Open Graph', 'Open Graph tags'), h.t('تحسّن المشاركة الاجتماعية.', 'Improve social sharing.')],
        [!!d.querySelector('script[type="application/ld+json"]'), h.t('بيانات منظمة JSON-LD', 'JSON-LD structured data'), h.t('تساعد محركات البحث.', 'Helps search engines.')],
        [noAlt === 0, h.t(`صور بلا alt: ${noAlt}/${imgs.length}`, `Images missing alt: ${noAlt}/${imgs.length}`), h.t('أضف نصًا بديلًا لكل صورة.', 'Give every image alt text.')],
        [j.url.startsWith('https://'), 'HTTPS', h.t('استخدم HTTPS.', 'Use HTTPS.')],
        [!/noindex/i.test(g('meta[name=robots]', 'content')), h.t('قابلية الفهرسة', 'Indexable'), h.t('الصفحة تحمل noindex.', 'The page has noindex.')]
      ];
      const pass = checks.filter((c) => c[0]).length;
      const rows = checks.map((c) => `<tr><td>${c[0] ? '✅' : '⚠️'}</td><td>${esc(c[1])}</td><td>${c[0] ? '' : esc(c[2])}</td></tr>`).join('');
      return { cards: [['الدرجة', 'Score', Math.round((pass / checks.length) * 100) + '/100'], ['الحالة', 'HTTP', j.httpStatus], ['العنوان', 'Title', title || '—'], ['الوصف', 'Description', desc || '—']], html: `<table class="tbl"><tbody>${rows}</tbody></table>`, note: j.truncated ? h.t('تم تحليل أول 400KB فقط.', 'Only the first 400KB was analysed.') : '' };
    }
  });

  const SEC = [['strict-transport-security', 'HSTS', 'يفرض HTTPS.', 'Forces HTTPS.'], ['content-security-policy', 'CSP', 'يمنع حقن السكربتات.', 'Mitigates script injection.'], ['x-content-type-options', 'X-Content-Type-Options', 'القيمة nosniff.', 'Should be nosniff.'], ['x-frame-options', 'X-Frame-Options', 'يمنع التضمين الخبيث (أو frame-ancestors).', 'Prevents clickjacking (or frame-ancestors).'], ['referrer-policy', 'Referrer-Policy', 'يتحكم في تسريب الرابط.', 'Controls referrer leakage.'], ['permissions-policy', 'Permissions-Policy', 'يقيّد ميزات المتصفح.', 'Restricts browser features.']];
  def('security-header-checker', {
    button: ['افحص الترويسات', 'Check headers'], layout: 'stack', fields: urlField,
    async run(v, h) {
      if (!v.u.trim()) return null; const j = await inspect(v.u, h).catch((e) => ({ err: e.message })); if (j.err) return { error: j.err };
      const hd = j.headers; let pass = 0;
      const rows = SEC.map(([k, n, ar, en]) => { let ok = !!hd[k]; if (k === 'x-frame-options' && !ok && /frame-ancestors/i.test(hd['content-security-policy'] || '')) ok = true; if (k === 'x-content-type-options') ok = /nosniff/i.test(hd[k] || ''); if (ok) pass++; return `<tr><td>${ok ? '✅' : '⚠️'}</td><td dir="ltr"><b>${n}</b></td><td>${ok ? `<code dir="ltr">${esc((hd[k] || '').slice(0, 90))}</code>` : esc(h.t(ar, en))}</td></tr>`; }).join('');
      const leak = ['server', 'x-powered-by'].filter((k) => hd[k]).map((k) => `${k}: ${hd[k]}`);
      return { cards: [['الدرجة', 'Score', pass + '/' + SEC.length], ['الحالة', 'HTTP', j.httpStatus], ['الاستجابة', 'Response', j.ttfbMs + ' ms']], html: `<table class="tbl"><tbody>${rows}</tbody></table>` + (leak.length ? `<p>${esc(h.t('ترويسات تكشف معلومات الخادم: ', 'Headers disclosing server info: '))}<code dir="ltr">${esc(leak.join(' | '))}</code></p>` : '') };
    }
  });

  def('page-speed-checker', {
    button: ['افحص السرعة', 'Check speed'], layout: 'stack', fields: urlField,
    async run(v, h) {
      if (!v.u.trim()) return null; const j = await inspect(v.u, h).catch((e) => ({ err: e.message })); if (j.err) return { error: j.err };
      const d = parse(j.html); const scripts = d.querySelectorAll('script[src]').length, css = d.querySelectorAll('link[rel=stylesheet]').length, imgs = [...d.images], lazy = imgs.filter((i) => i.loading === 'lazy').length, blocking = [...d.querySelectorAll('head script[src]')].filter((s) => !s.async && !s.defer && s.type !== 'module').length;
      const enc = j.headers['content-encoding'], cache = j.headers['cache-control'];
      const tips = []; if (!enc) tips.push(h.t('فعّل ضغط gzip/brotli.', 'Enable gzip/brotli compression.')); if (!cache) tips.push(h.t('أضف Cache-Control.', 'Add Cache-Control.')); if (blocking) tips.push(h.t(`${blocking} سكربت في الرأس يحجب العرض: استخدم defer/async.`, `${blocking} render-blocking script(s) in head: use defer/async.`)); if (imgs.length > 3 && lazy < imgs.length / 2) tips.push(h.t('فعّل loading="lazy" للصور.', 'Use loading="lazy" for images.')); if (j.ttfbMs > 800) tips.push(h.t('زمن الاستجابة الأولى بطيء (>800ms).', 'Slow first response (>800ms).')); if (j.bytes > 300 * 1024) tips.push(h.t('حجم HTML كبير.', 'Large HTML payload.'));
      return { cards: [['زمن الاستجابة (من خادمنا)', 'Response time (from our server)', j.ttfbMs + ' ms'], ['حجم HTML', 'HTML size', h.bytes(j.bytes) + (j.truncated ? '+' : '')], ['ملفات JS', 'JS files', scripts], ['ملفات CSS', 'CSS files', css], ['الصور', 'Images', `${imgs.length} (lazy: ${lazy})`], ['الضغط', 'Compression', enc || h.t('لا يوجد', 'none')], ['التخزين المؤقت', 'Cache-Control', cache || '—']], html: tips.length ? list(tips) : `<p>✅ ${esc(h.t('لا توجد ملاحظات كبيرة على مستوى HTML.', 'No major HTML-level issues.'))}</p>`, note: h.t('هذا فحص مبدئي لـ HTML والترويسات، وليس بديلًا عن Lighthouse/PageSpeed Insights.', 'A first-pass HTML/headers check — not a replacement for Lighthouse/PageSpeed Insights.') };
    }
  });

  def('accessibility-checker', {
    button: ['افحص الوصولية', 'Check accessibility'], layout: 'stack', fields: urlField,
    async run(v, h) {
      if (!v.u.trim()) return null; const j = await inspect(v.u, h).catch((e) => ({ err: e.message })); if (j.err) return { error: j.err };
      const d = parse(j.html); const issues = [];
      if (!d.documentElement.getAttribute('lang')) issues.push(h.t('لا توجد سمة lang على <html>.', 'Missing lang on <html>.'));
      if (!d.querySelector('title')) issues.push(h.t('لا يوجد <title>.', 'Missing <title>.'));
      const noAlt = [...d.images].filter((i) => !i.hasAttribute('alt')).length; if (noAlt) issues.push(h.t(`${noAlt} صورة بلا alt.`, `${noAlt} image(s) without alt.`));
      const btn = [...d.querySelectorAll('button')].filter((b) => !b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).length; if (btn) issues.push(h.t(`${btn} زر بلا اسم مفهوم.`, `${btn} button(s) without an accessible name.`));
      const lnk = [...d.querySelectorAll('a[href]')].filter((a) => !a.textContent.trim() && !a.getAttribute('aria-label') && !a.querySelector('img[alt]')).length; if (lnk) issues.push(h.t(`${lnk} رابط بلا نص.`, `${lnk} link(s) without text.`));
      const inputs = [...d.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea')].filter((i) => !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby') && !(i.id && d.querySelector(`label[for="${CSS.escape(i.id)}"]`)) && !i.closest('label')).length; if (inputs) issues.push(h.t(`${inputs} حقل نموذج بلا label.`, `${inputs} form field(s) without a label.`));
      const hs = [...d.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((x) => +x.tagName[1]); for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) { issues.push(h.t('قفزة في ترتيب العناوين (مثلًا H2 ثم H4).', 'Skipped heading level (e.g. H2 then H4).')); break; }
      if (d.querySelectorAll('h1').length !== 1) issues.push(h.t('يُفضّل وجود H1 واحد.', 'Exactly one H1 is recommended.'));
      if (!d.querySelector('main,[role=main]')) issues.push(h.t('لا يوجد عنصر <main>.', 'No <main> landmark.'));
      const vp = d.querySelector('meta[name=viewport]'); if (vp && /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/i.test(vp.content)) issues.push(h.t('الـ viewport يمنع التكبير.', 'Viewport blocks zoom.'));
      return { cards: [['المشكلات المكتشفة', 'Issues found', issues.length], ['الحالة', 'HTTP', j.httpStatus]], html: issues.length ? list(issues) : `<p>✅ ${esc(h.t('لم تُكتشف مشكلات في الفحوص الأساسية.', 'No problems in the basic checks.'))}</p>`, note: h.t('فحص آلي أولي لا يغطي التباين والتنقل بلوحة المفاتيح؛ استخدم أدوات متقدمة واختبارًا يدويًا للاعتماد.', 'An automated first pass; it does not cover contrast or keyboard navigation — verify manually.') };
    }
  });
})();
