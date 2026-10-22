# Toolora Platform v1 — implementation blueprint

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
| GitHub + Actions | Version control, validation and draft sync | Connected workflow files exist; verify every run |
| Playwright | Desktop/mobile interaction tests | CI scaffold exists; expand to actual tool flows |
| Lighthouse | Performance/accessibility/SEO audit | CI scaffold exists |
| Context7 | Version-specific developer documentation via MCP | Developer-time documentation aid; not a public-site dependency and not a live visitor integration |
| Strix | Authorized security review of staging | Not connected or run in this repo; use only against authorized staging, with existing tests as the immediate baseline |
| ScrapeGraphAI | Structured extraction when a source has no usable API/feed | Not connected; prefer official APIs and RSS first, then add only with a configured provider and cost limits |
| Scrapling | Crawl/parse approved public sources | Not connected to the public Worker; use a separate allowlisted Python runner only where site terms and robots rules permit |
| MCP Agent Reach | Agent access to supported search/RSS/GitHub sources | Not connected to the visitor-facing app; use GitHub Actions and documented APIs until the upstream MCP server is configured and permission-reviewed |
| GDELT | Public news/event discovery | Implemented read-only `/api/trends?q=...` adapter with HTTPS link filtering, a 7-day window, 10-result cap and 5-minute caching |
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


## Integration decisions: use the right source, not a list of logos

The named integrations are not all appropriate as runtime dependencies for a student/office/developer tools website. Do not claim a connector is active unless a working authenticated test proves it.

| Requested integration | Decision for Toolora v1 | Practical replacement / use |
|---|---|---|
| Context7 | Optional developer-time documentation lookup; not a public-site feature | Prefer official provider documentation and versioned links in the build workflow. No Context7 connection is configured in this repository. |
| Strix | Not connected or run; never scan production without authorization | CI syntax/unit/browser tests first; add a scoped security scanner and dependency audit before release. |
| ScrapeGraphAI | Not connected; can require a hosted key and incur costs | Official APIs and publisher RSS/Atom feeds first. Use extraction only for an allowlisted source with a documented license and tests. |
| Scrapling | Not connected; a Python crawling tool is not a Cloudflare Worker dependency | If needed later, run a separate controlled ingestion job with robots/terms checks, rate limits, timeouts and deduplication. |
| MCP Agent Reach | Not connected; not needed for the public runtime | Use the GitHub Actions, Blogger API and official source APIs that are already part of the repository workflow. |
| GDELT | Not connected; a news/event dataset does not measure demand for utility tools well | Prioritize first-party failed searches and, after property authorization, Google Search Console query/impression/click data. Add RSS/Atom only for a genuinely useful public data catalog. |

## Demand-driven tool roadmap
1. Aggregate the site's successful tool opens/actions and failed internal searches without storing raw tool input.
2. Once at least 20 eligible events exist, let the AI propose up to eight new tools with the exact observed evidence, confidence and a test plan.
3. Add a Search Console integration only after the owner authorizes the correct verified property and read-only access; do not confuse on-site search with Google search volume.
4. Human review decides whether an idea merits implementation. Every new tool needs a distinct use case, accessible input/output, client-side privacy where practical, error handling, mobile tests and a regression test before publication.
5. AI responses must be calibrated: no fabricated sources, no claims of browsing without retrieval, no guarantee that every problem can be solved, and no autonomous public deployment.
