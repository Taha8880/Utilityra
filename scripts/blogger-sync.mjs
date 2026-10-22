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

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(`Blogger API request failed (HTTP ${response.status}). Check blog ID, OAuth scope and page permissions.`);
    err.status = response.status;
    throw err;
  }
  return payload;
}

const existing = [];
let pageToken;
do {
  const url = new URL(`${api}/pages`);
  url.searchParams.set("maxResults", "100");
  if (pageToken) url.searchParams.set("pageToken", pageToken);
  const result = await apiRequest(url.toString());
  existing.push(...(result.items || []));
  pageToken = result.nextPageToken;
} while (pageToken);

for (const item of manifest.pages) {
  if (!item.title || !item.file) throw new Error("Every page needs title and file in manifest.json");
  const filename = path.join(root, "blogger-pages", item.file);
  const content = (await fs.readFile(filename, "utf8")).replaceAll("Utilityra", "Toolora");
  if (content.includes("REPLACE-WITH-YOUR-WORKER")) {
    console.warn(`WARNING: ${item.file} still contains an unconfigured Worker URL.`);
  }
  const acceptedTitles = [item.title, item.legacyTitle].filter(Boolean);
  const normalizeTitle = title => String(title || "").replace(/\s*\|\s*(Toolora|Utilityra)$/i, "").trim().toLowerCase();
  const acceptedNormalizedTitles = acceptedTitles.map(normalizeTitle);
  const match = existing.find(page =>
    acceptedTitles.some(title => page.title?.trim().toLowerCase() === title.trim().toLowerCase()) ||
    acceptedNormalizedTitles.includes(normalizeTitle(page.title))
  );
  const body = { title: item.title, content };
  if (!match) {
    // Default is draft to protect the live site; publishing is an explicit workflow input.
    const url = new URL(`${api}/pages`);
    if (mode === "draft") url.searchParams.set("isDraft", "true");
    const created = await apiRequest(url.toString(), { method: "POST", body: JSON.stringify(body) });
    console.log(`${mode === "draft" ? "Created draft" : "Created page"}: ${created.title} ${created.url || ""}`);
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
