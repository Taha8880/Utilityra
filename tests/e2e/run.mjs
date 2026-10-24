// Browser test: every tool page loads without errors, plus functional checks and screenshots.
// Static server over dist/ with /api/* mocked (no network needed).
import http from 'node:http'; import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { TOOLS } from '../../src/meta.mjs';
const die = (e) => { console.log('::error title=e2e crashed::' + String((e && e.stack) || e).replace(/[\r\n]+/g, ' | ').slice(0, 500)); process.exit(1); };
process.on('uncaughtException', die); process.on('unhandledRejection', die);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..'), DIST = join(ROOT, 'dist'), LOG = join(ROOT, 'docs/test-logs'); mkdirSync(LOG, { recursive: true });
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/json' };
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); let p = decodeURIComponent(u.pathname);
  if (p === '/api/ai') { let b = ''; req.on('data', (c) => { b += c; }); req.on('end', () => { let j = {}; try { j = JSON.parse(b); } catch (e) { /* ignore */ } if (j.stream) { res.setHeader('content-type', 'text/event-stream'); res.write('data: ' + JSON.stringify({ sources: [{ title: 'Cairo', url: 'https://en.wikipedia.org/wiki/Cairo' }] }) + '\n\n'); res.write('data: ' + JSON.stringify({ response: '**mock ' }) + '\n\n'); setTimeout(() => { res.write('data: ' + JSON.stringify({ response: 'stream answer**' }) + '\n\n'); res.end('data: [DONE]\n\n'); }, 60); } else { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ answer: '**mock answer**', provider: 'mock' })); } }); return; }
  if (p === '/api/inspect') { res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify({ url: 'https://example.com/', httpStatus: 200, redirects: [], ttfbMs: 120, totalMs: 130, bytes: 900, truncated: false, headers: { 'strict-transport-security': 'max-age=1', 'x-content-type-options': 'nosniff', server: 'x' }, html: '<!doctype html><html lang="en"><head><title>Example page title ok</title><meta name="description" content="A description that is long enough to pass the audit check for meta descriptions in tests."></head><body><main><h1>Hi</h1><img src="a.png"></main></body></html>' })); }
  if (p.startsWith('/api/')) { res.statusCode = 204; return res.end(); }
  let f = join(DIST, p); if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.statusCode = 404; res.setHeader('content-type', T['.html']); return res.end(readFileSync(join(DIST, '404.html'))); }
  res.setHeader('content-type', T[extname(f)] || 'application/octet-stream'); res.end(readFileSync(f));
});
await new Promise((r) => srv.listen(0, r)); const base = `http://127.0.0.1:${srv.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const results = []; let fails = 0;
const rec = (name, ok, note = '') => { results.push({ name, ok, note }); if (!ok) { fails++; console.log('FAIL', name, note); if (process.env.GITHUB_ACTIONS) console.log('::error title=e2e ' + name + '::' + String(note).replace(/[\r\n]+/g, ' ').slice(0, 300)); } };
async function open(ctx, path) { const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push('pageerror: ' + e.message)); page.on('console', (m) => { if (m.type() === 'error' && !/favicon|fonts\.g|ERR_(NAME|INTERNET|CONNECTION|BLOCKED)|Failed to load resource/i.test(m.text())) errs.push('console: ' + m.text()); }); await page.goto(base + path, { waitUntil: 'domcontentloaded' }); return { page, errs }; }
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
await ctx.route(/fonts\.(googleapis|gstatic)\.com|googlesyndication|googletagmanager/, (r) => r.abort());

// 1) every tool page
for (const t of TOOLS) {
  const { page, errs } = await open(ctx, `/tools/${t[0]}/`);
  try { await page.waitForSelector('#tool-root .tool-panel, #tool-root [data-f], #tool-root .chat, #tool-root button', { timeout: 8000 }); const h1 = await page.locator('h1').count(); const txt = (await page.textContent('#tool-root')).trim().length; rec(`page:${t[0]}`, !errs.length && h1 >= 1 && txt > 10, errs.join(' | ') || (h1 < 1 ? 'no h1' : txt <= 10 ? 'empty tool' : '')); }
  catch (e) { rec(`page:${t[0]}`, false, 'tool did not mount ' + errs.join(' | ')); }
  await page.close();
}


// 1b) smoke-run every tool with its default values: must not throw; classify the outcome
const FILE_TOOLS = new Set(TOOLS.filter((t) => ['files', 'images'].includes(t[1]) || t[0] === 'favicon-generator' || t[0] === 'image-to-data-uri' || t[0] === 'file-metadata-inspector' || t[0] === 'pdf-to-text').map((t) => t[0]));
const outcomes = {};
for (const t of TOOLS) {
  const { page, errs } = await open(ctx, `/tools/${t[0]}/`);
  try {
    await page.waitForSelector('#tool-root', { timeout: 8000 }); await page.waitForTimeout(250);
    if (await page.locator('#tool-root [data-run]').count()) await page.locator('#tool-root [data-run]').first().click();
    await page.waitForTimeout(900);
    const o = await page.evaluate(() => { const out = document.querySelector('#tool-root .out'); if (!out) return 'no-out-container'; if (out.querySelector('.tool-status.err')) return 'graceful-error'; return out.innerText.trim() || [...out.querySelectorAll('textarea')].some((x) => x.value.trim()) || out.querySelector('img,canvas,iframe,table') ? 'output' : 'empty'; });
    outcomes[t[0]] = o;
    const CUSTOM = new Set(['ai-assistant', 'text-to-speech', 'scientific-calculator', 'flashcard-maker']); const mounted = (await page.locator('#tool-root').innerText()).trim().length > 20; rec(`smoke:${t[0]}`, !errs.length && (o !== 'no-out-container' || (CUSTOM.has(t[0]) && mounted)), `${o} ${errs.join('|')}`);
  } catch (e) { outcomes[t[0]] = 'exception'; rec(`smoke:${t[0]}`, false, e.message.split('\n')[0]); }
  await page.close();
}
writeFileSync(join(LOG, 'smoke-outcomes.json'), JSON.stringify(outcomes, null, 1));

// 2) functional checks (input -> output)
async function run(id, fill, expect, { click = true, files } = {}) {
  const { page, errs } = await open(ctx, `/tools/${id}/`);
  try {
    await page.waitForSelector('#tool-root [data-f]', { timeout: 8000 });
    for (const [f, v] of Object.entries(fill)) { const el = page.locator(`#tool-root [data-f="${f}"]`); if (files && files[f]) await el.setInputFiles(files[f]); else if ((await el.evaluate((n) => n.tagName)) === 'SELECT') await el.selectOption(String(v)); else await el.fill(String(v)); }
    if (click && await page.locator('#tool-root [data-run]').count()) await page.locator('#tool-root [data-run]').click();
    await page.waitForFunction((e) => (() => { const r = document.querySelector('#tool-root'); return (r.innerText + ' ' + [...r.querySelectorAll('textarea,input')].map((x) => x.value).join(' ')).split('النتيجة').pop().includes(e) || r.innerText.includes(e); })(), expect, { timeout: 8000 });
    rec(`func:${id}`, !errs.length, errs.join('|'));
  } catch (e) { rec(`func:${id}`, false, 'expected "' + expect + '" ' + e.message.split('\n')[0]); }
  await page.close();
}
await run('word-counter', { text: 'hello world foo bar' }, '4');
await run('case-converter', { text: 'hello world', mode: 'upper' }, 'HELLO WORLD');
await run('base64-encoder-decoder', { text: 'hello', mode: 'enc' }, 'aGVsbG8=');
await run('json-formatter', { text: '{"a":1,"b":[1,2]}' }, '"b": [');
await run('percentage-calculator', { a: 20, b: 200 }, '40');
await run('slug-generator', { text: 'Hello World Tool' }, 'hello-world-tool');
await run('reverse-text', { t: 'abc' }, 'cba');
await run('ai-summarizer', { text: 'نص تجريبي طويل للتلخيص' }, 'mock answer');
await run('seo-auditor', { u: 'example.com' }, 'Example page title ok');
await run('security-header-checker', { u: 'example.com' }, 'HSTS');
await run('accessibility-checker', { u: 'example.com' }, 'alt');
await run('page-speed-checker', { u: 'example.com' }, '120');
await run('contrast-checker', { fg: '#000000', bg: '#ffffff' }, '21.00', { click: false });

