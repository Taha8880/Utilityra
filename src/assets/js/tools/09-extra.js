(function () {
  const { ta, tx, nm, sel, ck, esc } = UT.H;
  const def = UT.def;
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
  const num = (x, d = 4) => { const r = Math.round(x * 10 ** d) / 10 ** d; return Number.isFinite(r) ? r.toLocaleString('en-US', { maximumFractionDigits: d }) : '—'; };
  const iso = (d) => d.toISOString().slice(0, 10);
  const parseD = (s) => (s ? new Date(s + 'T00:00:00Z') : null);

  def('percentage-change-calculator', {
    fields: [nm('a', 'القيمة الأولى (القديمة)', 'Old value', 80), nm('b', 'القيمة الثانية (الجديدة)', 'New value', 100)],
    sample: { a: 80, b: 100 },
    run(v, h) {
      if (v.a === '' || v.b === '' || v.a == null || v.b == null) return null;
      if (v.a === 0) return { error: h.t('لا يمكن حساب النسبة من قيمة أولى تساوي صفرًا.', 'Percentage change from zero is undefined.') };
      const ch = (v.b - v.a) / Math.abs(v.a) * 100;
      return { cards: [['نسبة التغيّر', 'Percentage change', num(ch, 2) + '%'], ['الفرق', 'Difference', num(v.b - v.a)], ['الاتجاه', 'Direction', ch > 0 ? h.t('زيادة', 'Increase') : ch < 0 ? h.t('انخفاض', 'Decrease') : h.t('بدون تغيّر', 'No change')]] };
    }
  });

  def('ratio-calculator', {
    fields: [nm('a', 'الطرف الأول', 'First term', 18, { min: 0 }), nm('b', 'الطرف الثاني', 'Second term', 24, { min: 0 })],
    sample: { a: 18, b: 24 },
    run(v, h) {
      if (!(v.a >= 0) || !(v.b >= 0) || (v.a === 0 && v.b === 0)) return null;
      const dec = (x) => (String(x).split('.')[1] || '').length, sc = 10 ** Math.min(6, Math.max(dec(v.a), dec(v.b)));
      const A = Math.round(v.a * sc), B = Math.round(v.b * sc), g = gcd(A, B) || 1;
      return { cards: [['النسبة المبسّطة', 'Simplified ratio', (A / g) + ' : ' + (B / g)], ['الأول ÷ الثاني', 'First ÷ second', v.b === 0 ? '—' : num(v.a / v.b)], ['حصة الطرف الأول', 'Share of first', num(v.a / (v.a + v.b) * 100, 2) + '%']] };
    }
  });

  def('gcd-lcm-calculator', {
    fields: [tx('n', 'أعداد صحيحة موجبة مفصولة بفواصل', 'Positive integers separated by commas', { value: '12, 18, 24', dir: 'ltr' })],
    sample: { n: '12, 18, 24' },
    run(v, h) {
      const xs = String(v.n).split(/[\s,;،]+/).filter(Boolean).map(Number); if (!xs.length) return null;
      if (xs.some((x) => !Number.isInteger(x) || x <= 0 || x > 1e9)) return { error: h.t('أدخل أعدادًا صحيحة موجبة (حتى مليار).', 'Enter positive integers (up to 1,000,000,000).') };
      if (xs.length < 2) return { error: h.t('أدخل عددين على الأقل.', 'Enter at least two numbers.') };
      let G = xs[0], L = xs[0]; for (const x of xs.slice(1)) { G = gcd(G, x); L = L / gcd(L, x) * x; }
      return { cards: [['القاسم المشترك الأكبر', 'GCD', String(G)], ['المضاعف المشترك الأصغر', 'LCM', Number.isSafeInteger(L) ? String(L) : h.t('كبير جدًا', 'Too large')]] };
    }
  });

  def('prime-checker', {
    fields: [nm('n', 'عدد صحيح', 'Integer', 360, { min: 0 })],
    sample: { n: 360 },
    run(v, h) {
      const n = v.n; if (n === '' || n == null) return null;
      if (!Number.isInteger(n) || n < 0 || n > 1e12) return { error: h.t('أدخل عددًا صحيحًا بين 0 و1,000,000,000,000.', 'Enter an integer between 0 and 1,000,000,000,000.') };
      if (n < 2) return { cards: [['هل هو أولي؟', 'Prime?', h.t('لا', 'No')]] };
      let m = n; const f = []; for (let p = 2; p * p <= m; p += p === 2 ? 1 : 2) { let e = 0; while (m % p === 0) { m /= p; e++; } if (e) f.push([p, e]); } if (m > 1) f.push([m, 1]);
      const prime = f.length === 1 && f[0][1] === 1;
      return { cards: [['هل هو أولي؟', 'Prime?', prime ? h.t('نعم', 'Yes') : h.t('لا', 'No')], ['التحليل إلى عوامل أولية', 'Prime factorization', prime ? String(n) : f.map(([p, e]) => (e > 1 ? p + '^' + e : p)).join(' × ')]] };
    }
  });

  def('fraction-calculator', {
    fields: [nm('n1', 'بسط الكسر الأول', 'Numerator 1', 1), nm('d1', 'مقام الكسر الأول', 'Denominator 1', 2), sel('op', 'العملية', 'Operation', [['+', 'جمع +', 'Add +'], ['-', 'طرح −', 'Subtract −'], ['*', 'ضرب ×', 'Multiply ×'], ['/', 'قسمة ÷', 'Divide ÷']], '+'), nm('n2', 'بسط الكسر الثاني', 'Numerator 2', 1), nm('d2', 'مقام الكسر الثاني', 'Denominator 2', 3)],
    sample: { n1: 1, d1: 2, op: '+', n2: 1, d2: 3 },
    run(v, h) {
      const { n1, d1, n2, d2 } = v; if ([n1, d1, n2, d2].some((x) => x === '' || x == null)) return null;
      if (![n1, d1, n2, d2].every(Number.isInteger)) return { error: h.t('استخدم أعدادًا صحيحة فقط.', 'Use whole numbers only.') };
      if (d1 === 0 || d2 === 0) return { error: h.t('المقام لا يمكن أن يكون صفرًا.', 'A denominator cannot be zero.') };
      let n, d;
      if (v.op === '+') { n = n1 * d2 + n2 * d1; d = d1 * d2; } else if (v.op === '-') { n = n1 * d2 - n2 * d1; d = d1 * d2; } else if (v.op === '*') { n = n1 * n2; d = d1 * d2; } else { if (n2 === 0) return { error: h.t('لا يمكن القسمة على صفر.', 'Cannot divide by zero.') }; n = n1 * d2; d = d1 * n2; }
      if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; n /= g; d /= g;
      const w = Math.trunc(n / d), r = Math.abs(n % d);
      return { cards: [['الناتج', 'Result', d === 1 ? String(n) : n + '/' + d], ['عدد كسري', 'Mixed number', r === 0 ? String(w) : (w === 0 ? (n < 0 ? '-' : '') : w + ' ') + r + '/' + d], ['عشري', 'Decimal', num(n / d, 6)]] };
    }
  });

  def('working-days-calculator', {
    fields: [{ id: 's', type: 'date', label: ['من تاريخ', 'From'], value: '2026-11-01' }, { id: 'e', type: 'date', label: ['إلى تاريخ (شامل)', 'To (inclusive)'], value: '2026-11-30' }, sel('w', 'عطلة نهاية الأسبوع', 'Weekend', [['fs', 'الجمعة والسبت', 'Friday & Saturday'], ['ss', 'السبت والأحد', 'Saturday & Sunday'], ['f', 'الجمعة فقط', 'Friday only']], 'fs')],
    sample: { s: '2026-11-01', e: '2026-11-30', w: 'fs' },
    note: ['لا تُخصم الإجازات الرسمية؛ اطرحها يدويًا.', 'Public holidays are not deducted; subtract them manually.'],
    run(v, h) {
      const a = parseD(v.s), b = parseD(v.e); if (!a || !b) return null;
      if (b < a) return { error: h.t('تاريخ النهاية قبل البداية.', 'End date is before start.') };
      const off = v.w === 'ss' ? [6, 0] : v.w === 'f' ? [5] : [5, 6]; let work = 0, total = 0;
      for (let d = new Date(a); d <= b; d = new Date(d.getTime() + 86400000)) { total++; if (!off.includes(d.getUTCDay())) work++; }
      return { cards: [['أيام العمل', 'Working days', String(work)], ['أيام العطلة', 'Weekend days', String(total - work)], ['إجمالي الأيام', 'Total days', String(total)]] };
    }
  });

  def('date-add-calculator', {
    fields: [{ id: 's', type: 'date', label: ['تاريخ البداية', 'Start date'], value: '2026-01-31' }, nm('n', 'المقدار (سالب للطرح)', 'Amount (negative to subtract)', 1), sel('u', 'الوحدة', 'Unit', [['d', 'أيام', 'Days'], ['w', 'أسابيع', 'Weeks'], ['m', 'أشهر', 'Months'], ['y', 'سنوات', 'Years']], 'm')],
    sample: { s: '2026-01-31', n: 1, u: 'm' },
    note: ['عند الإضافة بالأشهر لا يتجاوز الناتج نهاية الشهر (31 يناير + شهر = 28 فبراير).', 'Month math never overflows the month end (Jan 31 + 1 month = Feb 28).'],
    run(v, h) {
      const a = parseD(v.s); if (!a || v.n === '' || v.n == null || !Number.isInteger(v.n)) return null;
      let r;
      if (v.u === 'd' || v.u === 'w') r = new Date(a.getTime() + v.n * (v.u === 'w' ? 7 : 1) * 86400000);
      else { const months = v.u === 'y' ? v.n * 12 : v.n; const y = a.getUTCFullYear(), m = a.getUTCMonth() + months; const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); r = new Date(Date.UTC(y, m, Math.min(a.getUTCDate(), last))); }
      return { cards: [['التاريخ الناتج', 'Resulting date', iso(r)], ['اليوم', 'Weekday', r.toLocaleDateString(h.lang() === 'en' ? 'en-US' : 'ar-EG', { weekday: 'long', timeZone: 'UTC' })]] };
    }
  });

  def('character-limit-checker', {
    fields: [ta('t', 'النص', 'Text', { rows: 6, value: '' })],
    sample: { t: 'Utilityra: free online tools for everyone.' },
    run(v, h) {
      if (!v.t) return null; const n = Array.from(v.t).length;
      const L = [['منشور X (تويتر)', 'X (Twitter) post', 280], ['وصف إنستغرام', 'Instagram caption', 2200], ['منشور LinkedIn', 'LinkedIn post', 3000], ['عنوان الصفحة (SEO)', 'SEO title', 60], ['الوصف التعريفي (SEO)', 'Meta description', 160], ['عنوان يوتيوب', 'YouTube title', 100], ['رسالة SMS واحدة', 'Single SMS', 160]];
      return { cards: [['عدد الأحرف', 'Characters', String(n)], ...L.map(([a, e, m]) => [a, e, n + ' / ' + m + (n <= m ? ' ✓' : ' ✗ (+' + (n - m) + ')')])] };
    }
  });

  def('email-extractor', {
    fields: [sel('m', 'استخراج', 'Extract', [['e', 'البريد الإلكتروني', 'Emails'], ['u', 'الروابط', 'URLs'], ['h', 'الوسوم #', 'Hashtags']], 'e'), ta('t', 'النص', 'Text', { rows: 8 })],
    sample: { m: 'e', t: 'Contact: sales@example.com, Dev.Team@site.org and sales@example.com. Docs: https://utilityra.com/tools #free' },
    run(v, h) {
      if (!v.t.trim()) return null;
      const re = v.m === 'e' ? /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g : v.m === 'u' ? /https?:\/\/[^\s<>"')\]]+/g : /#[\p{L}\p{N}_]+/gu;
      const seen = new Set(), out = []; for (const m of v.t.match(re) || []) { const k = v.m === 'e' ? m.toLowerCase() : m; if (!seen.has(k)) { seen.add(k); out.push(m.replace(/[.,;]+$/, '')); } }
      if (!out.length) return { error: h.t('لم يتم العثور على نتائج.', 'Nothing found.') };
      return { note: h.t('تم العثور على ' + out.length + ' نتيجة فريدة.', out.length + ' unique result(s) found.'), text: out.join('\n') };
    }
  });

  const AR = '٠١٢٣٤٥٦٧٨٩', FA = '۰۱۲۳۴۵۶۷۸۹';
  def('arabic-numerals-converter', {
    fields: [sel('m', 'الاتجاه', 'Direction', [['w', 'إلى أرقام إنجليزية (0-9)', 'To Western digits (0-9)'], ['a', 'إلى أرقام عربية (٠-٩)', 'To Arabic-Indic digits (٠-٩)']], 'w'), ta('t', 'النص', 'Text', { rows: 6 })],
    sample: { m: 'w', t: 'رقم الطلب ٢٠٢٦ وتاريخه ۱۲/۱۰ و 77' },
    run(v) {
      if (!v.t) return null;
      return v.m === 'w' ? v.t.replace(/[٠-٩]/g, (c) => AR.indexOf(c)).replace(/[۰-۹]/g, (c) => FA.indexOf(c)) : v.t.replace(/[0-9]/g, (c) => AR[c]);
    }
  });

  def('list-joiner', {
    fields: [sel('m', 'الوضع', 'Mode', [['j', 'أسطر ← قائمة مفصولة', 'Lines → delimited list'], ['s', 'قائمة مفصولة ← أسطر', 'Delimited list → lines']], 'j'), tx('sep', 'الفاصل', 'Separator', { value: ',' }), sel('q', 'علامات الاقتباس', 'Quotes', [['', 'بدون', 'None'], ['"', 'مزدوجة "', 'Double "'], ["'", "مفردة '", "Single '"]], ''), ck('u', 'حذف المكرر', 'Remove duplicates', false), ta('t', 'المدخل', 'Input', { rows: 8 })],
    sample: { m: 'j', sep: ',', q: '"', u: false, t: 'apple\nbanana\ncherry' },
    run(v) {
      if (!v.t.trim()) return null; const sep = v.sep === '\\n' ? '\n' : v.sep === '\\t' ? '\t' : v.sep;
      let xs = v.m === 'j' ? v.t.split(/\r?\n/).map((x) => x.trim()).filter(Boolean) : v.t.split(sep).map((x) => x.trim().replace(/^(["'])(.*)\1$/, '$2')).filter(Boolean);
      if (v.u) xs = [...new Set(xs)];
      return v.m === 'j' ? xs.map((x) => v.q + x + v.q).join(sep) : xs.join('\n');
    }
  });

  def('profit-margin-calculator', {
    fields: [nm('c', 'التكلفة', 'Cost', 80, { min: 0 }), nm('p', 'سعر البيع', 'Selling price', 100, { min: 0 })],
    sample: { c: 80, p: 100 },
    run(v, h) {
      if (!(v.c >= 0) || !(v.p > 0)) return null; const pr = v.p - v.c;
      return { cards: [['الربح', 'Profit', num(pr, 2)], ['هامش الربح', 'Profit margin', num(pr / v.p * 100, 2) + '%'], ['نسبة الإضافة على التكلفة', 'Markup', v.c > 0 ? num(pr / v.c * 100, 2) + '%' : '—']] };
    }
  });

  def('break-even-calculator', {
    fields: [nm('f', 'التكاليف الثابتة', 'Fixed costs', 10000, { min: 0 }), nm('p', 'سعر بيع الوحدة', 'Price per unit', 50, { min: 0 }), nm('v', 'التكلفة المتغيّرة للوحدة', 'Variable cost per unit', 30, { min: 0 })],
    sample: { f: 10000, p: 50, v: 30 },
    run(v, h) {
      if (!(v.f >= 0) || !(v.p > 0) || !(v.v >= 0)) return null;
      if (v.p <= v.v) return { error: h.t('سعر البيع يجب أن يزيد عن التكلفة المتغيّرة للوحدة.', 'Price must exceed variable cost per unit.') };
      const u = Math.ceil(v.f / (v.p - v.v));
      return { cards: [['وحدات التعادل', 'Break-even units', String(u)], ['إيراد التعادل', 'Break-even revenue', num(u * v.p, 2)], ['هامش المساهمة للوحدة', 'Contribution per unit', num(v.p - v.v, 2)]] };
    }
  });

  def('fuel-cost-calculator', {
    fields: [nm('d', 'المسافة (كم)', 'Distance (km)', 300, { min: 0 }), nm('c', 'الاستهلاك (لتر/100 كم)', 'Consumption (L/100 km)', 8, { min: 0 }), nm('p', 'سعر اللتر', 'Price per litre', 12, { min: 0 }), ck('r', 'ذهاب وعودة', 'Round trip', false)],
    sample: { d: 300, c: 8, p: 12, r: false },
    run(v) {
      if (!(v.d > 0) || !(v.c > 0) || !(v.p >= 0)) return null; const km = v.d * (v.r ? 2 : 1), l = km * v.c / 100;
      return { cards: [['الوقود المطلوب (لتر)', 'Fuel needed (L)', num(l, 2)], ['التكلفة', 'Cost', num(l * v.p, 2)], ['التكلفة لكل كم', 'Cost per km', num(l * v.p / km, 3)]] };
    }
  });

  def('json-escape', {
    fields: [sel('m', 'الوضع', 'Mode', [['e', 'تهريب (Escape)', 'Escape'], ['u', 'إلغاء التهريب (Unescape)', 'Unescape']], 'e'), ta('t', 'النص', 'Text', { rows: 8, mono: true })],
    sample: { m: 'e', t: 'He said "hi"\nSecond line\twith tab' },
    run(v, h) {
      if (!v.t) return null;
      if (v.m === 'e') return JSON.stringify(v.t).slice(1, -1);
      try { const s = v.t.trim(); return JSON.parse(/^".*"$/s.test(s) ? s : '"' + s.replace(/(?<!\\)"/g, '\\"') + '"'); } catch (e) { return { error: h.t('نص غير صالح للتحويل.', 'Invalid escaped string.') }; }
    }
  });

  def('download-time-calculator', {
    fields: [nm('s', 'حجم الملف', 'File size', 1, { min: 0 }), sel('su', 'وحدة الحجم', 'Size unit', [['KB', 'KB', 'KB'], ['MB', 'MB', 'MB'], ['GB', 'GB', 'GB'], ['TB', 'TB', 'TB']], 'GB'), nm('v', 'سرعة الإنترنت', 'Connection speed', 100, { min: 0 }), sel('vu', 'وحدة السرعة', 'Speed unit', [['Mbps', 'ميغابت/ث (Mbps)', 'Mbps'], ['MBps', 'ميغابايت/ث (MB/s)', 'MB/s']], 'Mbps')],
    sample: { s: 1, su: 'GB', v: 100, vu: 'Mbps' },
    note: ['يُحسب 1 GB = 1000 MB (النظام العشري)، والسرعة الفعلية عادةً أقل من المعلنة.', 'Uses 1 GB = 1000 MB (decimal); real speeds are usually below the advertised rate.'],
    run(v) {
      if (!(v.s > 0) || !(v.v > 0)) return null; const mult = { KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12 }[v.su], bits = v.s * mult * 8, bps = v.v * 1e6 * (v.vu === 'MBps' ? 8 : 1), sec = bits / bps;
      const d = Math.floor(sec / 86400), hh = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60), s = Math.round(sec % 60);
      return { cards: [['الزمن المقدّر', 'Estimated time', [d && d + 'd', hh && hh + 'h', m && m + 'm', (s || !(d || hh || m)) && s + 's'].filter(Boolean).join(' ')], ['بالثواني', 'In seconds', num(sec, 1)]] };
    }
  });

  def('subnet-calculator', {
    fields: [tx('c', 'عنوان IPv4 مع البادئة (CIDR)', 'IPv4 address with prefix (CIDR)', { value: '192.168.1.10/24', dir: 'ltr' })],
    sample: { c: '192.168.1.10/24' },
    run(v, h) {
      const m = /^\s*(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})\s*$/.exec(v.c || ''); if (!v.c || !v.c.trim()) return null;
      const bad = { error: h.t('صيغة غير صحيحة. مثال: 192.168.1.10/24', 'Invalid format. Example: 192.168.1.10/24') };
      if (!m) return bad; const o = m.slice(1, 5).map(Number), p = Number(m[5]); if (o.some((x) => x > 255) || p > 32) return bad;
      const ip = ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0, mask = p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0, net = (ip & mask) >>> 0, bc = (net | (~mask >>> 0)) >>> 0;
      const s = (n) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'), total = 2 ** (32 - p), hosts = p >= 31 ? (p === 31 ? 2 : 1) : total - 2;
      return { cards: [['عنوان الشبكة', 'Network', s(net)], ['قناع الشبكة', 'Subnet mask', s(mask)], ['قناع المعكوس', 'Wildcard', s((~mask) >>> 0)], ['عنوان البث', 'Broadcast', s(bc)], ['أول مضيف', 'First host', p >= 31 ? s(net) : s(net + 1)], ['آخر مضيف', 'Last host', p >= 31 ? s(bc) : s(bc - 1)], ['عدد المضيفين', 'Usable hosts', String(hosts)]] };
    }
  });

  def('chmod-calculator', {
    fields: [ck('ur', 'المالك: قراءة', 'Owner: read', true), ck('uw', 'المالك: كتابة', 'Owner: write', true), ck('ux', 'المالك: تنفيذ', 'Owner: execute', true), ck('gr', 'المجموعة: قراءة', 'Group: read', true), ck('gw', 'المجموعة: كتابة', 'Group: write', false), ck('gx', 'المجموعة: تنفيذ', 'Group: execute', true), ck('or', 'الآخرون: قراءة', 'Others: read', true), ck('ow', 'الآخرون: كتابة', 'Others: write', false), ck('ox', 'الآخرون: تنفيذ', 'Others: execute', true)],
    sample: { ur: true, uw: true, ux: true, gr: true, gw: false, gx: true, or: true, ow: false, ox: true },
    run(v) {
      const d = (r, w, x) => (v[r] ? 4 : 0) + (v[w] ? 2 : 0) + (v[x] ? 1 : 0), sy = (r, w, x) => (v[r] ? 'r' : '-') + (v[w] ? 'w' : '-') + (v[x] ? 'x' : '-');
      const oct = '' + d('ur', 'uw', 'ux') + d('gr', 'gw', 'gx') + d('or', 'ow', 'ox');
      return { cards: [['الصيغة الرقمية', 'Octal', oct], ['الصيغة الرمزية', 'Symbolic', sy('ur', 'uw', 'ux') + sy('gr', 'gw', 'gx') + sy('or', 'ow', 'ox')], ['الأمر', 'Command', 'chmod ' + oct + ' filename']] };
    }
  });

  def('color-shades-generator', {
    fields: [tx('c', 'اللون (HEX)', 'Colour (HEX)', { value: '#0B5D52', dir: 'ltr' })],
    sample: { c: '#0B5D52' },
    run(v, h) {
      let x = (v.c || '').trim().replace(/^#/, ''); if (!x) return null; if (/^[0-9a-f]{3}$/i.test(x)) x = x.replace(/./g, '$&$&');
      if (!/^[0-9a-f]{6}$/i.test(x)) return { error: h.t('أدخل لونًا بصيغة HEX مثل #0B5D52', 'Enter a HEX colour such as #0B5D52') };
      const rgb = [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)), hex = (a) => '#' + a.map((n) => Math.round(n).toString(16).padStart(2, '0')).join('').toUpperCase();
      const mix = (t, p) => hex(rgb.map((c) => c + (t - c) * p)); const rows = [];
      for (let p = 10; p <= 90; p += 10) rows.push(['light ' + p + '%', mix(255, p / 100)]); rows.push(['base', hex(rgb)]); for (let p = 10; p <= 90; p += 10) rows.push(['dark ' + p + '%', mix(0, p / 100)]);
      return { html: '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px">' + rows.map(([l, c]) => '<div style="border:1px solid rgba(0,0,0,.15);border-radius:8px;overflow:hidden"><div style="height:44px;background:' + c + '"></div><div style="padding:6px;font:12px/1.4 monospace" dir="ltr">' + esc(l) + '<br>' + c + '</div></div>').join('') + '</div>', copy: rows.map(([l, c]) => l + ': ' + c).join('\n') };
    }
  });

  def('speed-distance-time-calculator', {
    fields: [sel('m', 'المطلوب حسابه', 'Solve for', [['t', 'الزمن', 'Time'], ['s', 'السرعة', 'Speed'], ['d', 'المسافة', 'Distance']], 't'), nm('d', 'المسافة (كم)', 'Distance (km)', 300, { min: 0 }), nm('s', 'السرعة (كم/س)', 'Speed (km/h)', 80, { min: 0 }), nm('t', 'الزمن (ساعة)', 'Time (hours)', 2, { min: 0 })],
    sample: { m: 't', d: 300, s: 80, t: 2 },
    note: ['املأ الحقلين المعلومين فقط؛ يُتجاهل الحقل المطلوب حسابه.', 'Fill the two known fields only; the field being solved is ignored.'],
    run(v, h) {
      const hm = (x) => { const m = Math.round(x * 60); return Math.floor(m / 60) + 'h ' + (m % 60) + 'm'; };
      if (v.m === 't') { if (!(v.d >= 0) || !(v.s > 0)) return null; const t = v.d / v.s; return { cards: [['الزمن', 'Time', num(t, 3) + ' h'], ['بالساعات والدقائق', 'In hours & minutes', hm(t)]] }; }
      if (v.m === 's') { if (!(v.d >= 0) || !(v.t > 0)) return null; return { cards: [['السرعة', 'Speed', num(v.d / v.t, 2) + ' km/h']] }; }
      if (!(v.s >= 0) || !(v.t >= 0)) return null; return { cards: [['المسافة', 'Distance', num(v.s * v.t, 2) + ' km']] };
    }
  });
})();
