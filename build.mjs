#!/usr/bin/env node
// Utilityra static site generator: node build.mjs  ->  dist/
// Env: SITE_URL, API_BASE, ADSENSE_ID, GA_ID, CONTACT_EMAIL
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { ICONS, iconFor, CAT_ICON, svg } from './src/icons.mjs';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, TOOLS, toolObj } from './src/meta.mjs';
import { GUIDES as G1 } from './src/guides.mjs';
import { GUIDES2 } from './src/guides2.mjs';
import { GUIDES3 } from './src/guides3.mjs';
const GUIDES = { ...G1, ...GUIDES2, ...GUIDES3 };

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'dist');
const SITE = (process.env.SITE_URL || 'https://utilityra.tavengers16.workers.dev').replace(/\/+$/, '');
const API_BASE = (process.env.API_BASE || '').replace(/\/+$/, '');
const ADSENSE = process.env.ADSENSE_ID === undefined ? 'ca-pub-1235197294708204' : process.env.ADSENSE_ID;
const GA = process.env.GA_ID || '';
const CONTACT = process.env.CONTACT_EMAIL || '';
const YEAR = 2026;

const tools = TOOLS.map(toolObj);
const cats = CATEGORIES.map((c) => ({ id: c[0], glyph: c[1], ar: c[2], en: c[3], dAr: c[4], dEn: c[5] }));
const catOf = (id) => cats.find((c) => c.id === id);
const byCat = (id) => tools.filter((t) => t.cat === id);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const L = (ar, en) => `<span class="ar">${ar}</span><span class="en">${en}</span>`;
const Le = (ar, en) => L(esc(ar), esc(en));

// ---------- assets ----------
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'assets/js'), { recursive: true });
mkdirSync(join(OUT, 'assets/css'), { recursive: true });
mkdirSync(join(OUT, 'assets/vendor'), { recursive: true });
const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 8);
const cssSrc = readFileSync(join(ROOT, 'src/assets/css/app.css'), 'utf8');
const css = cssSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();
const appJs = readFileSync(join(ROOT, 'src/assets/js/app.js'), 'utf8');
const toolFiles = readdirSync(join(ROOT, 'src/assets/js/tools')).filter((f) => f.endsWith('.js')).sort();
const toolsJs = toolFiles.map((f) => readFileSync(join(ROOT, 'src/assets/js/tools', f), 'utf8')).join('\n;\n');
const indexJs = 'window.UT_INDEX=' + JSON.stringify(tools.map((t) => [t.id, t.cat, iconFor(t.id, t.cat), t.ar, t.en, t.dAr, t.dEn])) + ';window.UT_ICONS=' + JSON.stringify(ICONS) + ';';
writeFileSync(join(OUT, 'assets/css/app.css'), css);
writeFileSync(join(OUT, 'assets/js/app.js'), appJs);
writeFileSync(join(OUT, 'assets/js/tools.js'), toolsJs);
writeFileSync(join(OUT, 'assets/js/index.js'), indexJs);
const adminJs = readFileSync(join(ROOT, 'src/assets/js/admin.js'), 'utf8');
writeFileSync(join(OUT, 'assets/js/admin.js'), adminJs);
cpSync(join(ROOT, 'src/assets/vendor'), join(OUT, 'assets/vendor'), { recursive: true });
const V = { css: hash(css), app: hash(appJs), tools: hash(toolsJs), idx: hash(indexJs) };

// ---------- shared layout ----------
const FONTS = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap';
const FAVICON = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#E45A1F"/><stop offset="1" stop-color="#FF7C30"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><path d="M20 18v18a12 12 0 0 0 24 0V18" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>');
copyFileSync(join(ROOT, 'src/assets/og.png'), join(OUT, 'og.png'));
writeFileSync(join(OUT, 'favicon.svg'), decodeURIComponent(FAVICON.split(',')[1]));

const initScript = `<script>(function(){try{var d=document.documentElement,l=localStorage.getItem('ur-lang'),t=localStorage.getItem('ur-theme');if(!l){l='ar'}d.lang=l;d.dir=l==='ar'?'rtl':'ltr';if(t)d.dataset.theme=t}catch(e){}})();window.UTILITYRA=${JSON.stringify({ apiBase: API_BASE, assetBase: '/assets/' })};</script>`;
const adsHead = ADSENSE ? `<meta name="google-adsense-account" content="${esc(ADSENSE)}"><script>(function(){var d=0;function l(){if(d)return;d=1;var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(ADSENSE)}';document.head.appendChild(s)}['scroll','pointerdown','keydown','touchstart'].forEach(function(e){addEventListener(e,l,{once:true,passive:true})});addEventListener('load',function(){setTimeout(l,6000)})})()</script>` : '';
const gaHead = GA ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(GA)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(GA)}');</script>` : '';

function head({ titleAr, titleEn, descAr, descEn, path, extra = '', noindex = false }) {
  const full = (a) => `${a} | Utilityra`;
  const url = SITE + path;
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title id="doc-title" data-ar="${esc(full(titleAr))}" data-en="${esc(full(titleEn))}">${esc(full(titleAr))}</title>
<meta name="description" content="${esc(descAr)}">
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">${process.env.GOOGLE_SITE_VERIFICATION ? `
<meta name="google-site-verification" content="${String(process.env.GOOGLE_SITE_VERIFICATION).replace(/[^\w-]/g, '')}">` : ''}${process.env.BING_SITE_VERIFICATION ? `
<meta name="msvalidate.01" content="${String(process.env.BING_SITE_VERIFICATION).replace(/[^\w-]/g, '')}">` : ''}
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Utilityra"><meta property="og:title" content="${esc(full(titleAr))}"><meta property="og:description" content="${esc(descAr)}"><meta property="og:url" content="${url}"><meta property="og:locale" content="ar_AR"><meta property="og:locale:alternate" content="en_US">
<meta property="og:image" content="${SITE}/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${SITE}/og.png"><meta name="twitter:title" content="${esc(full(titleAr))}"><meta name="twitter:description" content="${esc(descAr)}">
<meta name="theme-color" content="#E45A1F">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="${FONTS}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${FONTS}"></noscript>
${initScript}
<style>${css}</style>
${extra}${gaHead}${adsHead}
</head>`;
}

