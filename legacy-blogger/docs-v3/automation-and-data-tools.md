# Utilityra — automation, AI agents, quality and news data tools

This file distinguishes tools used to BUILD and TEST Utilityra from features that belong on the public Blogger site. Do not load developer tools or MCP servers in the public browser.

## Integration map

| Tool | Role | Placement | Status / constraints |
|---|---|---|---|
| Playwright | Browser tests for desktop/mobile navigation, forms, tool behavior and regressions | GitHub Actions CI | Starter smoke tests included; expand for every final page |
| Context7 | Current, version-specific library documentation for coding agents | Developer/agent environment via MCP | Optional; not a public-site dependency |
| Strix | AI-assisted security testing of an authorized staging deployment | Manual/isolated security workflow | Test only owned/authorized targets; review findings before fixes |
| ScrapeGraphAI | Structured extraction from permitted sources when HTML/RSS/API is insufficient | Optional Python runner or hosted API | May incur model/API costs |
| Scrapling | Python crawling/parsing for permitted sources | Optional scheduled runner | Respect robots.txt, terms, rate limits and copyright |
| MCP Agent Reach | Agent access to supported web/search/RSS/GitHub sources | Developer/agent environment | Verify exact upstream project and install source before enabling |
| Lighthouse / PageSpeed Insights | Performance, accessibility, SEO and best-practice audits | GitHub Actions + optional admin analyzer | Scheduled Lighthouse workflow included; PageSpeed API key is optional |
| GDELT DOC API | Global news discovery and event/topic research | Server-side feed adapter / scheduled job | Deduplicate, preserve source links/timestamps, and verify claims |
| RSS/Atom | Low-complexity discovery of source headlines | Server-side scheduled ingestion | Use publisher allowlist, caching, attribution; do not republish full articles |

## Recommended additions
- GitHub Actions for syntax checks, Playwright, dependency/security review and Lighthouse reports.
- OWASP ZAP baseline scan on staging; supplementary, not a replacement for manual review.
- Dependabot for dependency update alerts.
- Google Search Console and sitemap checks for indexing diagnostics; indexing/ranking is never guaranteed.
- Uptime monitoring for homepage and Worker /health with alerts on repeated failures.

## Architecture and safety rules
1. Blogger is the public UI and SEO host. Browser pages should remain usable if optional AI/search providers fail.
2. Cloudflare Worker is the server-side gateway for secrets and small JSON APIs. Never put API keys in Blogger HTML or public GitHub.
3. Python crawler libraries do not belong inside the Cloudflare Worker runtime. Run them separately on a controlled runner and send validated, normalized data to the site.
4. Never accept arbitrary URLs for server-side fetches. Use an allowlist to prevent SSRF and abuse.
5. Treat fetched pages, RSS descriptions, GDELT results and AI output as untrusted. Escape HTML, validate URLs and defend against prompt injection.
6. Cache public feed results, set timeouts and payload limits, deduplicate canonical URLs, and provide fallbacks.
7. Display headline, source, publication time and a link to the original. Aggregation does not guarantee accuracy.
8. AI may propose a patch or report. No production edits, theme replacement or deployment without tests and explicit human approval.

## Included
- Playwright config for desktop Chromium and mobile emulation.
- Basic homepage smoke tests; adapt to final theme landmarks.
- GitHub Actions workflows for browser tests and weekly/manual Lighthouse CI.
- Integration plan for Context7, Strix, Scrapling, ScrapeGraphAI, Agent Reach, GDELT and RSS.

## Not configured yet
Committing these files does not connect MCP servers or activate scraping. No API keys are set, no security scan has run against production, and RSS/GDELT ingestion remains a plan until sources, attribution, caching and scheduling are configured and tested.