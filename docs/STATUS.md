# Projektstatus
Kort, maskinlæsbar overlevering til en ny session. `npm run status` viser branch, ændringer, commits og "Næste".

## Tilstand
- Starter: lokal-first PWA-demo i `public/` (opgaveliste). Kan erstattes af næste app.
- Ultra Efficiency Mode aktiv: RTK-hook, kompakte tests (`npm run check`), `AGENTS.md` som eneste instruktionsfil (CLAUDE.md importerer den), OpenCode-konfiguration. Se `docs/TOOLS.md`.
- Cloud: `.claude/hooks/session-start.sh` installerer RTK ved opstart (virker for nye sessioner, når branchen er merget til default).

## Apps
- `apps/kryb-drift/`: kilde til artifact'en "Drift · Kryb i Ly" (https://claude.ai/artifact/TVg5CvZMoacufE9ipJTpsX, privat). Data ligger i artifact'ens db (samlinger faults, tasks, readings, rooms, rounds, manuals); feltnavne må ikke ændres. Publicér ved at sende `apps/kryb-drift/index.html` til samme URL. Test: `node apps/kryb-drift/e2e.mjs` (mock-runtime, eksempeldata, aldrig rigtige data i repoet).

## Næste
- Kryb-drift: manuel test på telefon af scanning (sample) og upload af manual (assets) — kan ikke køres med mock.
- Næste app: brug `/build-app` med én kort beskrivelse.