const header = () => `<a class="skip" href="#main">${Le('تخطّي إلى المحتوى', 'Skip to content')}</a>
<header class="hdr"><div class="wrap in">
  <a class="logo" href="/" aria-label="Utilityra"><i>U</i><span>Utilityra</span></a>
  <nav class="nav" id="nav" aria-label="main">
    <a href="/tools/">${Le('كل الأدوات', 'All tools')}</a>
    <a href="/category/ai/">${Le('الذكاء الاصطناعي', 'AI tools')}</a>
    <a href="/category/files/">${Le('PDF', 'PDF')}</a>
    <a href="/category/images/">${Le('الصور', 'Images')}</a>
    <a href="/category/dev/">${Le('المطورون', 'Developers')}</a>
    <a href="/about/">${Le('عن الموقع', 'About')}</a>
  </nav>
  <span class="hsp"></span>
  <button class="hbtn" id="theme-btn" type="button" aria-label="Theme">${svg('contrast', 'ic sm')}</button>
  <button class="hbtn" id="lang-btn" type="button" aria-label="Language">EN</button>
  <button class="hbtn burger" id="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav">${svg('menu', 'ic sm')}</button>
</div></header>`;

const footer = () => `<footer class="ftr"><div class="wrap">
  <div class="fcols">
    <div><a class="logo" href="/"><i>U</i><span>Utilityra</span></a><p>${Le('أدوات رقمية مجانية وسريعة للطلاب والمكاتب والمطورين، تعمل داخل متصفحك وتحترم خصوصيتك.', 'Free, fast digital tools for students, offices and developers. They run in your browser and respect your privacy.')}</p></div>
    <div><h4>${Le('الأدوات', 'Tools')}</h4><ul>${['ai', 'text', 'dev', 'files', 'images'].map((c) => `<li><a href="/category/${c}/">${Le(catOf(c).ar, catOf(c).en)}</a></li>`).join('')}</ul></div>
    <div><h4>${Le('المزيد', 'More')}</h4><ul>${['security', 'seo', 'calc', 'study', 'convert', 'design'].map((c) => `<li><a href="/category/${c}/">${Le(catOf(c).ar, catOf(c).en)}</a></li>`).join('')}</ul></div>
    <div><h4>${Le('الموقع', 'Site')}</h4><ul><li><a href="/about/">${Le('عن Utilityra', 'About')}</a></li><li><a href="/privacy/">${Le('سياسة الخصوصية', 'Privacy Policy')}</a></li><li><a href="/terms/">${Le('الشروط وإخلاء المسؤولية', 'Terms & Disclaimer')}</a></li><li><a href="/contact/">${Le('اتصل بنا', 'Contact')}</a></li></ul></div>
  </div>
  <div class="copy"><span>© ${YEAR} Utilityra · ${Le('من تطوير Taha', 'Created by Taha')}</span><span><a href="/admin/" rel="nofollow">${Le('الإدارة', 'Admin')}</a></span></div>
</div></footer>`;

