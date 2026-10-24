# Launch and regression checklist

## Before publishing
- [ ] Export a Blogger theme backup and keep it outside the repository.
- [ ] Confirm the GitHub repository visibility is intentional.
- [ ] Add Worker secrets through Cloudflare dashboard; never commit keys.
- [ ] Create D1 and apply `worker/schema.sql` before expecting analytics to work.
- [ ] Set a unique `ADMIN_PASSWORD` and a separate random `ADMIN_SESSION_SECRET` in Cloudflare.
- [ ] Bind the Worker assets directory and verify `/admin` serves the private dashboard with noindex headers.
- [ ] Verify a wrong admin password is rejected, repeated attempts are throttled, and stats return 401 without a signed session.
- [ ] Set `window.FLARIVO_API_BASE` to the exact deployed Worker origin only after deployment.
- [ ] Use the admin dashboard owner-exclusion control on every browser/device used for owner review.
- [ ] Confirm known automated review/bot traffic and `?flarivo_review=1` are excluded on a best-effort basis.
- [ ] Confirm analytics stores no raw IP, uploaded file, or tool input; review the privacy policy before enabling tracking.
- [ ] Set allowed origin to the exact Blogger/custom domain.
- [ ] Verify GET /health does not expose secret values.
- [ ] Verify AI requests fail safely when provider keys are absent.
- [ ] Verify malformed JSON, empty messages, unsupported providers, and oversized messages are rejected.
- [ ] Test the core tools and image editing tools on Android Chrome and desktop.
- [ ] Verify the GSAP animations on desktop/mobile and confirm reduced-motion preferences disable animation.
- [ ] Check keyboard access, labels, readable contrast, and screen-reader status.
- [ ] Confirm each public tool has a unique title, description, useful instructions, and internal links.
- [ ] Inspect canonical URLs and sitemap in Blogger/Search Console.
- [ ] Test pages while logged out and in a private browser session.
- [ ] Do not promise indexing or AdSense approval; monitor real reports.

## AI security
- [ ] No API key appears in page source, repository, or client-side JavaScript.
- [ ] Add Cloudflare rate limiting / abuse protection before public launch.
- [ ] Set usage budgets and provider limits.
- [ ] Never let AI directly deploy code or change Blogger settings without human approval.