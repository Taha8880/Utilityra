const { test, expect } = require('@playwright/test');

test('homepage responds and has a meaningful document title', async ({ page }) => {
  const response = await page.goto('/');
  expect(response, 'homepage should return a response').not.toBeNull();
  expect(response.status()).toBeLessThan(400);
  await expect(page).toHaveTitle(/.+/);
});

test('homepage declares a viewport for mobile devices', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
});

test('homepage has a main landmark or a body fallback', async ({ page }) => {
  await page.goto('/');
  const mainCount = await page.locator('main, [role="main"]').count();
  expect(mainCount).toBeGreaterThan(0);
});