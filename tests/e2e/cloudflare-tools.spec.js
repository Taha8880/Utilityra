const { test, expect } = require('@playwright/test');

const BASE = 'https://utilityra.tavengers16.workers.dev';

async function openTool(page, slug) {
  const response = await page.goto(`${BASE}/tools/${slug}`, { waitUntil: 'domcontentloaded' });
  expect(response && response.status()).toBe(200);
  await expect(page.locator('#app')).toBeVisible();
}

test('Cloudflare app serves a dedicated working tool route', async ({ page }) => {
  await openTool(page, 'word-counter');
  await expect(page.locator('h1')).toContainText('عداد الكلمات');
  await page.locator('#input').fill('one two\nthree');
  await expect(page.locator('#w')).toHaveText('3');
});

test('HTML encoder and slug generator work on the live Cloudflare app', async ({ page }) => {
  await openTool(page, 'html-escape');
  await page.locator('#input').fill('<b>Utilityra</b> &');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue('&lt;b&gt;Utilityra&lt;/b&gt; &amp;');
  await openTool(page, 'slug-generator');
  await page.locator('#input').fill('Hello Utilityra World!');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue('hello-utilityra-world');
});

test('line sorter and duplicate remover run on the live Cloudflare app', async ({ page }) => {
  await openTool(page, 'sort-lines');
  await page.locator('#input').fill('zebra\napple\nBanana');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue('apple\nBanana\nzebra');
  await openTool(page, 'remove-duplicate-lines');
  await page.locator('#input').fill('alpha\nbeta\nalpha');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue('alpha\nbeta');
});

test('JSON minifier validates input and compacts valid JSON', async ({ page }) => {
  await openTool(page, 'json-minifier');
  await page.locator('#input').fill('{ "a": 1, "b": [ true ] }');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue('{"a":1,"b":[true]}');
  await page.locator('#input').fill('{broken');
  await page.locator('#run').click();
  await expect(page.locator('#status')).toContainText('خطأ');
});

test('regex tester returns matching text and positions', async ({ page }) => {
  await openTool(page, 'regex-tester');
  await page.locator('#input').fill('cat 123 dog 456');
  await page.locator('#pattern').fill('[0-9]+');
  await page.locator('#flags').fill('g');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue(/123.*456/s);
});

test('JSON to CSV exports values with commas safely quoted', async ({ page }) => {
  await openTool(page, 'json-to-csv');
  await page.locator('#input').fill('[{"name":"A, B","age":20},{"name":"Mona","age":25}]');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue(/"A, B",20/);
});

test('image resizer loads an image and exposes a PNG download', async ({ page }) => {
  await openTool(page, 'image-resizer');
  const base64 = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 2; c.height = 2;
    const x = c.getContext('2d'); x.fillStyle = '#00aa88'; x.fillRect(0,0,2,2);
    return c.toDataURL('image/png').split(',')[1];
  });
  await page.locator('#imageFile').setInputFiles({ name: 'sample.png', mimeType: 'image/png', buffer: Buffer.from(base64, 'base64') });
  await expect(page.locator('#width')).toHaveValue('2');
  await page.locator('#width').fill('1');
  await page.locator('#height').fill('1');
  await page.locator('#resizeImage').click();
  await expect(page.locator('#downloadImage')).toBeVisible();
  await expect(page.locator('#downloadImage')).toHaveAttribute('href', /^blob:/);
});

test('text-to-speech and isolated HTML preview controls initialize', async ({ page }) => {
  await openTool(page, 'text-to-speech');
  await expect(page.locator('#speakText')).toBeVisible();
  await openTool(page, 'html-preview');
  await page.locator('#input').fill('<h2>Preview works</h2>');
  await page.locator('#previewHtml').click();
  await expect(page.locator('#htmlFrame')).toHaveAttribute('sandbox', '');
  await expect(page.frameLocator('#htmlFrame').locator('h2')).toHaveText('Preview works');
});


