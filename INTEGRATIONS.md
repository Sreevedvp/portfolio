# Portfolio integrations

## Personal AI chatbot

The portfolio includes a Vercel API backed by Upstash Vector and DeepSeek through OpenRouter. Setup, Git-safe secrets, knowledge updates, and connecting the existing GitHub Pages frontend are documented in [CHATBOT_SETUP.md](CHATBOT_SETUP.md). Live activation requires the owner's provider credentials and vector ingestion.

Production URL: https://sreevedvp.github.io/portfolio/

The existing GitHub Pages workflow publishes this static app on pushes to `main`. It runs type checks and integration tests, then builds with `--base=/portfolio/`. The contact and Medium requests go directly to their CORS-enabled services from the visitor’s browser; they do not require a GitHub Pages backend, repository secrets, or an assistant automation. FormSubmit receives the production page URL in `_url`.


## Contact messages

The contact form posts directly to `https://formsubmit.co/ajax/sreevedvp@gmail.com`. No email credentials or API keys are exposed in the frontend. Visitor email is included as the reply-to address. The form validates lengths and email syntax, blocks duplicate clicks, uses a honeypot, preserves input on failures, and checks the provider's success field before showing an acknowledgement. A successful acknowledgement means the provider accepted the submission; it is not an inbox-delivery receipt.

### One-time activation

1. Open the portfolio contact form and submit a clearly labeled test message.
2. In `sreevedvp@gmail.com`, find FormSubmit's activation email (including Spam) and click its activation link.
3. Submit a second test from the intended deployed URL and confirm the message arrives with the correct reply-to address.

A setup message was sent with the inbox owner’s authorization. FormSubmit returned `success: false` and confirmed that its activation email was sent. Inbox activation and a subsequent delivery check are still pending.

Delivery cannot be considered verified until those steps succeed. This email-only activation must be completed by the inbox owner. The direct email link remains available if the provider is unavailable. No real messages are sent by the automated tests.

Service documentation: https://formsubmit.co/ajax-documentation and https://formsubmit.co/help

## Medium stories

Source: `https://medium.com/feed/@sreevedvp`, converted to browser-readable JSON by rss2json. The writing cards and command palette use the same feed state. Six recent stories appear on the page, with a link to the full Medium profile.

The app checks on first load, after returning to the page when the cache is older than ten minutes, and every ten minutes while the page is visible. Medium and rss2json may cache the upstream feed, so this is automatic polling, not instant push delivery. No rebuild or redeployment is needed to display new feed entries.

A verified snapshot of real public stories is bundled for the initial render. The latest successful response is cached locally; if the service fails, the page labels saved stories and offers a retry. HTML is converted to plain text, invalid dates and links are discarded, and article links are restricted to HTTPS Medium domains.

Medium documentation: https://help.medium.com/hc/en-us/articles/214874118-Using-RSS-feeds-of-profiles-publications-and-topics
Converter documentation: https://rss2json.com/docs

## Animation

GSAP provides hero entrances, staggered card reveals and desktop pointer parallax. CSS adds subtle signal pulses, scanlines, moving diagram packets, artwork drift and contact feedback. The desktop navigation has a motion toggle; on mobile it appears inside the menu. The preference is saved locally and always respects the system's reduced-motion preference. The graph can still be inspected while animation is paused.

## Validation

- `npm run lint`
- `npm run build`
- `npm test`
