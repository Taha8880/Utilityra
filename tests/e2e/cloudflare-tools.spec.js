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
  await expect(page.locator('#htmlFrame')).toHaveJSProperty('srcdoc', /Preview works/);
});
