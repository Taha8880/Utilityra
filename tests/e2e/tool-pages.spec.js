const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const pagesDir = path.join(__dirname, '..', '..', 'blogger-pages');
async function loadTool(page, filename) {
  const html = fs.readFileSync(path.join(pagesDir, filename), 'utf8');
  await page.route('https://utilityra.test/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html><head><meta charset="utf-8"><title>Tool test</title></head><body></body></html>' }));
  await page.goto('https://utilityra.test/');
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
}

test('CSV to JSON converter preserves rows and headers', async ({ page }) => {
  await loadTool(page, 'csv-json-converter.html');
  await page.locator('#ucj-input').fill('name,age\nMona,25\nOmar,31');
  await page.locator('#ucj-run').click();
  const rows = JSON.parse(await page.locator('#ucj-output').inputValue());
  expect(rows).toEqual([{ name: 'Mona', age: '25' }, { name: 'Omar', age: '31' }]);
});

test('CSV parser reports unclosed quoted fields', async ({ page }) => {
  await loadTool(page, 'csv-json-converter.html');
  await page.locator('#ucj-input').fill('name,note\nMona,"unfinished');
  await page.locator('#ucj-run').click();
  await expect(page.locator('#ucj-status')).toContainText('unclosed quoted field');
});

test('text cleaner removes duplicate and blank lines when selected', async ({ page }) => {
  await loadTool(page, 'text-cleaner.html');
  await page.locator('#utc-input').fill(' alpha   beta \n\nalpha beta\ngamma');
  await page.locator('#utc-blank').check();
  await page.locator('#utc-unique').check();
  await page.locator('#utc-run').click();
  await expect(page.locator('#utc-output')).toHaveValue('alpha beta\ngamma');
});

test('URL encoder and decoder round-trip Arabic text', async ({ page }) => {
  await loadTool(page, 'url-encoder-decoder.html');
  await page.locator('#uue-input').fill('أهلاً Utilityra & data');
  await page.locator('#uue-encode').click();
  const encoded = await page.locator('#uue-output').inputValue();
  expect(encoded).toContain('%');
  await page.locator('#uue-input').fill(encoded);
  await page.locator('#uue-decode').click();
  await expect(page.locator('#uue-output')).toHaveValue('أهلاً Utilityra & data');
});

test('Base64 encoder and decoder support UTF-8', async ({ page }) => {
  await loadTool(page, 'base64-encoder-decoder.html');
  await page.locator('#ube-input').fill('مرحبا Utilityra');
  await page.locator('#ube-encode').click();
  const encoded = await page.locator('#ube-output').inputValue();
  expect(encoded.length).toBeGreaterThan(0);
  await page.locator('#ube-input').fill(encoded);
  await page.locator('#ube-decode').click();
  await expect(page.locator('#ube-output')).toHaveValue('مرحبا Utilityra');
});

