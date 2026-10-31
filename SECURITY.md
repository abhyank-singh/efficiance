# Security

## Reporting a problem
Email **singhabhyank@gmail.com** with steps to reproduce. This is a personal portfolio project, so there is no bounty, but reports are welcome and will be answered.

## How the app is designed
- **Local-first.** Your tracked data lives in your browser. The server has no database and no login.
- **Public demo** (Render): fictional data, Google Calendar routes are switched off server-side, AI calls are rate-limited per visitor and per day, and the AI key never reaches the browser.
- **Personal build** (your own machine): binds to `127.0.0.1` only and answers only to `localhost` names, because it holds your Google Calendar token and has no login.
- **AI output is never trusted.** Quick Add actions are validated by `shared/schema.js` on the server and again in the browser, and nothing changes until you confirm.
- Headers: a strict Content-Security-Policy (no inline scripts), `X-Frame-Options: DENY`, `nosniff`, a Permissions-Policy, and HSTS over HTTPS.

## Security review (2026-10-31)
Method: the Cloudflare [security-audit](https://github.com/cloudflare/security-audit-skill) skill in its focused-review mode, not its full six-phase ledger run. Two independent read-only hunters (server and deployment; browser and supply chain) each returned candidates against the skill's evidence bar. A third, fresh agent tried to disprove every candidate. Source review only: no live probing and no dynamic testing.

| Finding | Build | Verdict | Status |
|---|---|---|---|
| Personal server listened on every network interface with no Host check, so a device on the same Wi-Fi, or a web page using DNS rebinding, could read the calendar events endpoint | personal | **Confirmed, medium** | Fixed: loopback bind and a Host allowlist (`tests/security.test.mjs`) |
| Google connect had no OAuth `state`, and `POST /disconnect` accepted cross-site requests | personal | **Confirmed, low** | Fixed: random `state` bound to an HttpOnly cookie; same-origin check on writes; token file is `0600` |
| Rate limit keyed on the raw IPv6 address, so rotating addresses inside a /64 could drain the shared daily AI quota | demo | **Needs validation** (depends on what address Render's edge reports) | Hardened: IPv6 keyed by /64, bounded memory. **Owner check below** |
| Host header placed into the HTML unescaped | both | **Rejected** (no victim-visible result) | Hardened anyway: only hostname characters are accepted |

Browser side: no candidates met the bar. The review found no HTML injection sinks, no model-supplied object keys, and a service worker that never touches `/api`.

**Dependency advisory fixed during the review:** `body-parser` < 1.20.9 (high, a denial of service from a malformed compressed request body, reachable on the public demo through Express). Lockfile bumped to 1.20.9; `npm audit` reports 0 vulnerabilities.

### One check for the owner (the "needs validation" item)
Open `https://<your-site>/api/health?ip=1` from your phone on mobile data. `clientIp` should be your own public address. If every visitor shows the same address, set `TRUST_PROXY=2` (or the right hop count) in Render's environment.

### Not covered
Dynamic testing, the hosting provider's own configuration, and a full dependency audit beyond `npm audit` (currently 0 vulnerabilities). Run `npm test` to repeat the checks above.
