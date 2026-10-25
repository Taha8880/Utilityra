(function () {
  const { ta, tx, nm, sel, ck, esc } = UT.H;
  const def = UT.def;

  /* ---------- JSON ---------- */
  function jsonError(src, e, h) {
    const m = String(e.message); let pos = null;
    let r = m.match(/position (\d+)/); if (r) pos = +r[1];
    let line, col; r = m.match(/line (\d+) column (\d+)/);
    if (r) { line = +r[1]; col = +r[2]; } else if (pos != null) { const before = src.slice(0, pos).split('\n'); line = before.length; col = before[before.length - 1].length + 1; }
    return h.t('JSON غير صالح', 'Invalid JSON') + (line ? h.t(` (السطر ${line}، العمود ${col})`, ` (line ${line}, column ${col})`) : '') + ': ' + m;
  }
  const sortKeys = (o) => (Array.isArray(o) ? o.map(sortKeys) : o && typeof o === 'object' ? Object.keys(o).sort().reduce((a, k) => { a[k] = sortKeys(o[k]); return a; }, {}) : o);
  def('json-formatter', {
    layout: 'stack',
    fields: [ta('text', 'JSON', 'JSON', { rows: 12, mono: true, ph: ['{"name":"Utilityra","tools":100}', '{"name":"Utilityra","tools":100}'] }), sel('mode', 'الإجراء', 'Action', [['2', 'تنسيق (مسافتان)', 'Format (2 spaces)'], ['4', 'تنسيق (4 مسافات)', 'Format (4 spaces)'], ['tab', 'تنسيق (Tab)', 'Format (tab)'], ['min', 'تقليص (Minify)', 'Minify']], '2'), ck('sort', 'ترتيب المفاتيح أبجديًا', 'Sort keys', false)],
    sample: { text: '{"name":"Utilityra","tools":[{"id":"json","free":true},{"id":"pdf","free":true}],"version":1.5}' },
    out: { name: 'formatted.json', ext: 'json' },
    run(v, h) {
      if (!v.text.trim()) return null;
      let o; try { o = JSON.parse(v.text); } catch (e) { return { error: jsonError(v.text, e, h) }; }
      if (v.sort) o = sortKeys(o);
      const text = v.mode === 'min' ? JSON.stringify(o) : JSON.stringify(o, null, v.mode === 'tab' ? '\t' : +v.mode);
      return { text, note: h.t('✓ JSON صالح', '✓ Valid JSON') };
    }
  });

  function jdiff(a, b, path, out) {
    const ta_ = (x) => (Array.isArray(x) ? 'array' : x === null ? 'null' : typeof x);
    if (ta_(a) !== ta_(b) || (ta_(a) !== 'object' && ta_(a) !== 'array')) { if (JSON.stringify(a) !== JSON.stringify(b)) out.push(['~', path || '$', a, b]); return; }
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    keys.forEach((k) => { const p = path + (Array.isArray(a) ? `[${k}]` : '.' + k); if (!(k in a)) out.push(['+', p.replace(/^\./, ''), undefined, b[k]]); else if (!(k in b)) out.push(['-', p.replace(/^\./, ''), a[k], undefined]); else jdiff(a[k], b[k], p, out); });
  }
  def('json-diff', {
    layout: 'stack',
    fields: [ta('a', 'JSON الأول', 'First JSON', { rows: 9, mono: true }), ta('b', 'JSON الثاني', 'Second JSON', { rows: 9, mono: true })],
    sample: { a: '{"name":"A","price":10,"tags":["x","y"],"old":true}', b: '{"name":"A","price":12,"tags":["x","z"],"new":1}' },
    run(v, h) {
      if (!v.a.trim() && !v.b.trim()) return null;
      let A, B; try { A = JSON.parse(v.a); } catch (e) { return { error: h.t('JSON الأول: ', 'First JSON: ') + jsonError(v.a, e, h) }; }
      try { B = JSON.parse(v.b); } catch (e) { return { error: h.t('JSON الثاني: ', 'Second JSON: ') + jsonError(v.b, e, h) }; }
      const out = []; jdiff(A, B, '', out);
      if (!out.length) return { note: h.t('✓ الكائنان متطابقان', '✓ Both are identical') };
      const f = (x) => esc(x === undefined ? '' : JSON.stringify(x));
      const html = `<table class="tbl"><thead><tr><th></th><th>${h.L('المسار', 'Path')}</th><th>${h.L('قبل', 'Before')}</th><th>${h.L('بعد', 'After')}</th></tr></thead><tbody>${out.map((r) => `<tr class="${r[0] === '+' ? 'add' : r[0] === '-' ? 'del' : 'chg'}"><td>${r[0]}</td><td dir="ltr">${esc(r[1])}</td><td dir="ltr">${f(r[2])}</td><td dir="ltr">${f(r[3])}</td></tr>`).join('')}</tbody></table>`;
      return { html, copy: out.map((r) => r[0] + ' ' + r[1]).join('\n'), cards: [['مضاف', 'Added', out.filter((x) => x[0] === '+').length], ['محذوف', 'Removed', out.filter((x) => x[0] === '-').length], ['متغيّر', 'Changed', out.filter((x) => x[0] === '~').length]] };
    }
  });

  const xmlName = (k) => { let n = String(k).replace(/[^\p{L}\p{N}_.-]/gu, '_'); if (!/^[\p{L}_]/u.test(n)) n = '_' + n; return n; };
  const xmlEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  function toXml(val, name, ind) {
    const pad = '  '.repeat(ind);
    if (Array.isArray(val)) return val.map((x) => toXml(x, name, ind)).join('\n');
    if (val && typeof val === 'object') { const inner = Object.keys(val).map((k) => toXml(val[k], xmlName(k), ind + 1)).join('\n'); return `${pad}<${name}>\n${inner}\n${pad}</${name}>`; }
    return `${pad}<${name}>${val === null ? '' : xmlEsc(val)}</${name}>`;
  }
  def('json-to-xml', {
    layout: 'stack',
    fields: [ta('text', 'JSON', 'JSON', { rows: 10, mono: true }), tx('root', 'اسم العنصر الجذر', 'Root element', { value: 'root', mono: true })],
    sample: { text: '{"user":{"name":"Taha","skills":["js","css"],"active":true}}' },
    out: { name: 'data.xml', ext: 'xml' },
    run(v, h) {
      if (!v.text.trim()) return null; let o; try { o = JSON.parse(v.text); } catch (e) { return { error: jsonError(v.text, e, h) }; }
      return { text: '<?xml version="1.0" encoding="UTF-8"?>\n' + toXml(o, xmlName(v.root || 'root'), 0) };
    }
  });

  /* ---------- CSV ---------- */
  function parseCSV(s, d) {
    const rows = []; let row = [], f = '', q = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"' && f === '') q = true;
      else if (c === d) { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    return { rows, unterminated: q };
  }
  const detectDelim = (s) => { const first = s.split('\n')[0] || ''; const c = { ',': 0, ';': 0, '\t': 0, '|': 0 }; Object.keys(c).forEach((k) => { c[k] = first.split(k).length; }); return Object.keys(c).sort((a, b) => c[b] - c[a])[0]; };
  const DELIMS = [['auto', 'تلقائي', 'Auto-detect'], [',', 'فاصلة ,', 'Comma ,'], [';', 'فاصلة منقوطة ;', 'Semicolon ;'], ['\t', 'Tab', 'Tab'], ['|', 'خط رأسي |', 'Pipe |']];
  const getDelim = (v) => (v.delim === 'auto' ? detectDelim(v.text) : v.delim);
  const csvCell = (x, d) => { const s = x == null ? '' : typeof x === 'object' ? JSON.stringify(x) : String(x); return new RegExp('["\\n\\r' + (d === '\t' ? '\\t' : d.replace(/[|]/g, '\\|')) + ']').test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };

  def('csv-json-converter', {
    layout: 'stack',
    fields: [ta('text', 'CSV', 'CSV', { rows: 9, mono: true }), sel('delim', 'الفاصل', 'Delimiter', DELIMS, 'auto'), ck('header', 'الصف الأول عناوين', 'First row is header', true), ck('num', 'تحويل الأرقام والقيم المنطقية', 'Convert numbers and booleans', true)],
    sample: { text: 'name,age,active\nSara,28,true\n"Ali, Jr.",31,false' },
    out: { name: 'data.json', ext: 'json' },
    run(v, h) {
      if (!v.text.trim()) return null;
      const { rows, unterminated } = parseCSV(v.text, getDelim(v)); if (unterminated) return { error: h.t('علامة اقتباس غير مغلقة.', 'Unclosed quote.') };
      const conv = (x) => (v.num ? (/^-?\d+(\.\d+)?$/.test(x) && !/^0\d/.test(x) ? Number(x) : x === 'true' ? true : x === 'false' ? false : x) : x);
      let data;
      if (v.header) { const hd = rows[0].map((x, i) => x.trim() || 'col' + (i + 1)); data = rows.slice(1).map((r) => hd.reduce((o, k, i) => { o[k] = conv(r[i] == null ? '' : r[i]); return o; }, {})); }
      else data = rows.map((r) => r.map(conv));
      return { text: JSON.stringify(data, null, 2), note: h.t('عدد السجلات: ' + data.length, 'Records: ' + data.length) };
    }
  });

  const flat = (o, p, out) => { if (o && typeof o === 'object' && !Array.isArray(o)) Object.keys(o).forEach((k) => flat(o[k], p ? p + '.' + k : k, out)); else out[p] = o; return out; };
  def('json-to-csv', {
    layout: 'stack',
    fields: [ta('text', 'JSON (مصفوفة كائنات)', 'JSON (array of objects)', { rows: 10, mono: true }), sel('delim', 'الفاصل', 'Delimiter', DELIMS.slice(1), ','), ck('bom', 'إضافة BOM لفتحه في Excel بالعربية', 'Add BOM so Excel opens Arabic correctly', true)],
    sample: { text: '[{"name":"Sara","age":28,"city":{"name":"Cairo"}},{"name":"Ali","age":31,"city":{"name":"Riyadh"}}]' },
    out: { name: 'data.csv', ext: 'csv' },
    run(v, h) {
      if (!v.text.trim()) return null; let o; try { o = JSON.parse(v.text); } catch (e) { return { error: jsonError(v.text, e, h) }; }
      if (!Array.isArray(o)) o = [o];
      const rows = o.map((x) => flat(x && typeof x === 'object' ? x : { value: x }, '', {})); const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
      const d = v.delim; const text = [cols.map((c) => csvCell(c, d)).join(d), ...rows.map((r) => cols.map((c) => csvCell(r[c], d)).join(d))].join('\n');
      return { text, download: { name: 'data.csv', blob: new Blob([(v.bom ? '﻿' : '') + text], { type: 'text/csv;charset=utf-8' }), label: ['تنزيل CSV', 'Download CSV'] } };
    }
  });

  def('csv-validator', {
    layout: 'stack',
    fields: [ta('text', 'CSV', 'CSV', { rows: 10, mono: true }), sel('delim', 'الفاصل', 'Delimiter', DELIMS, 'auto')],
    sample: { text: 'id,name,email\n1,Sara,sara@x.com\n2,Ali\n3,Mona,mona@x.com,extra\n,,\n4,Sara,sara@x.com' },
    run(v, h) {
      if (!v.text.trim()) return null;
      const { rows, unterminated } = parseCSV(v.text, getDelim(v)); const n = rows[0].length; const issues = [];
      if (unterminated) issues.push(h.t('علامة اقتباس غير مغلقة', 'Unclosed quote'));
      const hd = rows[0].map((x) => x.trim()); if (new Set(hd).size !== hd.length) issues.push(h.t('عناوين أعمدة مكررة', 'Duplicate header names')); if (hd.some((x) => !x)) issues.push(h.t('عنوان عمود فارغ', 'Empty header name'));
      let empty = 0;
      rows.slice(1).forEach((r, i) => { const ln = i + 2; if (r.length !== n) issues.push(h.t(`السطر ${ln}: ${r.length} أعمدة بدلًا من ${n}`, `Line ${ln}: ${r.length} columns instead of ${n}`)); if (r.every((c) => !c.trim())) { empty++; issues.push(h.t(`السطر ${ln}: صف فارغ`, `Line ${ln}: empty row`)); } });
      return { cards: [['الصفوف', 'Rows', rows.length - 1], ['الأعمدة', 'Columns', n], ['المشكلات', 'Issues', issues.length]], text: issues.length ? issues.join('\n') : h.t('✓ لا توجد مشكلات.', '✓ No issues found.'), out: { label: ['التقرير', 'Report'], mono: false } };
    }
  });

  def('csv-to-markdown', {
    layout: 'stack',
    fields: [ta('text', 'CSV', 'CSV', { rows: 9, mono: true }), sel('delim', 'الفاصل', 'Delimiter', DELIMS, 'auto'), sel('align', 'المحاذاة', 'Alignment', [['l', 'يسار', 'Left'], ['c', 'وسط', 'Center'], ['r', 'يمين', 'Right']], 'l')],
    sample: { text: 'Tool,Category\nWord counter,Text\nJSON formatter,Dev' },
    out: { name: 'table.md', ext: 'md' },
    run(v) {
      if (!v.text.trim()) return null; const { rows } = parseCSV(v.text, getDelim(v)); const n = Math.max(...rows.map((r) => r.length));
      const c = (r) => '| ' + Array.from({ length: n }, (_, i) => (r[i] || '').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ') + ' |';
      const sep = '| ' + Array(n).fill({ l: ':---', c: ':---:', r: '---:' }[v.align]).join(' | ') + ' |';
      return [c(rows[0]), sep, ...rows.slice(1).map(c)].join('\n');
    }
  });

  def('markdown-table-generator', {
    mount(root, h) {
      let data = [['Name', 'Value'], ['', '']], align = 'l';
      root.innerHTML = `<div class="tool-grid stack"><div class="tool-in"><div class="gridwrap"></div><div class="btnrow">
        <button class="btn" data-a="ar" type="button">+ ${h.L('صف', 'Row')}</button><button class="btn" data-a="ac" type="button">+ ${h.L('عمود', 'Column')}</button>
        <button class="btn ghost" data-a="rr" type="button">− ${h.L('صف', 'Row')}</button><button class="btn ghost" data-a="rc" type="button">− ${h.L('عمود', 'Column')}</button>
        <select data-al><option value="l">${h.t('يسار', 'Left')}</option><option value="c">${h.t('وسط', 'Center')}</option><option value="r">${h.t('يمين', 'Right')}</option></select></div></div>
        <div class="tool-out"><div class="out"></div></div></div>`;
      const wrap = h.$('.gridwrap', root), out = h.$('.out', root);
      function render() {
        wrap.innerHTML = '<table class="edit">' + data.map((r, i) => '<tr>' + r.map((c, j) => `<td><input data-i="${i}" data-j="${j}" value="${h.esc(c)}" class="${i === 0 ? 'hd' : ''}" dir="auto"></td>`).join('') + '</tr>').join('') + '</table>';
        h.$$('input', wrap).forEach((inp) => inp.addEventListener('input', () => { data[+inp.dataset.i][+inp.dataset.j] = inp.value; show(); }));
        show();
      }
      function show() {
        const md = (r) => '| ' + r.map((x) => (x || ' ').replace(/\|/g, '\\|')).join(' | ') + ' |';
        const sep = '| ' + data[0].map(() => ({ l: ':---', c: ':---:', r: '---:' }[align])).join(' | ') + ' |';
        UT.renderResult(out, { text: [md(data[0]), sep, ...data.slice(1).map(md)].join('\n') }, { out: { name: 'table.md' } });
      }
      h.$$('[data-a]', root).forEach((b) => b.addEventListener('click', () => {
        const a = b.dataset.a;
        if (a === 'ar') data.push(data[0].map(() => '')); if (a === 'ac') data.forEach((r) => r.push('')); if (a === 'rr' && data.length > 2) data.pop(); if (a === 'rc' && data[0].length > 1) data.forEach((r) => r.pop());
        render();
      }));
      h.$('[data-al]', root).addEventListener('change', (e) => { align = e.target.value; show(); });
      render();
    }
  });

  /* ---------- SQL ---------- */
  const SQLK = new Set('select from where and or not in is null like between exists as on join inner left right full outer cross group by order having limit offset union all distinct insert into values update set delete create table alter drop index view case when then else end asc desc with primary key foreign references default unique check constraint if returning using over partition natural top fetch next rows only intersect except'.split(' '));
  const SQLBREAK = ['union all', 'insert into', 'delete from', 'group by', 'order by', 'left outer join', 'right outer join', 'full outer join', 'inner join', 'left join', 'right join', 'full join', 'cross join', 'select', 'from', 'where', 'having', 'limit', 'offset', 'union', 'intersect', 'except', 'values', 'update', 'set', 'join', 'returning'].map((b) => b.split(' '));
  const SQLLIST = new Set(['select', 'group by', 'order by', 'set']);
  const SQLCOND = new Set(['where', 'on', 'having']);
  function tokSQL(s) { return s.match(/--[^\n]*|\/\*[\s\S]*?\*\/|'(?:[^']|'')*'|"(?:[^"]|"")*"|`[^`]*`|\[[^\]]*\]|[\w$.@#:]+|<=>|<>|<=|>=|!=|\|\||[(),;]|\S/g) || []; }
  function formatSQL(src, indentSize, kwMode) {
    const toks = tokSQL(src), I = ' '.repeat(indentSize), lines = [];
    const stack = [], clauses = ['']; let cur = '', between = false;
    const lvl = () => clauses.length - 1;
    const inFunc = () => stack.length && stack[stack.length - 1] === 'func';
    const newline = (n) => { if (cur.trim()) lines.push(cur.replace(/\s+$/, '')); cur = I.repeat(n); };
    const trim = () => { cur = cur.replace(/\s+$/, ''); };
    const kw = (w) => (kwMode === 'upper' ? w.toUpperCase() : kwMode === 'lower' ? w.toLowerCase() : w);
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i], lw = t.toLowerCase();
      if (!inFunc()) {
        const m = SQLBREAK.find((parts) => parts.every((p, k) => (toks[i + k] || '').toLowerCase() === p));
        if (m && !(lw === 'set' && false)) {
          newline(lvl()); const name = m.join(' ');
          cur += toks.slice(i, i + m.length).map(kw).join(' ') + ' '; clauses[clauses.length - 1] = name; i += m.length - 1;
          if (name === 'select') newline(lvl() + 1);
          continue;
        }
        if ((lw === 'and' || lw === 'or') && SQLCOND.has(clauses[clauses.length - 1])) {
          if (lw === 'and' && between) { between = false; cur += kw(t) + ' '; continue; }
          newline(lvl() + 1); cur += kw(t) + ' '; continue;
        }
      }
      if (lw === 'between') between = true;
      if (t === '(') {
        const sub = /^select$/i.test(toks[i + 1] || '');
        const prev = toks[i - 1] || ''; const prevKw = SQLK.has(prev.toLowerCase());
        if (!prevKw && /^[\w$.`"\]]+$/.test(prev) && !(clauses[clauses.length - 1] === 'insert into')) trim();
        cur += '(';
        if (sub) { stack.push('sub'); clauses.push(''); newline(lvl()); } else stack.push('func');
        continue;
      }
      if (t === ')') {
        const kind = stack.pop();
        if (kind === 'sub') { clauses.pop(); newline(lvl()); cur += ')'; } else { trim(); cur += ')'; }
        cur += ' '; continue;
      }
      if (t === ',') {
        trim(); cur += ',';
        if (!inFunc() && SQLLIST.has(clauses[clauses.length - 1])) newline(lvl() + 1); else cur += ' ';
        continue;
      }
      if (t === ';') { trim(); cur += ';'; newline(0); lines.push(''); clauses.length = 1; clauses[0] = ''; stack.length = 0; continue; }
      if (/^--/.test(t)) { cur += t; newline(lvl()); continue; }
      if (/^\/\*/.test(t)) { cur += t + ' '; continue; }
      const isKw = SQLK.has(lw) && !/^['"`\[]/.test(t);
      cur += (isKw ? kw(t) : t) + ' ';
    }
    newline(0);
    return lines.join('\n').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
  }
  def('sql-formatter', {
    layout: 'stack',
    fields: [ta('text', 'استعلام SQL', 'SQL query', { rows: 9, mono: true }), sel('kw', 'الكلمات المفتاحية', 'Keywords', [['upper', 'أحرف كبيرة', 'UPPERCASE'], ['keep', 'كما هي', 'As typed'], ['lower', 'أحرف صغيرة', 'lowercase']], 'upper'), sel('indent', 'المسافة البادئة', 'Indent', [['2', '2', '2'], ['4', '4', '4']], '2')],
    sample: { text: "select u.id,u.name,count(o.id) as orders from users u left join orders o on o.user_id=u.id where u.active=1 and u.created_at>'2024-01-01' and u.id in (select user_id from vip) group by u.id,u.name having count(o.id)>2 order by orders desc limit 10;" },
    out: { name: 'query.sql', ext: 'sql' },
    run(v) { return v.text.trim() ? formatSQL(v.text, +v.indent, v.kw) : null; }
  });

  /* ---------- XML / HTML / CSS ---------- */
  function fmtXml(node, ind, d) {
    const pad = ind.repeat(d);
    if (node.nodeType === 3) { const t = node.nodeValue.trim(); return t ? pad + xmlEsc(t).replace(/&quot;/g, '"') : ''; }
    if (node.nodeType === 4) return pad + '<![CDATA[' + node.nodeValue + ']]>';
    if (node.nodeType === 8) return pad + '<!--' + node.nodeValue + '-->';
    if (node.nodeType === 7) return pad + '<?' + node.target + ' ' + node.data + '?>';
    if (node.nodeType !== 1) return '';
    const attrs = Array.from(node.attributes).map((a) => ` ${a.name}="${xmlEsc(a.value)}"`).join('');
    const kids = Array.from(node.childNodes).map((c) => fmtXml(c, ind, d + 1)).filter(Boolean);
    if (!kids.length) return `${pad}<${node.nodeName}${attrs}/>`;
    if (kids.length === 1 && node.childNodes.length === 1 && node.firstChild.nodeType === 3) return `${pad}<${node.nodeName}${attrs}>${kids[0].trim()}</${node.nodeName}>`;
    return `${pad}<${node.nodeName}${attrs}>\n${kids.join('\n')}\n${pad}</${node.nodeName}>`;
  }
  def('xml-formatter', {
    layout: 'stack',
    fields: [ta('text', 'XML', 'XML', { rows: 10, mono: true }), sel('mode', 'الإجراء', 'Action', [['2', 'تنسيق (مسافتان)', 'Format (2 spaces)'], ['4', 'تنسيق (4 مسافات)', 'Format (4 spaces)'], ['min', 'تقليص', 'Minify']], '2')],
    sample: { text: '<?xml version="1.0"?><catalog><book id="1"><title>JS</title><price>10</price></book><book id="2"><title>CSS</title></book></catalog>' },
    out: { name: 'data.xml', ext: 'xml' },
    run(v, h) {
      if (!v.text.trim()) return null;
      const doc = new DOMParser().parseFromString(v.text, 'application/xml'); const err = doc.querySelector('parsererror');
      if (err) return { error: h.t('XML غير صالح: ', 'Invalid XML: ') + err.textContent.split('\n')[0].slice(0, 200) };
      const decl = (v.text.match(/^\s*<\?xml[^>]*\?>/) || [''])[0].trim();
      if (v.mode === 'min') return (decl ? decl : '') + new XMLSerializer().serializeToString(doc.documentElement).replace(/>\s+</g, '><');
      return (decl ? decl + '\n' : '') + fmtXml(doc.documentElement, ' '.repeat(+v.mode), 0);
    }
  });

  const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
  const INLINE = new Set('a abbr b bdi bdo cite code data dfn em i kbd mark q s samp small span strong sub sup time u var'.split(' '));
  def('html-formatter', {
    layout: 'stack',
    fields: [ta('text', 'HTML', 'HTML', { rows: 10, mono: true }), sel('indent', 'المسافة البادئة', 'Indent', [['2', '2', '2'], ['4', '4', '4'], ['tab', 'Tab', 'Tab']], '2')],
    sample: { text: '<div class="card"><h2>Title</h2><p>Some <b>bold</b> text.</p><ul><li>One</li><li>Two</li></ul><img src="a.png" alt=""></div>' },
    out: { name: 'page.html', ext: 'html' },
    run(v) {
      if (!v.text.trim()) return null; const ind = v.indent === 'tab' ? '\t' : ' '.repeat(+v.indent);
      const toks = v.text.match(/<!--[\s\S]*?-->|<(script|style|pre|textarea)\b[\s\S]*?<\/\1\s*>|<[^>]+>|[^<]+/gi) || []; const out = []; let d = 0;
      toks.forEach((t) => {
        if (/^<!--/.test(t) || /^<!doctype/i.test(t)) { out.push(ind.repeat(d) + t.trim()); return; }
        const raw = t.match(/^<(script|style|pre|textarea)\b/i);
        if (raw) { out.push(ind.repeat(d) + t.trim()); return; }
        if (t[0] === '<') {
          const m = t.match(/^<\/?([a-zA-Z][\w:-]*)/); const name = m ? m[1].toLowerCase() : '';
          if (t[1] === '/') { d = Math.max(0, d - 1); out.push(ind.repeat(d) + t.trim()); }
          else { out.push(ind.repeat(d) + t.trim()); if (!VOID.has(name) && !/\/>$/.test(t)) d++; }
        } else { const x = t.replace(/\s+/g, ' ').trim(); if (x) out.push(ind.repeat(d) + x); }
      });
      // collapse simple <tag>text</tag> into one line
      const res = []; for (let i = 0; i < out.length; i++) { const a = out[i], b = out[i + 1], c = out[i + 2]; if (b && c && /^\s*<[a-z][^>]*>$/i.test(a) && !/^\s*</.test(b) && /^\s*<\/[a-z]/i.test(c) && a.match(/^\s*</) && !VOID.has((a.match(/<([a-z0-9]+)/i) || [])[1] || '') && (a.match(/<([a-z0-9]+)/i) || [])[1] === (c.match(/<\/([a-z0-9]+)/i) || [])[1] && b.trim().length < 80) { res.push(a + b.trim() + c.trim()); i += 2; } else res.push(a); }
      return res.join('\n');
    }
  });

  function cssBeautify(src, ind) {
    const s = src.replace(/\/\*[\s\S]*?\*\//g, (m) => '\u0001' + btoa(unescape(encodeURIComponent(m))) + '\u0002');
    let out = '', d = 0, par = 0, q = '', buf = '';
    const pad = () => ind.repeat(d);
    const flushBuf = () => { const t = buf.trim(); buf = ''; return t; };
    const decl = (t) => { t = t.replace(/\s*:\s*/, ': ').replace(/\s+/g, ' '); return /url\(|["']/.test(t) ? t : t.replace(/,\s*/g, ', '); };
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (q) { buf += c; if (c === q && s[i - 1] !== '\\') q = ''; continue; }
      if (c === '"' || c === "'") { q = c; buf += c; continue; }
      if (c === '(') par++; if (c === ')') par--;
      if (c === '{' && !par) { out += pad() + flushBuf().replace(/\s*,\s*/g, ',\n' + pad()).replace(/\s+/g, ' ') + ' {\n'; d++; }
      else if (c === ';' && !par) { const t = flushBuf(); if (t) out += pad() + decl(t) + ';\n'; }
      else if (c === '}' && !par) { const t = flushBuf(); if (t) out += pad() + decl(t) + ';\n'; d = Math.max(0, d - 1); out += pad() + '}\n' + (d ? '' : '\n'); }
      else buf += c;
    }
    if (buf.trim()) out += buf.trim();
    return out.replace(/\u0001([^\u0002]+)\u0002/g, (m, b) => decodeURIComponent(escape(atob(b)))).replace(/\n{3,}/g, '\n\n').trim();
  }
  function cssMinify(src) {
    const keep = []; let s = src.replace(/\/\*[\s\S]*?\*\//g, '');
    s = s.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|url\([^)]*\))/g, (m) => { keep.push(m); return '\u0003' + (keep.length - 1) + '\u0003'; });
    s = s.replace(/\s+/g, ' ').replace(/\s*([{}:;,>~+])\s*/g, '$1').replace(/;}/g, '}').trim();
    return s.replace(/\u0003(\d+)\u0003/g, (m, i) => keep[+i]);
  }
  def('css-formatter', {
    layout: 'stack',
    fields: [ta('text', 'CSS', 'CSS', { rows: 10, mono: true }), sel('mode', 'الإجراء', 'Action', [['2', 'تنسيق (مسافتان)', 'Format (2 spaces)'], ['4', 'تنسيق (4 مسافات)', 'Format (4 spaces)'], ['min', 'تقليص (Minify)', 'Minify']], '2')],
    sample: { text: 'body{margin:0;font-family:Arial,sans-serif}.btn:hover,.btn:focus{color:#fff;background:url(a.png)}@media (max-width:600px){.btn{display:block}}' },
    out: { name: 'style.css', ext: 'css' },
    run(v, h) {
      if (!v.text.trim()) return null;
      const out = v.mode === 'min' ? cssMinify(v.text) : cssBeautify(v.text, ' '.repeat(+v.mode));
      return { text: out, note: v.mode === 'min' ? h.t(`تم التقليص: ${v.text.length} ← ${out.length} حرف`, `Minified: ${v.text.length} → ${out.length} chars`) : null };
    }
  });

  /* ---------- Regex ---------- */
  def('regex-tester', {
    layout: 'stack',
    fields: [tx('re', 'التعبير النمطي', 'Pattern', { mono: true, value: '' }), { id: 'flags', type: 'text', label: ['الأعلام (flags)', 'Flags'], value: 'g', mono: true }, ta('text', 'نص الاختبار', 'Test text', { rows: 8 })],
    sample: { re: '(\\w+)@(\\w+\\.\\w+)', flags: 'gi', text: 'Contact: sara@example.com, ali@test.org' },
    run(v, h) {
      if (!v.re) return null; let re;
      try { re = new RegExp(v.re, v.flags.replace(/[^dgimsuvy]/g, '')); } catch (e) { return { error: h.t('تعبير غير صالح: ', 'Invalid pattern: ') + e.message }; }
      const ms = []; let m; const g = re.global || re.sticky; let guard = 0;
      if (!g) { m = re.exec(v.text); if (m) ms.push(m); } else { re.lastIndex = 0; while ((m = re.exec(v.text)) && guard++ < 2000) { ms.push(m); if (m[0] === '') re.lastIndex++; } }
      let html = '', last = 0; ms.forEach((x) => { if (x[0] === '') return; html += esc(v.text.slice(last, x.index)) + '<mark>' + esc(x[0]) + '</mark>'; last = x.index + x[0].length; }); html += esc(v.text.slice(last));
      const tbl = ms.length ? `<table class="tbl"><thead><tr><th>#</th><th>${h.L('المطابقة', 'Match')}</th><th>${h.L('الموضع', 'Index')}</th><th>${h.L('المجموعات', 'Groups')}</th></tr></thead><tbody>${ms.slice(0, 200).map((x, i) => `<tr><td>${i + 1}</td><td dir="ltr">${esc(x[0])}</td><td>${x.index}</td><td dir="ltr">${esc(x.slice(1).map((y, k) => '$' + (k + 1) + '=' + y).join('  '))}</td></tr>`).join('')}</tbody></table>` : '';
      return { cards: [['المطابقات', 'Matches', ms.length]], html: `<pre class="hl" dir="auto">${html}</pre>${tbl}`, copy: ms.map((x) => x[0]).join('\n') };
    }
  });

  /* ---------- JWT / Base64 / URL / Entities ---------- */
  const b64uDecode = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0))); };
  def('jwt-decoder', {
    layout: 'stack',
    fields: [ta('text', 'رمز JWT', 'JWT token', { rows: 5, mono: true, ph: ['eyJhbGciOi…', 'eyJhbGciOi…'] })],
    sample: { text: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRhaGEiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0.signature' },
    run(v, h) {
      const s = v.text.trim().replace(/^Bearer\s+/i, ''); if (!s) return null; const p = s.split('.');
      if (p.length !== 3) return { error: h.t('JWT يجب أن يتكون من 3 أجزاء مفصولة بنقاط.', 'A JWT must have 3 dot-separated parts.') };
      let head, pay; try { head = JSON.parse(b64uDecode(p[0])); pay = JSON.parse(b64uDecode(p[1])); } catch (e) { return { error: h.t('تعذّر فك ترميز الرمز.', 'Could not decode the token.') }; }
      const cards = []; const dt = (n) => new Date(n * 1000).toLocaleString(h.lang() === 'en' ? 'en-GB' : 'ar-EG-u-nu-latn');
      if (head.alg) cards.push(['الخوارزمية', 'Algorithm', head.alg]);
      ['iat', 'nbf', 'exp'].forEach((k) => { if (typeof pay[k] === 'number') cards.push([{ iat: 'صدر في', nbf: 'يبدأ في', exp: 'ينتهي في' }[k], { iat: 'Issued at', nbf: 'Not before', exp: 'Expires at' }[k], dt(pay[k])]); });
      if (typeof pay.exp === 'number') cards.push(['الحالة', 'Status', pay.exp * 1000 < Date.now() ? h.t('منتهي الصلاحية', 'Expired') : h.t('ساري', 'Valid (not expired)')]);
      return { cards, text: '// HEADER\n' + JSON.stringify(head, null, 2) + '\n\n// PAYLOAD\n' + JSON.stringify(pay, null, 2), note: h.t('لا يتم التحقق من التوقيع هنا. لا تثق بالمحتوى دون تحقق من الخادم.', 'The signature is NOT verified here. Never trust claims without server-side verification.') };
    }
  });

  def('base64-encoder-decoder', {
    layout: 'stack',
    fields: [ta('text', 'النص', 'Text', { rows: 8, mono: true }), sel('mode', 'الإجراء', 'Action', [['enc', 'ترميز → Base64', 'Encode → Base64'], ['dec', 'فك Base64 → نص', 'Decode Base64 → text']], 'enc'), ck('url', 'صيغة آمنة للروابط (URL-safe)', 'URL-safe variant', false)],
    sample: { text: 'مرحبا Utilityra 👋' },
    run(v, h) {
      if (!v.text) return null;
      try {
        if (v.mode === 'enc') { let b = btoa(String.fromCharCode(...new TextEncoder().encode(v.text))); if (v.url) b = b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); return b; }
        return b64uDecode(v.text.trim().replace(/\s+/g, ''));
      } catch (e) { return { error: h.t('مدخل Base64 غير صالح.', 'Invalid Base64 input.') }; }
    }
  });

  def('url-encoder-decoder', {
    layout: 'stack',
    fields: [ta('text', 'النص أو الرابط', 'Text or URL', { rows: 6, mono: true }), sel('mode', 'الإجراء', 'Action', [['comp', 'ترميز جزء (encodeURIComponent)', 'Encode component'], ['full', 'ترميز رابط كامل (encodeURI)', 'Encode full URL'], ['dec', 'فك الترميز', 'Decode']], 'comp')],
    sample: { text: 'https://example.com/search?q=مرحبا بالعالم&lang=ar' },
    run(v, h) { if (!v.text) return null; try { return v.mode === 'comp' ? encodeURIComponent(v.text) : v.mode === 'full' ? encodeURI(v.text) : decodeURIComponent(v.text.replace(/\+/g, ' ')); } catch (e) { return { error: h.t('ترميز غير صالح.', 'Malformed encoding.') }; } }
  });

  def('url-parser', {
    layout: 'stack',
    fields: [tx('url', 'الرابط', 'URL', { mono: true, ph: ['https://example.com/path?x=1#top', 'https://example.com/path?x=1#top'] })],
    sample: { url: 'https://user:pass@www.example.com:8080/a/b.html?q=utilityra&lang=ar&lang=en#section' },
    run(v, h) {
      if (!v.url.trim()) return null; let u; try { u = new URL(v.url.trim()); } catch (e) { return { error: h.t('رابط غير صالح (أضف https://).', 'Invalid URL (add https://).') }; }
      const cards = [['البروتوكول', 'Protocol', u.protocol], ['النطاق', 'Hostname', u.hostname], ['المنفذ', 'Port', u.port || h.t('افتراضي', 'default')], ['المسار', 'Path', u.pathname], ['الاستعلام', 'Query', u.search || '—'], ['الجزء #', 'Hash', u.hash || '—'], ['المصدر', 'Origin', u.origin]];
      if (u.username) cards.push(['المستخدم', 'Username', u.username]);
      const params = [...u.searchParams.entries()];
      const html = params.length ? `<table class="tbl"><thead><tr><th>${h.L('المعامل', 'Parameter')}</th><th>${h.L('القيمة', 'Value')}</th></tr></thead><tbody>${params.map((p) => `<tr><td dir="ltr">${esc(p[0])}</td><td dir="auto">${esc(p[1])}</td></tr>`).join('')}</tbody></table>` : '';
      return { cards, html };
    }
  });

  def('html-entities', {
    layout: 'stack',
    fields: [ta('text', 'النص', 'Text', { rows: 8, mono: true }), sel('mode', 'الإجراء', 'Action', [['enc', 'ترميز إلى كيانات HTML', 'Encode to HTML entities'], ['dec', 'فك كيانات HTML', 'Decode HTML entities']], 'enc'), ck('all', 'ترميز كل الأحرف غير ASCII (رقميًا)', 'Encode all non-ASCII characters', false)],
    sample: { text: '<p class="x">Tom & Jerry — “quotes” ©</p>' },
    run(v) {
      if (!v.text) return null;
      if (v.mode === 'dec') return new DOMParser().parseFromString('<!doctype html><body>' + v.text.replace(/<(?=[a-z\/!])/gi, '&lt;'), 'text/html').body.textContent;
      let s = v.text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      if (v.all) s = Array.from(s).map((c) => (c.codePointAt(0) > 127 ? '&#' + c.codePointAt(0) + ';' : c)).join('');
      return s;
    }
  });

  def('uuid-generator', {
    button: ['توليد', 'Generate'],
    fields: [nm('n', 'العدد', 'Count', 5, { min: 1, max: 1000 }), ck('upper', 'أحرف كبيرة', 'Uppercase', false), ck('nodash', 'بدون شرطات', 'No hyphens', false), ck('braces', 'بين أقواس {}', 'Wrap in {}', false)],
    run(v) {
      const n = Math.max(1, Math.min(1000, Math.floor(v.n) || 1));
      const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)));
      return Array.from({ length: n }, () => { let u = uuid(); if (v.nodash) u = u.replace(/-/g, ''); if (v.upper) u = u.toUpperCase(); if (v.braces) u = '{' + u + '}'; return u; }).join('\n');
    }
  });

  /* ---------- Cron ---------- */
  const CRON_FIELDS = [['الدقيقة', 'Minute', 0, 59], ['الساعة', 'Hour', 0, 23], ['يوم الشهر', 'Day of month', 1, 31], ['الشهر', 'Month', 1, 12], ['يوم الأسبوع', 'Day of week', 0, 6]];
  const MON = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' '), DOW = 'sun mon tue wed thu fri sat'.split(' ');
  function parseCronField(txt, min, max, names) {
    const set = new Set();
    txt.split(',').forEach((part) => {
      let [range, step] = part.split('/'); step = step == null ? 1 : Number(step); if (!(step >= 1) || !Number.isInteger(step)) throw new Error('step');
      const val = (x) => { x = x.toLowerCase(); if (names && names.indexOf(x) >= 0) return names.indexOf(x) + (names === MON ? 1 : 0); if (!/^\d+$/.test(x)) throw new Error('value'); return Number(x); };
      let a, b;
      if (range === '*' || range === '?') { a = min; b = max; } else if (range.includes('-')) { const r = range.split('-'); a = val(r[0]); b = val(r[1]); } else { a = val(range); b = part.includes('/') ? max : a; }
      if (a < min || b > max + (names === DOW ? 1 : 0) || a > b) throw new Error('range');
      for (let i = a; i <= b; i += step) set.add(names === DOW && i === 7 ? 0 : i);
    });
    return set;
  }
  def('cron-validator', {
    layout: 'stack',
    fields: [tx('expr', 'تعبير Cron (5 حقول)', 'Cron expression (5 fields)', { mono: true, value: '*/15 9-17 * * mon-fri' }), nm('n', 'عدد المواعيد القادمة', 'Next runs', 5, { min: 1, max: 20 })],
    run(v, h) {
      const p = v.expr.trim().split(/\s+/); if (!v.expr.trim()) return null;
      if (p.length !== 5) return { error: h.t('يجب أن يحتوي التعبير على 5 حقول: دقيقة ساعة يوم شهر يوم-أسبوع.', 'Expected 5 fields: minute hour day month weekday.') };
      const sets = []; try { p.forEach((x, i) => sets.push(parseCronField(x, CRON_FIELDS[i][2], CRON_FIELDS[i][3], i === 3 ? MON : i === 4 ? DOW : null))); } catch (e) { return { error: h.t('حقل غير صالح في التعبير.', 'Invalid field in the expression.') }; }
      const runs = []; const d = new Date(); d.setSeconds(0, 0); d.setMinutes(d.getMinutes() + 1);
      const domStar = p[2] === '*', dowStar = p[4] === '*';
      for (let i = 0; i < 600000 && runs.length < Math.min(20, v.n || 5); i++, d.setMinutes(d.getMinutes() + 1)) {
        if (!sets[0].has(d.getMinutes()) || !sets[1].has(d.getHours()) || !sets[3].has(d.getMonth() + 1)) continue;
        const okDom = sets[2].has(d.getDate()), okDow = sets[4].has(d.getDay());
        if (domStar || dowStar ? okDom && okDow : okDom || okDow) runs.push(d.toLocaleString(h.lang() === 'en' ? 'en-GB' : 'ar-EG-u-nu-latn', { dateStyle: 'full', timeStyle: 'short' }));
      }
      return { cards: p.map((x, i) => [CRON_FIELDS[i][0], CRON_FIELDS[i][1], x + '  (' + [...sets[i]].slice(0, 8).join(',') + (sets[i].size > 8 ? '…' : '') + ')']), text: runs.length ? runs.join('\n') : h.t('لا توجد مواعيد خلال السنتين القادمتين.', 'No runs in the next two years.'), out: { label: ['المواعيد القادمة', 'Next runs'], mono: false }, note: h.t('✓ تعبير صالح', '✓ Valid expression') };
    }
  });

  def('timestamp-converter', {
    layout: 'stack',
    fields: [tx('ts', 'Unix timestamp (ثوانٍ أو ميلي ثانية)', 'Unix timestamp (seconds or ms)', { mono: true, ph: ['اتركه فارغًا لعرض الوقت الحالي', 'Leave empty to see current time'] }), { id: 'dt', type: 'datetime', label: ['أو اختر تاريخًا ووقتًا (توقيتك المحلي)', 'Or pick a local date & time'], value: '' }],
    sample: { ts: '1700000000' },
    run(v, h) {
      let ms;
      if (v.ts.trim()) { const n = Number(v.ts.trim()); if (!Number.isFinite(n)) return { error: h.t('رقم غير صالح.', 'Invalid number.') }; ms = Math.abs(n) < 1e11 ? n * 1000 : n; }
      else if (v.dt) ms = new Date(v.dt).getTime(); else ms = Date.now();
      const d = new Date(ms); if (isNaN(d)) return { error: h.t('تاريخ غير صالح.', 'Invalid date.') };
      const rel = (() => { const s = Math.round((ms - Date.now()) / 1000), a = Math.abs(s); const u = [[31536000, 'y'], [2592000, 'mo'], [86400, 'd'], [3600, 'h'], [60, 'm']].find((x) => a >= x[0]); const rf = new Intl.RelativeTimeFormat(h.lang(), { numeric: 'auto' }); if (!u) return rf.format(s, 'second'); return rf.format(Math.round(s / u[0]), { y: 'year', mo: 'month', d: 'day', h: 'hour', m: 'minute' }[u[1]]); })();
      return [['Unix (ثوانٍ)', 'Unix (seconds)', Math.floor(ms / 1000)], ['Unix (ميلي ثانية)', 'Unix (ms)', ms], ['ISO 8601 (UTC)', 'ISO 8601 (UTC)', d.toISOString()], ['UTC', 'UTC', d.toUTCString()], ['توقيتك المحلي', 'Your local time', d.toLocaleString(h.lang() === 'en' ? 'en-GB' : 'ar-EG-u-nu-latn', { dateStyle: 'full', timeStyle: 'medium' })], ['منذ / بعد', 'Relative', rel]];
    }
  });
})();
