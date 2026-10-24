(function () {
  const { ta, tx, nm, sel, ck, esc } = UT.H;
  const def = UT.def;
  const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);

  /* ---------- Study ---------- */
  def('grade-calculator', {
    fields: [ta('text', 'الدرجات (سطر لكل اختبار: 18/20 أو 85)', 'Scores (one per line: 18/20 or 85)', { rows: 6, mono: true }), sel('scale', 'مقياس التقدير', 'Grading scale', [['us', 'A–F (أمريكي)', 'A–F (US)'], ['ar', 'ممتاز / جيد جدًا / جيد…', 'Excellent / Very good / Good…']], 'ar')],
    sample: { text: '18/20\n42/50\n85' },
    run(v, h) {
      const L = lines(v.text); if (!L.length) return null; let got = 0, tot = 0;
      for (const l of L) { const m = l.match(/^(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+(?:\.\d+)?))?$/); if (!m) return { error: h.t('صيغة غير صحيحة: ', 'Bad format: ') + l }; const t = m[2] ? +m[2] : 100; if (t <= 0) return { error: h.t('الدرجة الكلية يجب أن تكون أكبر من صفر.', 'Total must be above zero.') }; got += +m[1]; tot += t; }
      const pct = got / tot * 100;
      const us = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
      const ar = pct >= 85 ? ['ممتاز', 'Excellent'] : pct >= 75 ? ['جيد جدًا', 'Very good'] : pct >= 65 ? ['جيد', 'Good'] : pct >= 50 ? ['مقبول', 'Pass'] : ['راسب', 'Fail'];
      return [['مجموع الدرجات', 'Total points', h.fmtNum(got, 2) + ' / ' + h.fmtNum(tot, 2)], ['النسبة المئوية', 'Percentage', h.fmtNum(pct, 2) + '%'], ['التقدير', 'Grade', v.scale === 'us' ? us : h.t(ar[0], ar[1])]];
    }
  });

  def('weighted-grade-calculator', {
    layout: 'stack',
    fields: [ta('text', 'سطر لكل بند: الاسم، الدرجة من 100، الوزن %', 'One per line: name, score out of 100, weight %', { rows: 6, mono: true }), nm('target', 'الدرجة المستهدفة النهائية (اختياري)', 'Target final grade (optional)', 90, { min: 0, max: 100 })],
    sample: { text: 'Assignments, 88, 20\nMidterm, 75, 30\nProject, 92, 20' },
    run(v, h) {
      const L = lines(v.text); if (!L.length) return null; let ws = 0, acc = 0;
      for (const l of L) { const p = l.split(/[,،;\t]/).map((x) => x.trim()); const g = parseFloat(p[p.length - 2]), w = parseFloat(p[p.length - 1]); if (!(g >= 0) || !(w > 0)) return { error: h.t('صيغة غير صحيحة: ', 'Bad format: ') + l }; ws += w; acc += g * w; }
      const cards = [['المتوسط الموزون للمنجز', 'Weighted average so far', h.fmtNum(acc / ws, 2) + '%'], ['مجموع الأوزان المنجزة', 'Completed weight', h.fmtNum(ws, 2) + '%']];
      if (ws < 100 && Number.isFinite(v.target)) { const need = (v.target * 100 - acc) / (100 - ws); cards.push(['الدرجة المطلوبة في الباقي (' + h.fmtNum(100 - ws, 1) + '%)', 'Needed on the remaining (' + h.fmtNum(100 - ws, 1) + '%)', need > 100 ? h.t('غير ممكن (' + h.fmtNum(need, 1) + '%)', 'Not reachable (' + h.fmtNum(need, 1) + '%)') : h.fmtNum(Math.max(0, need), 2) + '%']); }
      if (ws > 100) cards.push(['تنبيه', 'Warning', h.t('مجموع الأوزان يتجاوز 100%', 'Weights add up to more than 100%')]);
      return cards;
    }
  });

  const GP = { 'A+': 4, A: 4, 'A-': 3.7, 'B+': 3.3, B: 3, 'B-': 2.7, 'C+': 2.3, C: 2, 'C-': 1.7, 'D+': 1.3, D: 1, F: 0 };
  def('gpa-calculator', {
    layout: 'stack',
    fields: [ta('text', 'سطر لكل مادة: الاسم، التقدير (A أو 3.5)، الساعات', 'One per line: course, grade (A or 3.5), credits', { rows: 7, mono: true }), sel('scale', 'المقياس', 'Scale', [['4', 'من 4.0', 'Out of 4.0'], ['5', 'من 5.0 (تناسبي تقريبي)', 'Out of 5.0 (proportional)']], '4')],
    sample: { text: 'Calculus, A, 4\nPhysics, B+, 3\nEnglish, 3.5, 2\nProgramming, A-, 3' },
    run(v, h) {
      const L = lines(v.text); if (!L.length) return null; let pts = 0, cr = 0; const k = v.scale === '5' ? 5 / 4 : 1; const rows = [];
      for (const l of L) { const p = l.split(/[,،;\t]/).map((x) => x.trim()); if (p.length < 3) return { error: h.t('صيغة غير صحيحة: ', 'Bad format: ') + l }; const gs = p[p.length - 2].toUpperCase(), c = parseFloat(p[p.length - 1]); let g = gs in GP ? GP[gs] * k : parseFloat(gs); if (!Number.isFinite(g) || !(c > 0)) return { error: h.t('تقدير أو ساعات غير صالحة: ', 'Invalid grade or credits: ') + l }; pts += g * c; cr += c; rows.push([p.slice(0, -2).join(','), p[p.length - 2], c, g]); }
      return { cards: [['المعدل التراكمي GPA', 'GPA', (pts / cr).toFixed(2)], ['إجمالي الساعات', 'Total credits', cr], ['إجمالي النقاط', 'Quality points', pts.toFixed(2)]], html: `<table class="tbl"><thead><tr><th>${h.L('المادة', 'Course')}</th><th>${h.L('التقدير', 'Grade')}</th><th>${h.L('الساعات', 'Credits')}</th><th>${h.L('النقاط', 'Points')}</th></tr></thead><tbody>${rows.map((r) => `<tr><td dir="auto">${esc(r[0])}</td><td>${esc(r[1])}</td><td>${r[2]}</td><td>${r[3].toFixed(2)}</td></tr>`).join('')}</tbody></table>` };
    }
  });

  def('study-plan-generator', {
    layout: 'stack',
    fields: [ta('subjects', 'المواد: سطر لكل مادة (الاسم، الصعوبة 1-5)', 'Subjects: one per line (name, difficulty 1-5)', { rows: 5, mono: true }), { id: 'exam', type: 'date', label: ['تاريخ الامتحان', 'Exam date'], value: '' }, nm('hpd', 'ساعات المذاكرة يوميًا', 'Study hours per day', 4, { min: 1, max: 16, step: 1 }), sel('rest', 'يوم راحة أسبوعي', 'Weekly rest day', [['-1', 'بدون', 'None'], ['5', 'الجمعة', 'Friday'], ['6', 'السبت', 'Saturday'], ['0', 'الأحد', 'Sunday']], '5'), ck('review', 'خصّص آخر يوم للمراجعة العامة', 'Keep the last day for a general review', true)],
    sample: { subjects: 'Math, 5\nPhysics, 4\nEnglish, 2\nHistory, 3', exam: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10) },
    run(v, h) {
      const subs = lines(v.subjects).map((l) => { const p = l.split(/[,،;\t]/).map((x) => x.trim()); return { n: p[0], d: Math.min(5, Math.max(1, parseFloat(p[1]) || 3)) }; }); if (!subs.length || !v.exam) return null;
      const today = new Date(); today.setHours(0, 0, 0, 0); const exam = new Date(v.exam + 'T00:00:00'); const days = Math.round((exam - today) / 86400000);
      if (days < 1) return { error: h.t('اختر تاريخ امتحان في المستقبل.', 'Pick an exam date in the future.') }; if (days > 120) return { error: h.t('الحد الأقصى 120 يومًا.', 'Maximum 120 days.') };
      const hpd = Math.max(1, Math.floor(v.hpd) || 1), rest = +v.rest; const plan = [];
      for (let i = 0; i < days; i++) { const d = new Date(today.getTime() + i * 86400000); plan.push({ d, rest: d.getDay() === rest && days > 2 }); }
      const study = plan.filter((x) => !x.rest); if (v.review && study.length > 2) study[study.length - 1].review = true;
      const learnDays = study.filter((x) => !x.review); const totalH = learnDays.length * hpd; const sumD = subs.reduce((a, b) => a + b.d, 0);
      subs.forEach((s) => { s.target = totalH * s.d / sumD; s.done = 0; });
      learnDays.forEach((day) => { day.items = {}; for (let k = 0; k < hpd; k++) { subs.sort((a, b) => (b.target - b.done) - (a.target - a.done)); const s = subs[0]; s.done++; day.items[s.n] = (day.items[s.n] || 0) + 1; } });
      const fmt = (d) => d.toLocaleDateString(h.lang() === 'en' ? 'en-GB' : 'ar-EG-u-nu-latn', { weekday: 'short', day: 'numeric', month: 'short' });
      const out = plan.map((x, i) => `${h.t('اليوم', 'Day')} ${i + 1} — ${fmt(x.d)}: ` + (x.rest ? h.t('راحة', 'Rest') : x.review ? h.t('مراجعة عامة لكل المواد', 'General review of all subjects') : Object.entries(x.items).map(([n, c]) => `${n} (${c}${h.t('س', 'h')})`).join(' + '))).join('\n');
      return { text: out, cards: [['أيام حتى الامتحان', 'Days to exam', days], ['أيام المذاكرة', 'Study days', study.length], ['إجمالي الساعات', 'Total hours', study.length * hpd - (v.review && study.length > 2 ? hpd : 0)]], out: { label: ['الخطة اليومية', 'Daily plan'], mono: false, rows: 14 } };
    }
  });

  def('flashcard-maker', {
    mount(root, h) {
      let cards = [], idx = 0, flipped = false;
      root.innerHTML = `<div class="tool-grid stack"><div class="tool-in"><div class="fld full"><label>${h.L('البطاقات: سطر لكل بطاقة بالشكل  سؤال | إجابة', 'Cards: one per line as  question | answer')}</label><textarea id="fc-src" rows="7" dir="auto" class="mono" data-ph-ar="عاصمة مصر | القاهرة" data-ph-en="Capital of Egypt | Cairo" placeholder="${h.t('عاصمة مصر | القاهرة', 'Capital of Egypt | Cairo')}"></textarea></div>
        <div class="btnrow"><button class="btn primary" id="fc-go" type="button">${h.L('ابدأ المراجعة', 'Start review')}</button><button class="btn ghost" id="fc-sample" type="button">${h.L('جرّب مثالًا', 'Try an example')}</button></div></div>
        <div class="tool-out"><div class="fc" hidden><button class="fc-card" id="fc-card" type="button" aria-live="polite"><span class="fc-side" id="fc-side"></span><span class="fc-text" id="fc-text" dir="auto"></span><small>${h.L('اضغط لقلب البطاقة', 'Click to flip')}</small></button>
        <div class="btnrow"><button class="btn" id="fc-prev" type="button">←</button><span id="fc-count" class="fc-count"></span><button class="btn" id="fc-next" type="button">→</button><button class="btn ghost" id="fc-shuf" type="button">${h.L('خلط', 'Shuffle')}</button><button class="btn ghost" id="fc-dl" type="button">${h.L('تنزيل CSV', 'Download CSV')}</button></div></div><p class="tool-status err" id="fc-err" hidden></p></div></div>`;
      const $ = (s) => h.$(s, root);
      const draw = () => { const c = cards[idx]; $('#fc-side').textContent = flipped ? h.t('الإجابة', 'Answer') : h.t('السؤال', 'Question'); $('#fc-text').textContent = flipped ? c[1] : c[0]; $('#fc-card').classList.toggle('flipped', flipped); $('#fc-count').textContent = (idx + 1) + ' / ' + cards.length; };
      $('#fc-sample').onclick = () => { $('#fc-src').value = 'عاصمة مصر | القاهرة\nWhat is 7 × 8? | 56\nأكبر كوكب في المجموعة الشمسية | المشتري\nH₂O | Water'; };
      $('#fc-go').onclick = () => { cards = lines($('#fc-src').value).map((l) => { const i = l.indexOf('|'); return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : null; }).filter((c) => c && c[0] && c[1]); const err = $('#fc-err'); if (!cards.length) { err.hidden = false; err.textContent = h.t('أضف بطاقة واحدة على الأقل بصيغة: سؤال | إجابة', 'Add at least one card as: question | answer'); $('.fc').hidden = true; return; } err.hidden = true; idx = 0; flipped = false; $('.fc').hidden = false; draw(); };
      $('#fc-card').onclick = () => { flipped = !flipped; draw(); };
      $('#fc-next').onclick = () => { if (!cards.length) return; idx = (idx + 1) % cards.length; flipped = false; draw(); };
      $('#fc-prev').onclick = () => { if (!cards.length) return; idx = (idx - 1 + cards.length) % cards.length; flipped = false; draw(); };
      $('#fc-shuf').onclick = () => { for (let i = cards.length - 1; i > 0; i--) { const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1); [cards[i], cards[j]] = [cards[j], cards[i]]; } idx = 0; flipped = false; draw(); };
      $('#fc-dl').onclick = () => h.download('flashcards.csv', '﻿' + cards.map((c) => c.map((x) => '"' + x.replace(/"/g, '""') + '"').join(',')).join('\n'), 'text/csv;charset=utf-8');
    }
  });

  /* citations */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function parseAuthors(s) { return lines(s).map((l) => { let last, first; if (l.includes(',')) { [last, first] = l.split(',').map((x) => x.trim()); } else { const p = l.split(/\s+/); last = p.pop(); first = p.join(' '); } return { last, first, init: first.split(/[\s-]+/).filter(Boolean).map((x) => x[0].toUpperCase() + '.').join(' ') }; }); }
  function citation(v) {
    const A = parseAuthors(v.authors), y = v.year.trim() || 'n.d.', t = v.title.trim(), c = v.container.trim(), pub = v.publisher.trim(), url = v.url.trim(), vol = v.vol.trim(), iss = v.issue.trim(), pg = v.pages.trim(), acc = v.accessed.trim();
    const join = (arr, last) => (arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + (arr.length > 2 && last === ', &' ? ',' : '') + ' ' + (last === ', &' ? '&' : last) + ' ' + arr[arr.length - 1]);
    const s = v.style, ty = v.type; let r = '';
    const fixEnd = (x) => x.replace(/\s+/g, ' ').replace(/\.\./g, '.').replace(/\s+\./g, '.').trim();
    if (s === 'apa') {
      const au = A.length > 20 ? A.slice(0, 19).map((a) => `${a.last}, ${a.init}`).join(', ') + ', ... ' + `${A[A.length - 1].last}, ${A[A.length - 1].init}` : join(A.map((a) => `${a.last}, ${a.init}`), ', &');
      const head = (au ? au.replace(/\.?$/, '.') + ' ' : '') + `(${y}). `;
      if (ty === 'web') r = head + `${t}. ` + (c ? `*${c}*. ` : '') + url; else if (ty === 'book') r = head + `*${t}*` + (v.edition ? ` (${v.edition} ed.)` : '') + `. ${pub}.` + (url ? ' ' + url : ''); else r = head + `${t}. *${c}*` + (vol ? `, *${vol}*` : '') + (iss ? `(${iss})` : '') + (pg ? `, ${pg}` : '') + '.' + (url ? ' ' + url : '');
    } else if (s === 'mla') {
      const au = A.length ? (A.length > 2 ? `${A[0].last}, ${A[0].first}, et al` : A.length === 2 ? `${A[0].last}, ${A[0].first}, and ${A[1].first} ${A[1].last}` : `${A[0].last}, ${A[0].first}`) + '. ' : '';
      if (ty === 'web') r = au + `"${t}." ` + (c ? `*${c}*, ` : '') + (pub ? pub + ', ' : '') + y + (url ? ', ' + url.replace(/^https?:\/\//, '') : '') + '.' + (acc ? ` Accessed ${acc}.` : ''); else if (ty === 'book') r = au + `*${t}*. ` + (v.edition ? v.edition + ' ed., ' : '') + (pub ? pub + ', ' : '') + y + '.'; else r = au + `"${t}." *${c}*` + (vol ? `, vol. ${vol}` : '') + (iss ? `, no. ${iss}` : '') + `, ${y}` + (pg ? `, pp. ${pg}` : '') + '.';
    } else if (s === 'chicago') {
      const au = A.length ? A.map((a, i) => (i ? `${a.first} ${a.last}` : `${a.last}, ${a.first}`)).reduce((p, n, i, arr) => (i === 0 ? n : i === arr.length - 1 ? p + ', and ' + n : p + ', ' + n), '') + '. ' : '';
      if (ty === 'web') r = au + `“${t}.” ` + (c ? `${c}. ` : '') + y + '. ' + url + '.'; else if (ty === 'book') r = au + `*${t}*. ` + (pub ? pub + ', ' : '') + y + '.'; else r = au + `“${t}.” *${c}*` + (vol ? ` ${vol}` : '') + (iss ? `, no. ${iss}` : '') + ` (${y})` + (pg ? ': ' + pg : '') + '.';
    } else if (s === 'ieee') {
      const au = A.length ? join(A.map((a) => `${a.init} ${a.last}`), 'and') + ', ' : '';
      if (ty === 'web') r = au + `“${t},” ` + (c ? `*${c}*, ` : '') + y + '. [Online]. Available: ' + url; else if (ty === 'book') r = au + `*${t}*. ` + (pub ? pub + ', ' : '') + y + '.'; else r = au + `“${t},” *${c}*` + (vol ? `, vol. ${vol}` : '') + (iss ? `, no. ${iss}` : '') + (pg ? `, pp. ${pg}` : '') + `, ${y}.`;
    } else {
      const au = A.length ? join(A.map((a) => `${a.last}, ${a.init}`), 'and') + ' ' : '';
      if (ty === 'web') r = au + `(${y}) ‘${t}’` + (c ? `, *${c}*` : '') + `. Available at: ${url}` + (acc ? ` (Accessed: ${acc}).` : '.'); else if (ty === 'book') r = au + `(${y}) *${t}*. ` + (v.edition ? v.edition + ' edn. ' : '') + (pub ? pub + '.' : ''); else r = au + `(${y}) ‘${t}’, *${c}*` + (vol ? `, ${vol}` : '') + (iss ? `(${iss})` : '') + (pg ? `, pp. ${pg}` : '') + '.';
    }
    return fixEnd(r);
  }
  def('citation-formatter', {
    layout: 'stack',
    fields: [sel('style', 'نمط التوثيق', 'Style', [['apa', 'APA 7', 'APA 7'], ['mla', 'MLA 9', 'MLA 9'], ['chicago', 'Chicago', 'Chicago'], ['ieee', 'IEEE', 'IEEE'], ['harvard', 'Harvard', 'Harvard']], 'apa'), sel('type', 'نوع المصدر', 'Source type', [['web', 'موقع إلكتروني', 'Website'], ['book', 'كتاب', 'Book'], ['journal', 'مقال في مجلة', 'Journal article']], 'web'), ta('authors', 'المؤلفون (واحد في كل سطر: الاسم الأول الأخير)', 'Authors (one per line: First Last)', { rows: 3 }), tx('title', 'العنوان', 'Title'), tx('container', 'اسم الموقع / المجلة', 'Website / Journal name'), tx('publisher', 'الناشر', 'Publisher'), tx('year', 'السنة', 'Year', { mono: true }), tx('vol', 'المجلد', 'Volume', { mono: true }), tx('issue', 'العدد', 'Issue', { mono: true }), tx('pages', 'الصفحات', 'Pages', { mono: true }), tx('edition', 'الطبعة', 'Edition'), tx('url', 'الرابط / DOI', 'URL / DOI', { mono: true }), tx('accessed', 'تاريخ الاطلاع', 'Accessed date')],
    sample: { authors: 'Sara Ahmed\nOmar Khaled', title: 'Understanding Web Performance', container: 'Journal of Web Engineering', year: '2024', vol: '12', issue: '3', pages: '45-67', type: 'journal', url: 'https://doi.org/10.1000/xyz123' },
    run(v, h) {
      if (!v.title.trim()) return null; const text = citation(v); const html = esc(text).replace(/\*([^*]+)\*/g, '<i>$1</i>');
      return { html: `<p class="citation" dir="ltr">${html}</p>`, copy: text.replace(/\*/g, ''), note: h.t('راجع الناتج مع دليل الجهة المطلوب منها التوثيق.', 'Check the result against your institution’s style guide.') };
    }
  });

  /* ---------- Converters ---------- */
  const UNITS = {
    length: { l: ['الطول', 'Length'], u: { m: ['متر', 'Meter', 1], km: ['كيلومتر', 'Kilometer', 1000], cm: ['سنتيمتر', 'Centimeter', 0.01], mm: ['مليمتر', 'Millimeter', 0.001], mi: ['ميل', 'Mile', 1609.344], yd: ['ياردة', 'Yard', 0.9144], ft: ['قدم', 'Foot', 0.3048], in: ['بوصة', 'Inch', 0.0254], nmi: ['ميل بحري', 'Nautical mile', 1852] } },
    mass: { l: ['الوزن', 'Mass'], u: { kg: ['كيلوجرام', 'Kilogram', 1], g: ['جرام', 'Gram', 0.001], mg: ['مليجرام', 'Milligram', 1e-6], t: ['طن', 'Tonne', 1000], lb: ['رطل', 'Pound', 0.45359237], oz: ['أونصة', 'Ounce', 0.028349523125], st: ['ستون', 'Stone', 6.35029318] } },
    volume: { l: ['الحجم', 'Volume'], u: { l: ['لتر', 'Liter', 1], ml: ['مليلتر', 'Milliliter', 0.001], m3: ['متر مكعب', 'Cubic meter', 1000], gal: ['جالون أمريكي', 'US gallon', 3.785411784], qt: ['كوارت', 'US quart', 0.946352946], cup: ['كوب أمريكي', 'US cup', 0.2365882365], floz: ['أونصة سائلة', 'US fl oz', 0.0295735295625], tbsp: ['ملعقة كبيرة', 'Tablespoon', 0.01478676478], tsp: ['ملعقة صغيرة', 'Teaspoon', 0.00492892159] } },
    area: { l: ['المساحة', 'Area'], u: { m2: ['متر مربع', 'Square meter', 1], km2: ['كيلومتر مربع', 'Square km', 1e6], ha: ['هكتار', 'Hectare', 10000], fed: ['فدان', 'Feddan', 4200.833], ac: ['إيكر', 'Acre', 4046.8564224], ft2: ['قدم مربع', 'Square foot', 0.09290304], in2: ['بوصة مربعة', 'Square inch', 0.00064516], mi2: ['ميل مربع', 'Square mile', 2589988.110336] } },
    speed: { l: ['السرعة', 'Speed'], u: { ms: ['متر/ثانية', 'm/s', 1], kmh: ['كم/ساعة', 'km/h', 1 / 3.6], mph: ['ميل/ساعة', 'mph', 0.44704], kn: ['عقدة', 'Knot', 0.514444], ft_s: ['قدم/ثانية', 'ft/s', 0.3048] } },
    time: { l: ['الوقت', 'Time'], u: { s: ['ثانية', 'Second', 1], min: ['دقيقة', 'Minute', 60], h: ['ساعة', 'Hour', 3600], d: ['يوم', 'Day', 86400], wk: ['أسبوع', 'Week', 604800], mo: ['شهر (30.44 يوم)', 'Month (30.44 d)', 2629800], yr: ['سنة (365.25 يوم)', 'Year (365.25 d)', 31557600], ms: ['ميلي ثانية', 'Millisecond', 0.001] } },
    energy: { l: ['الطاقة', 'Energy'], u: { j: ['جول', 'Joule', 1], kj: ['كيلوجول', 'Kilojoule', 1000], cal: ['سعر حراري', 'Calorie', 4.184], kcal: ['كيلوسعر', 'Kilocalorie', 4184], wh: ['واط ساعة', 'Watt-hour', 3600], kwh: ['كيلوواط ساعة', 'kWh', 3.6e6], btu: ['BTU', 'BTU', 1055.05585] } },
    temp: { l: ['الحرارة', 'Temperature'], u: { c: ['مئوي °C', 'Celsius °C'], f: ['فهرنهايت °F', 'Fahrenheit °F'], k: ['كلفن K', 'Kelvin K'] } }
  };
  function convertUnit(cat, v, from, to) {
    if (cat === 'temp') { const c = from === 'c' ? v : from === 'f' ? (v - 32) * 5 / 9 : v - 273.15; return to === 'c' ? c : to === 'f' ? c * 9 / 5 + 32 : c + 273.15; }
    const u = UNITS[cat].u; return v * u[from][2] / u[to][2];
  }
  def('unit-converter', {
    mount(root, h) {
      const cats = Object.keys(UNITS); const name = (x) => h.t(x[0], x[1]);
      root.innerHTML = `<div class="tool-grid"><div class="tool-in"><div class="fld"><label>${h.L('الفئة', 'Category')}</label><select id="uc-cat">${cats.map((c) => `<option value="${c}" data-ar="${UNITS[c].l[0]}" data-en="${UNITS[c].l[1]}">${name(UNITS[c].l)}</option>`).join('')}</select></div>
        <div class="fld"><label>${h.L('القيمة', 'Value')}</label><input id="uc-val" type="number" step="any" value="1" dir="ltr"></div>
        <div class="fld"><label>${h.L('من', 'From')}</label><select id="uc-from"></select></div><div class="fld"><label>${h.L('إلى', 'To')}</label><select id="uc-to"></select></div>
        <div class="btnrow"><button class="btn" id="uc-swap" type="button">⇄ ${h.L('تبديل', 'Swap')}</button></div></div><div class="tool-out"><div class="out" id="uc-out"></div></div></div>`;
      const cat = h.$('#uc-cat', root), from = h.$('#uc-from', root), to = h.$('#uc-to', root), val = h.$('#uc-val', root), out = h.$('#uc-out', root);
      const fill = () => { const u = UNITS[cat.value].u; const opts = Object.keys(u).map((k) => `<option value="${k}" data-ar="${u[k][0]}" data-en="${u[k][1]}">${name(u[k])}</option>`).join(''); from.innerHTML = opts; to.innerHTML = opts; to.selectedIndex = Math.min(1, to.options.length - 1); calc(); };
      const calc = () => {
        const v = parseFloat(val.value); if (!Number.isFinite(v)) { out.innerHTML = ''; return; } const u = UNITS[cat.value].u;
        const r = convertUnit(cat.value, v, from.value, to.value);
        UT.renderResult(out, { cards: [[`${h.fmtNum(v, 8)} ${u[from.value][0]} =`, `${h.fmtNum(v, 8)} ${u[from.value][1]} =`, h.fmtNum(r, 8) + ' ' + h.t(u[to.value][0], u[to.value][1])]], html: `<table class="tbl"><tbody>${Object.keys(u).map((k) => `<tr><td>${h.L(u[k][0], u[k][1])}</td><td dir="ltr">${h.fmtNum(convertUnit(cat.value, v, from.value, k), 8)}</td></tr>`).join('')}</tbody></table>` }, {});
      };
      cat.onchange = fill; [from, to, val].forEach((e) => e.addEventListener('input', calc)); h.$('#uc-swap', root).onclick = () => { const a = from.value; from.value = to.value; to.value = a; calc(); };
      fill();
    }
  });

  def('file-size-converter', {
    fields: [nm('v', 'القيمة', 'Value', 1.5, { min: 0 }), sel('u', 'الوحدة', 'Unit', [['B', 'بايت (B)', 'Bytes (B)'], ['KB', 'كيلوبايت (KB)', 'Kilobytes (KB)'], ['MB', 'ميجابايت (MB)', 'Megabytes (MB)'], ['GB', 'جيجابايت (GB)', 'Gigabytes (GB)'], ['TB', 'تيرابايت (TB)', 'Terabytes (TB)'], ['PB', 'بيتابايت (PB)', 'Petabytes (PB)']], 'GB'), sel('base', 'الأساس', 'Base', [['1024', 'ثنائي 1024 (KiB)', 'Binary 1024 (KiB)'], ['1000', 'عشري 1000 (kB)', 'Decimal 1000 (kB)']], '1024')],
    run(v, h) {
      if (!(v.v >= 0)) return null; const names = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'], b = +v.base; const bytes = v.v * Math.pow(b, names.indexOf(v.u));
      return names.map((n, i) => [n, n, h.fmtNum(bytes / Math.pow(b, i), 6)]).concat([['بت', 'Bits', h.fmtNum(bytes * 8, 0)]]);
    }
  });

  /* time zones */
  const ZONES = [['Africa/Cairo', 'القاهرة', 'Cairo'], ['Asia/Riyadh', 'الرياض', 'Riyadh'], ['Asia/Dubai', 'دبي', 'Dubai'], ['Asia/Qatar', 'الدوحة', 'Doha'], ['Asia/Kuwait', 'الكويت', 'Kuwait'], ['Asia/Baghdad', 'بغداد', 'Baghdad'], ['Asia/Amman', 'عمّان', 'Amman'], ['Asia/Beirut', 'بيروت', 'Beirut'], ['Africa/Casablanca', 'الدار البيضاء', 'Casablanca'], ['Africa/Algiers', 'الجزائر', 'Algiers'], ['Africa/Tunis', 'تونس', 'Tunis'], ['Africa/Khartoum', 'الخرطوم', 'Khartoum'], ['Europe/Istanbul', 'إسطنبول', 'Istanbul'], ['Europe/London', 'لندن', 'London'], ['Europe/Paris', 'باريس', 'Paris'], ['Europe/Berlin', 'برلين', 'Berlin'], ['Europe/Moscow', 'موسكو', 'Moscow'], ['America/New_York', 'نيويورك', 'New York'], ['America/Chicago', 'شيكاغو', 'Chicago'], ['America/Denver', 'دنفر', 'Denver'], ['America/Los_Angeles', 'لوس أنجلوس', 'Los Angeles'], ['America/Toronto', 'تورنتو', 'Toronto'], ['America/Sao_Paulo', 'ساو باولو', 'São Paulo'], ['Asia/Karachi', 'كراتشي', 'Karachi'], ['Asia/Kolkata', 'مومباي / دلهي', 'Mumbai / Delhi'], ['Asia/Dhaka', 'دكا', 'Dhaka'], ['Asia/Bangkok', 'بانكوك', 'Bangkok'], ['Asia/Singapore', 'سنغافورة', 'Singapore'], ['Asia/Hong_Kong', 'هونغ كونغ', 'Hong Kong'], ['Asia/Tokyo', 'طوكيو', 'Tokyo'], ['Asia/Seoul', 'سيول', 'Seoul'], ['Australia/Sydney', 'سيدني', 'Sydney'], ['Pacific/Auckland', 'أوكلاند', 'Auckland'], ['UTC', 'التوقيت العالمي UTC', 'UTC']];
  const tzParts = (ts, tz) => { const p = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(ts)).forEach((x) => { p[x.type] = +x.value; }); return p; };
  const tzOffset = (ts, tz) => { const p = tzParts(ts, tz); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ts / 1000) * 1000; };
  function zonedToUtc(str, tz) { const m = str.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/); if (!m) return NaN; const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]); let ts = guess - tzOffset(guess, tz); ts = guess - tzOffset(ts, tz); return ts; }
  def('timezone-converter', {
    layout: 'stack',
    fields: [{ id: 'dt', type: 'datetime', label: ['التاريخ والوقت', 'Date & time'], value: '' }, sel('from', 'المنطقة الأصلية', 'From time zone', ZONES.map((z) => [z[0], z[1], z[2]]), 'Africa/Cairo')],
    run(v, h) {
      const dt = v.dt || (() => { const n = new Date(); const p = tzParts(n.getTime(), v.from); return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}T${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`; })();
      const ts = zonedToUtc(dt, v.from); if (!Number.isFinite(ts)) return { error: h.t('تاريخ غير صالح.', 'Invalid date.') };
      const rows = ZONES.map((z) => { const f = new Intl.DateTimeFormat(h.lang() === 'en' ? 'en-GB' : 'ar-EG-u-nu-latn', { timeZone: z[0], weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }); const off = tzOffset(ts, z[0]) / 60000; const sign = off < 0 ? '−' : '+'; const a = Math.abs(off); return [z, f.format(new Date(ts)), `UTC${sign}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`, off]; }).sort((a, b) => a[3] - b[3]);
      return { html: `<table class="tbl"><thead><tr><th>${h.L('المدينة', 'City')}</th><th>${h.L('الوقت', 'Time')}</th><th>UTC</th></tr></thead><tbody>${rows.map((r) => `<tr${r[0][0] === v.from ? ' class="chg"' : ''}><td>${h.L(r[0][1], r[0][2])}</td><td dir="auto">${esc(r[1])}</td><td dir="ltr">${r[2]}</td></tr>`).join('')}</tbody></table>`, copy: rows.map((r) => `${r[0][2]}: ${r[1]} (${r[2]})`).join('\n'), note: v.dt ? null : h.t('يعرض الوقت الحالي. اختر تاريخًا ووقتًا للتحويل.', 'Showing the current time. Pick a date & time to convert.') };
    }
  });

  def('date-difference', {
    fields: [{ id: 'a', type: 'date', label: ['من تاريخ', 'From date'], value: '2026-01-01' }, { id: 'b', type: 'date', label: ['إلى تاريخ', 'To date'], value: new Date().toISOString().slice(0, 10) }, sel('we', 'عطلة نهاية الأسبوع', 'Weekend', [['5,6', 'الجمعة والسبت', 'Friday & Saturday'], ['6,0', 'السبت والأحد', 'Saturday & Sunday']], '5,6'), ck('inc', 'احتساب يوم النهاية', 'Include the end day', false)],
    run(v, h) {
      if (!v.a || !v.b) return null; let a = new Date(v.a + 'T00:00:00Z'), b = new Date(v.b + 'T00:00:00Z'); let sign = 1; if (b < a) { [a, b] = [b, a]; sign = -1; }
      let y = b.getUTCFullYear() - a.getUTCFullYear(), m = b.getUTCMonth() - a.getUTCMonth(), d = b.getUTCDate() - a.getUTCDate();
      if (d < 0) { m--; d += new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), 0)).getUTCDate(); } if (m < 0) { y--; m += 12; }
      const days = Math.round((b - a) / 86400000) + (v.inc ? 1 : 0); const we = v.we.split(',').map(Number); let work = 0; const end = new Date(b.getTime() + (v.inc ? 86400000 : 0));
      for (let t = new Date(a); t < end; t = new Date(t.getTime() + 86400000)) if (!we.includes(t.getUTCDay())) work++;
      return [['الفرق', 'Difference', `${y} ${h.t('سنة', 'y')} ${m} ${h.t('شهر', 'm')} ${d} ${h.t('يوم', 'd')}` + (sign < 0 ? h.t(' (قبل)', ' (before)') : '')], ['إجمالي الأيام', 'Total days', days], ['الأسابيع', 'Weeks', h.fmtNum(days / 7, 2)], ['الأشهر (تقريبًا)', 'Months (approx.)', h.fmtNum(days / 30.4375, 2)], ['أيام العمل', 'Working days', work], ['الساعات', 'Hours', h.fmtNum(days * 24, 0)]];
    }
  });

  def('age-calculator', {
    fields: [{ id: 'dob', type: 'date', label: ['تاريخ الميلاد', 'Date of birth'], value: '2000-01-15' }, { id: 'at', type: 'date', label: ['حتى تاريخ (اتركه فارغًا لليوم)', 'As of (empty = today)'], value: '' }],
    run(v, h) {
      if (!v.dob) return null; const a = new Date(v.dob + 'T00:00:00Z'); const now = v.at ? new Date(v.at + 'T00:00:00Z') : (() => { const n = new Date(); return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())); })();
      if (now < a) return { error: h.t('تاريخ الميلاد بعد التاريخ المحدد.', 'Birth date is after the chosen date.') };
      let y = now.getUTCFullYear() - a.getUTCFullYear(), m = now.getUTCMonth() - a.getUTCMonth(), d = now.getUTCDate() - a.getUTCDate();
      if (d < 0) { m--; d += new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)).getUTCDate(); } if (m < 0) { y--; m += 12; }
      const days = Math.round((now - a) / 86400000); let nb = new Date(Date.UTC(now.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())); if (nb < now) nb = new Date(Date.UTC(now.getUTCFullYear() + 1, a.getUTCMonth(), a.getUTCDate())); const left = Math.round((nb - now) / 86400000);
      const dow = a.toLocaleDateString(h.lang() === 'en' ? 'en-US' : 'ar-EG', { weekday: 'long', timeZone: 'UTC' });
      return [['العمر', 'Age', `${y} ${h.t('سنة', 'years')} ${m} ${h.t('شهر', 'months')} ${d} ${h.t('يوم', 'days')}`], ['بالأشهر', 'In months', y * 12 + m], ['بالأسابيع', 'In weeks', Math.floor(days / 7)], ['بالأيام', 'In days', h.fmtNum(days, 0)], ['بالساعات', 'In hours', h.fmtNum(days * 24, 0)], ['عيد الميلاد القادم بعد', 'Next birthday in', left === 0 ? h.t('اليوم! 🎉', 'Today! 🎉') : left + ' ' + h.t('يوم', 'days')], ['وُلدت يوم', 'Born on a', dow]];
    }
  });

  /* Hijri <-> Gregorian (Umm al-Qura via Intl) */
  const HM_AR = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'], HM_EN = ['Muharram', 'Safar', 'Rabi’ al-awwal', 'Rabi’ al-thani', 'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha’ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi’dah', 'Dhu al-Hijjah'];
  const hijriOf = (date) => { const p = {}; new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }).formatToParts(date).forEach((x) => { p[x.type] = parseInt(x.value, 10); }); return { y: p.year, m: p.month, d: p.day }; };
  function gregOfHijri(y, m, d) {
    const approx = Date.UTC(622, 6, 16) + ((y - 1) * 354.367 + (m - 1) * 29.5306 + (d - 1)) * 86400000;
    for (let off = -45; off <= 45; off++) { const t = new Date(Math.round(approx / 86400000) * 86400000 + off * 86400000); const hh = hijriOf(t); if (hh.y === y && hh.m === m && hh.d === d) return t; }
    return null;
  }
  def('hijri-converter', {
    fields: [sel('mode', 'التحويل', 'Convert', [['g2h', 'ميلادي ← هجري', 'Gregorian → Hijri'], ['h2g', 'هجري ← ميلادي', 'Hijri → Gregorian']], 'g2h'), { id: 'g', type: 'date', label: ['التاريخ الميلادي (للتحويل إلى هجري)', 'Gregorian date (for → Hijri)'], value: new Date().toISOString().slice(0, 10) }, nm('hy', 'السنة الهجرية', 'Hijri year', 1448, { min: 1, max: 1600, step: 1 }), nm('hm', 'الشهر الهجري (1-12)', 'Hijri month (1-12)', 1, { min: 1, max: 12, step: 1 }), nm('hd', 'اليوم (1-30)', 'Day (1-30)', 1, { min: 1, max: 30, step: 1 })],
    run(v, h) {
      const wd = (d) => d.toLocaleDateString(h.lang() === 'en' ? 'en-US' : 'ar-EG', { weekday: 'long', timeZone: 'UTC' });
      if (v.mode === 'g2h') { if (!v.g) return null; const d = new Date(v.g + 'T00:00:00Z'); const x = hijriOf(d); if (!x.y) return { error: h.t('متصفحك لا يدعم التقويم الهجري.', 'Your browser does not support the Hijri calendar.') }; return [['التاريخ الهجري', 'Hijri date', `${x.d} ${h.t(HM_AR[x.m - 1], HM_EN[x.m - 1])} ${x.y} ${h.t('هـ', 'AH')}`], ['بالأرقام', 'Numeric', `${x.y}/${String(x.m).padStart(2, '0')}/${String(x.d).padStart(2, '0')}`], ['اليوم', 'Weekday', wd(d)]]; }
      if (!(v.hy > 0) || !(v.hm >= 1 && v.hm <= 12) || !(v.hd >= 1 && v.hd <= 30)) return { error: h.t('تاريخ هجري غير صالح.', 'Invalid Hijri date.') };
      const g = gregOfHijri(Math.floor(v.hy), Math.floor(v.hm), Math.floor(v.hd)); if (!g) return { error: h.t('هذا اليوم غير موجود في هذا الشهر (قد يكون الشهر 29 يومًا).', 'That day does not exist in this month (it may have 29 days).') };
      return [['التاريخ الميلادي', 'Gregorian date', g.toLocaleDateString(h.lang() === 'en' ? 'en-GB' : 'ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })], ['ISO', 'ISO', g.toISOString().slice(0, 10)], ['اليوم', 'Weekday', wd(g)]];
    }
  });
})();
