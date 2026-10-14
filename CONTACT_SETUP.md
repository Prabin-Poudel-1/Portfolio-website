User verification: The owner confirmed the Web3Forms contact form is working after testing it locally. Publication was subsequently authorized.

## Web3Forms update — 14 October 2026

The owner supplied a Web3Forms access key. The frontend now enables sending through `https://api.web3forms.com/submit`, adds the public routing key to FormData, and requires an HTTP-success response with `success: true` before resetting the form. Existing timeout, validation, duplicate protection, honeypot, and email fallback remain. The recipient is controlled by the email associated with the key in Web3Forms; confirm it there if needed. The key is intended for browser use, not an account password.

No real email was sent during implementation. End-to-end delivery remains untested. The earlier disabled Apps Script status below is historical and no longer describes the active frontend provider. No DNS, Cloudflare routing, CV, commit, push, or deployment changes were made.

---

# Contact delivery setup

## Current status — 14 October 2026

The old Apps Script `/exec` URL returned HTTP 403 on a read-only GET from this environment. This does not prove how POST behaves, but it is not a verified public endpoint. No real messages were sent and no deployment settings were changed. The form is intentionally disabled through `contact-config.js` (`enabled: false`). Visitors can email `contact@poudelprabin.com.np` or copy the address.

Cloudflare Email Routing already handles incoming forwarding. It is not assumed to provide SMTP or an outgoing mailbox. DNS and routing were not changed. The old Gmail fallback is retained in a private local note outside this repository, not in public HTML, JavaScript, or this guide. The existing CV was preserved unchanged.

## Likely failure points

- Deployment access: an archived deployment, owner-only access, Google sign-in requirement, or Workspace restriction can produce 403/login HTML.
- `/dev` is an editor test URL. The site must use the deployed `/exec` URL.
- Apps Script ContentService responses redirect to a Google-hosted content URL. Browser fetch must follow redirects and receive a readable CORS response. A server-side request succeeding does not establish browser CORS success.
- JSON parsing fails if Google returns a login/error page or if the script returns HTML rather than the expected JSON.
- Permissions/quota/backend errors can prevent MailApp or the existing storage operation from completing.
- A timeout is ambiguous: aborting fetch does not cancel a server-side message. Never automatically retry and report success without confirmation.

## Preferred repair: existing Apps Script

1. Open the existing script in its owner account. Review `doPost(e)` and Executions; confirm it reads `e.parameter.name`, `email`, `message`, and `website` from multipart form data.
2. Keep the recipient/fallback address in server-side Script Properties. Do not add credentials or private routing addresses to this repository.
3. Validate trimmed name/email/message and maximum lengths (120/254/5000). Reject a nonempty `website` honeypot. Add server-side quota/rate controls and deduplication if needed; frontend timing/cooldown controls are only basic deterrents.
4. Return `ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON)` only after the actual mail/storage operation succeeds. On validation/backend failure return an error result, not success. Do not echo sensitive exceptions.
5. Under Deploy → Manage deployments, update the Web app to the reviewed version. For a public portfolio, execution and access must permit anonymous visitors to submit without signing in (typically execute as owner, access Anyone, subject to account policy). The owner must authorize required scopes. This task did not change these permissions.
6. Copy the deployment's `/exec` URL into `contact-config.js`, retaining provider `apps-script`.
7. With owner approval for a real test message, verify from the portfolio origin in a logged-out browser: POST, redirect chain, readable JSON `{result: "success"}`, and receipt. Examine Console/Network for CORS or HTML responses. Only then set `enabled: true` for publication. A GET-only check is insufficient.
8. If anonymous access is prohibited or CORS cannot be made reliable, use the compatible Formspree path below. Do not use `mode: "no-cors"`: an opaque response cannot confirm acceptance.

## Formspree alternative (not configured)

Create/verify a form in your own Formspree account, confirm the recipient and provider spam controls, then set `provider: "formspree"` and `endpoint` to the exact URL supplied by Formspree. No form ID was invented. Keep `enabled: false` until an approved browser delivery test succeeds. The frontend sends FormData with `Accept: application/json` and requires an HTTP-success JSON response with `ok: true`.

After modifying configuration, increment its cache-version reference in `index.html`. No API secret belongs in the public config. Keep the direct email link available even after enabling sending.

## Frontend verification

Mocked tests cover confirmed acceptance for both providers, backend rejection, HTTP failure, network/CORS failure, non-JSON response, timeout, duplicate submission suppression, disabled configuration, honeypot, and whitespace validation. Failed submissions retain entered text. Loading uses an accessible status and `aria-busy`; the submit button stays disabled while pending. Live delivery remains unverified.
