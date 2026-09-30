# Contributing

Thank you for your help. This project has two parts, and each part has its own rules:

| Part | Files | License |
|------|-------|---------|
| Code | everything outside `src/lib/data/` | AGPL-3.0-or-later |
| Data | `src/lib/data/*.ts` (compounds, foods, symptoms) | CC BY-SA 4.0 |

When you open a pull request, you agree to license your code under
AGPL-3.0-or-later and your data changes under CC BY-SA 4.0.

## Ground rules

1. **No user data leaves the device.** Do not add analytics, trackers, remote
   fonts, CDNs, error reporters, or any request to a server that the user did
   not start. A pull request that adds a network call will not be merged.
2. **No diagnosis.** The app shows patterns and evidence. It never tells a
   user that they have a condition. Use words like "often linked to" and
   "discuss this with a doctor".
3. **Safety first.** Keep the celiac test warning and the other warnings. If
   you add a compound that needs a test before elimination, or has an
   emergency symptom, add a `warning`.

## Data changes

The compound database is the most important part of this project. Every change
must be checkable.

### Each symptom link needs

- A `symptomId` from `src/lib/data/symptoms.ts`.
- An `evidence` level:
  - **strong** — clinical guidelines, or consistent controlled trials in humans.
  - **moderate** — controlled trials exist, but results vary or apply to a
    subgroup only.
  - **weak** — mechanism, animal studies, case reports, or anecdote only.
- A source in the compound's `sources` list that supports the link.

If you are not sure, choose the lower level. A popular claim with weak
evidence is still welcome, but it must say **weak**.

### Acceptable sources

- Peer-reviewed papers (give authors, year, journal, volume, and page or DOI).
- Clinical guidelines (for example from NIH, NICE, or a medical society).
- Government health or food-safety pages (for example NIDDK, FDA, EFSA).

Not acceptable as the only source: blogs, books without citations, social
media, product pages, or AI-generated text.

### Food levels

Levels are `1` (low), `2` (medium), and `3` (high). Say in the pull request
where the number comes from, for example a food composition table or a
published list (such as the Monash FODMAP data or a histamine food list from a
clinical paper).

### Pull request checklist for data

- [ ] Each new or changed link has an evidence level and a source.
- [ ] I chose the lower evidence level when I was not sure.
- [ ] `npm run lint` and `npm run build` pass.

## Code changes

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # static export to ./out
```

- Keep the app a static site. It must work with `output: "export"`.
- Store data only through `src/lib/store.ts` (IndexedDB on the device).
- If you change the stored data shape, keep old data readable, and bump
  `version` with a migration.
- Test at phone width. Most people log meals on a phone.

## Report a problem

- Wrong or missing data: open a **Data correction** issue.
- A bug: open a **Bug report** issue.
- A security or privacy problem: see [SECURITY.md](SECURITY.md).

Never paste your own food or symptom log into a public issue.
