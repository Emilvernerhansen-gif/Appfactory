# Projektstatus
Kort, maskinlæsbar overlevering til en ny session. `npm run status` viser branch, ændringer, commits og "Næste".

## Tilstand
- Starter: lokal-first PWA-demo i `public/` (opgaveliste). Kan erstattes af næste app.
- Ultra Efficiency Mode aktiv: RTK-hook, kompakte tests (`npm run check`), `AGENTS.md` som eneste instruktionsfil (CLAUDE.md importerer den), OpenCode-konfiguration. Se `docs/TOOLS.md`.
- Cloud: `.claude/hooks/session-start.sh` installerer RTK ved opstart (aktiv på `main`).
- ECC-plugin blev tilføjet (PR #3) og fjernet igen: blev ikke indlæst i cloud-session og overlapper superpowers (72 agenter/328 skills).

## Næste
- Overvej via `/upgrade-stack`: axe-core i e2e, Lighthouse CI, `webapp-testing` fra anthropics/skills.
- Mulige app-forbedringer: forslag 1, 2, 4, 7, 8 (fortryd-sletning, mørk tilstand, app-badge, filterfaner, forfaldsdato).
- Næste app: brug `/build-app` med én kort beskrivelse.
