# Flarivo Platform v1 — implementation blueprint

## Product direction
Build a useful tools-and-data platform, not a collection of thin keyword pages. The current staging catalog has 69 standalone utility pages spanning study, office, developer, design, time, calculations and image editing, PDF merging/splitting and file metadata inspection; keep tools distinct and tested rather than padding the count. Every public tool should have a stable Blogger Page URL, a unique title and description, plain-language instructions, error states, and internal links to related tools.

## Public site
- Blogger remains the public content and SEO host at `https://utilityra.blogspot.com/`.
- A new theme candidate is stored separately and must be reviewed on a backup/test copy before any manual Blogger theme upload.
- Each tool page is a separate Blogger Page. The GitHub workflow creates drafts by default; publishing requires an explicit workflow input.
- Local tools should work without AI credentials or backend availability.
- The theme uses GSAP Core for subtle entrance/stagger animations, with CSS fallback and `prefers-reduced-motion` support.
- A separate Worker-hosted `/admin` dashboard provides signed-session protection, aggregate analytics and owner/review exclusion. Configure it using `docs/admin-analytics-setup.md`.
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
- The admin AI opportunity report requires at least 20 eligible events and analyzes on-site tool usage and failed internal searches; it is not external keyword volume until Search Console or a licensed trend source is connected.
- AI can suggest tools but must not invent sources or publish untested code. Recommendations are not automatically merged or published; owner review and CI checks are required.

## Developer and quality integrations
| Integration | Purpose | Status in this repo |
|---|---|---|
| GitHub + Actions | Version control, validation and draft sync | Connected; validation runs on pull requests and the rebuild branch |
| Playwright | Desktop/mobile interaction tests | Connected; browser tests cover local tool flows and run in CI |
| Context7 | Version-specific developer documentation via MCP | Not connected; use official vendor docs as the verified fallback |
| Strix | Authorized security review of staging | Not connected or run; add only with explicit scope and authorization |
| ScrapeGraphAI | Structured extraction when an approved source lacks an API/feed | Not connected; prefer official APIs and RSS/Atom before paid extraction |
| Scrapling | Controlled parsing of approved public sources | Not connected; if needed, run separately from the Worker with robots/terms checks and rate limits |
| MCP Agent Reach | Agent access to supported search/RSS/GitHub sources | Not connected to the public app; use official APIs and GitHub Actions until permissions are reviewed |
| GDELT DOC 2.0 | Recent public news discovery | Adapter implemented in this branch at \`GET /api/trends?q=...\`; not live until the Worker is deployed |
| RSS/Atom | Efficient publisher-feed ingestion | Not yet connected; use an allowlist and cache only if a real data-catalog feature needs it |
| OpenAI / Gemini / Workers AI | AI assistance and transformations | Gateway supports these providers; live use depends on configured secrets/bindings and Worker deployment |
| First-party analytics | Aggregate page views, tool opens and failed searches | Client tracking and private dashboard are implemented in this branch; they require the Worker origin and D1 deployment |
| Google Search Console | Real Google query/impression/click demand | Not connected; requires owner-authorized access to the verified property |
| Dependabot / npm audit | Dependency risk alerts | Dependabot is configured; add an explicit audit gate before release |

## Release gates
1. Keep the current live Blogger theme, settings, and AdSense setup unchanged during development.
2. Test XML well-formedness and every page script before any publication.
3. Run browser tests on desktop and mobile, keyboard/accessibility checks, and Lighthouse.
4. Inspect drafts in Blogger; do not publish all pages automatically.
5. Upload a theme only after export/backup and a human visual review.
6. Never promise Google indexing, ranking, traffic, or AdSense approval.


## Demand-driven tool roadmap
1. Aggregate the site's successful tool opens/actions and failed internal searches without storing raw tool input.
2. Once at least 20 eligible events exist, let the AI propose up to eight new tools with the exact observed evidence, confidence and a test plan.
3. Add a Search Console integration only after the owner authorizes the correct verified property and read-only access; do not confuse on-site search with Google search volume.
4. Human review decides whether an idea merits implementation. Every new tool needs a distinct use case, accessible input/output, client-side privacy where practical, error handling, mobile tests and a regression test before publication.
5. AI responses must be calibrated: no fabricated sources, no claims of browsing without retrieval, no guarantee that every problem can be solved, and no autonomous public deployment.
