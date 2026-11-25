---
name: modern-web-guidance
description: Offline library of Google Chrome's modern web best-practice guides (211 guides - HTML, CSS, client JS, forms, accessibility, PWA, performance, security, dialogs, dark mode, dates). Use at the start of implementing or changing web UI, CSS layout/animation or client-side JS, before writing ad-hoc code or adding a dependency.
---

# Modern Web Guidance (local copy)

Vendored from GoogleChrome/modern-web-guidance v1.0.2 (Apache-2.0, see `LICENSE`, `NOTICE.md`).
Upstream runs `npx -y modern-web-guidance@latest` on every call; this copy reads the same guides from disk instead: no network, no unpinned code.

## Workflow
1. **Find guides.** Search `INDEX.md` (one line per guide: path — title), then the guide bodies if needed. Use 2–5 word generic terms for one capability or UI primitive (`dialog`, `dark mode`, `form validation`, `install web app`), not app or framework names. Split compound tasks into separate searches.
   ```sh
   rg -i "dialog" .claude/skills/modern-web-guidance/INDEX.md
   rg -il "light dismiss" .claude/skills/modern-web-guidance/guides
   ```
2. **Read** the matching guide(s) plus the broad discipline guide that applies (`guides/html/html.md`, `guides/css/css.md`, `guides/js/js.md`, `guides/forms/forms.md`, `guides/accessibility/accessibility.md`, `guides/performance/performance.md`, `guides/security/security.md`) — read the needed line ranges, not whole folders.
3. **Verify** the implementation against the guide: modern pattern applied, required fallbacks present, nothing unrequested added.
4. **Disclose** in the delivery report: one short line per guide that shaped the code (`guides/...` path + the rule it applied). If guides were checked but none applied, say which in one sentence.

If no guide matches after one rephrase, proceed without one; never invent guide content.

## Browser support and fallbacks
- Guides assume **Baseline Widely available** features are safe without fallbacks. For anything newer, follow the guide's fallback advice unless `AGENTS.md` states a browser policy.
- AppFactory targets Android Chrome first, but apps must still work in other current browsers: feature-detect and degrade gracefully.
- Guides are vanilla HTML/CSS/JS, which matches AppFactory's default stack. Do not add libraries a guide does not require; respect `AGENTS.md` (no CDN scripts, no paid APIs).

## Not included
- `legacy-scan` (needs the upstream npm CLI) and the `chrome-extensions` skill (out of scope).
- `UPSTREAM-SKILL.md` is the unmodified upstream instructions, kept for reference only; do not follow its `npx` commands.