test('QR generator creates a downloadable QR code', async ({ page }) => {
  await openTool(page, 'qr-generator');
  await page.locator('#input').fill('https://utilityra.tavengers16.workers.dev/');
  await page.locator('#makeQr').click();
  await expect(page.locator('#qrCanvas canvas, #qrCanvas img').first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#downloadQr')).toBeVisible();
});

test('PDF merger merges two browser-generated PDFs', async ({ page }) => {
  await openTool(page, 'pdf-merge');
  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js' });
  const pdfs = await page.evaluate(async () => {
    const result = [];
    for (const text of ['First page', 'Second page']) {
      const doc = await PDFLib.PDFDocument.create();
      const p = doc.addPage([300, 200]);
      p.drawText(text, { x: 20, y: 100 });
      result.push(Array.from(await doc.save()));
    }
    return result;
  });
  await page.locator('#pdfFiles').setInputFiles(pdfs.map((bytes, i) => ({
    name: 'sample-' + i + '.pdf', mimeType: 'application/pdf', buffer: Buffer.from(bytes)
  })));
  await page.locator('#mergePdf').click();
  await expect(page.locator('#downloadPdf')).toBeVisible({ timeout: 30000 });
  const href = await page.locator('#downloadPdf').getAttribute('href');
  expect(href).toMatch(/^blob:/);
});

test('PDF page extractor validates page ranges and exports a PDF', async ({ page }) => {
  await openTool(page, 'pdf-split');
  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js' });
  const bytes = await page.evaluate(async () => {
    const doc = await PDFLib.PDFDocument.create();
    doc.addPage([300, 200]); doc.addPage([300, 200]);
    return Array.from(await doc.save());
  });
  await page.locator('#pdfFile').setInputFiles({ name: 'two-pages.pdf', mimeType: 'application/pdf', buffer: Buffer.from(bytes) });
  await page.locator('#pages').fill('2');
  await page.locator('#splitPdf').click();
  await expect(page.locator('#downloadPdf')).toBeVisible({ timeout: 30000 });
  await page.locator('#pages').fill('0');
  await page.locator('#splitPdf').click();
  await expect(page.locator('#status')).toContainText('خطأ');
});

test('image compressor exports an image and markdown preview escapes HTML', async ({ page }) => {
  await openTool(page, 'image-compressor');
  const png = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 4; c.height = 4;
    c.getContext('2d').fillRect(0, 0, 4, 4);
    return c.toDataURL('image/png').split(',')[1];
  });
  await page.locator('#imageFile').setInputFiles({ name: 'tiny.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await page.locator('#compressImage').click();
  await expect(page.locator('#downloadImage')).toBeVisible();
  await openTool(page, 'markdown-preview');
  await page.locator('#input').fill('# Heading\n\n<script>bad()</script>\n\n**bold**');
  await page.locator('#renderMarkdown').click();
  await expect(page.locator('#markdownOutput h1')).toHaveText('Heading');
  await expect(page.locator('#markdownOutput strong')).toHaveText('bold');
  await expect(page.locator('#markdownOutput script')).toHaveCount(0);
});

test('SEO audit and JSON diff produce useful results', async ({ page }) => {
  await openTool(page, 'seo-auditor');
  await page.locator('#input').fill('<html><head><title>Test page title long enough for auditing</title><meta name="description" content="This is a description with enough words to make the SEO checker analyze the page description content correctly."><link rel="canonical" href="https://example.com"><meta property="og:title" content="Test"></head><body><h1>Main</h1><img src="x"></body></html>');
  await page.locator('#auditSeo').click();
  await expect(page.locator('#seoResults')).toContainText('H1: 1');
  await openTool(page, 'json-diff');
  await page.locator('#input').fill('{"name":"A","count":1}');
  await page.locator('#second').fill('{"name":"B","count":1}');
  await page.locator('#compareJson').click();
  await expect(page.locator('#jsonDiffResult')).toContainText('name');
});

test('API tester and AI workspace have live controls', async ({ page }) => {
  await openTool(page, 'api-tester');
  await page.locator('#apiUrl').fill(new URL('/', BASE).toString());
  await page.locator('#sendApi').click();
  await expect(page.locator('#apiResult')).toContainText('Utilityra', { timeout: 15000 });
  await openTool(page, 'ai-assistant');
  await expect(page.locator('#aiProvider')).toBeVisible();
  await expect(page.locator('#askAi')).toBeVisible();
});

test('password strength is evaluated locally', async ({ page }) => {
  await openTool(page, 'password-strength');
  await page.locator('#input').fill('mV!9qP2#xL7@aZ4');
  await page.locator('#checkPassword').click();
  await expect(page.locator('#passwordResult')).toContainText('/10');
  await expect(page.locator('#status')).toContainText('لم تُرسل');
});
