import { FOOD_BY_ID } from "./data/foods";
import type { AppData, MealEntry, SymptomEntry } from "./store";

/**
 * Four weeks of sample data for a person who reacts to histamine
 * (headache, flushing) and lactose (bloating). Deterministic.
 */
export function demoData(now = Date.now()): AppData {
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];

  const breakfasts = [
    ["eggs", "bacon", "coffee"],
    ["eggs", "butter", "coffee"],
    ["yogurt", "berries", "coffee"],
    ["eggs", "ground-beef", "coffee"],
    ["milk", "breakfast-cereal"],
  ];
  const lunches = [
    ["ground-beef", "aged-cheese", "lettuce"],
    ["tuna-canned", "lettuce", "cucumber"],
    ["chicken", "rice-white"],
    ["leftover-meat", "rice-white"],
    ["beef-fresh", "potato"],
    ["salami", "aged-cheese"],
  ];
  const dinners = [
    ["beef-fresh", "butter"],
    ["salmon", "rice-white", "broccoli"],
    ["pizza"],
    ["lamb", "sweet-potato"],
    ["pork", "cabbage"],
    ["beef-fresh", "red-wine"],
    ["chicken", "potato", "ice-cream"],
  ];

  const meals: MealEntry[] = [];
  const symptoms: SymptomEntry[] = [];
  const day0 = new Date(now - 28 * 86_400_000);
  day0.setHours(0, 0, 0, 0);

  const addSymptom = (
    at: number,
    symptomId: string,
    severity: SymptomEntry["severity"],
  ) => {
    if (at < now)
      symptoms.push({
        id: `demo-s${symptoms.length}`,
        at: new Date(at).toISOString(),
        symptomId,
        severity,
      });
  };

  for (let d = 0; d < 28; d++) {
    for (const [hour, pool] of [
      [8, breakfasts],
      [13, lunches],
      [19, dinners],
    ] as const) {
      const at = day0.getTime() + d * 86_400_000 + (hour + rand()) * 3_600_000;
      if (at > now) continue;
      const foodIds = pick(pool as string[][]);
      meals.push({
        id: `demo-m${meals.length}`,
        at: new Date(at).toISOString(),
        foodIds,
      });

      const histamine = Math.max(
        0,
        ...foodIds.map((id) => FOOD_BY_ID[id]?.compounds.histamine ?? 0),
      );
      const lactose = Math.max(
        0,
        ...foodIds.map((id) => FOOD_BY_ID[id]?.compounds.lactose ?? 0),
      );
      if (histamine >= 2 && rand() < 0.7)
        addSymptom(at + (1 + rand() * 5) * 3_600_000, "headache", (2 + Math.floor(rand() * 3)) as 2 | 3 | 4);
      if (histamine >= 3 && rand() < 0.5)
        addSymptom(at + (0.5 + rand()) * 3_600_000, "flushing", 2);
      if (lactose >= 2 && rand() < 0.75)
        addSymptom(at + (1 + rand() * 3) * 3_600_000, "bloating", (2 + Math.floor(rand() * 2)) as 2 | 3);
    }
    // Background noise not tied to food.
    if (rand() < 0.12)
      addSymptom(day0.getTime() + d * 86_400_000 + rand() * 86_400_000, "headache", 1);
    if (rand() < 0.15)
      addSymptom(day0.getTime() + d * 86_400_000 + 23 * 3_600_000, "poor-sleep", 2);
  }

  const desc = <T extends { at: string }>(a: T, b: T) => b.at.localeCompare(a.at);
  return {
    version: 1,
    meals: meals.sort(desc),
    symptoms: symptoms.sort(desc),
    experiments: [],
    customFoods: [],
    acknowledgedDisclaimer: true,
  };
}
