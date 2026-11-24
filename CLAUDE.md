# AppFactory — repository instructions
You are the implementation lead. Work autonomously, but never claim a test or deployment succeeded without evidence. User operates on Android and prefers Danish, one short request, and no extra subscription/API charges.

## Build protocol
1. Inspect existing files, user goal, constraints and git status. Preserve unrelated changes and existing data. Identify acceptance criteria; ask only if an essential decision cannot be safely made.
2. Choose the smallest stack that actually meets requirements. Default: static HTML/CSS/ES modules + offline PWA, local storage only for small non-sensitive data; IndexedDB/Dexie for larger structured data and photos. For complex interfaces consider Vite/React and shadcn/ui. Use package versions with a lockfile. Never add a paid API, hosted database, billing or public exposure without permission.
3. Build complete working flows, not visual mockups. Reuse trusted open-source libraries when worthwhile; check upstream README, license, release, dependencies and compatibility. Do not run third-party install scripts blindly. Use existing installed skills when available; do not claim they are installed otherwise.
4. Mobile-first: 360–430px widths, no horizontal scrolling, touch targets >=44px, clear labels, loading/error/empty states, keyboard and focus, contrast, responsive layout. Avoid gratuitous effects and generic dashboard clutter.
5. Security: no secrets in frontend or git, no unsafe HTML injection, no personal data in public hosting, no destructive migration without backup/approval. Do not confuse client storage with authenticated access control. Validate imports. Provide export/import where data matters.
6. Test: run `npm test`, then `npm run test:e2e` (exit 2 = skipped, never report it as passed); run actual browser tests (Chromium at 360 and 412px) when available, verify create/edit/delete, reload persistence, offline and export/import as applicable. For new builds run build/lint as applicable. Fix failures before completion. If environment blocks a test, state exactly what was not verified.
7. Deliver changes on the session branch, concise Danish report with files, test results and any remaining blockers. Never deploy publicly, merge, enable billing or delete an existing project without approval. Do not fabricate links or test results.

## Skills
- `/build-app` for new apps or major changes
- `/verify-app` for independent QA
- `/upgrade-stack` for vetted optional open-source integrations
- `/publish-app` for release preparation after user approval

## Installed design skills (project-local, pinned; see docs/TOOLS.md)
AppFactory is the permanent development method in this repository: every app task follows the build protocol above, using the skills below in fixed roles so they never overlap.
- `ui-ux-pro-max` — **before UI work**: pick style, palette, font pairing and UX rules from its local database (`python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<product>" --design-system`). Python stdlib only, offline. Ignore its "Premium" upsell.
- `impeccable` — **after UI work / in QA**: critique, audit and polish; run the detector at phone widths: `sh .claude/skills/impeccable/scripts/impeccable detect --viewport 360x800 http://localhost:4173/` (also 412x915). Its engine binary downloads once from GitHub Releases and is checksum-verified. Do not use `login`, Pro rules, `health on`, image generation or any paid feature. Telemetry stays off via `.claude/settings.json`. Its hooks are deliberately not installed.
- GStack is evaluated and **not** installed (overlaps with AppFactory skills and Superpowers; global hooks, auto-update and Codex-based reviews). Do not add it on top.
- When both design skills apply, AppFactory rules (mobile-first, accessibility, no paid services) win over upstream defaults; the user's brief wins over all.

## Current starter
Static local-first PWA in `public/`; run `npm start` and open http://localhost:4173. `npm test` runs dependency-free Node tests. The demo is replaceable, but keep the requirements and verification discipline. `docs/TOOLS.md` describes upstream integrations, which are installed and which are rejected, and why.
