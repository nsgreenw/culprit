# Culprit

**Find the food behind your symptoms.**

Culprit is a private, open-source food and symptom log. It links your symptoms to the food
compounds you ate before them, such as gluten, FODMAPs, lactose, histamine,
oxalates, or lectins. Then it helps you test each suspect with an elimination
experiment.

**Your data never leaves your device.** There are no accounts, no server, and
no analytics. The app is a static website. It keeps your log in your browser's
own database (IndexedDB).

**Use the app:** https://nsgreenw.github.io/culprit/
(On a phone, use "Add to Home Screen" to install it like an app.)

> **Medical disclaimer.** This app shows patterns in data that you enter. A
> pattern is a clue, not a diagnosis. The app does not give medical advice.
> Some conditions need a test *before* you change your diet. For example, a
> celiac test only works while you still eat gluten. Talk to a doctor about
> your symptoms.

## Features

| Screen      | What it does |
|-------------|--------------|
| Today       | Log food (search, recent foods, your own foods) and symptoms (severity 1–5). |
| History     | All entries by day. |
| Patterns    | Suspect compounds for each symptom. Shows the pattern strength in *your* log and the evidence level in *science*. |
| Experiments | Avoid one compound for 14–28 days, then add it back. Compares your symptoms per day and warns about slips. |
| Compounds   | The compound library: linked symptoms, onset time, foods, and sources. |
| Data        | Backup (export/import), storage protection, sample data, delete all, and a printable doctor report. |

## Your data

- The log stays in IndexedDB in your browser, on your device only.
- The app asks the browser for *persistent storage*, so the browser does not
  delete the data when the device is low on space. Some browsers refuse.
- **Export a backup file often.** If you clear your browser data, or lose the
  device, the log is gone. The app reminds you every 14 days.
- To move to a new device, export on the old device and import on the new one.

## How the pattern engine works

Code: [`src/lib/analysis.ts`](src/lib/analysis.ts).

1. Each meal gives one exposure per compound, at the highest level in that meal.
2. Each compound has an onset window (for example, histamine: 15 min–12 h).
3. For each symptom and compound, the engine counts the symptom events that
   had the compound inside the window.
4. It splits the logged period into 3-hour slots and builds a 2×2 table
   (compound in window: yes/no × symptom in slot: yes/no). The relative risk
   from this table is the "× more likely" number.
5. **Strong** needs ≥5 hits, a hit rate of ≥60%, and a relative risk of ≥3.
   **Possible** needs ≥3 hits and a relative risk of ≥2. A link with no known
   mechanism is never marked "strong".
6. Compounds that share ≥60% of their meals are flagged as "eaten together",
   because the log alone cannot separate them. An experiment can.

## The compound database

- [`src/lib/data/compounds.ts`](src/lib/data/compounds.ts): 17 compounds,
  symptom links with evidence levels, onset windows, warnings, and sources.
- [`src/lib/data/foods.ts`](src/lib/data/foods.ts): about 100 foods with
  compound levels (low / medium / high).
- [`src/lib/data/symptoms.ts`](src/lib/data/symptoms.ts): 25 symptoms in 8
  body systems.

**Status: draft.** The data needs review by dietitians and physicians. Food
levels are approximate. If you have the expertise, please help: see
[CONTRIBUTING.md](CONTRIBUTING.md).

## Run it yourself

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in ./out, host it anywhere
```

Click **Load 4 weeks of sample data** on the Today screen to see patterns at once.

Every push to `main` deploys to GitHub Pages through
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Contributing

Contributions to the code and to the data are welcome. Read
[CONTRIBUTING.md](CONTRIBUTING.md) first. For security or privacy problems,
see [SECURITY.md](SECURITY.md).

## License

- **Code:** [GNU AGPL-3.0-or-later](LICENSE). If you run a changed version of
  this app for other people, you must share your changes under the same
  license.
- **Data** (`src/lib/data/`): [CC BY-SA 4.0](LICENSE-DATA). You may reuse it
  with credit, and changed versions must use the same license.

The software comes with no warranty. See the license for details.
