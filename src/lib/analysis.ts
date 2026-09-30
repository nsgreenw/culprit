import {
  COMPOUND_BY_ID,
  COMPOUNDS,
  EVIDENCE_WEIGHT,
  type Evidence,
} from "./data/compounds";
import type { AppData, Experiment } from "./store";
import { foodById } from "./store";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export interface Exposure {
  compoundId: string;
  mealId: string;
  at: number;
  level: number;
  foodIds: string[];
}

/** One exposure per compound per meal, at the highest level in that meal. */
export function exposuresOf(data: AppData): Exposure[] {
  const out: Exposure[] = [];
  for (const meal of data.meals) {
    const at = Date.parse(meal.at);
    const perCompound = new Map<string, Exposure>();
    for (const foodId of meal.foodIds) {
      const food = foodById(data, foodId);
      if (!food) continue;
      for (const [compoundId, level] of Object.entries(food.compounds)) {
        const prev = perCompound.get(compoundId);
        if (prev) {
          prev.level = Math.max(prev.level, level);
          prev.foodIds.push(foodId);
        } else {
          perCompound.set(compoundId, {
            compoundId,
            mealId: meal.id,
            at,
            level,
            foodIds: [foodId],
          });
        }
      }
    }
    out.push(...perCompound.values());
  }
  return out;
}

export type Strength = "strong" | "possible" | "early";

export interface Suspect {
  compoundId: string;
  symptomId: string;
  /** Symptom events that had this compound in the onset window. */
  hits: number;
  occurrences: number;
  hitRate: number;
  /** How often a random time point has the compound in the same window. */
  baselineRate: number;
  /** Relative risk: symptom rate after exposure / symptom rate without it. */
  lift: number;
  /** Exposures followed by the symptom inside the window. */
  exposuresFollowed: number;
  exposures: number;
  avgSeverity: number;
  knownEvidence: Evidence | null;
  strength: Strength;
  score: number;
  /** Foods that carried the compound before the symptom, most frequent first. */
  topFoods: { foodId: string; count: number }[];
  /** Other suspects for the same symptom that you usually eat together with this one. */
  eatenWith: string[];
}

function inWindow(exp: Exposure, t: number, onset: [number, number]) {
  return exp.at >= t - onset[1] * HOUR && exp.at <= t - onset[0] * HOUR;
}

export function findSuspects(data: AppData, now = Date.now()): Suspect[] {
  const exposures = exposuresOf(data);
  if (!exposures.length || !data.symptoms.length) return [];

  const times = [
    ...data.meals.map((m) => Date.parse(m.at)),
    ...data.symptoms.map((s) => Date.parse(s.at)),
  ];
  const spanStart = Math.min(...times);
  const spanEnd = Math.min(Math.max(...times), now);

  // Reference points every 3 hours across the logged period.
  const refs: number[] = [];
  for (let t = spanStart; t <= spanEnd; t += 3 * HOUR) refs.push(t);

  const bySymptom = new Map<string, { at: number; severity: number }[]>();
  for (const s of data.symptoms) {
    const list = bySymptom.get(s.symptomId) ?? [];
    list.push({ at: Date.parse(s.at), severity: s.severity });
    bySymptom.set(s.symptomId, list);
  }

  const byCompound = new Map<string, Exposure[]>();
  for (const e of exposures) {
    const list = byCompound.get(e.compoundId) ?? [];
    list.push(e);
    byCompound.set(e.compoundId, list);
  }

  const suspects: Suspect[] = [];

  for (const [symptomId, events] of bySymptom) {
    for (const [compoundId, exps] of byCompound) {
      const compound = COMPOUND_BY_ID[compoundId];
      if (!compound) continue;
      const onset = compound.onsetHours;

      const foodCounts = new Map<string, number>();
      let hits = 0;
      let hitSeverity = 0;
      for (const ev of events) {
        const before = exps.filter((e) => inWindow(e, ev.at, onset));
        if (before.length) {
          hits++;
          hitSeverity += ev.severity;
          for (const e of before)
            for (const fid of e.foodIds)
              foodCounts.set(fid, (foodCounts.get(fid) ?? 0) + 1);
        }
      }
      if (hits < 2) continue;

      // 2x2 table over 3-hour slots: was the compound in the window, and
      // did the symptom appear in the slot? Haldane correction avoids /0.
      let eS = 0, eN = 0, nS = 0, nN = 0, refHits = 0;
      for (const t of refs) {
        const exposed = exps.some((e) => inWindow(e, t + 1.5 * HOUR, onset));
        const symptom = events.some((ev) => ev.at >= t && ev.at < t + 3 * HOUR);
        if (exposed) refHits++;
        if (exposed && symptom) eS++;
        else if (exposed) eN++;
        else if (symptom) nS++;
        else nN++;
      }
      const baselineRate = refs.length ? refHits / refs.length : 0;
      const hitRate = hits / events.length;
      const lift =
        ((eS + 0.5) / (eS + eN + 1)) / ((nS + 0.5) / (nS + nN + 1));
      if (lift < 1.3) continue;

      // Only count exposures whose full window has passed.
      const matured = exps.filter((e) => e.at + onset[1] * HOUR <= now);
      const exposuresFollowed = matured.filter((e) =>
        events.some(
          (ev) =>
            ev.at >= e.at + onset[0] * HOUR && ev.at <= e.at + onset[1] * HOUR,
        ),
      ).length;

      const link = compound.links.find((l) => l.symptomId === symptomId);
      const knownEvidence = link?.evidence ?? null;

      let strength: Strength = "early";
      if (hits >= 5 && hitRate >= 0.6 && lift >= 3) strength = "strong";
      else if (hits >= 3 && lift >= 2) strength = "possible";
      // A pattern with no known mechanism needs an experiment before we call it strong.
      if (!knownEvidence && strength === "strong") strength = "possible";

      const dataWeight = Math.min(events.length / 8, 1);
      const score =
        hitRate * (Math.min(lift, 6) / 6) * (0.5 + 0.5 * dataWeight) +
        (knownEvidence ? 0.25 * EVIDENCE_WEIGHT[knownEvidence] : 0);

      suspects.push({
        compoundId,
        symptomId,
        hits,
        occurrences: events.length,
        hitRate,
        baselineRate,
        lift,
        exposuresFollowed,
        exposures: matured.length,
        avgSeverity: hitSeverity / hits,
        knownEvidence,
        strength,
        score,
        topFoods: [...foodCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([foodId, count]) => ({ foodId, count })),
        eatenWith: [],
      });
    }
  }

  // Flag suspects for the same symptom that come from the same meals.
  const mealSets = new Map<string, Set<string>>();
  for (const [cid, exps] of byCompound)
    mealSets.set(cid, new Set(exps.map((e) => e.mealId)));
  for (const s of suspects) {
    const a = mealSets.get(s.compoundId)!;
    s.eatenWith = suspects
      .filter((o) => o.symptomId === s.symptomId && o.compoundId !== s.compoundId)
      .filter((o) => {
        const b = mealSets.get(o.compoundId)!;
        let both = 0;
        for (const m of a) if (b.has(m)) both++;
        return both / (a.size + b.size - both) >= 0.6;
      })
      .map((o) => o.compoundId);
  }

  return suspects.sort((a, b) => b.score - a.score);
}

