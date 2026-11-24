# AppFactory
En genbrugelig, lokal-first startpakke til Claude Code. Ingen API-nøgler, eksterne services eller npm-afhængigheder i standardversionen.

## Fra telefonen
1. Opret et nyt privat GitHub-repository med README. Upload `appfactory_bootstrap.py` fra startpakken, hvis du ikke allerede har pakket alle filerne ud.
2. Åbn Claude Code via https://claude.ai/code, forbind GitHub og vælg repository. Bed Claude køre `python3 appfactory_bootstrap.py`, læse `CLAUDE.md`, køre `npm test` og committe/pushe til sessionsbranchen. Hvis filerne allerede er der, spring bootstrap over.
3. Gennemgå ændringerne og merge, når du er tilfreds. Brug samme instruktioner i nye Claude Code-sessioner. `/build-app` er en lokal skill; en almindelig tekstinstruktion virker også.

Eksempel: Byg en komplet mobilapp til registrering af materialer med søgning, foto, offline lagring og JSON-backup. Brug CLAUDE.md, arbejd selvstændigt, test og ret fejl før levering.

## Kør og test
Node.js 20+; `npm test` (ingen installation). `npm run test:e2e` kører browsertest i Chromium ved 360 og 412 px, hvis Playwright findes lokalt (exit 2 = sprunget over). `npm start` starter en lokal statisk server på port 4173. Åbn http://localhost:4173. `public/` er webroden og kan hostes på en statisk HTTPS-host. GitHub Pages kan kræve offentligt repository på Free; publicér kun efter godkendelse. Cloudflare Pages kan tilsluttes manuelt og publicere `public` uden build-kommando, inden for gratisgrænserne.

Demoen er en simpel opgaveliste med tilføjelse, redigering, afslutning, sletning, søgning, JSON-backup og offline-cache. Den kan erstattes af næste app. Data er kun i browseren, ikke krypteret eller synkroniseret; tag backup, og undgå følsomme oplysninger. ## Design-skills
To gratis, projekt-lokale skills er installeret fra fastlåste commits: **UI/UX Pro Max** (vælger designsystem før UI-arbejde, offline) og **Impeccable** (kritik, audit og anti-mønster-detektor efter UI-arbejde; telemetri slået fra). GStack er vurderet og fravalgt pga. overlap. Detaljer, versioner og begrundelser: docs/TOOLS.md.
