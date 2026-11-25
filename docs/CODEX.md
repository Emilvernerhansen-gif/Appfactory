# Claude Code + Codex på Windows

Claude bygger, Codex læser korrektur. Begge følger `AGENTS.md` (Codex læser den direkte; `CLAUDE.md` importerer den).
Koster intet ekstra: Claude bruger dit Claude-abonnement, Codex din ChatGPT-konto (også gratis) og dens Codex-grænser.

## Opsætning (én gang, i PowerShell)
1. Git: `winget install --id Git.Git -e --source winget` → luk og åbn PowerShell → `git --version`.
2. Node.js (krævet af npm): `winget install OpenJS.NodeJS.LTS` → luk og åbn PowerShell → `node --version`.
3. Claude Code: `npm install -g --allow-scripts=@anthropic-ai/claude-code @anthropic-ai/claude-code` → ny PowerShell → `claude --version`.
   - Uden `--allow-scripts` blokerer npm 11+ installationstrinnet, og `claude` findes ikke bagefter.
   - Fejl "running scripts is disabled": `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
   - `irm https://claude.ai/install.ps1 | iex` sluttede uden besked og uden installation på denne laptop; brug npm.
4. Hent repoet: `cd $HOME` → `git clone https://github.com/Emilvernerhansen-gif/Appfactory`.
5. Start Claude i repoet: `cd $HOME\Appfactory` → `claude` → log ind i browseren.
6. Codex-plugin, inde i Claude:
   ```
   /plugin marketplace add openai/codex-plugin-cc
   /plugin install codex@openai-codex     (vælg "Install for you (user scope)")
   /reload-plugins
   /codex:setup                            (installerer Codex CLI og logger ind med ChatGPT)
   ```
   Vælg ikke "project scope": så kommer pluginet i repoet, og cloud-sessioner uden Codex-login prøver at indlæse det.
7. T3 Code: genstart, tjek at Claude og Codex står "Ready", åbn `C:\Users\Emilv\Appfactory`.

## Daglig brug
| Kommando (i Claude) | Hvornår |
|---|---|
| `/codex:review --base main` | Før hver merge: Codex gennemgår ændringerne. Ret eller besvar hvert fund. |
| `/codex:adversarial-review <fokus>` | Før større valg: Codex udfordrer løsningen. |
| `/codex:rescue <opgave>` | Når Claude sidder fast: giv opgaven til Codex. |
| `/codex:status`, `/codex:result` | Følg et review, der kører i baggrunden (`--background`). |

Regler:
- Review-porten (`/codex:setup --enable-review-gate`) holdes slået fra: den reviewer efter hvert svar og bruger dine Codex-grænser.
- Kør aldrig Claude og Codex på samme branch i samme mappe samtidig. Giv hver sin branch eller worktree.
- AppFactorys `npm run check` er skrevet til Linux (`sh`); på Windows er den ikke testet. Cloud-sessionerne kører den.
