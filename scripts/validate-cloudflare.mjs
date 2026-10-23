import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../worker/public/index.html", import.meta.url), "utf8");
const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");
const match = html.match(/const T=\[([\s\S]*?)\n\];let lang=/);
if (!match) throw new Error("Cloudflare tool registry not found");
const entries = [...match[1].matchAll(/\["([a-z0-9-]+)","(text|data|web|math)","[^"]*","[^"]*","[^"]*","[^"]*","[^"]*","([a-z]+)"\]/g)];
const slugs = entries.map(m => m[1]);
if (slugs.length < 40) throw new Error("Expected at least 40 registered Cloudflare tools; found " + slugs.length);
if (new Set(slugs).size !== slugs.length) throw new Error("Duplicate tool slugs found");
for (const slug of ["word-counter","json-formatter","qr-generator","pdf-merge","pdf-split","image-compressor","image-cropper","markdown-preview","seo-auditor","api-tester","ai-assistant","json-diff","password-strength"]) {
  if (!slugs.includes(slug)) throw new Error("Required tool missing: " + slug);
}
const scriptStart = html.indexOf("<script>");
const scriptEnd = html.indexOf("</script>", scriptStart);
if (scriptStart < 0 || scriptEnd < 0) throw new Error("Main application script is missing");
new vm.Script(html.slice(scriptStart + 8, scriptEnd), { filename: "worker/public/index.html inline script" });
if (!worker.includes('url.pathname !== "/api/ai"')) throw new Error("AI API route is missing");
if (!worker.includes('homeUrl.pathname = "/"')) throw new Error("SPA root fallback is missing");
if (!worker.includes("https://cdn.jsdelivr.net") || !worker.includes("https://cdnjs.cloudflare.com")) throw new Error("Trusted tool library origins are not allowed by CSP");
console.log("PASS: Cloudflare HTML JavaScript parses.");
console.log("PASS: " + slugs.length + " unique tool routes are registered.");
console.log("PASS: Required QR, PDF, image, SEO, API and AI tools exist.");
console.log("PASS: Worker AI endpoint, SPA fallback and trusted library CSP are present.");
