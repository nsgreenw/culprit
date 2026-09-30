"use client";

import { useSyncExternalStore } from "react";
import { FOOD_BY_ID, FOODS, type Food } from "./data/foods";
import {
  announceChange,
  onExternalChange,
  readData,
  requestPersistence,
  writeData,
} from "./persist";

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
  /** Set when the user exports a backup file. */
  lastBackupAt?: string;
}

const EMPTY: AppData = {
  version: 1,
  meals: [],
  symptoms: [],
  experiments: [],
  customFoods: [],
  acknowledgedDisclaimer: false,
};

let cache: AppData | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function reload() {
  loading = readData<AppData>().then((stored) => {
    cache = { ...EMPTY, ...stored };
    notify();
  });
  return loading;
}

function getSnapshot(): AppData | null {
  return cache;
}

function save(next: AppData) {
  cache = next;
  notify();
  writeData(next).then(announceChange);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loading) reload();
  const off = onExternalChange(() => void reload());
  return () => {
    listeners.delete(listener);
    off();
  };
}

/** Returns null until the data has loaded from the device. */
export function useAppData(): AppData | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function update(fn: (d: AppData) => AppData) {
  // Actions only run from the UI, after the first load has finished.
  if (!cache) return;
  save(fn(cache));
}

let persistAsked = false;
/** Ask for persistent storage once, when the user saves real data. */
function askPersistence() {
  if (persistAsked) return;
  persistAsked = true;
  requestPersistence().catch(() => {});
}

const byTimeDesc = <T extends { at: string }>(a: T, b: T) =>
  b.at.localeCompare(a.at);

export const actions = {
  addMeal(meal: Omit<MealEntry, "id">) {
    askPersistence();
    update((d) => ({
      ...d,
      meals: [...d.meals, { ...meal, id: uid() }].sort(byTimeDesc),
    }));
  },
  addSymptom(entry: Omit<SymptomEntry, "id">) {
    askPersistence();
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
  markBackedUp() {
    update((d) => ({ ...d, lastBackupAt: new Date().toISOString() }));
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

/** True when there is data worth keeping and no backup in the last 14 days. */
export function backupDue(data: AppData, now = Date.now()): boolean {
  if (data.meals.length + data.symptoms.length < 10) return false;
  if (!data.lastBackupAt) return true;
  return now - Date.parse(data.lastBackupAt) > 14 * 86_400_000;
}

export function allFoods(data: AppData): Food[] {
  return [...FOODS, ...data.customFoods];
}

export function foodById(data: AppData, id: string): Food | undefined {
  return FOOD_BY_ID[id] ?? data.customFoods.find((f) => f.id === id);
}
