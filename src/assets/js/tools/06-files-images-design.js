(function () {
  const { ta, tx, nm, sel, ck, fl, esc } = UT.H;
  const def = UT.def;
  const H = UT.H;
  const pdfLib = async () => { if (!window.PDFLib) await H.loadScript(H.base + 'vendor/pdf-lib.min.js'); return window.PDFLib; };
  const noFile = (h) => ({ error: h.t('اختر ملفًا أولًا.', 'Choose a file first.') });
  const MAXPDF = 60 * 1024 * 1024;
  const blobUrl = (b) => URL.createObjectURL(b);

  /* ---------- PDF ---------- */
  def('pdf-merge', {
    button: ['دمج الملفات', 'Merge files'], layout: 'stack',
    fields: [fl('f', 'اختر ملفين PDF أو أكثر', 'Choose two or more PDFs', { accept: 'application/pdf,.pdf', multiple: true, hint: ['الملفات لا تغادر جهازك. الحد: 10 ملفات.', 'Files never leave your device. Limit: 10 files.'] })],
    async run(v, h) {
      const files = v.f; if (files.length < 2) return { error: h.t('اختر ملفين على الأقل.', 'Choose at least two files.') }; if (files.length > 10 || files.reduce((a, b) => a + b.size, 0) > MAXPDF) return { error: h.t('الحد 10 ملفات و60MB إجمالًا.', 'Limit: 10 files and 60MB total.') };
      const { PDFDocument } = await pdfLib(); const out = await PDFDocument.create(); let pages = 0;
      for (const f of files) { let src; try { src = await PDFDocument.load(await f.arrayBuffer()); } catch (e) { return { error: h.t('تعذّر قراءة الملف (قد يكون تالفًا أو مشفرًا): ', 'Could not read file (damaged or encrypted?): ') + f.name }; } (await out.copyPages(src, src.getPageIndices())).forEach((p) => { out.addPage(p); pages++; }); }
      const blob = new Blob([await out.save()], { type: 'application/pdf' });
      return { note: h.t(`تم دمج ${files.length} ملفات في ${pages} صفحة (${h.bytes(blob.size)}).`, `Merged ${files.length} files into ${pages} pages (${h.bytes(blob.size)}).`), downloads: [{ name: 'merged.pdf', blob, label: ['تنزيل PDF المدمج', 'Download merged PDF'] }] };
    }
  });

  function parseRanges(str, max) {
    const set = []; for (const part of str.split(/[,،\s]+/).filter(Boolean)) { const m = part.match(/^(\d*)-(\d*)$/); let a, b; if (m) { a = m[1] ? +m[1] : 1; b = m[2] ? +m[2] : max; } else if (/^\d+$/.test(part)) { a = b = +part; } else return null; if (a < 1 || b > max || a > b) return null; for (let i = a; i <= b; i++) set.push(i - 1); }
    return set;
  }
  def('pdf-split', {
    button: ['تنفيذ', 'Run'], layout: 'stack',
    fields: [fl('f', 'ملف PDF', 'PDF file', { accept: 'application/pdf,.pdf' }), sel('mode', 'الطريقة', 'Mode', [['extract', 'استخراج صفحات في ملف واحد', 'Extract pages into one file'], ['each', 'كل صفحة في ملف مستقل', 'One file per page'], ['chunks', 'تقسيم كل N صفحة', 'Split every N pages']], 'extract'), tx('pages', 'الصفحات (مثال: 1-3, 5, 8-)', 'Pages (e.g. 1-3, 5, 8-)', { mono: true, value: '1' }), nm('n', 'N (لطريقة التقسيم)', 'N (for chunk mode)', 5, { min: 1, step: 1 })],
    async run(v, h) {
      const f = v.f[0]; if (!f) return noFile(h); if (f.size > MAXPDF) return { error: h.t('الملف كبير (الحد 60MB).', 'File too large (limit 60MB).') };
      const { PDFDocument } = await pdfLib(); let src; try { src = await PDFDocument.load(await f.arrayBuffer()); } catch (e) { return { error: h.t('تعذّر قراءة الملف.', 'Could not read the file.') }; }
      const total = src.getPageCount(); const mk = async (idx) => { const d = await PDFDocument.create(); (await d.copyPages(src, idx)).forEach((p) => d.addPage(p)); return new Blob([await d.save()], { type: 'application/pdf' }); };
      const base = f.name.replace(/\.pdf$/i, ''); const dls = [];
      if (v.mode === 'extract') { const idx = parseRanges(v.pages, total); if (!idx || !idx.length) return { error: h.t(`نطاق غير صالح. عدد الصفحات ${total}.`, `Invalid range. The file has ${total} pages.`) }; dls.push({ name: base + '-extract.pdf', blob: await mk(idx), label: [`تنزيل ${idx.length} صفحة`, `Download ${idx.length} page(s)`] }); }
      else if (v.mode === 'each') { if (total > 60) return { error: h.t('الحد 60 صفحة لهذه الطريقة. استخدم التقسيم كل N.', 'Limit 60 pages here. Use “every N pages”.') }; for (let i = 0; i < total; i++) dls.push({ name: `${base}-p${i + 1}.pdf`, blob: await mk([i]), label: [`صفحة ${i + 1}`, `Page ${i + 1}`] }); }
      else { const n = Math.max(1, Math.floor(v.n) || 1); for (let s = 0; s < total; s += n) { const idx = Array.from({ length: Math.min(n, total - s) }, (_, k) => s + k); dls.push({ name: `${base}-${s + 1}-${idx[idx.length - 1] + 1}.pdf`, blob: await mk(idx), label: [`الصفحات ${s + 1}–${idx[idx.length - 1] + 1}`, `Pages ${s + 1}–${idx[idx.length - 1] + 1}`] }); if (dls.length > 60) return { error: h.t('عدد الأجزاء كبير جدًا.', 'Too many parts.') }; } }
      return { note: h.t(`عدد صفحات الملف: ${total}`, `Source pages: ${total}`), downloads: dls };
    }
  });

  def('pdf-page-info', {
    fields: [fl('f', 'ملف PDF', 'PDF file', { accept: 'application/pdf,.pdf' })],
    async run(v, h) {
      const f = v.f[0]; if (!f) return null; const { PDFDocument } = await pdfLib(); let d; try { d = await PDFDocument.load(await f.arrayBuffer(), { updateMetadata: false }); } catch (e) { return { error: h.t('تعذّر قراءة الملف (قد يكون مشفرًا).', 'Could not read the file (it may be encrypted).') }; }
      const pts = (n) => n.toFixed(0) + ' pt (' + (n / 72 * 25.4).toFixed(0) + ' mm)'; const sizes = d.getPages().map((p) => p.getSize()); const first = sizes[0];
      const uniq = new Set(sizes.map((s) => Math.round(s.width) + '×' + Math.round(s.height)));
      const rows = [['الصفحات', 'Pages', d.getPageCount()], ['حجم الملف', 'File size', h.bytes(f.size)], ['مقاس أول صفحة', 'First page size', pts(first.width) + ' × ' + pts(first.height)], ['مقاسات مختلفة', 'Distinct page sizes', uniq.size], ['العنوان', 'Title', d.getTitle() || '—'], ['المؤلف', 'Author', d.getAuthor() || '—'], ['المنتج', 'Producer', d.getProducer() || '—'], ['تاريخ الإنشاء', 'Created', d.getCreationDate() ? d.getCreationDate().toLocaleString() : '—']];
      return rows;
    }
  });

  def('images-to-pdf', {
    button: ['إنشاء PDF', 'Create PDF'], layout: 'stack',
    fields: [fl('f', 'اختر الصور بالترتيب المطلوب', 'Choose images in order', { accept: 'image/*', multiple: true }), sel('size', 'مقاس الصفحة', 'Page size', [['a4', 'A4', 'A4'], ['letter', 'Letter', 'Letter'], ['fit', 'نفس مقاس الصورة', 'Match image size']], 'a4'), nm('m', 'الهامش (نقطة)', 'Margin (pt)', 24, { min: 0, max: 100 })],
    async run(v, h) {
      if (!v.f.length) return noFile(h); if (v.f.length > 50) return { error: h.t('الحد 50 صورة.', 'Limit 50 images.') };
      const { PDFDocument } = await pdfLib(); const doc = await PDFDocument.create(); const P = { a4: [595.28, 841.89], letter: [612, 792] };
      for (const f of v.f) {
        let bytes, img; const type = f.type;
        if (type === 'image/jpeg' || type === 'image/png') { bytes = new Uint8Array(await f.arrayBuffer()); img = type === 'image/png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes); }
        else { const im = await h.loadImage(f); const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0); img = await doc.embedPng(new Uint8Array(await (await h.canvasBlob(c, 'image/png')).arrayBuffer())); }
        const m = v.size === 'fit' ? 0 : Math.max(0, v.m || 0); const [pw, ph] = v.size === 'fit' ? [img.width, img.height] : P[v.size]; const page = doc.addPage([pw, ph]);
        const s = Math.min((pw - 2 * m) / img.width, (ph - 2 * m) / img.height, v.size === 'fit' ? 1 : Infinity); const w = img.width * s, hh = img.height * s; page.drawImage(img, { x: (pw - w) / 2, y: (ph - hh) / 2, width: w, height: hh });
      }
      const blob = new Blob([await doc.save()], { type: 'application/pdf' });
      return { note: h.t(`تم إنشاء PDF من ${v.f.length} صورة (${h.bytes(blob.size)}).`, `Created a PDF from ${v.f.length} image(s) (${h.bytes(blob.size)}).`), downloads: [{ name: 'images.pdf', blob, label: ['تنزيل PDF', 'Download PDF'] }] };
    }
  });

  def('file-metadata-inspector', {
    fields: [fl('f', 'اختر ملفًا', 'Choose a file')],
    async run(v, h) {
      const f = v.f[0]; if (!f) return null; const rows = [['الاسم', 'Name', f.name], ['النوع', 'Type', f.type || h.t('غير معروف', 'unknown')], ['الحجم', 'Size', `${h.bytes(f.size)} (${f.size.toLocaleString('en-US')} bytes)`], ['آخر تعديل', 'Last modified', new Date(f.lastModified).toLocaleString(h.lang() === 'en' ? 'en-GB' : 'ar-EG-u-nu-latn')], ['الامتداد', 'Extension', (f.name.split('.').length > 1 ? f.name.split('.').pop() : '—')]];
      if (f.type.startsWith('image/')) { try { const im = await h.loadImage(f); rows.push(['الأبعاد', 'Dimensions', im.naturalWidth + ' × ' + im.naturalHeight + ' px']); } catch (e) { /* ignore */ } }
      if (f.size <= 200 * 1024 * 1024) { const d = await crypto.subtle.digest('SHA-256', await f.arrayBuffer()); rows.push(['SHA-256', 'SHA-256', Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('')]); }
      return rows;
    }
  });

  /* ---------- Images ---------- */
  const IMG = { accept: 'image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif,image/svg+xml' };
  function imgTool(id, extra, fn, o) {
    o = o || {};
    def(id, {
      layout: 'stack', button: o.button || null, live: o.live !== false && !o.button,
      fields: [fl('f', 'اختر صورة', 'Choose an image', IMG)].concat(extra),
      async run(v, h) {
        const f = v.f[0]; if (!f) return o.button ? noFile(h) : null; if (f.size > 40 * 1024 * 1024) return { error: h.t('الصورة كبيرة (الحد 40MB).', 'Image too large (limit 40MB).') };
        let img; try { img = await h.loadImage(f); } catch (e) { return { error: h.t('تعذّر قراءة الصورة.', 'Could not read the image.') }; }
        const r = await fn(img, v, h, f); if (r.error) return r;
        const url = blobUrl(r.blob); const cards = r.cards || [];
        return { cards: [['الأبعاد', 'Dimensions', r.w + ' × ' + r.h + ' px'], ['الحجم الجديد', 'New size', h.bytes(r.blob.size)]].concat(cards), html: `<img class="preview" src="${url}" alt="">`, downloads: [{ name: r.name, blob: r.blob, label: ['تنزيل الصورة', 'Download image'] }] };
      }
    });
  }
  const outName = (f, ext) => f.name.replace(/\.[^.]+$/, '') + '-utilityra.' + ext;
  const FMT = [['image/jpeg', 'JPG', 'JPG'], ['image/webp', 'WebP', 'WebP'], ['image/png', 'PNG', 'PNG']];
  const extOf = (t) => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[t]);
  async function draw(img, w, h, type, q, mut) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
    if (type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); }
    if (mut) mut(x, c); else x.drawImage(img, 0, 0, w, h);
    const blob = await H.canvasBlob(c, type, q); if (!blob) throw new Error('Encoding not supported in this browser');
    return blob;
  }

  imgTool('image-compressor', [sel('type', 'الصيغة', 'Output format', FMT.slice(0, 2), 'image/jpeg'), { id: 'q', type: 'range', label: ['الجودة %', 'Quality %'], value: 75, min: 10, max: 100 }, nm('maxw', 'أقصى عرض px (اختياري)', 'Max width px (optional)', '', { min: 16 })], async (img, v, h, f) => {
    let w = img.naturalWidth, hh = img.naturalHeight; const mw = v.maxw > 0 ? v.maxw : 0; if (mw && w > mw) { hh = Math.round(hh * mw / w); w = mw; }
    const blob = await draw(img, w, hh, v.type, v.q / 100);
    return { blob, w, h: hh, name: outName(f, extOf(v.type)), cards: [['الحجم الأصلي', 'Original size', h.bytes(f.size)], ['التوفير', 'Saved', (f.size ? Math.round((1 - blob.size / f.size) * 100) : 0) + '%']] };
  });

  imgTool('image-resizer', [sel('mode', 'الطريقة', 'Mode', [['px', 'بالبكسل', 'Pixels'], ['pct', 'بالنسبة المئوية', 'Percentage']], 'px'), nm('w', 'العرض px', 'Width px', 800, { min: 1, max: 12000 }), nm('hh', 'الارتفاع px (اتركه فارغًا للحفاظ على النسبة)', 'Height px (empty = keep ratio)', '', { min: 1, max: 12000 }), nm('pct', 'النسبة %', 'Percent %', 50, { min: 1, max: 500 }), sel('type', 'الصيغة', 'Output', FMT, 'image/png')], async (img, v, h, f) => {
    let w, hh; if (v.mode === 'pct') { w = Math.round(img.naturalWidth * v.pct / 100); hh = Math.round(img.naturalHeight * v.pct / 100); } else { w = Math.round(v.w) || img.naturalWidth; hh = v.hh > 0 ? Math.round(v.hh) : Math.round(img.naturalHeight * w / img.naturalWidth); }
    if (w < 1 || hh < 1 || w > 12000 || hh > 12000 || w * hh > 80e6) return { error: h.t('الأبعاد خارج الحد المسموح.', 'Dimensions out of range.') };
    return { blob: await draw(img, w, hh, v.type, 0.92), w, h: hh, name: outName(f, extOf(v.type)) };
  });

  imgTool('image-converter', [sel('type', 'تحويل إلى', 'Convert to', FMT, 'image/webp'), { id: 'q', type: 'range', label: ['الجودة % (JPG/WebP)', 'Quality % (JPG/WebP)'], value: 90, min: 10, max: 100 }], async (img, v, h, f) => ({ blob: await draw(img, img.naturalWidth, img.naturalHeight, v.type, v.q / 100), w: img.naturalWidth, h: img.naturalHeight, name: outName(f, extOf(v.type)) }));

  imgTool('image-cropper', [sel('mode', 'القص', 'Crop', [['1:1', '1:1 مربع', '1:1 square'], ['4:3', '4:3', '4:3'], ['3:4', '3:4', '3:4'], ['16:9', '16:9', '16:9'], ['9:16', '9:16', '9:16'], ['custom', 'مخصص (px)', 'Custom (px)']], '1:1'), { id: 'px', type: 'range', label: ['إزاحة أفقية %', 'Horizontal position %'], value: 50, min: 0, max: 100 }, { id: 'py', type: 'range', label: ['إزاحة رأسية %', 'Vertical position %'], value: 50, min: 0, max: 100 }, nm('x', 'المخصص: X', 'Custom: X', 0, { min: 0 }), nm('y', 'Y', 'Y', 0, { min: 0 }), nm('cw', 'العرض', 'Width', 500, { min: 1 }), nm('ch', 'الارتفاع', 'Height', 500, { min: 1 }), sel('type', 'الصيغة', 'Output', FMT, 'image/png')], async (img, v, h, f) => {
    const W = img.naturalWidth, Hh = img.naturalHeight; let x, y, w, hh;
    if (v.mode === 'custom') { x = Math.max(0, Math.floor(v.x) || 0); y = Math.max(0, Math.floor(v.y) || 0); w = Math.min(Math.floor(v.cw) || 1, W - x); hh = Math.min(Math.floor(v.ch) || 1, Hh - y); if (w < 1 || hh < 1) return { error: h.t('منطقة القص خارج الصورة.', 'Crop area is outside the image.') }; }
    else { const [a, b] = v.mode.split(':').map(Number); const r = a / b; if (W / Hh > r) { hh = Hh; w = Math.round(Hh * r); } else { w = W; hh = Math.round(W / r); } x = Math.round((W - w) * v.px / 100); y = Math.round((Hh - hh) * v.py / 100); }
    const blob = await draw(img, w, hh, v.type, 0.92, (c) => c.drawImage(img, x, y, w, hh, 0, 0, w, hh)); return { blob, w, h: hh, name: outName(f, extOf(v.type)) };
  });

  imgTool('image-rotate-flip', [sel('rot', 'التدوير', 'Rotate', [['0', 'بدون', 'None'], ['90', '90° مع عقارب الساعة', '90° clockwise'], ['180', '180°', '180°'], ['270', '90° عكس عقارب الساعة', '90° counter-clockwise']], '90'), ck('fh', 'قلب أفقي', 'Flip horizontally', false), ck('fv', 'قلب رأسي', 'Flip vertically', false), sel('type', 'الصيغة', 'Output', FMT, 'image/png')], async (img, v, h, f) => {
    const r = +v.rot, sw = r === 90 || r === 270, W = img.naturalWidth, Hh = img.naturalHeight, w = sw ? Hh : W, hh = sw ? W : Hh;
    const blob = await draw(img, w, hh, v.type, 0.92, (x) => { x.translate(w / 2, hh / 2); x.rotate(r * Math.PI / 180); x.scale(v.fh ? -1 : 1, v.fv ? -1 : 1); x.drawImage(img, -W / 2, -Hh / 2); }); return { blob, w, h: hh, name: outName(f, extOf(v.type)) };
  });

  imgTool('image-filter-studio', [{ id: 'br', type: 'range', label: ['السطوع %', 'Brightness %'], value: 100, min: 0, max: 200 }, { id: 'co', type: 'range', label: ['التباين %', 'Contrast %'], value: 100, min: 0, max: 200 }, { id: 'sa', type: 'range', label: ['التشبع %', 'Saturation %'], value: 100, min: 0, max: 300 }, { id: 'hu', type: 'range', label: ['تدرج اللون °', 'Hue °'], value: 0, min: 0, max: 360 }, { id: 'bl', type: 'range', label: ['التمويه px', 'Blur px'], value: 0, min: 0, max: 20 }, ck('gs', 'أبيض وأسود', 'Grayscale', false), ck('se', 'قديم (Sepia)', 'Sepia', false), sel('type', 'الصيغة', 'Output', FMT, 'image/png')], async (img, v, h, f) => {
    const filter = `brightness(${v.br}%) contrast(${v.co}%) saturate(${v.sa}%) hue-rotate(${v.hu}deg) blur(${v.bl}px)` + (v.gs ? ' grayscale(1)' : '') + (v.se ? ' sepia(1)' : '');
    const blob = await draw(img, img.naturalWidth, img.naturalHeight, v.type, 0.92, (x) => { x.filter = filter; x.drawImage(img, 0, 0); }); return { blob, w: img.naturalWidth, h: img.naturalHeight, name: outName(f, extOf(v.type)) };
  });

  imgTool('image-watermark', [tx('text', 'نص العلامة المائية', 'Watermark text', { value: '© Utilityra' }), { id: 'size', type: 'range', label: ['حجم الخط %', 'Font size %'], value: 6, min: 2, max: 20 }, { id: 'op', type: 'range', label: ['الشفافية %', 'Opacity %'], value: 50, min: 5, max: 100 }, { id: 'color', type: 'color', label: ['اللون', 'Color'], value: '#ffffff' }, sel('pos', 'الموضع', 'Position', [['br', 'أسفل اليمين', 'Bottom right'], ['bl', 'أسفل اليسار', 'Bottom left'], ['tr', 'أعلى اليمين', 'Top right'], ['tl', 'أعلى اليسار', 'Top left'], ['c', 'المنتصف', 'Center'], ['tile', 'تكرار مائل', 'Tiled diagonal']], 'br'), sel('type', 'الصيغة', 'Output', FMT, 'image/png')], async (img, v, h, f) => {
    if (!v.text.trim()) return { error: h.t('اكتب نص العلامة المائية.', 'Enter watermark text.') }; const W = img.naturalWidth, Hh = img.naturalHeight, fs = Math.max(10, Math.round(Math.min(W, Hh) * v.size / 100));
    const blob = await draw(img, W, Hh, v.type, 0.92, (x) => {
      x.drawImage(img, 0, 0); x.globalAlpha = v.op / 100; x.fillStyle = v.color; x.font = `700 ${fs}px sans-serif`; x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = fs / 8; x.textBaseline = 'middle'; const pad = fs;
      if (v.pos === 'tile') { x.save(); x.rotate(-Math.PI / 6); const tw = x.measureText(v.text).width + fs * 2; for (let yy = -Hh; yy < Hh * 2; yy += fs * 3.2) for (let xx = -W; xx < W * 2; xx += tw) x.fillText(v.text, xx, yy); x.restore(); return; }
      const tw = x.measureText(v.text).width; const xx = v.pos.includes('l') ? pad : v.pos.includes('r') ? W - tw - pad : (W - tw) / 2; const yy = v.pos.includes('t') ? pad + fs / 2 : v.pos.includes('b') ? Hh - pad - fs / 2 : Hh / 2; x.fillText(v.text, xx, yy);
    }); return { blob, w: W, h: Hh, name: outName(f, extOf(v.type)) };
  });

  def('image-to-data-uri', {
    layout: 'stack', fields: [fl('f', 'اختر صورة', 'Choose an image', IMG)],
    async run(v, h) {
      const f = v.f[0]; if (!f) return null; if (f.size > 5 * 1024 * 1024) return { error: h.t('الحد 5MB (Data URI الكبيرة تضر بالأداء).', 'Limit 5MB (large data URIs hurt performance).') };
      const uri = await h.readFileAs(f, 'dataurl'); return { text: uri, cards: [['حجم الملف', 'File size', h.bytes(f.size)], ['طول النص', 'String length', uri.length.toLocaleString('en-US')]], html: `<p class="hint">${h.L('وسم HTML:', 'HTML tag:')}</p><pre class="hl" dir="ltr">${esc('<img src="' + uri.slice(0, 60) + '…" alt="">')}</pre>`, out: { rows: 6 } };
    }
  });

  /* ---------- Design ---------- */
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  function parseColor(s) {
    s = s.trim().toLowerCase(); let m;
    if ((m = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/))) { let x = m[1]; if (x.length === 3) x = x.split('').map((c) => c + c).join(''); return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)]; }
    if ((m = s.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/))) return [clamp(+m[1], 0, 255), clamp(+m[2], 0, 255), clamp(+m[3], 0, 255)];
    if ((m = s.match(/^hsla?\(\s*(-?\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)%[,\s]+(\d+(?:\.\d+)?)%/))) { const hh = ((+m[1] % 360) + 360) % 360, ss = +m[2] / 100, l = +m[3] / 100; const k = (n) => (n + hh / 30) % 12, a = ss * Math.min(l, 1 - l), f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]; }
    return null;
  }
  const toHex = (r, g, b) => '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  function rgbToHsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let hh = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; } return [Math.round(hh), Math.round(s * 100), Math.round(l * 100)]; }
  function rgbToHsv(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let hh = 0; if (d) hh = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [Math.round(hh * 60), Math.round((mx ? d / mx : 0) * 100), Math.round(mx * 100)]; }
  function rgbToCmyk(r, g, b) { const k = 1 - Math.max(r, g, b) / 255; if (k === 1) return [0, 0, 0, 100]; return [(1 - r / 255 - k) / (1 - k), (1 - g / 255 - k) / (1 - k), (1 - b / 255 - k) / (1 - k)].map((x) => Math.round(x * 100)).concat([Math.round(k * 100)]); }
  const lum = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  def('color-converter', {
    layout: 'stack',
    fields: [tx('c', 'اللون (HEX أو rgb() أو hsl())', 'Color (HEX, rgb() or hsl())', { mono: true, value: '#E45A1F' }), { id: 'pick', type: 'color', label: ['أو اختر من المنتقي', 'Or use the picker'], value: '#e45a1f' }],
    run(v, h) {
      const typed = v.c.trim(); const rgb = parseColor(typed); if (!rgb) return typed ? { error: h.t('صيغة لون غير مفهومة. جرّب #FF8800 أو rgb(255,136,0).', 'Unrecognized color. Try #FF8800 or rgb(255,136,0).') } : null;
      const [r, g, b] = rgb, hsl = rgbToHsl(r, g, b), hsv = rgbToHsv(r, g, b), cmyk = rgbToCmyk(r, g, b); const L = lum(r, g, b); const cw = 1.05 / (L + 0.05), cb = (L + 0.05) / 0.05;
      return { html: `<div class="swatch" style="background:${toHex(r, g, b)}"></div>`, cards: [['HEX', 'HEX', toHex(r, g, b)], ['RGB', 'RGB', `rgb(${r}, ${g}, ${b})`], ['HSL', 'HSL', `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`], ['HSV', 'HSV', `hsv(${hsv[0]}, ${hsv[1]}%, ${hsv[2]}%)`], ['CMYK', 'CMYK', `cmyk(${cmyk.join('%, ')}%)`], ['تباين مع الأبيض', 'Contrast on white', cw.toFixed(2) + ':1' + (cw >= 4.5 ? ' ✓ AA' : '')], ['تباين مع الأسود', 'Contrast on black', cb.toFixed(2) + ':1' + (cb >= 4.5 ? ' ✓ AA' : '')]] };
    }
  });
  // color-converter: reuse the generic renderer but keep the text box and picker in sync
  (function () {
    const orig = UT.mount;
    UT.mount = function (root, id) {
      orig(root, id);
      if (id !== 'color-converter') return;
      const t = root.querySelector('[data-f="c"]'), p = root.querySelector('[data-f="pick"]');
      p.addEventListener('input', () => { t.value = p.value.toUpperCase(); t.dispatchEvent(new Event('input', { bubbles: true })); });
      t.addEventListener('input', () => { const c = parseColor(t.value); if (c) p.value = toHex(...c).toLowerCase(); });
    };
  })();

  def('gradient-generator', {
    layout: 'stack',
    fields: [sel('type', 'النوع', 'Type', [['linear', 'خطي', 'Linear'], ['radial', 'دائري', 'Radial'], ['conic', 'مخروطي', 'Conic']], 'linear'), { id: 'angle', type: 'range', label: ['الزاوية °', 'Angle °'], value: 135, min: 0, max: 360 }, { id: 'c1', type: 'color', label: ['اللون 1', 'Color 1'], value: '#ff7c30' }, { id: 'c2', type: 'color', label: ['اللون 2', 'Color 2'], value: '#6a3df0' }, ck('use3', 'إضافة لون ثالث', 'Add a third color', false), { id: 'c3', type: 'color', label: ['اللون 3', 'Color 3'], value: '#1fd3c1' }],
    run(v) {
      const stops = [v.c1, v.use3 ? v.c3 : null, v.c2].filter(Boolean).join(', '); const css = v.type === 'linear' ? `linear-gradient(${v.angle}deg, ${stops})` : v.type === 'radial' ? `radial-gradient(circle, ${stops})` : `conic-gradient(from ${v.angle}deg, ${stops})`;
      return { html: `<div class="swatch tall" style="background:${css}"></div>`, text: `background: ${css};`, out: { rows: 2, label: ['كود CSS', 'CSS code'] } };
    }
  });

  def('box-shadow-generator', {
    layout: 'stack',
    fields: [{ id: 'x', type: 'range', label: ['الإزاحة الأفقية px', 'Offset X px'], value: 0, min: -60, max: 60 }, { id: 'y', type: 'range', label: ['الإزاحة الرأسية px', 'Offset Y px'], value: 12, min: -60, max: 60 }, { id: 'b', type: 'range', label: ['التمويه px', 'Blur px'], value: 30, min: 0, max: 100 }, { id: 's', type: 'range', label: ['الانتشار px', 'Spread px'], value: -4, min: -50, max: 50 }, { id: 'col', type: 'color', label: ['اللون', 'Color'], value: '#000000' }, { id: 'op', type: 'range', label: ['الشفافية %', 'Opacity %'], value: 25, min: 0, max: 100 }, ck('inset', 'داخلي (inset)', 'Inset', false)],
    run(v) {
      const [r, g, b] = parseColor(v.col); const css = `${v.inset ? 'inset ' : ''}${v.x}px ${v.y}px ${v.b}px ${v.s}px rgba(${r}, ${g}, ${b}, ${(v.op / 100).toFixed(2)})`;
      return { html: `<div class="shadow-stage"><div class="shadow-box" style="box-shadow:${css}"></div></div>`, text: `box-shadow: ${css};`, out: { rows: 2, label: ['كود CSS', 'CSS code'] } };
    }
  });

  def('qr-code-generator', {
    layout: 'stack',
    fields: [ta('text', 'النص أو الرابط', 'Text or URL', { rows: 3, mono: true, value: 'https://example.com' }), sel('ecl', 'مستوى تصحيح الأخطاء', 'Error correction', [['1', 'متوسط (M)', 'Medium (M)'], ['0', 'منخفض (L)', 'Low (L)'], ['2', 'مرتفع (Q)', 'Quartile (Q)'], ['3', 'الأعلى (H)', 'High (H)']], '1'), { id: 'size', type: 'range', label: ['الحجم px', 'Size px'], value: 320, min: 128, max: 1024, step: 16 }, { id: 'fg', type: 'color', label: ['لون الرمز', 'Foreground'], value: '#111111' }, { id: 'bg', type: 'color', label: ['لون الخلفية', 'Background'], value: '#ffffff' }],
    sample: { text: 'https://utilityra.example' },
    async run(v, h) {
      if (!v.text.trim()) return null; if (v.text.length > 1000) return { error: h.t('النص طويل (الحد 1000 حرف للحصول على رمز موثوق).', 'Text too long (limit 1000 characters for a reliable code).') };
      let q; try { q = UTQR.encode(v.text, +v.ecl); } catch (e) { return { error: h.t('النص طويل جدًا لرمز QR.', 'Text is too long for a QR code.') }; }
      const margin = 4, n = q.size + margin * 2, scale = Math.max(1, Math.floor(v.size / n)), px = n * scale;
      const c = document.createElement('canvas'); c.width = c.height = px; const x = c.getContext('2d'); x.fillStyle = v.bg; x.fillRect(0, 0, px, px); x.fillStyle = v.fg;
      let path = ''; q.modules.forEach((row, yy) => row.forEach((on, xx) => { if (on) { x.fillRect((xx + margin) * scale, (yy + margin) * scale, scale, scale); path += `M${xx + margin},${yy + margin}h1v1h-1z`; } }));
      const png = await h.canvasBlob(c, 'image/png'); const svg = new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="${v.bg}"/><path d="${path}" fill="${v.fg}"/></svg>`], { type: 'image/svg+xml' });
      return { html: `<img class="preview qr" width="${Math.min(px, 360)}" height="${Math.min(px, 360)}" src="${c.toDataURL('image/png')}" alt="QR code">`, note: h.t(`النسخة ${q.version} — ${q.size}×${q.size} وحدة`, `Version ${q.version} — ${q.size}×${q.size} modules`), downloads: [{ name: 'qr-code.png', blob: png, label: ['تنزيل PNG', 'Download PNG'] }, { name: 'qr-code.svg', blob: svg, label: ['تنزيل SVG', 'Download SVG'] }] };
    }
  });
})();
