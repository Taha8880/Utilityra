import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = "https://utilityra.blogspot.com/";
await fs.mkdir("browser-evidence", { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  page.setDefaultTimeout(20000);

  const response = await page.goto(baseUrl, {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });

  await page.waitForTimeout(2500);
  const result = {
    url: page.url(),
    title: await page.title(),
    status: response?.status() ?? null,
    heading: await page.locator("h1").first().textContent().catch(() => null),
    loginRedirect: /accounts\.google\.com/i.test(page.url()),
    checkedAt: new Date().toISOString(),
  };

  await page.screenshot({ path: "browser-evidence/utilityra-homepage.png", fullPage: true })
    .catch(async () => page.screenshot({ path: "browser-evidence/utilityra-homepage.png" }));

  await fs.writeFile(
    "browser-evidence/result.json",
    JSON.stringify(result, null, 2),
  );

  console.log(JSON.stringify(result, null, 2));
  if (!response || response.status() >= 500) {
    throw new Error(`Utilityra returned HTTP ${response?.status() ?? "no response"}`);
  }
} finally {
  await browser.close();
}