const scripts = (withTools) => `<script src="/assets/js/index.js?v=${V.idx}" defer></script>${withTools ? `<script src="/assets/js/tools.js?v=${V.tools}" defer></script>` : ''}<script src="/assets/js/app.js?v=${V.app}" defer></script>`;
const adSlot = () => (ADSENSE ? `<div class="adslot" aria-label="advertisement"><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(ADSENSE)}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>` : '');
const page = (h, body, withTools = false, bodyClass = '') => `${h}\n<body${bodyClass ? ` class="${bodyClass}"` : ''}>\n${header()}\n${body}\n${footer()}\n${scripts(withTools)}\n</body>\n</html>\n`;
const write = (path, html) => { const f = join(OUT, path.replace(/^\//, ''), path.endsWith('.html') ? '' : 'index.html'); mkdirSync(dirname(f), { recursive: true }); writeFileSync(path.endsWith('.html') ? join(OUT, path) : f, html); };

const toolCard = (t) => `<a class="tcard" href="/tools/${t.id}/" data-id="${t.id}" data-cat="${t.cat}"><span class="g">${svg(iconFor(t.id, t.cat))}</span><span><h3>${Le(t.ar, t.en)}${t.cat === 'ai' ? '<span class="ai">AI</span>' : ''}</h3><p>${Le(t.dAr, t.dEn)}</p></span></a>`;
const catCard = (c) => `<a class="ccat reveal" data-cat="${c.id}" href="/category/${c.id}/"><span class="g">${svg(CAT_ICON[c.id])}</span><h3>${Le(c.ar, c.en)}</h3><p>${Le(c.dAr, c.dEn)}</p><span class="n">${byCat(c.id).length} ${Le('أداة', 'tools')} →</span></a>`;
const chips = (active, isStatic) => `<div class="chips"><a class="chip${active ? '' : ' on'}" data-cat="" href="/tools/">${Le('الكل', 'All')} (${tools.length})</a>${cats.map((c) => `<a class="chip${active === c.id ? ' on' : ''}" data-cat="${c.id}" href="/category/${c.id}/">${Le(c.ar, c.en)}</a>`).join('')}</div>`;
const searchIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

// ---------- HOME ----------
function home() {
  const n = (...ids) => ids.reduce((a, c) => a + byCat(c).length, 0);
  const car = (cls, glow, href, title, foot, center, extra = '') => `<article class="ccard ${cls}" data-glow="${glow}" data-href="${href}" aria-roledescription="slide"><div class="cbg"></div><div class="cgrain"></div>${extra}<p class="ct">${title}</p>${center}<p class="cf">${foot}</p></article>`;
  const cards = [
    car('c1', '237,190,241', '/category/ai/', L('أدوات الذكاء<br>الاصطناعي', 'Smart AI<br>tools'), L('تلخيص · ترجمة · برمجة', 'Summarize · Translate · Code'), `<div class="cc"><span class="num" style="color:rgba(232,240,200,.95)">${byCat('ai').length}<sup>AI</sup></span></div>`, `<svg class="dial" viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="dialFade" x1="0" y1="0" x2="1" y2="1"><stop offset=".15" stop-color="#fff" stop-opacity=".15"/><stop offset=".5" stop-color="#fff" stop-opacity="1"/><stop offset=".85" stop-color="#fff" stop-opacity=".1"/></linearGradient><mask id="dialMask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><path d="M100 100 L-80 170 L-80 -100 L280 -100 L280 120 Z" fill="url(#dialFade)"/></mask></defs><circle cx="100" cy="100" r="93" fill="none" stroke="rgba(240,245,190,.22)" stroke-width="9" stroke-dasharray="1.1 2.7"/><circle cx="100" cy="100" r="93" fill="none" stroke="rgba(246,248,190,.78)" stroke-width="9" stroke-dasharray="1.1 2.7" mask="url(#dialMask)"/><circle cx="100" cy="100" r="84" fill="none" stroke="rgba(240,245,190,.16)" stroke-width="1"/></svg>`),
    car('c2', '70,190,240', '/category/files/', L('ملفات PDF<br>والصور', 'PDF &amp;<br>Image tools'), L('كل شيء داخل متصفحك', 'Everything in your browser'), `<div class="cc" style="justify-content:flex-start;padding:0 calc(var(--u)*27)"><span class="num" style="font-size:calc(var(--u)*77);background:linear-gradient(90deg,#ffe9ee 0%,#ffb3a6 34%,#f0604e 62%,#9c1a36 100%);-webkit-background-clip:text;background-clip:text;color:transparent;padding-inline-end:calc(var(--u)*4)">${n('files', 'images')}</span></div>`, `<svg class="ruler" id="ruler" viewBox="0 0 256 20" preserveAspectRatio="none" aria-hidden="true"></svg>`),
    car('c3', '38,196,238', '/category/dev/', L('أدوات المطورين<br>والسيو', 'Developer &amp;<br>SEO tools'), L('JSON · SQL · Regex · Meta', 'JSON · SQL · Regex · Meta'), `<div class="cc" style="padding-inline-end:calc(var(--u)*8)"><span class="num" style="background:linear-gradient(180deg,#2f9dff 0%,#36d6f5 55%,#46f0ee 100%);-webkit-background-clip:text;background-clip:text;color:transparent">${n('dev', 'seo', 'security')}<sup style="-webkit-text-fill-color:#3fd3f7;color:#3fd3f7">+</sup></span></div>`, `<div class="slider"></div>`),
    car('c4', '150,170,250', '/category/calc/', L('الحاسبات<br>والدراسة', 'Calculators<br>&amp; study'), L('GPA · قروض · وحدات · هجري', 'GPA · Loans · Units · Hijri'), `<div class="cc" style="padding-inline-start:calc(var(--u)*4)"><span class="num" style="background:linear-gradient(180deg,#fbe4ff 0%,#e79cff 45%,#c45cf5 100%);-webkit-background-clip:text;background-clip:text;color:transparent">${n('calc', 'study', 'convert', 'text', 'design')}<sup style="-webkit-text-fill-color:#d6a0ff;color:#d6a0ff">+</sup></span></div>`, `<span class="cbadge">${L('مجاني', 'Free')}</span><div class="cross-h"></div><div class="cross-v"></div>`)
  ].join('');
  const featured = ['ai-assistant', 'ai-summarizer', 'ai-translator', 'pdf-merge', 'image-compressor', 'json-formatter', 'word-counter', 'qr-code-generator', 'password-generator', 'gpa-calculator', 'hijri-converter', 'unit-converter'].map((id) => tools.find((t) => t.id === id)).filter(Boolean);
  const pills = (arr) => arr.map((t) => `<a class="pill" href="/tools/${t.id}/"><i>${svg(iconFor(t.id, t.cat))}</i>${Le(t.ar, t.en)}</a>`).join('');
  const half = Math.ceil(tools.length / 2); const r1 = tools.slice(0, half), r2 = tools.slice(half);
  const h = head({ titleAr: 'أدوات مجانية أونلاين: ذكاء اصطناعي، PDF، صور، مطورين', titleEn: 'Free online tools: AI, PDF, images, developer utilities', descAr: `أكثر من ${tools.length} أداة مجانية تعمل داخل متصفحك: تلخيص وترجمة بالذكاء الاصطناعي، دمج PDF، ضغط الصور، منسق JSON، حاسبات وأدوات الطلاب. بدون تسجيل وبخصوصية.`, path: '/', extra: `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Utilityra', url: SITE + '/', inLanguage: ['ar', 'en'], potentialAction: { '@type': 'SearchAction', target: SITE + '/tools/?q={q}', 'query-input': 'required name=q' } })}</script>` });
  const body = `<main id="main">
<section class="hero">
  <div class="sky" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div>
  <div class="hero-copy">
    <span class="eyebrow">${Le('منصتك للأدوات الرقمية', 'YOUR DIGITAL TOOLBOX')}</span>
    <h1>${L('كل أداة تحتاجها، في مكان واحد.<br>سريعة ومجانية وتحترم خصوصيتك.', 'Every tool you need, in one place.<br>Fast, free and built for privacy.')}</h1>
    <p class="sub">${Le(`${tools.length} أداة احترافية تعمل داخل متصفحك: ذكاء اصطناعي، PDF، صور، برمجة، حاسبات ودراسة. بلا تسجيل وبلا تثبيت.`, `${tools.length} professional tools that run in your browser: AI, PDF, images, code, calculators and study. No sign-up, no install.`)}</p>
    <div class="hero-search"><input data-search type="search" autocomplete="off" aria-label="Search tools" data-ph-ar="ابحث عن أداة… (مثال: دمج PDF، ضغط صور، JSON)" data-ph-en="Search tools… (e.g. merge PDF, compress image, JSON)" placeholder="ابحث عن أداة…">${searchIcon}<kbd>/</kbd><div class="sugg" role="listbox"></div></div>
    <div class="cta-row"><a class="btn glass" href="/category/ai/">${Le('ابدأ مع الذكاء الاصطناعي', 'Start with AI')}</a><a class="btn solid" href="/tools/">${Le('استعرض جميع الأدوات', 'Browse all tools')}</a></div>
  </div>
  <div class="appwin" aria-hidden="true">
    <aside><a class="logo" href="/"><i>U</i><span>Utilityra</span></a><a class="on">◧ ${Le('مساحة العمل', 'Workspace')}</a><a>✦ ${Le('الذكاء الاصطناعي', 'AI tools')}</a><a>▤ ${Le('الملفات', 'Files')}</a><a>{ } ${Le('المطورون', 'Developers')}</a></aside>
    <div class="main">
      <div class="aw-head"><span class="av">U</span><span class="av b">AI</span><h3>${Le('ملخّص تقرير الربع الثالث', 'Q3 report summary')}</h3></div>
      <div class="aw-tabs"><span class="on">${Le('الملخص', 'Summary')}</span><span>${Le('الترجمة', 'Translate')}</span><span>${Le('الأسئلة', 'Quiz')}</span><span>${Le('البريد', 'Email')}</span></div>
      <div class="aw-ai"><div class="t"><span class="spin">✳</span>${Le('جارٍ تحليل المستند…', 'Working on your document…')}</div>
      <ul><li>${Le('قراءة النص وتحديد الأفكار الرئيسية…', 'Reading text and finding key ideas…')}</li><li>${Le('استخراج الأرقام والتواريخ…', 'Extracting numbers and dates…')}</li><li>${Le('كتابة الملخص بنقاط واضحة…', 'Writing a clear bullet summary…')}</li><li>${Le('ترجمة الملخص إلى الإنجليزية…', 'Translating the summary to English…')}</li><li>${Le('تجهيز أسئلة مراجعة…', 'Preparing review questions…')}</li></ul></div>
    </div>
  </div>
</section>

<section class="sec after-hero"><div class="wrap">
  <div class="sec-h reveal"><span class="label">${Le('الأقسام', 'CATEGORIES')}</span><h2>${L('أقسام منظّمة لكل احتياج', 'Organised for every need')}</h2><p>${Le('تنقّل بالسحب أو بالأسهم، وانقر على البطاقة الأمامية لفتح القسم.', 'Swipe or use the arrows to browse, and click the front card to open a category.')}</p></div>
</div></section>
<section class="carousel" id="carousel" aria-roledescription="carousel" aria-label="Tool categories">
  <div class="glow glow--top"></div><div class="glow glow--bottom"></div>
  <div class="stage" id="stage">${cards}</div>
  <div class="lens lens--l"></div><div class="lens lens--r"></div>
  <div class="cdots" role="group" aria-label="Slides">${[1, 2, 3, 4].map((n) => `<button type="button" aria-label="Slide ${n}"></button>`).join('')}</div>
</section>

<section class="sec" style="padding-bottom:30px"><div class="wrap">
  <div class="sec-h reveal" style="margin-bottom:22px"><span class="label">${Le('الأكثر استخدامًا', 'POPULAR')}</span><h2>${L('الأدوات الأكثر طلبًا', 'Most-used tools')}</h2></div>
  <div class="tgrid">${featured.map(toolCard).join('')}</div>
</div></section>

<section class="sec" style="padding:40px 0"><div class="wrap"><p class="label" style="display:flex;justify-content:center;margin-bottom:18px">${Le(`${tools.length} أداة وأكثر`, `${tools.length}+ TOOLS`)}</p></div>
  <div class="marq"><div class="track">${pills(r1)}${pills(r1)}</div></div><div class="marq rev"><div class="track">${pills(r2)}${pills(r2)}</div></div>
</section>

<section class="sec"><div class="wrap">
  <div class="sec-h reveal"><span class="label">${Le('لماذا Utilityra', 'WHY UTILITYRA')}</span><h2>${L('صُمّمت لتوفّر وقتك وتحمي بياناتك', 'Built to save your time and protect your data')}</h2></div>
  <div class="f3">
    <div class="fcard reveal"><div class="tile"><div class="ico ring"><b></b><i></i></div></div><span class="label" style="margin-top:18px">${Le('الخصوصية', 'PRIVACY')}</span><h3>${L('ملفاتك لا تغادر جهازك', 'Your files never leave your device')}</h3><p>${Le('تُعالَج ملفات PDF والصور والنصوص والأكواد داخل متصفحك مباشرة، دون رفعها إلى أي خادم. الاستثناء الوحيد أدوات الذكاء الاصطناعي.', 'PDFs, images, text and code are processed right in your browser and never uploaded. The only exception is the AI tools.')}</p></div>
    <div class="fcard reveal"><div class="tile"><div class="ico bars"><i></i><i></i><i class="o"></i><i></i></div></div><span class="label" style="margin-top:18px">${Le('السرعة', 'SPEED')}</span><h3>${L('نتائج فورية، بلا حساب', 'Instant results, no account')}</h3><p>${Le('افتح الأداة وابدأ فورًا على الهاتف أو الحاسوب، بالعربية أو الإنجليزية، دون تسجيل أو تثبيت.', 'Open a tool and start right away on phone or desktop, in Arabic or English, with no sign-up or install.')}</p></div>
    <div class="fcard reveal"><div class="tile"><div class="ico stack"><span></span><i></i><span></span></div></div><span class="label" style="margin-top:18px">${Le('الذكاء الاصطناعي', 'AI')}</span><h3>${L('ذكاء اصطناعي لمهام حقيقية', 'AI for real work')}</h3><p>${Le(`${byCat('ai').length} أداة ذكية للتلخيص والترجمة والتدقيق والكتابة وشرح الكود وصياغة SQL ومعادلات Excel.`, `${byCat('ai').length} AI tools to summarise, translate, proofread, write, explain code and build SQL and Excel formulas.`)}</p></div>
  </div>
</div></section>

<section class="sec" style="padding-top:20px"><div class="wrap">
  <div class="sec-h reveal"><span class="label">${Le('تصفّح حسب القسم', 'BROWSE BY CATEGORY')}</span><h2>${L('اختر القسم المناسب', 'Choose a category')}</h2></div>
  <div class="cgrid">${cats.map(catCard).join('')}</div>
</div></section>
</main>`;
  write('/', page(h, body, false, 'home'));
}

// ---------- tools index + categories ----------
function listing({ path, titleAr, titleEn, descAr, descEn, cat }) {
  const list = cat ? byCat(cat) : tools;
  const h = head({ titleAr, titleEn, descAr, descEn, path });
  const body = `<main id="main"><div class="wrap">
  <div class="phead"><nav class="crumbs" aria-label="breadcrumb"><a href="/">${Le('الرئيسية', 'Home')}</a><span>/</span>${cat ? `<a href="/tools/">${Le('الأدوات', 'Tools')}</a><span>/</span>` : ''}<span>${Le(cat ? catOf(cat).ar : 'كل الأدوات', cat ? catOf(cat).en : 'All tools')}</span></nav>
  <h1>${Le(cat ? catOf(cat).ar : 'كل الأدوات', cat ? catOf(cat).en : 'All tools')}</h1><p>${Le(descAr, descEn)}</p></div>
  ${chips(cat)}
  <div class="searchbar"><input id="gsearch" type="search" autocomplete="off" aria-label="Search" data-ph-ar="ابحث في ${cat ? 'هذا القسم' : 'كل الأدوات'}…" data-ph-en="Search ${cat ? 'this category' : 'all tools'}…" placeholder="ابحث…"></div>
  <div class="tgrid" id="tgrid" ${cat ? `data-cat="${cat}"` : ''} data-static="${cat ? '1' : ''}">${list.map(toolCard).join('')}</div>
  <p class="empty" id="gempty" hidden>${Le('لا توجد نتائج مطابقة.', 'No matching tools.')}</p>
  ${adSlot()}
</div></main>`;
  write(path, page(h, body));
}

// ---------- tool pages ----------
const HOW = {
  ai: [['اكتب طلبك أو الصق النص', 'Write your request or paste text'], ['اختر الخيارات المناسبة', 'Pick the options you need'], ['اضغط الزر وراجع الناتج قبل استخدامه', 'Press the button and review the result before using it']],
  files: [['اختر ملفاتك من جهازك', 'Choose files from your device'], ['اضبط الإعدادات إن وُجدت', 'Adjust the settings if any'], ['نزّل النتيجة، لا يتم رفع شيء لأي خادم', 'Download the result; nothing is uploaded']],
  images: [['اختر صورة من جهازك', 'Choose an image from your device'], ['عدّل الإعدادات وشاهد المعاينة', 'Tune the settings and watch the preview'], ['نزّل الصورة الناتجة', 'Download the resulting image']]
};
const HOW_DEF = [['أدخل بياناتك أو الصق النص', 'Enter your data or paste text'], ['تظهر النتيجة فورًا أثناء الكتابة', 'The result appears instantly as you type'], ['انسخ النتيجة أو نزّلها', 'Copy or download the result']];
const PRIV = {
  ai: ['تُرسل النصوص التي تكتبها إلى خدمة الذكاء الاصطناعي لمعالجتها. لا تُدخل كلمات مرور أو بيانات حساسة، وراجع الإجابات قبل الاعتماد عليها.', 'The text you type is sent to an AI service to be processed. Do not enter passwords or sensitive data, and verify answers before relying on them.'],
  _: ['تعمل هذه الأداة بالكامل داخل متصفحك. لا يتم إرسال مدخلاتك أو ملفاتك إلى أي خادم.', 'This tool runs entirely in your browser. Your input and files are never sent to a server.']
};
function toolPage(t) {
  const c = catOf(t.cat); const related = byCat(t.cat).filter((x) => x.id !== t.id).slice(0, 6); const how = HOW[t.cat] || HOW_DEF; const pv = PRIV[t.cat] || PRIV._;
  const ld = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: t.en, alternateName: t.ar, description: t.dEn, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any (web)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, url: `${SITE}/tools/${t.id}/`, inLanguage: ['ar', 'en'] };
  const bc = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ['Tools', '/tools/'], [c.en, `/category/${c.id}/`], [t.en, `/tools/${t.id}/`]].map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[0], item: SITE + x[1] })) };
  const faqs = [
    [`هل ${t.ar} مجانية؟`, `Is ${t.en} free?`, 'نعم، الأداة مجانية بالكامل وتعمل بدون تسجيل أو تثبيت.', 'Yes. The tool is completely free and works without sign-up or installation.'],
    [`هل بياناتي آمنة عند استخدام ${t.ar}؟`, `Is my data safe when using ${t.en}?`, pv[0], pv[1]],
    ['هل تعمل الأداة على الهاتف؟', 'Does it work on mobile?', 'نعم، تعمل على الهاتف والحاسوب في أي متصفح حديث، بالعربية والإنجليزية.', 'Yes. It works on phones and desktops in any modern browser, in Arabic and English.']
  ];
  const G = GUIDES[t.id]; if (G) for (let i = 0; i < G.ar.faq.length; i++) faqs.unshift([G.ar.faq[i][0], G.en.faq[i][0], G.ar.faq[i][1], G.en.faq[i][1]]);
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f[1], acceptedAnswer: { '@type': 'Answer', text: f[3] } })) };
  const h = head({ titleAr: `${t.ar} - أداة مجانية أونلاين`, titleEn: `${t.en} - Free Online Tool`, descAr: `${t.ar}: ${t.dAr} مجانًا وبدون تسجيل.`, path: `/tools/${t.id}/`, extra: `<script type="application/ld+json">${JSON.stringify(ld)}</script><script type="application/ld+json">${JSON.stringify(faqLd)}</script><script type="application/ld+json">${JSON.stringify(bc)}</script>` });
  const body = `<main id="main"><div class="wrap">
  <div class="phead"><nav class="crumbs" aria-label="breadcrumb"><a href="/">${Le('الرئيسية', 'Home')}</a><span>/</span><a href="/tools/">${Le('الأدوات', 'Tools')}</a><span>/</span><a href="/category/${c.id}/">${Le(c.ar, c.en)}</a></nav>
  <div class="ttl" data-cat="${t.cat}"><span class="g big">${svg(iconFor(t.id, t.cat), 'ic')}</span><h1>${Le(t.ar, t.en)}${t.cat === 'ai' ? '<span class="ai">AI</span>' : ''}</h1></div><p>${Le(t.dAr, t.dEn)}</p></div>
  <section class="panel" aria-label="tool"><div id="tool-root" data-tool="${t.id}"><noscript><p class="tool-status err">${Le('تحتاج هذه الأداة إلى تفعيل JavaScript.', 'This tool needs JavaScript enabled.')}</p></noscript></div></section>
  <div class="note" style="margin-bottom:26px"><span class="ni">${svg(t.cat === 'ai' ? 'sparkles' : 'lock', 'ic sm')}</span><span>${Le(pv[0], pv[1])}</span></div>
  ${adSlot()}
  <section style="margin:36px 0"><h2 style="font-size:26px;margin-bottom:16px">${Le('طريقة الاستخدام', 'How to use')}</h2><div class="how">${how.map((s) => `<div><b>${Le(s[0], s[1])}</b></div>`).join('')}</div></section>
  ${G ? `<section class="guide" style="margin:36px 0"><h2 style="font-size:26px;margin-bottom:12px">${Le('دليل استخدام ' + t.ar, 'How to use ' + t.en + ': a guide')}</h2><p>${Le(G.ar.intro, G.en.intro)}</p><h3 style="font-size:20px;margin:18px 0 8px">${Le('الخطوات', 'Steps')}</h3><ol>${G.ar.steps.map((x, i) => `<li>${Le(x, G.en.steps[i])}</li>`).join('')}</ol><h3 style="font-size:20px;margin:18px 0 8px">${Le('نصائح', 'Tips')}</h3><ul>${G.ar.tips.map((x, i) => `<li>${Le(x, G.en.tips[i])}</li>`).join('')}</ul></section>` : ''}
  <section class="faq" style="margin:36px 0"><h2 style="font-size:26px;margin-bottom:16px">${Le('أسئلة شائعة', 'FAQ')}</h2>${faqs.map((f) => `<details><summary>${Le(f[0], f[1])}</summary><p>${Le(f[2], f[3])}</p></details>`).join('')}</section>
  <section style="margin:36px 0"><h2 style="font-size:26px;margin-bottom:16px">${Le('أدوات ذات صلة', 'Related tools')}</h2><div class="tgrid">${related.map(toolCard).join('')}</div><p style="margin-top:16px"><a class="btn" href="/category/${c.id}/">${Le('كل أدوات ' + c.ar, 'All ' + c.en)} →</a></p></section>
</div></main>`;
  write(`/tools/${t.id}/`, page(h, body, true));
}

