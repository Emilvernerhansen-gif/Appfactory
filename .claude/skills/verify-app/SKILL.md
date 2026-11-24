---
name: verify-app
description: Independently review and test mobile web apps, persistence, offline behavior, accessibility and release readiness.
---
Read CLAUDE.md and acceptance criteria. Inspect diff for regressions, injection, secrets, destructive operations and license risks. Run npm test and build/lint if present. Run `npm run test:e2e` (Chromium at 360x800 and 412x915; exit 2 means skipped, report it as not run) and extend scripts/e2e.mjs for new flows; test navigation, main workflows, reload, error/empty states and no horizontal overflow. Check service worker update and offline if applicable, plus import/export. Inspect console errors. With the app served (`npm start`), run the `impeccable` detector at `--viewport 360x800` and `412x915` and fix or justify every finding. Correct defects and rerun affected tests. Distinguish passed, failed and not run; never invent results.
