# Utilityra Platform v1 — implementation blueprint

## Product direction
Build a useful tools-and-data platform, not a collection of thin keyword pages. Start with a compact set of reliable tools that solve distinct jobs. Every public tool should have a stable Blogger Page URL, a unique title and description, plain-language instructions, error states, and internal links to related tools.

## Public site
- Blogger remains the public content and SEO host at `https://utilityra.blogspot.com/`.
- A new theme candidate is stored separately and must be reviewed on a backup/test copy before any manual Blogger theme upload.
- Each tool page is a separate Blogger Page. The GitHub workflow creates drafts by default; publishing requires an explicit workflow input.
- Local tools should work without AI credentials or backend availability.
- Do not claim a file stays local unless its code actually processes it in the browser.

## Backend and data
- Cloudflare Worker is the server-side gateway. Provider credentials are Worker secrets only, never page source or Git.
- Cloudflare D1 schema is proposed in `worker/schema.sql`. No D1 database is provisioned or bound by this commit.
- Database records require provenance fields: source URL, license/usage notes, fetched time, verified time and status.
- RSS/Atom and GDELT adapters should store normalized metadata and link to publishers; do not republish full articles.
- Any crawler must use an allowlist, rate limits, timeouts, robots/terms checks and deduplication. Never expose an arbitrary URL-fetch endpoint.

## AI provider integrations
- OpenAI, Gemini and Cloudflare Workers AI are optional providers behind the Worker. Each can be absent; tools must fail with a helpful message and never leak secrets. Workers AI requires an explicit Cloudflare AI binding and may be subject to account usage limits or charges; it is not activated on the live site by this PR.
- Add provider budgets, request limits and abuse controls before enabling public AI.
- AI can suggest content or patches but cannot publish, modify theme settings or deploy code autonomously.

## Developer and quality integrations
| Integration | Purpose | Status in this repo |
|---|---|---|
| GitHub + Actions | Version control, validation and draft sync | Connected workflow files exist; verify every run |
| Playwright | Desktop/mobile interaction tests | CI scaffold exists; expand to actual tool flows |
| Lighthouse | Performance/accessibility/SEO audit | CI scaffold exists |
| Context7 | Version-specific developer documentation via MCP | Developer-time optional integration; not a public-site dependency |
| Strix | Authorized security review of staging | Not run; do not scan production without approval |
| ScrapeGraphAI | Structured extraction when a source has no usable API/feed | Optional runner/API; may incur usage costs |
| Scrapling | Crawl/parse approved public sources | Optional Python runner; not suitable inside a Cloudflare Worker |
| MCP Agent Reach | Agent access to supported search/RSS/GitHub sources | Optional developer environment integration; verify upstream package and permissions |
| GDELT | News/event discovery | Planned server-side adapter; source attribution and validation required |
| RSS/Atom | Efficient publisher feed ingestion | Planned; allowlist and caching required |
| OpenAI / Gemini / Workers AI | AI assistance and transformations | Gateway code supports these providers; keys/bindings/configuration must be verified separately |
| Dependabot / npm audit | Dependency risk alerts | Recommended CI hardening |

## Release gates
1. Keep the current live Blogger theme, settings, and AdSense setup unchanged during development.
2. Test XML well-formedness and every page script before any publication.
3. Run browser tests on desktop and mobile, keyboard/accessibility checks, and Lighthouse.
4. Inspect drafts in Blogger; do not publish all pages automatically.
5. Upload a theme only after export/backup and a human visual review.
6. Never promise Google indexing, ranking, traffic, or AdSense approval.