// ---------- static pages ----------
function info(path, titleAr, titleEn, ar, en) {
  const h = head({ titleAr, titleEn, descAr: ar.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 150), path });
  write(path, page(h, `<main id="main"><div class="wrap"><div class="phead"><h1>${Le(titleAr, titleEn)}</h1></div><div class="prose">${L(ar, en)}</div></div></main>`));
}
const contactHtml = (ar) => (CONTACT ? `<p>${ar ? 'البريد الإلكتروني' : 'Email'}: <a href="mailto:${esc(CONTACT)}">${esc(CONTACT)}</a></p>` : '') + `<p>${ar ? 'للإبلاغ عن مشكلة أو اقتراح أداة جديدة، افتح طلبًا في' : 'To report a problem or suggest a new tool, open an issue on'} <a href="https://github.com/Taha8880/Utilityra/issues" rel="noopener">GitHub</a>.</p>`;
function staticPages() {
  info('/about/', 'عن Utilityra', 'About Utilityra',
    `<p>Utilityra منصة مجانية ثنائية اللغة (العربية والإنجليزية) تجمع أكثر من ${tools.length} أداة رقمية للطلاب والموظفين والمطورين وصنّاع المحتوى، لتنجز مهامك اليومية بسرعة ودون حساب أو تثبيت.</p><h2>مبادئنا</h2><ul><li><b>الخصوصية أولًا:</b> تعمل الأدوات داخل متصفحك، ولا يغادر نصّك أو ملفك جهازك إلا عند استخدامك لأداة ذكاء اصطناعي.</li><li><b>البساطة:</b> لكل أداة صفحتها ورابطها الثابت، وواجهة واضحة تأخذك إلى النتيجة بأقل خطوات.</li><li><b>الشفافية:</b> نوضح ما تفعله كل أداة وحدودها، ونذكّرك بمراجعة مخرجات الذكاء الاصطناعي قبل الاعتماد عليها.</li></ul><h2>أدوات الذكاء الاصطناعي</h2><p>تعمل أدوات الذكاء الاصطناعي عبر خادم يعالج الطلب ويعيد الإجابة. قد تحتوي الإجابات على أخطاء، فلا تعتمد عليها في القرارات الطبية أو القانونية أو المالية دون مراجعة مختص.</p><p>أنشأ الموقع Taha. ${contactHtml(true)}</p>`,
    `<p>Utilityra is a free bilingual (Arabic/English) toolbox with ${tools.length}+ digital tools for students, professionals, developers and creators, so you can finish everyday tasks fast, with no account and no install.</p><h2>Principles</h2><ul><li><b>Privacy first:</b> tools run in your browser. Your text or files leave your device only when you use an AI tool.</li><li><b>Simplicity:</b> every tool has its own page and permanent link, and a clean interface that gets you to the result in the fewest steps.</li><li><b>Transparency:</b> we explain what each tool does and where its limits are, and remind you to review AI output before relying on it.</li></ul><h2>AI tools</h2><p>AI tools send your request to a server that processes it and returns an answer. Answers can be wrong; do not rely on them for medical, legal or financial decisions without a professional.</p><p>Created by Taha. ${contactHtml(false)}</p>`);
  info('/privacy/', 'سياسة الخصوصية', 'Privacy Policy',
    `<p>آخر تحديث: ${YEAR}. نحترم خصوصيتك، وهذه السياسة توضح ما نجمعه وما لا نجمعه.</p><h2>ما تعالجه الأدوات داخل المتصفح</h2><p>أدوات النصوص والكود والصور وPDF والحاسبات تعمل على جهازك فقط. لا يتم رفع مدخلاتك أو ملفاتك إلى خوادمنا.</p><h2>أدوات الذكاء الاصطناعي</h2><p>عند استخدام أداة ذكاء اصطناعي يُرسل النص الذي تكتبه إلى مزود خدمة الذكاء الاصطناعي لمعالجته وإرجاع الإجابة. لا تُدخل كلمات مرور أو أرقام بطاقات أو بيانات شخصية حساسة. لا نخزّن محتوى الطلبات في قاعدة بيانات.</p><h2>التخزين المحلي</h2><p>نحفظ في متصفحك تفضيلاتك (اللغة والوضع الفاتح/الداكن) وأدواتك المفضلة والأخيرة. وفي مساعد Utilityra نحفظ ملاحظات قصيرة وملخصات محادثاتك السابقة محليًا فقط، لتتذكر السياق في زياراتك القادمة، ويمكنك مسحها في أي وقت من داخل المساعد. تُرسل هذه الملاحظات مع سؤالك إلى مزود الذكاء الاصطناعي لتحسين الإجابة.</p><h2>الإعلانات وملفات تعريف الارتباط</h2><p>قد نعرض إعلانات Google AdSense. تستخدم Google وشركاؤها ملفات تعريف الارتباط لعرض إعلانات بناءً على زياراتك لهذا الموقع ومواقع أخرى. يمكنك إدارة إعلانات Google المخصصة من <a href="https://adssettings.google.com" rel="noopener">إعدادات الإعلانات</a>، ومعرفة المزيد في <a href="https://policies.google.com/technologies/ads" rel="noopener">سياسة Google للإعلانات</a>.</p><h2>التحليلات</h2><p>نقيس الزيارات والأدوات الأكثر استخدامًا بشكل مجمّع ومجهول، دون ملفات تعريف ارتباط ودون تخزين عنوان IP. نحترم إعداد «عدم التتبع» (Do Not Track) في متصفحك.</p><h2>التواصل</h2>${contactHtml(true)}`,
    `<p>Last updated: ${YEAR}. We respect your privacy; this policy explains what we collect and what we do not.</p><h2>Tools that run in your browser</h2><p>Text, code, image, PDF and calculator tools run on your device only. Your input and files are not uploaded to our servers.</p><h2>AI tools</h2><p>When you use an AI tool, the text you type is sent to an AI provider to process and return an answer. Do not enter passwords, card numbers or sensitive personal data. We do not store request content in a database.</p><h2>Local storage</h2><p>Your browser stores your preferences (language, light/dark mode) and your favourite and recent tools. The Utilityra assistant also keeps short notes and summaries of earlier chats locally, only so it can remember context on your next visit; you can clear them at any time from inside the assistant. These notes are sent with your question to the AI provider to improve the answer.</p><h2>Ads and cookies</h2><p>We may show Google AdSense ads. Google and its partners use cookies to serve ads based on your visits to this and other sites. You can manage personalized ads in <a href="https://adssettings.google.com" rel="noopener">Ads Settings</a> and learn more in <a href="https://policies.google.com/technologies/ads" rel="noopener">Google’s advertising policy</a>.</p><h2>Analytics</h2><p>We measure visits and the most-used tools in aggregate and anonymously, without cookies and without storing IP addresses. We respect your browser’s Do Not Track setting.</p><h2>Contact</h2>${contactHtml(false)}`);
  info('/terms/', 'الشروط وإخلاء المسؤولية', 'Terms & Disclaimer',
    `<p>باستخدامك Utilityra فإنك توافق على هذه الشروط.</p><h2>الاستخدام</h2><p>الأدوات مقدمة «كما هي» دون أي ضمان بالدقة أو الملاءمة لغرض معين. أنت المسؤول عن مراجعة النتائج قبل استخدامها.</p><h2>الذكاء الاصطناعي</h2><p>قد تكون إجابات الذكاء الاصطناعي غير دقيقة أو ناقصة. لا تُعد بديلًا عن استشارة طبية أو قانونية أو مالية.</p><h2>الملفات</h2><p>احتفظ بنسخ أصلية من ملفاتك قبل معالجتها. لسنا مسؤولين عن أي فقدان بيانات.</p><h2>الأمان</h2><p>أدوات كلمات المرور والتشفير مخصصة للمساعدة العامة، ولا تُدخل فيها بيانات سرية حقيقية إن لم تكن واثقًا من بيئة جهازك.</p><h2>حقوق النشر</h2><p>© ${YEAR} Utilityra · ${Le('من تطوير Taha', 'Created by Taha')}.</p>`,
    `<p>By using Utilityra you agree to these terms.</p><h2>Use</h2><p>Tools are provided “as is” without warranty of accuracy or fitness for a particular purpose. You are responsible for reviewing results before use.</p><h2>AI</h2><p>AI answers may be inaccurate or incomplete and are not a substitute for medical, legal or financial advice.</p><h2>Files</h2><p>Keep original copies of your files before processing. We are not liable for data loss.</p><h2>Security</h2><p>Password and hashing tools are for general help; do not enter real secrets unless you trust your device environment.</p><h2>Copyright</h2><p>© ${YEAR} Utilityra · ${Le('من تطوير Taha', 'Created by Taha')}.</p>`);
  info('/contact/', 'اتصل بنا', 'Contact', `<p>يسعدنا سماع رأيك أو اقتراحك لأداة جديدة.</p>${contactHtml(true)}`, `<p>We would love to hear your feedback or tool suggestions.</p>${contactHtml(false)}`);
}

