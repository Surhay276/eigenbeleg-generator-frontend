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
| Liste von Beispiel-Entitäten mit `v-for` | `ReceiptList.vue` rendert die Beispielbelege aus `src/data/sampleReceipts.ts` mit `v-for` als Tabelle (Use Case UC-06 „Belegverlauf anzeigen“) |

Die Beispielbelege haben dieselben Felder wie die Entity `Receipt` im Backend (`src/types/receipt.ts`). Ab M3 werden sie über `GET /api/receipts` vom Backend geladen.

## Projektstruktur

```text
src/
├── App.vue                     Seitenrahmen und Seite „Meine Belege“
├── components/
│   ├── ReceiptList.vue         Belegliste (v-for), sortiert, mit Summe und Leerzustand
│   └── __tests__/              Komponententests (Vitest)
├── data/sampleReceipts.ts      Beispielbelege für M2
├── types/receipt.ts            TypeScript-Typ der Entity Receipt
└── utils/format.ts             Euro-, Datums- und Bezeichnungsformatierung
```

## Lokal starten

Voraussetzung: Node.js 22.18 oder neuer (bzw. 24.12 oder neuer).

```sh
npm install
npm run dev
```

Die App läuft danach unter <http://localhost:5173>.

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
