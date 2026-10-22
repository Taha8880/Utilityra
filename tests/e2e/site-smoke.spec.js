const { test, expect } = require('@playwright/test');

test('homepage responds and has a meaningful document title', async ({ page }) => {
  const response = await page.goto('/');
  expect(response, 'homepage should return a response').not.toBeNull();
  expect(response.status()).toBeLessThan(400);
  await expect(page).toHaveTitle(/.+/);
});

test('homepage renders readable page content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).not.toBeEmpty();
  const visibleText = (await page.locator('body').innerText()).trim();
  expect(visibleText.length, 'homepage should render visible text').toBeGreaterThan(20);
});

test('homepage contains navigation or a usable link', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('a[href]');
  await expect(links.first()).toBeVisible();
});