// ---------- 404, sitemap, robots, etc ----------
function misc() {
  const h = head({ titleAr: 'الصفحة غير موجودة', titleEn: 'Page not found', descAr: 'الصفحة المطلوبة غير موجودة.', path: '/404.html', noindex: true });
  const q = tools.slice(0, 6);
  const body = `<main id="main"><div class="wrap"><div class="phead"><span class="label">404</span><h1>${Le('الصفحة غير موجودة', 'Page not found')}</h1><p>${Le('ربما تغيّر الرابط. جرّب البحث عن الأداة:', 'The link may have changed. Try searching for the tool:')}</p></div><div class="searchbar"><input data-search type="search" aria-label="Search" data-ph-ar="ابحث عن أداة…" data-ph-en="Search tools…" placeholder="ابحث عن أداة…"><div class="sugg"></div></div><div class="tgrid" style="margin-top:40px">${q.map(toolCard).join('')}</div></div></main>`;
  writeFileSync(join(OUT, '404.html'), page(h, body));
  const urls = ['/', '/tools/', ...cats.map((c) => `/category/${c.id}/`), ...tools.map((t) => `/tools/${t.id}/`), '/about/', '/privacy/', '/terms/', '/contact/'];
  const day = new Date().toISOString().slice(0, 10);
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${day}</lastmod><changefreq>${u === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${u === '/' ? '1.0' : u.startsWith('/tools/') && u !== '/tools/' ? '0.8' : '0.6'}</priority></url>`).join('\n')}\n</urlset>\n`;
  // Keep the public XML asset and Worker response byte-for-byte identical.
  writeFileSync(join(OUT, 'sitemap.xml'), sitemapXml);
  writeFileSync(join(ROOT, 'worker/src/sitemap.generated.js'), '// Generated by build.mjs; do not edit.\nexport const SITEMAP_XML = ' + JSON.stringify(sitemapXml) + ';\n');
  writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);
  if (ADSENSE) writeFileSync(join(OUT, 'ads.txt'), `google.com, ${ADSENSE.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`);
  writeFileSync(join(OUT, 'site.webmanifest'), JSON.stringify({ name: 'Utilityra', short_name: 'Utilityra', start_url: '/', display: 'standalone', background_color: '#FFFDFA', theme_color: '#E45A1F', icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }] }));
  // Legacy Blogger URLs -> new tool pages (works on Cloudflare; GitHub Pages ignores this file).
  try {
    const man = JSON.parse(readFileSync(join(ROOT, 'src/legacy-redirects.json'), 'utf8'));
    const lines = [];
    man.pages.forEach((p) => { const id = p.file.replace(/\.html$/, ''); const path = (p.url || '').replace(/^https?:\/\/[^/]+/, ''); if (path && tools.some((t) => t.id === id)) lines.push(`${path} /tools/${id}/ 301`); else if (path && ['about', 'contact', 'disclaimer', 'privacy-policy'].includes(id)) lines.push(`${path} /${{ 'privacy-policy': 'privacy', disclaimer: 'terms' }[id] || id}/ 301`); });
    const ALIAS = { 'sort-lines': 'line-sorter', 'remove-duplicate-lines': 'duplicate-line-remover', 'json-minifier': 'json-formatter', 'character-frequency': 'word-frequency', 'html-escape': 'html-entities', 'qr-generator': 'qr-code-generator', 'image-to-pdf': 'images-to-pdf', 'password-strength': 'password-strength-checker', 'pdf-metadata': 'pdf-page-info' };
    Object.entries(ALIAS).forEach(([a, t]) => lines.push(`/tools/${a} /tools/${t}/ 301`, `/tools/${a}/ /tools/${t}/ 301`));
    writeFileSync(join(OUT, '_redirects'), lines.join('\n') + '\n');
  } catch (e) { /* legacy manifest optional */ }
  if (existsSync(join(ROOT, 'src/static'))) cpSync(join(ROOT, 'src/static'), OUT, { recursive: true });
  writeFileSync(join(OUT, '_headers'), `/sw.js\n  Cache-Control: no-cache\n\n/admin/*\n  X-Robots-Tag: noindex\n  Cache-Control: no-store\n\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n  Cross-Origin-Opener-Policy: same-origin-allow-popups\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`);
}


