# Projektstatus
Kort, maskinlæsbar overlevering til en ny session. `npm run status` viser branch, ændringer, commits og "Næste".

## Tilstand
- Starter: lokal-first PWA-demo i `public/` (opgaveliste). Kan erstattes af næste app.
- Ultra Efficiency Mode aktiv: RTK-hook, kompakte tests (`npm run check`), `AGENTS.md` som eneste instruktionsfil (CLAUDE.md importerer den), OpenCode-konfiguration. Se `docs/TOOLS.md`.
- Cloud: `.claude/hooks/session-start.sh` installerer RTK ved opstart (aktiv på `main`).
- ECC-plugin (`affaan-m/ECC`) slået til i `.claude/settings.json` (PR #3, merget). Indlæsning ikke verificeret; repoet er ikke gennemgået for licens/afhængigheder.

## Næste
- Ny session på `main`: bekræft at ECC indlæses (skills med `ecc:`-præfiks). Hvis ikke: tjek netværk til github.com.
- Gennemgå `affaan-m/ECC` (licens, release, hooks) jf. `AGENTS.md`.
- Mulige app-forbedringer: forslag 1, 2, 4, 7, 8 (fortryd-sletning, mørk tilstand, app-badge, filterfaner, forfaldsdato).
- Næste app: brug `/build-app` med én kort beskrivelse.
