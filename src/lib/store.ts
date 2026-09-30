"use client";

import { useSyncExternalStore } from "react";
import { FOOD_BY_ID, FOODS, type Food } from "./data/foods";

export interface MealEntry {
  id: string;
  at: string; // ISO timestamp
  foodIds: string[];
  note?: string;
}

export interface SymptomEntry {
  id: string;
  at: string;
  symptomId: string;
  severity: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

export interface Experiment {
  id: string;
  compoundId: string;
  startedAt: string;
  eliminationDays: number;
  /** Set when the user starts to eat the compound again. */
  reintroducedAt?: string;
  endedAt?: string;
  conclusion?: "reacted" | "no-reaction" | "unclear";
}

export interface AppData {
  version: 1;
  meals: MealEntry[];
  symptoms: SymptomEntry[];
  experiments: Experiment[];
  customFoods: Food[];
  acknowledgedDisclaimer: boolean;
}

const KEY = "elimination-tracker:v1";

const EMPTY: AppData = {
  version: 1,
  meals: [],
  symptoms: [],
  experiments: [],
  customFoods: [],
  acknowledgedDisclaimer: false,
};

let cache: AppData | null = null;
const listeners = new Set<() => void>();

function load(): AppData {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as AppData) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function save(next: AppData) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: keep the in-memory copy for this session.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Returns null during server render and the first hydration pass. */
export function useAppData(): AppData | null {
  return useSyncExternalStore(subscribe, load, () => null);
}

export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function update(fn: (d: AppData) => AppData) {
  save(fn(load()));
}

const byTimeDesc = <T extends { at: string }>(a: T, b: T) =>
  b.at.localeCompare(a.at);

export const actions = {
  addMeal(meal: Omit<MealEntry, "id">) {
    update((d) => ({
      ...d,
      meals: [...d.meals, { ...meal, id: uid() }].sort(byTimeDesc),
    }));
  },
  addSymptom(entry: Omit<SymptomEntry, "id">) {
    update((d) => ({
      ...d,
      symptoms: [...d.symptoms, { ...entry, id: uid() }].sort(byTimeDesc),
    }));
  },
  deleteMeal(id: string) {
    update((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== id) }));
  },
  deleteSymptom(id: string) {
    update((d) => ({ ...d, symptoms: d.symptoms.filter((s) => s.id !== id) }));
  },
  addCustomFood(food: Omit<Food, "id" | "custom">): Food {
    const created: Food = { ...food, id: `custom-${uid()}`, custom: true };
    update((d) => ({ ...d, customFoods: [...d.customFoods, created] }));
    return created;
  },
  startExperiment(compoundId: string, eliminationDays: number) {
    update((d) => ({
      ...d,
      experiments: [
        {
          id: uid(),
          compoundId,
          eliminationDays,
          startedAt: new Date().toISOString(),
        },
        ...d.experiments,
      ],
    }));
  },
  reintroduce(id: string) {
    update((d) => ({
      ...d,
      experiments: d.experiments.map((e) =>
        e.id === id ? { ...e, reintroducedAt: new Date().toISOString() } : e,
      ),
    }));
  },
  endExperiment(id: string, conclusion: Experiment["conclusion"]) {
    update((d) => ({
      ...d,
      experiments: d.experiments.map((e) =>
        e.id === id
          ? { ...e, endedAt: new Date().toISOString(), conclusion }
          : e,
      ),
    }));
  },
  deleteExperiment(id: string) {
    update((d) => ({
      ...d,
      experiments: d.experiments.filter((e) => e.id !== id),
    }));
  },
  acknowledgeDisclaimer() {
    update((d) => ({ ...d, acknowledgedDisclaimer: true }));
  },
  replaceAll(next: AppData) {
    save({ ...EMPTY, ...next });
  },
  clearAll() {
    save({ ...EMPTY, acknowledgedDisclaimer: true });
  },
};

export function allFoods(data: AppData): Food[] {
  return [...FOODS, ...data.customFoods];
}

export function foodById(data: AppData, id: string): Food | undefined {
  return FOOD_BY_ID[id] ?? data.customFoods.find((f) => f.id === id);
}