function adminPage() {
  const h = head({ titleAr: 'لوحة الإدارة', titleEn: 'Admin', descAr: 'لوحة إدارة Utilityra', path: '/admin/', noindex: true });
  write('/admin/', page(h, `<main id="main"><div class="wrap"><div class="phead"><span class="label">ADMIN</span><h1>${Le('لوحة الإدارة', 'Admin dashboard')}</h1></div><div id="admin-root"></div></div></main><script src="/assets/js/index.js?v=${V.idx}"></script><script src="/assets/js/admin.js?v=${hash(adminJs)}" defer></script>`));
}


// ---------- site knowledge for the AI assistant ("awareness" of the site and how it evolved) ----------
function knowledge() {
  const cat = (id) => catOf(id);
  const lines = tools.map((t) => `${t.id} | ${t.en} | ${t.ar} | ${cat(t.cat).en}`).join('\n');
  let log = ''; try { log = readFileSync(join(ROOT, 'docs/CHANGELOG.md'), 'utf8'); } catch (e) { /* optional */ }
  const text = `ABOUT THE SITE OWNER: Utilityra was created by Taha (GitHub: Taha8880, repository Taha8880/Utilityra). Contact page: /contact/. Built as static pages generated by build.mjs plus a Cloudflare Worker (AI gateway, URL inspector, admin API). Do not invent further personal details about the creator.\nUtilityra facts: free bilingual (Arabic/English) toolbox with ${tools.length} tools, each at /tools/<id>/ (categories at /category/<id>/). Most tools run in the browser; AI tools call the server. Admin panel at /admin/ (owner only).\nTOOL CATALOG (id | English | Arabic | category). When a tool fits the user's need, recommend it with its link /tools/<id>/.\n${lines}\n\nCHANGELOG / HOW THE SITE EVOLVED:\n${log}`;
  writeFileSync(join(ROOT, 'worker/src/knowledge.generated.js'), '// Generated by build.mjs - do not edit.\nexport const SITE_KNOWLEDGE = ' + JSON.stringify(text) + ';\n');
}
knowledge();

