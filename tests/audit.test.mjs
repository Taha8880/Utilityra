// Static site audit over dist/: links, SEO, structure, duplicates. Run after `npm run build`.
import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'; import { join } from 'node:path';
const DIST = 'dist'; const walk = (d, o = []) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p, o) : o.push(p); } return o; };
const pages = walk(DIST).filter((f) => f.endsWith('.html') && !f.includes('google1dc')).map((f) => ({ f, html: readFileSync(f, 'utf8') }));
const redirects = existsSync(join(DIST, '_redirects')) ? readFileSync(join(DIST, '_redirects'), 'utf8').split('\n').map((l) => l.trim().split(/\s+/)[0]).filter(Boolean) : [];
const exists = (href) => { let p = href.split('#')[0].split('?')[0]; if (!p || /^(https?:|mailto:|tel:|data:|javascript:)/.test(p)) return true; if (!p.startsWith('/')) return true; if (redirects.includes(p) || redirects.includes(p.replace(/\/$/, ''))) return true; const f = join(DIST, p); return existsSync(f) && (statSync(f).isFile() || existsSync(join(f, 'index.html'))); };

test('every internal link and asset reference resolves', () => {
  const bad = []; for (const { f, html } of pages) for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) if (!exists(m[1])) bad.push(`${f}: ${m[1]}`);
  assert.deepEqual([...new Set(bad)].slice(0, 15), []);
});
test('each page has unique title, description, one h1, canonical, lang/dir and viewport', () => {
  const titles = new Map(), descs = new Map(), bad = [];
  for (const { f, html } of pages) {
    if (f.endsWith('404.html')) continue;
    const t = (html.match(/<title[^>]*>([^<]*)<\/title>/) || [])[1], d = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
    if (!t || t.length < 10) bad.push(f + ' title'); if (!d || d.length < 20) bad.push(f + ' description');
    if ((html.match(/<h1[ >]/g) || []).length !== 1) bad.push(f + ' h1 count'); if (!/<link rel="canonical"/.test(html)) bad.push(f + ' canonical'); if (!/<meta name="viewport"/.test(html)) bad.push(f + ' viewport'); if (!/<html lang="ar" dir="rtl"/.test(html)) bad.push(f + ' lang/dir');
    if (titles.has(t)) bad.push(`${f} duplicate title with ${titles.get(t)}`); titles.set(t, f); if (descs.has(d) && !f.includes('/admin/')) bad.push(`${f} duplicate description with ${descs.get(d)}`); descs.set(d, f);
  }
  assert.deepEqual(bad.slice(0, 15), []);
});
test('no duplicate ids, images have alt, buttons/inputs are labelled, JSON-LD parses', () => {
  const bad = [];
  for (const { f, html } of pages) {
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]); const dup = ids.filter((x, i) => ids.indexOf(x) !== i); if (dup.length) bad.push(`${f} dup ids ${[...new Set(dup)].join(',')}`);
    for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) bad.push(`${f} img without alt`);
    for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) if (!/aria-label=/.test(m[1]) && !m[2].replace(/<[^>]+>/g, '').trim() && !/<svg/.test(m[2])) bad.push(`${f} unlabelled button`);
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { bad.push(`${f} invalid JSON-LD`); } }
  }
  assert.deepEqual(bad.slice(0, 15), []);
});
test('sitemap lists every public page and no admin/404', () => {
  const sm = readFileSync(join(DIST, 'sitemap.xml'), 'utf8'); const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const pub = pages.map((p) => '/' + p.f.replace(/^dist\//, '').replace(/index\.html$/, '')).filter((p) => !/404|admin/.test(p));
  assert.deepEqual(pub.filter((p) => !locs.includes(p)), []); assert.ok(!locs.some((l) => /admin|404/.test(l))); assert.equal(new Set(locs).size, locs.length);
});
test('robots, ads.txt, verification file and security headers exist', () => {
  assert.match(readFileSync(join(DIST, 'robots.txt'), 'utf8'), /Disallow: \/admin\//); assert.ok(existsSync(join(DIST, 'google1dc3867d61891f77.html')));
  assert.match(readFileSync(join(DIST, '_headers'), 'utf8'), /X-Content-Type-Options: nosniff/); assert.match(readFileSync(join(DIST, '_headers'), 'utf8'), /\/admin\/\*[\s\S]*noindex/);
});
test('Arabic and English text exist for every visible bilingual span', () => {
  const bad = []; for (const { f, html } of pages) { const ar = (html.match(/class="ar"/g) || []).length, en = (html.match(/class="en"/g) || []).length; if (ar !== en) bad.push(`${f} ar=${ar} en=${en}`); }
  assert.deepEqual(bad.slice(0, 10), []);
});