// 2b) chat assistant: streaming, sources, persistence, memory, regenerate
{ const { page, errs } = await open(ctx, '/tools/ai-assistant/');
  try {
    await page.waitForSelector('.chat-form textarea'); await page.locator('details.memo summary').click(); await page.fill('.mem', 'I am a student');
    await page.fill('.chat-form textarea', 'what is the capital of egypt please'); await page.click('.chat-form button[type=submit]');
    await page.waitForFunction(() => document.querySelector('.chat-log').innerText.includes('mock stream answer'), null, { timeout: 8000 });
    rec('chat:streams-answer', true); rec('chat:shows-sources', (await page.locator('.srcs a').count()) === 1);
    await page.reload(); await page.waitForSelector('.chat-log'); await page.waitForTimeout(300);
    rec('chat:history-persists', (await page.locator('.chat-log').innerText()).includes('mock stream answer')); rec('chat:memory-persists', (await page.inputValue('.mem')) === 'I am a student');
    await page.click('.rg'); await page.waitForFunction(() => document.querySelectorAll('.msg.bot').length >= 2, null, { timeout: 8000 }); rec('chat:regenerate', true);
    await page.waitForTimeout(700); await page.click('.nw'); await page.waitForTimeout(200); rec('chat:new-chat-clears', (await page.locator('.msg.user').count()) === 0);
    rec('chat:no-errors', !errs.length, errs.join('|'));
  } catch (e) { rec('chat:flow', false, e.message.split('\n')[0]); }
  await page.close(); }

