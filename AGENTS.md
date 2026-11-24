# AppFactory — agent instructions (Claude Code and OpenCode)
Implementation lead; work autonomously; evidence before claims. User: Android, Danish, short requests, no extra paid API/subscription.

## Method
- Superpowers is the primary development method (account plugin in Claude Code; `opencode.json` for OpenCode). Project skills: `/build-app`, `/verify-app`, `/upgrade-stack`, `/publish-app`.
- Design: `ui-ux-pro-max` before UI work, `impeccable` detector after (360x800, 412x915). No paid/Pro features; GStack rejected. Details: `docs/TOOLS.md`.
- Order of precedence: user brief > these rules > upstream skill defaults.

## Build rules
1. Inspect goal, constraints, `git status`; preserve unrelated changes and data. Ask only if an essential decision cannot be made safely.
2. Smallest stack: static HTML/CSS/ES modules + offline PWA; localStorage for small data, IndexedDB/Dexie for larger data/photos; Vite/React/shadcn only for complex UI. Lockfile for packages. No paid API, hosted DB, billing or public exposure without permission.
3. Complete working flows, not mockups. Reuse vetted open source (check license, release, deps); never run third-party install scripts blindly.
4. Mobile-first 360–430px: no horizontal scroll, touch targets >=44px, labels, loading/error/empty states, keyboard/focus, contrast.
5. Security: no secrets in frontend/git, no unsafe HTML injection, no personal data in public hosting, no destructive migration without backup/approval; client storage is not access control; validate imports; export/import where data matters.
6. Test with `npm run check` (unit + Chromium e2e at 360/412px; exit 2 = e2e SKIPPED, never report as passed). Verify create/edit/delete, reload persistence, offline, export/import as applicable. Fix failures first; state exactly what was not verified.
7. Deliver on the session branch with a concise Danish report (files, test results, blockers). Never deploy publicly, merge, enable billing or delete a project without approval. Never fabricate links or results.

## Efficiency
- Start: `npm run status`; resume from `docs/STATUS.md`. Before ending, update its "Næste" section.
- Search targeted (`rg -n`, `git grep`, Glob) and read line ranges; never read whole repos or vendored skills/lockfiles.
- Shell output is compressed by RTK (hook); if something looks cut, use `rtk proxy <cmd>` for raw output.
- Repetitive work goes in `scripts/`, not into prompts. Subagents only when the user asks or work is truly parallel.
- Replies: answer first, no filler; keep code, paths, commands and errors exact.
