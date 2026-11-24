# Projektstatus
Kort, maskinlæsbar overlevering til en ny session. `npm run status` viser branch, ændringer, commits og "Næste".

## Tilstand
- Starter: lokal-first PWA-demo i `public/` (opgaveliste). Kan erstattes af næste app.
- Ultra Efficiency Mode aktiv: RTK-hook, kompakte tests (`npm run check`), `AGENTS.md` som eneste instruktionsfil (CLAUDE.md importerer den), OpenCode-konfiguration. Se `docs/TOOLS.md`.
- Cloud: `.claude/hooks/session-start.sh` installerer RTK ved opstart (virker for nye sessioner, når branchen er merget til default).

## Næste
- Merge `claude/appfactory-ultra-efficiency-iahx6j` efter gennemsyn, så nye cloudsessioner får hooket.
- Næste app: brug `/build-app` med én kort beskrivelse.