export const STRENGTH_ORDER: Record<Strength, number> = {
  strong: 0,
  possible: 1,
  early: 2,
};

/* ---------- Elimination experiments ---------- */

export interface PhaseStats {
  label: string;
  days: number;
  symptomsPerDay: number;
  avgSeverity: number;
  /** Only symptoms with a known link to the compound. */
  linkedPerDay: number;
}

export interface ExperimentReport {
  phase: "eliminate" | "reintroduce" | "done";
  dayOfElimination: number;
  eliminationComplete: boolean;
  slips: { at: string; foodIds: string[] }[];
  baseline: PhaseStats;
  elimination: PhaseStats;
  reintroduction: PhaseStats | null;
}

export function experimentReport(
  data: AppData,
  exp: Experiment,
  now = Date.now(),
): ExperimentReport {
  const compound = COMPOUND_BY_ID[exp.compoundId];
  const linked = new Set(compound?.links.map((l) => l.symptomId) ?? []);
  // Meal times are entered to the minute, so start at the start of that minute.
  const start = Math.floor(Date.parse(exp.startedAt) / 60_000) * 60_000;
  const reintro = exp.reintroducedAt ? Date.parse(exp.reintroducedAt) : null;
  const end = exp.endedAt ? Date.parse(exp.endedAt) : now;

  const stats = (label: string, from: number, to: number): PhaseStats => {
    const days = Math.max((to - from) / DAY, 1);
    const inRange = data.symptoms.filter((s) => {
      const t = Date.parse(s.at);
      return t >= from && t < to;
    });
    return {
      label,
      days: Math.round((to - from) / DAY),
      symptomsPerDay: inRange.length / days,
      avgSeverity: inRange.length
        ? inRange.reduce((sum, s) => sum + s.severity, 0) / inRange.length
        : 0,
      linkedPerDay: inRange.filter((s) => linked.has(s.symptomId)).length / days,
    };
  };

  const elimEnd = reintro ?? end;
  const slips = exposuresOf(data)
    .filter(
      (e) => e.compoundId === exp.compoundId && e.at >= start && e.at < elimEnd,
    )
    .map((e) => ({ at: new Date(e.at).toISOString(), foodIds: e.foodIds }));

  const dayOfElimination = Math.floor((elimEnd - start) / DAY) + 1;

  return {
    phase: exp.endedAt ? "done" : reintro ? "reintroduce" : "eliminate",
    dayOfElimination,
    eliminationComplete: dayOfElimination > exp.eliminationDays,
    slips,
    baseline: stats("Before", start - 14 * DAY, start),
    elimination: stats("Without it", start, elimEnd),
    reintroduction: reintro ? stats("Added back", reintro, end) : null,
  };
}

/** Count and total severity per symptom over the last `days` days. */
export function recentSymptomCounts(data: AppData, days: number, now = Date.now()) {
  const out = new Map<string, { n: number; sev: number }>();
  const since = now - days * DAY;
  for (const s of data.symptoms) {
    if (Date.parse(s.at) < since) continue;
    const c = out.get(s.symptomId) ?? { n: 0, sev: 0 };
    out.set(s.symptomId, { n: c.n + 1, sev: c.sev + s.severity });
  }
  return out;
}

export { COMPOUNDS };
