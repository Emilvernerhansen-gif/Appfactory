# Open-source upgrades

## Installed (project-local, reviewed 2026-11-24)
| Tool | Source pin | License | Installed files | Role |
|---|---|---|---|---|
| UI/UX Pro Max 2.15.0 | nextlevelbuilder/ui-ux-pro-max-skill@8db36338810d0942567b97ce439affd1619fcf31 | MIT | `.claude/skills/ui-ux-pro-max/` (core skill only; upstream `scripts/tests` omitted) | Design-system choice before UI work. Python 3 stdlib, no network. |
| Impeccable 4.10.0 (engine 0.1.27) | pbakaus/impeccable@b49177d32788f2dc585c42831d845dacf1ebed2c | Apache-2.0 | `.claude/skills/impeccable/`, `.claude/agents/impeccable-*.md` | Critique, audit, polish and anti-pattern detector after UI work. |

How they were installed: files copied from the pinned commits above (equivalent to upstream `gh skill install` / Claude plugin layout), not via `npx` or global installers, so nothing outside the repo was changed except Impeccable's engine cache. Verification done:
- UI/UX Pro Max: upstream unit tests 235/235 OK at the pin; `search.py ... --design-system` returns a design system offline.
- Impeccable: launcher downloads `impeccable-linux-x64` 0.1.27 from GitHub Releases into `~/.impeccable/bin/` and verifies it against `scripts/engine-checksums.txt` (SHA-256); `engine-probe` OK; `detect` finds 6 anti-patterns on a deliberately bad test page and 0 on the starter at 360x800.
- Not installed on purpose: Impeccable's SessionStart/PostToolUse/Stop hooks (run the engine on every edit; `/verify-app` runs the detector instead), UI/UX Pro Max companion skills (`brand`, `banner-design`, `slides`, `design`, `design-system`, `ui-styling`; overlap with Impeccable or out of scope).
- Paid/optional features not to use: UI/UX Pro Max "Premium"; Impeccable `login`, Pro rules, `health on`, generated images. Impeccable telemetry is disabled through `.claude/settings.json` (`IMPECCABLE_NO_TELEMETRY=1`).
- Update: re-review upstream, copy the new pinned commit, rerun `npm test`, `npm run test:e2e` and the detector, and update this table.

## Ultra Efficiency Mode (2026-11-24)
| Tool | Pin | License | Where | Role |
|---|---|---|---|---|
| RTK 0.49.0 | rtk-ai/rtk tag v0.49.0 (master 9a94ec1 reviewed); release binaries pinned by SHA-256 in `scripts/setup.sh` | Apache-2.0 + BUSL-1.1 (free for own production use; v0.49.0 ships no `rtk-oss` asset) | `~/.local/bin/rtk` via `npm run setup`; Claude hook in `.claude/settings.json`; OpenCode plugin `.opencode/plugins/rtk.ts` (file emitted by `rtk init -g --opencode` 0.49.0) | Compresses shell output before the agent reads it. Telemetry opt-in only, forced off with `RTK_TELEMETRY_DISABLED=1`. |
| ccusage 20.1.1 | npm `ccusage@20.1.1` (repo fb31fa8) | MIT | `npm run usage` (npx, nothing committed) | Measures real token use from local logs. `--offline` + `DO_NOT_TRACK=1` = no ping. "Cost (USD)" is API-list-price equivalent, not a subscription charge. |
| Superpowers 7.0.2 | Claude Code: account plugin (synced, survives new sessions). OpenCode: `opencode.json` `#v7.0.2` | MIT | not vendored | Primary development method. |

Not used from RTK: pipelines (send content to another model with your API key), `rtk-proxy` (BUSL daemon), RTK Pro, `rtk init -g` (would edit global `~/.claude`; the project hook does the same per-repo).
Known limit: `npm test` has no RTK filter, and `rtk test` keeps only the last 5 lines (would hide which test failed). So `npm test` uses Node's `dot` reporter instead: one line of dots when green (`npm test` 1865 → 107 bytes incl. npm header), full assertion + stack when red. e2e prints failures always, passes only with `E2E_VERBOSE=1`.

### Evaluated and rejected
- **context-mode** (mksglu/context-mode@a2bced6, v2.2.3, Elastic License 2.0): MCP server + PreToolUse/PostToolUse/PreCompact hooks that sandbox tool output. Same job as RTK on the same hook (double rewriting of Bash), plus permanent MCP tool schemas in every turn and a non-OSI license. No documented net gain on top of RTK.
- **caveman** (JuliusBrussee/caveman@47c61be, Apache-2.0): 29 skills, its own hooks and engine; "read less" duplicates RTK and skills such as `verify-and-stop`, `investigate-first`, `*-review` duplicate Superpowers. Only the zero-cost idea is kept: one "answer first, no filler" line in `AGENTS.md`.
- **opencode** (anomalyco/opencode@2444918, MIT): not installed; it is an alternative agent. Compatibility verified with `opencode-ai@1.19.6` in an isolated HOME: `opencode debug config` loads both plugins, `opencode debug skill` lists all 6 project skills + 15 Superpowers skills (+ OpenCode's built-in `customize-opencode`) with no duplicate names; the RTK plugin rewrites `git status` → `rtk git status` under Bun. It reads `AGENTS.md` first (CLAUDE.md is a 1-line import of it) and `.claude/skills/` natively. Running it needs a model provider of your own; use only free/included ones.

## Evaluated and not installed (earlier)
- GStack (garrytan/gstack@afb68ac, MIT): requires Bun and a global install in `~/.claude/skills`, registers global hooks (skill routing, destructive guard, contracts), auto-update checks and outside reviews through Codex (separate login/subscription). It is a full workflow that overlaps AppFactory's build/verify/publish skills and Superpowers; its own README reports no gain in fix rate. Per this file's rule (instead of, not on top of), it is not added.

## Other candidates
Not installed by this starter. Use only where useful. Verify current upstream instructions and pin a reviewed release/commit before installing. No paid Claude API is needed to use Claude Code within its Pro limits.

- GStack: https://github.com/garrytan/gstack — broad engineering/QA workflow. Requires environment checks; use instead of, not on top of, other large workflows.
- GSD: https://github.com/gsd-build/get-shit-done — project planning and execution.
- Superpowers: https://github.com/obra/superpowers — systematic development and testing.
- UI/UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill — design skill; upstream CLI supports Claude. Verify project-local install.
- Impeccable: https://github.com/pbakaus/impeccable — design critique; upstream plugin or project install. Check Node/engine requirements.
- Anthropic Skills: https://github.com/anthropics/skills — official examples and skills.
- Playwright: https://github.com/microsoft/playwright — real browser tests. Install only if browser environment supports it.
- Vite: https://github.com/vitejs/vite — build tooling for complex apps.
- shadcn/ui: https://github.com/shadcn-ui/ui — React components.
- Dexie: https://github.com/dexie/Dexie.js — IndexedDB wrapper.
- pdf-lib: https://github.com/Hopding/pdf-lib — client-side PDFs.
- Transformers.js: https://github.com/huggingface/transformers.js — local browser AI; benchmark device and model size.

Claude cloud setup: https://code.claude.com/docs/en/claude-code-on-the-web — network access and setup scripts depend on the environment. If blocked, do not silently switch to paid services.