// ---------- service worker: offline-friendly (static pages + assets only; never touches /api or /admin) ----------
function serviceWorker() {
  const v = hash(css + appJs + toolsJs + indexJs);
  writeFileSync(join(OUT, 'sw.js'), `const CACHE = 'utilityra-${v}';
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/tools/', '/assets/css/app.css?v=${V.css}', '/assets/js/app.js?v=${V.app}', '/assets/js/index.js?v=${V.idx}']).catch(() => {}))); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname.startsWith('/admin') || u.pathname === '/health' || u.pathname === '/sw.js') return;
  if (r.mode === 'navigate' || (r.headers.get('accept') || '').includes('text/html')) { e.respondWith(fetch(r).then((res) => { if (res.ok) caches.open(CACHE).then((c) => c.put(r, res.clone())); return res; }).catch(() => caches.open(CACHE).then(async (c) => (await c.match(r)) || (await c.match('/tools/')) || Response.error()))); return; }
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(r);
    const net = fetch(r).then((res) => { if (res.ok && (res.type === 'basic')) c.put(r, res.clone()); return res; }).catch(() => hit || (r.mode === 'navigate' ? c.match('/tools/') : undefined));
    return hit || net;
  }));
});
`);
}
serviceWorker();

home();
adminPage();
listing({ path: '/tools/', titleAr: 'كل الأدوات المجانية', titleEn: 'All Free Tools', descAr: `تصفح ${tools.length} أداة مجانية أونلاين: ذكاء اصطناعي، PDF، صور، مطورين، حاسبات، دراسة وأكثر.`, descEn: `Browse ${tools.length} free online tools: AI, PDF, images, developer utilities, calculators, study and more.` });
cats.forEach((c) => listing({ path: `/category/${c.id}/`, cat: c.id, titleAr: c.ar, titleEn: c.en, descAr: c.dAr, descEn: c.dEn }));
tools.forEach(toolPage);
staticPages();
misc();
console.log(`Built ${tools.length} tool pages, ${cats.length} categories -> ${OUT} (site: ${SITE})`);
