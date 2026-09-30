# Elimination Tracker

A food and symptom log that links your symptoms to the food compounds you ate
before them. It then helps you test each suspect with an elimination
experiment.

**Status:** prototype. Data stays in the browser (`localStorage`). There are no
accounts yet.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Click **Load 4 weeks of sample data** on the Today screen to see patterns at once.

## Screens

| Screen      | What it does |
|-------------|--------------|
| Today       | Log food (search, recent foods, custom foods) and symptoms (severity 1–5). |
| History     | All entries by day. |
| Patterns    | Suspect compounds per symptom, with the pattern strength in your log and the evidence level in science. |
| Experiments | Avoid one compound for 14–28 days, then add it back. Compares symptoms per day and warns about slips. |
| Compounds   | The compound library: linked symptoms, onset time, foods, sources. |
| Data        | Backup (export/import JSON), sample data, delete all, doctor report (print/PDF). |

## How the pattern engine works

Code: `src/lib/analysis.ts`.

1. Each meal gives one exposure per compound, at the highest level in that meal.
2. Each compound has an onset window (for example, histamine: 15 min–12 h).
3. For each symptom and compound, the engine counts how many symptom events had
   the compound inside the window (`hits`).
4. It splits the logged period into 3-hour slots and builds a 2×2 table
   (compound in window yes/no × symptom in slot yes/no). The relative risk
   from this table is the "× more likely" number.
5. Strength: **strong** needs ≥5 hits, ≥60% hit rate and relative risk ≥3.
   **Possible** needs ≥3 hits and relative risk ≥2. A link with no known
   mechanism can never be "strong".
6. Compounds that share ≥60% of their meals are flagged as "eaten together",
   because the log alone cannot separate them.

## Data

- `src/lib/data/compounds.ts` — 17 compounds, symptom links with evidence levels
  (strong / moderate / weak), onset windows, warnings, sources.
- `src/lib/data/foods.ts` — ~100 foods with compound levels (low / medium / high).
- `src/lib/data/symptoms.ts` — 25 symptoms in 8 body systems.

**A dietitian or physician must review all compound data and sources before a
public release.** The food levels are approximate.

## Safety rules in the app

- The app shows patterns, never a diagnosis.
- A gluten pattern shows a warning to get a celiac blood test **before** the
  user removes gluten. A gluten experiment needs a confirmation checkbox.
- Allergy, kidney stone, and asthma warnings show on the related compounds.
- A first-run notice lists red-flag symptoms that need a doctor.

## Next steps for a public product

- Accounts and cloud sync (for example Supabase), with encryption for health data.
- Privacy policy and terms; check FTC Health Breach Notification Rule and state
  health-data laws (for example Washington My Health My Data Act).
- Expert review of the compound database, with a source for each food level.
- Barcode and recipe import, so users do not log ingredients one by one.
- Push reminders to log, and a native app wrapper.