test('UUID generator produces the requested number of UUID v4 values', async ({ page }) => {
  await loadTool(page, 'uuid-generator.html');
  await page.locator('#uug-count').fill('3');
  await page.locator('#uug-run').click();
  const values = (await page.locator('#uug-output').inputValue()).split('\n');
  expect(values).toHaveLength(3);
  for (const value of values) expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test('password generator respects requested length and count', async ({ page }) => {
  await loadTool(page, 'password-generator.html');
  await page.locator('#upg-length').fill('24');
  await page.locator('#upg-count').fill('4');
  await page.locator('#upg-run').click();
  const values = (await page.locator('#upg-output').inputValue()).split('\n');
  expect(values).toHaveLength(4);
  for (const value of values) expect(value).toHaveLength(24);
  expect(new Set(values).size).toBe(4);
});

test('timestamp converter handles Unix seconds correctly', async ({ page }) => {
  await loadTool(page, 'timestamp-converter.html');
  await page.locator('#uts-input').fill('0');
  await page.locator('#uts-to-date').click();
  await expect(page.locator('#uts-output')).toHaveValue(/1970-01-01T00:00:00.000Z/);
});

test('percentage calculator handles discount and rejects zero denominator', async ({ page }) => {
  await loadTool(page, 'percentage-calculator.html');
  await page.locator('#upc-mode').selectOption('discount');
  await page.locator('#upc-a').fill('200');
  await page.locator('#upc-b').fill('15');
  await page.locator('#upc-run').click();
  await expect(page.locator('#upc-output')).toHaveValue(/Final price: 170.00/);
  await page.locator('#upc-mode').selectOption('change');
  await page.locator('#upc-a').fill('0');
  await page.locator('#upc-b').fill('10');
  await page.locator('#upc-run').click();
  await expect(page.locator('#upc-status')).toContainText('cannot be zero');
});

test('HTML entity encoder escapes markup rather than executing it', async ({ page }) => {
  await loadTool(page, 'html-entities.html');
  await page.locator('#uhe-input').fill('<script>alert(1)</script> &');
  await page.locator('#uhe-encode').click();
  await expect(page.locator('#uhe-output')).toHaveValue('&lt;script&gt;alert(1)&lt;/script&gt; &amp;');
  await expect(page.locator('script')).toHaveCount(1);
});


test('image compressor processes an image locally and offers a downloadable result', async ({ page }) => {
  await loadTool(page, 'image-compressor.html');
  const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGP4DwQACfsD/fteaysAAAAASUVORK5CYII=', 'base64');
  await page.locator('#uic-file').setInputFiles({ name: 'pixel.png', mimeType: 'image/png', buffer: pixel });
  await page.locator('#uic-run').click();
  await expect(page.locator('#uic-download')).toBeVisible();
  await expect(page.locator('#uic-download')).toHaveAttribute('href', /^blob:/);
  await expect(page.locator('#uic-image')).toBeVisible();
  await expect(page.locator('#uic-stats')).toContainText('Dimensions: 1 × 1 px');
});


test('number base converter returns binary, octal and hex', async ({ page }) => {
  await loadTool(page, 'number-base-converter.html');
  await page.locator('#number-base-converter-input').fill('255');
  await page.locator('#number-base-converter-run').click();
  await expect(page.locator('#number-base-converter-output')).toContainText('Binary: 11111111');
  await expect(page.locator('#number-base-converter-output')).toContainText('Hex: 0xFF');
});

test('JSON to XML converter escapes text and converts object fields', async ({ page }) => {
  await loadTool(page, 'json-to-xml.html');
  await page.locator('#json-to-xml-input').fill('{"name":"<test>","active":true}');
  await page.locator('#json-to-xml-run').click();
  await expect(page.locator('#json-to-xml-output')).toContainText('&lt;test&gt;');
});

test('SHA-256 tool returns the standard digest for abc', async ({ page }) => {
  await loadTool(page, 'sha256-hash.html');
  await page.locator('#sha256-hash-input').fill('abc');
  await page.locator('#sha256-hash-run').click();
  await expect(page.locator('#sha256-hash-output')).toHaveValue('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('color converter handles short HEX notation', async ({ page }) => {
  await loadTool(page, 'color-converter.html');
  await page.locator('#color-converter-input').fill('#fff');
  await page.locator('#color-converter-run').click();
  await expect(page.locator('#color-converter-output')).toContainText('RGB rgb(255, 255, 255)');
});

test('unit converter converts kilometres to miles', async ({ page }) => {
  await loadTool(page, 'unit-converter.html');
  await page.locator('#unit-converter-input').fill('5 km to mi');
  await page.locator('#unit-converter-run').click();
  await expect(page.locator('#unit-converter-output')).toContainText('3.10685596');
});

test('image filter tool accepts a local image and exports a PNG', async ({ page }) => {
  await loadTool(page, 'image-filter-studio.html');
  const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGP4DwQACfsD/fteaysAAAAASUVORK5CYII=', 'base64');
  await page.locator('#ifs-file').setInputFiles({ name: 'pixel.png', mimeType: 'image/png', buffer: pixel });
  await page.locator('#ifs-run').click();
  await expect(page.locator('#ifs-dl')).toBeVisible();
  await expect(page.locator('#ifs-dl')).toHaveAttribute('href', /^blob:/);
});

test('JSON formatter reports malformed JSON and formats valid input', async ({ page }) => {
  await loadTool(page, 'json-formatter.html');
  await page.locator('#ujf-input').fill('{"name":"Utilityra","active":true}');
  await page.locator('#ujf-format').click();
  await expect(page.locator('#ujf-output')).toHaveValue(/Utilityra/);
  await page.locator('#ujf-input').fill('{bad');
  await page.locator('#ujf-format').click();
  await expect(page.locator('#ujf-status')).toContainText('Invalid JSON');
});

test('word counter updates counts for empty and non-empty text', async ({ page }) => {
  await loadTool(page, 'word-counter.html');
  await page.locator('#uwc-input').fill('One two\nThree.');
  await expect(page.locator('#uwc-words')).toHaveText('3');
  await expect(page.locator('#uwc-chars')).toHaveText('14');
  await page.locator('#uwc-clear').click();
  await expect(page.locator('#uwc-words')).toHaveText('0');
});
