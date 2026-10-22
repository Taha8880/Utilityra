import fs from "node:fs/promises";
import path from "node:path";

const required = ["BLOGGER_BLOG_ID", "GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET", "GOOGLE_OAUTH_REFRESH_TOKEN"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required GitHub Actions secret/variable: ${key}`);
    process.exit(1);
  }
}

const mode = (process.env.PUBLISH_MODE || "draft").toLowerCase();
if (!["draft", "publish"].includes(mode)) {
  console.error("PUBLISH_MODE must be draft or publish");
  process.exit(1);
}

const root = process.cwd();
const manifestPath = path.join(root, "blogger-pages", "manifest.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest.pages) || manifest.pages.length === 0) {
  console.error("manifest.json must contain at least one page");
  process.exit(1);
}

async function getAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
      grant_type: "refresh_token"
    })
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error("Google OAuth refresh failed. Check OAuth client and refresh-token secrets.");
  }
  return data.access_token;
}

const accessToken = await getAccessToken();
const blogId = encodeURIComponent(process.env.BLOGGER_BLOG_ID);
const api = `https://www.googleapis.com/blogger/v3/blogs/${blogId}`;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let lastRequestAt = 0;
async function apiRequest(url, options = {}) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const gap = 1100 - (Date.now() - lastRequestAt);
    if (gap > 0) await delay(gap);
    lastRequestAt = Date.now();
    const response = await fetch(url, {
      ...options,
      signal: options.signal || AbortSignal.timeout(15000),
      headers: {
        authorization: "Bearer " + accessToken,
        "content-type": "application/json",
        ...(options.headers || {})
      }
    });
    if (response.ok) return await response.json().catch(() => ({}));
    const retryable = response.status === 429 || [500, 502, 503, 504].includes(response.status);
    if (retryable && attempt < 5) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(30000, retryAfter * 1000)
        : Math.min(30000, 1500 * (2 ** attempt));
      console.warn("Blogger API returned HTTP " + response.status + "; retry " + (attempt + 1) + "/5 after " + waitMs + "ms.");
      await delay(waitMs);
      continue;
    }
    const err = new Error("Blogger API request failed (HTTP " + response.status + "). Check blog ID, OAuth scope and page permissions.");
    err.status = response.status;
    throw err;
  }
  throw new Error("Blogger API request retry limit reached.");
}

async function listPages(status) {
  const pages = [];
  let pageToken;
  do {
    const url = new URL(api + "/pages");
    url.searchParams.set("maxResults", "100");
    url.searchParams.set("status", status);
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const result = await apiRequest(url.toString());
    pages.push(...(result.items || []));
    pageToken = result.nextPageToken;
  } while (pageToken);
  return pages;
}
const existing = await listPages("LIVE");
const uniqueExisting = Array.from(new Map(existing.filter(page => page.id).map(page => [page.id, page])).values());

for (const item of manifest.pages) {
  if (!item.title || !item.file) throw new Error("Every page needs title and file in manifest.json");
  const filename = path.join(root, "blogger-pages", item.file);
  const content = (await fs.readFile(filename, "utf8"));
  if (content.includes("REPLACE-WITH-YOUR-WORKER")) {
    console.warn(`WARNING: ${item.file} still contains an unconfigured Worker URL.`);
  }
  const acceptedTitles = [item.title, item.legacyTitle].filter(Boolean);
  const normalizeTitle = title => String(title || "").replace(/\s*\|\s*(Flarivo|Toolora|Utilityra)$/i, "").trim().toLowerCase();
  const acceptedNormalizedTitles = acceptedTitles.map(normalizeTitle);
  const match = uniqueExisting.find(page =>
    acceptedTitles.some(title => page.title?.trim().toLowerCase() === title.trim().toLowerCase()) ||
    acceptedNormalizedTitles.includes(normalizeTitle(page.title))
  );
  const normalizeContent = value => String(value || "").replace(/\r\n/g, "\n").trim();
  if (match && mode === "publish" && match.title?.trim() === item.title.trim()
      && normalizeContent(match.content) === normalizeContent(content)) {
    console.log("Skipped unchanged page: " + item.title + " " + (match.url || ""));
    continue;
  }
  const body = { title: item.title, content };
  if (!match && mode === "draft") {
    console.log("Dry run: would create " + item.title + "; no Blogger page was changed.");
    continue;
  }
  if (!match) {
    // Create using the legacy title first so Blogger generates the already-planned stable slug.
    // Then rename the page while it is still a draft; only publish when mode explicitly requests it.
    const createUrl = new URL(api + "/pages");
    createUrl.searchParams.set("isDraft", "true");
    const created = await apiRequest(createUrl.toString(), {
      method: "POST",
      body: JSON.stringify({ title: item.legacyTitle || item.title, content })
    });
    let prepared = created;
    if (item.legacyTitle) {
      prepared = await apiRequest(api + "/pages/" + encodeURIComponent(created.id), {
        method: "PATCH",
        body: JSON.stringify({ title: item.title, content })
      });
    }
    if (mode === "publish") {
      prepared = await apiRequest(api + "/pages/" + encodeURIComponent(created.id) + "?publish=true", {
        method: "PATCH",
        body: JSON.stringify({ title: item.title, content })
      });
    }
    console.log((mode === "draft" ? "Created draft" : "Created and published") + ": " + prepared.title + " " + (prepared.url || "") + " (legacy slug preserved where applicable)");
  } else if (mode === "draft") {
    // Do not overwrite an existing published page automatically in draft mode.
    console.log(`Skipped existing page in draft mode: ${item.title} (ID ${match.id})`);
  } else {
    const updated = await apiRequest(`${api}/pages/${encodeURIComponent(match.id)}?publish=true`, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
    console.log(`Updated/published: ${updated.title} ${updated.url || ""}`);
  }
}
console.log("Blogger sync finished. Review every created or updated page in Blogger before promoting changes.");