// 3) navigation, 404, redirects, search
{ const { page, errs } = await open(ctx, '/');
  rec('home:renders', (await page.locator('h1').count()) > 0 && !errs.length, errs.join('|'));
  await page.locator('a[href="/tools/"]').first().click(); await page.waitForURL('**/tools/'); rec('nav:tools-index', true);
  const cards = await page.locator('main .tgrid:not(#favrec *) a.tcard').count(); rec('tools-index:cards=' + TOOLS.length, cards === TOOLS.length, 'found ' + cards);
  await page.locator('a.tcard[href="/tools/word-counter/"]').first().click(); await page.waitForURL('**/tools/word-counter/'); rec('nav:card->own-page', (await page.locator('#tool-root').getAttribute('data-tool')) === 'word-counter');
  await page.goBack(); rec('nav:back', page.url().endsWith('/tools/'));
  await page.close(); }
{ const r = await ctx.request.get(base + '/nope-xyz/'); rec('404:status', r.status() === 404); }
{ const s = await (await ctx.request.get(base + '/sitemap.xml')).text(); const bad = TOOLS.filter((t) => !s.includes(`/tools/${t[0]}/`)); rec('sitemap:all-tools', !bad.length, bad.map((b) => b[0]).join(',')); }
{ const lang = await ctx.newPage(); await lang.goto(base + '/tools/word-counter/'); await lang.waitForSelector('#tool-root [data-f]');
  const dir0 = await lang.evaluate(() => document.documentElement.dir); await lang.locator('[data-lang-toggle], #lang-toggle, button[aria-label*="lang" i]').first().click(); const dir1 = await lang.evaluate(() => document.documentElement.dir);
  rec('i18n:toggle-direction', dir0 === 'rtl' && dir1 === 'ltr', dir0 + '->' + dir1); await lang.close(); }

// 4) responsive + overflow + screenshots (mobile 360, desktop; AR/EN; light/dark)
mkdirSync(join(LOG, 'screens'), { recursive: true });
for (const [vw, vh, tag] of [[360, 740, 'm360'], [1280, 800, 'desk']]) for (const theme of ['light', 'dark']) for (const lang of ['ar', 'en']) {
  const c = await browser.newContext({ viewport: { width: vw, height: vh } }); await c.addInitScript(([l, th]) => { localStorage.setItem('ur-lang', l); localStorage.setItem('ur-theme', th); }, [lang, theme]); await c.route(/fonts\.(googleapis|gstatic)\.com|googlesyndication|googletagmanager/, (r) => r.abort());
  for (const p of ['/', '/tools/', '/tools/qr-code-generator/', '/tools/ai-assistant/']) { const pg = await c.newPage(); await pg.goto(base + p); await pg.waitForTimeout(500); const ov = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); rec(`overflow:${tag}:${theme}:${lang}:${p}`, ov <= 1, 'overflow ' + ov + 'px'); if (p === '/' || p.includes('qr')) await pg.screenshot({ path: join(LOG, 'screens', `${tag}-${theme}-${lang}-${p.replace(/\W+/g, '_') || 'home'}.png`) }); await pg.close(); }
  await c.close();
}
await browser.close(); srv.close();
const pass = results.filter((r) => r.ok).length;
const md = `# E2E test log\n\nGenerated: ${new Date().toISOString()}\n\n**${pass}/${results.length} passed**, ${fails} failed.\n\n| test | result | note |\n|---|---|---|\n` + results.map((r) => `| ${r.name} | ${r.ok ? 'PASS' : 'FAIL'} | ${String(r.note).replace(/\|/g, '/').slice(0, 160)} |`).join('\n') + '\n';
writeFileSync(join(LOG, 'e2e-latest.md'), md); console.log(`${pass}/${results.length} passed`); process.exit(fails ? 1 : 0);
