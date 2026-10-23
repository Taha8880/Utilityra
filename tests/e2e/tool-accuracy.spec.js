const { test, expect } = require('@playwright/test');

const BASE = 'https://utilityra.tavengers16.workers.dev';
const SLUGS = [
  'word-counter','text-cleaner','case-converter','text-compare','json-formatter',
  'csv-json-converter','base64-encoder-decoder','url-encoder-decoder','uuid-generator',
  'password-generator','timestamp-converter','percentage-calculator','scientific-calculator',
  'unit-converter','color-converter','number-base-converter','reading-time',
  'random-number-generator','age-calculator','gpa-calculator','html-escape','slug-generator',
  'sort-lines','remove-duplicate-lines','json-minifier','regex-tester','reverse-text',
  'json-to-csv','character-frequency','image-resizer','text-to-speech','html-preview',
  'qr-generator','pdf-merge','pdf-split','image-compressor','image-cropper','markdown-preview',
  'seo-auditor','api-tester','ai-assistant','json-diff','password-strength','image-to-pdf',
  'pdf-rotate','favicon-generator','accessibility-checker','page-speed-checker',
  'security-header-checker','contrast-checker','pdf-metadata'
];

async function openTool(page, slug) {
  const response = await page.goto(`${BASE}/tools/${slug}`, { waitUntil: 'domcontentloaded' });
  expect(response, `No HTTP response for ${slug}`).toBeTruthy();
  expect(response.status(), `Unexpected HTTP status for ${slug}`).toBe(200);
  await expect(page.locator('#app')).toBeVisible();
}

test('all registered tools resolve to their own tool page, not a homepage fallback', async ({ page }) => {
  for (const slug of SLUGS) {
    await openTool(page, slug);
    await expect(page.locator('h1'), `Missing title for ${slug}`).toBeVisible();
    await expect(page.locator('h1'), `Fallback page shown for ${slug}`).not.toContainText(/Tool not available yet|الأداة غير متاحة بعد/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${BASE}/tools/${slug}`);
  }
});

test('percentage calculator matches hand-calculated reference values and rejects empty inputs', async ({ page }) => {
  await openTool(page, 'percentage-calculator');
  await page.locator('#a').fill('200');
  await page.locator('#b').fill('12.5');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toContainText('25.00');
  await expect(page.locator('#out')).toContainText('225.00');
  await page.locator('#a').fill('');
  await page.locator('#run').click();
  await expect(page.locator('#status')).toContainText('خطأ');
});

test('unit conversions match standard reference factors', async ({ page }) => {
  await openTool(page, 'unit-converter');
  await page.locator('#input').fill('1');
  await page.locator('#unit').selectOption('km');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue(/0\.6214 miles/);
  await page.locator('#input').fill('0');
  await page.locator('#unit').selectOption('c');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue(/32\.0000 °F/);
  await page.locator('#input').fill('32');
  await page.locator('#unit').selectOption('f');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue(/0\.0000 °C/);
});

test('weighted GPA is calculated correctly and invalid weights are rejected', async ({ page }) => {
  await openTool(page, 'gpa-calculator');
  await page.locator('#input').fill('4,2');
  await page.locator('#second').fill('3,1');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue('3.50');
  await page.locator('#second').fill('3,0');
  await page.locator('#run').click();
  await expect(page.locator('#status')).toContainText('خطأ');
});

test('calculator handles precedence and refuses non-arithmetic expressions', async ({ page }) => {
  await openTool(page, 'scientific-calculator');
  await page.locator('#input').fill('2+3*4');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue('14');
  await page.locator('#input').fill('alert(1)');
  await page.locator('#run').click();
  await expect(page.locator('#status')).toContainText('خطأ');
});

test('timestamp conversion treats a 10-digit Unix value as seconds', async ({ page }) => {
  await openTool(page, 'timestamp-converter');
  await page.locator('#input').fill('0');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toContainText('1970-01-01T00:00:00.000Z');
  await expect(page.locator('#out')).toContainText('Unix: 0');
});

test('random number generator respects inclusive bounds', async ({ page }) => {
  await openTool(page, 'random-number-generator');
  await page.locator('#input').fill('7 7');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue('7');
  await page.locator('#input').fill('10 2');
  await page.locator('#run').click();
  await expect(page.locator('#status')).toContainText('خطأ');
});

test('UUID generator emits standard UUID v4-shaped identifiers', async ({ page }) => {
  await openTool(page, 'uuid-generator');
  await page.locator('#count').fill('3');
  await page.locator('#run').click();
  const result = await page.locator('#out').inputValue();
  const ids = result.trim().split(/\s+/);
  expect(ids).toHaveLength(3);
  for (const id of ids) expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  expect(new Set(ids).size).toBe(3);
});

test('Base64 conversion round-trips UTF-8 Arabic text', async ({ page }) => {
  await openTool(page, 'base64-encoder-decoder');
  await page.locator('#input').fill('مرحبا Utilityra');
  await page.locator('#run').click();
  const encoded = await page.locator('#out').inputValue();
  expect(encoded).toBe('2YXYsdit2KjYpyBVdGlsaXR5cmE=');
  await page.locator('#reverse').click();
  await expect(page.locator('#out')).toHaveValue('مرحبا Utilityra');
});

test('URL component encoding safely round-trips reserved characters', async ({ page }) => {
  await openTool(page, 'url-encoder-decoder');
  await page.locator('#input').fill('a b&c=1');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue('a%20b%26c%3D1');
  await page.locator('#reverse').click();
  await expect(page.locator('#out')).toHaveValue('a b&c=1');
});

test('text comparison identifies changed content and duplicate cleanup preserves order', async ({ page }) => {
  await openTool(page, 'text-compare');
  await page.locator('#input').fill('alpha\nbeta');
  await page.locator('#second').fill('alpha\ngamma');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toContainText('beta');
  await expect(page.locator('#out')).toContainText('gamma');
  await openTool(page, 'text-cleaner');
  await page.locator('#input').fill('  alpha   beta  \n\nalpha   beta');
  await page.locator('#run').click();
  await expect(page.locator('#out')).toHaveValue(/alpha beta/);
});

test('JSON formatter rejects malformed JSON and preserves valid values', async ({ page }) => {
  await openTool(page, 'json-formatter');
  await page.locator('#input').fill('{"a":1,"b":[true,null]}');
  await page.locator('#run').click();
  const formatted = await page.locator('#out').inputValue();
  expect(JSON.parse(formatted)).toEqual({ a: 1, b: [true, null] });
  await page.locator('#input').fill('{bad json');
  await page.locator('#run').click();
  await expect(page.locator('#status')).toContainText('خطأ');
});

test('contrast ratio matches WCAG reference for black text on white', async ({ page }) => {
  await openTool(page, 'contrast-checker');
  await page.locator('#foreground').fill('#000000');
  await page.locator('#background').fill('#ffffff');
  await page.locator('#checkContrast').click();
  await expect(page.locator('#contrastResults')).toContainText('21.00:1');
});
