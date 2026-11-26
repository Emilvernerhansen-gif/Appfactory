# Projektstatus
Kort, maskinlæsbar overlevering til en ny session. `npm run status` viser branch, ændringer, commits og "Næste".

## Tilstand
- Starter: lokal-first PWA-demo i `public/` (opgaveliste). Kan erstattes af næste app.
- Ultra Efficiency Mode aktiv: RTK-hook, kompakte tests (`npm run check`), `AGENTS.md` som eneste instruktionsfil (CLAUDE.md importerer den), OpenCode-konfiguration. Se `docs/TOOLS.md`.
- Cloud: `.claude/hooks/session-start.sh` installerer RTK ved opstart (aktiv på `main`).
- Modern Web Guidance (Google, 211 guides, offline) som projekt-skill; axe-core 4.14.0 WCAG-scan i e2e (kræver `npm ci`). Se `docs/TOOLS.md`.
- `npm run scan-skill -- <sti|url>`: NVIDIA SkillSpector-scanning før installation af skills (bruges af `/upgrade-stack`; dommen er støjende, HIGH-fund vurderes manuelt).
- Claude Code + Codex på Windows-laptoppen (`docs/CODEX.md`); `/codex:review --base main` før merge.
- Ugentligt planlagt tjek mandag 7:36 (rapport, ændrer intet).
- ECC-plugin blev tilføjet (PR #3) og fjernet igen: blev ikke indlæst i cloud-session og overlapper superpowers (72 agenter/328 skills).

## Næste
- Overvej Lighthouse CI (PWA/ydelse) via `/upgrade-stack`.
- Sortering: værelsesnr. laveste/højeste først, nyeste/ældste oprettet først (oprettelse = rækkefølge i listen). Valget huskes ikke ved genindlæsning.
- Mulige app-forbedringer: forslag 1, 2, 4, 7, 8 (fortryd-sletning, mørk tilstand, app-badge, filterfaner, forfaldsdato).
- Næste app: brug `/build-app` med én kort beskrivelse.
