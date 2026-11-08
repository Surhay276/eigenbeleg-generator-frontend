# Eigenbeleg Generator – Frontend

Frontend des Webtech-Projekts „Eigenbeleg Generator“ (HTW Berlin, Team 31): eine Web-App, mit der Nutzer Eigenbelege erfassen, als PDF erzeugen und in einem persönlichen Verlauf wiederfinden können.

- Backend-Repository: <https://github.com/oguzhankc/Eigenbeleg-Generator>
- Use Cases: siehe `docs/use-cases.md` im Backend-Repository

> **Hinweis:** Hochschulprojekt mit fiktiven Testdaten. Die Anwendung ersetzt keine Steuerberatung.

## Aktueller Stand: Meilenstein M2

| M2-Anforderung | Umsetzung |
| --- | --- |
| Vue.js-App auf GitHub | Vue 3 mit TypeScript und Vite |
| Eigene Komponente | `src/components/ReceiptList.vue` |
| Liste von Beispiel-Entitäten mit `v-for` | `ReceiptList.vue` rendert die Beispielbelege aus `src/data/sampleReceipts.ts` mit `v-for` als Tabelle (Use Case UC-05 „Belegverlauf anzeigen“) |

Die Beispielbelege haben dieselben Felder wie die Entity `Receipt` im Backend (`src/types/receipt.ts`).

## Meilenstein M3: Anbindung an das Backend

| M3-Anforderung | Umsetzung |
| --- | --- |
| Frontend ruft die GET-Route auf | `src/api/receipts.ts` lädt `GET /api/receipts`, `App.vue` zeigt die Belege mit `ReceiptList.vue` an |
| Adresse des Backends | Umgebungsvariable `VITE_API_BASE_URL`: lokal aus `.env.development`, auf Render in den Einstellungen der Static Site |
| Lade- und Fehlerzustand | Hinweis „Belege werden geladen …“ und bei Fehlern eine Meldung mit „Erneut laden“ (UC-05, 3b) |
| Deployment | Render Static Site, Anleitung im Backend-Repository unter `docs/deployment.md` |

Die Beispielbelege in `src/data/sampleReceipts.ts` werden jetzt nur noch in den Tests verwendet.

## Projektstruktur

```text
src/
├── App.vue                     Seite „Meine Belege“: lädt die Belege und zeigt Lade-/Fehlerzustand
├── api/receipts.ts             Aufruf von GET /api/receipts im Backend
├── components/
│   ├── ReceiptList.vue         Belegliste (v-for), sortiert, mit Summe und Leerzustand
│   └── __tests__/              Komponententests (Vitest)
├── data/sampleReceipts.ts      Beispielbelege für die Tests
├── router/index.ts             Vue Router
├── types/receipt.ts            TypeScript-Typ der Entity Receipt
└── utils/format.ts             Euro-, Datums- und Bezeichnungsformatierung
```

## Lokal starten

Voraussetzung: Node.js 22.18 oder neuer (bzw. 24.12 oder neuer). Das Backend muss laufen (im Backend-Ordner `./gradlew bootRun`, Port 8080).

```sh
npm ci
npm run dev
```

Die App läuft danach unter <http://localhost:5173> und lädt die Belege von <http://localhost:8080>.

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver mit Hot Reload |
| `npm run build` | Typprüfung und Produktions-Build nach `dist/` |
| `npm run test:unit -- --run` | Unit-Tests einmalig ausführen |
| `npm run lint` | Oxlint und ESLint |

## Kursvorlage und M2-Abgabe

Das Grundgerüst stammt aus der [Vorlage von Prof. Wider](https://github.com/ProfWider/meinetodoliste-frontend) und enthält TypeScript, Vue Router, Vitest, ESLint/Oxlint und Prettier. Die eigene Belegliste ist unter `/` erreichbar.

Frontend-Repository: https://github.com/Surhay276/eigenbeleg-generator-frontend

M2: Vue-App auf GitHub, eigene Unterkomponente `ReceiptList.vue` und Beispiel-Entitäten per `v-for`. Abzugeben ist der Repository-Link bis 8. November 2026, 23:59 Uhr ([Moodle](https://moodle.htw-berlin.de/mod/assign/view.php?id=2256070)).
