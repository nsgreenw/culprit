"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Card,
  EvidenceBadge,
  Loading,
  PageTitle,
  StrengthBadge,
  Warning,
} from "@/components/ui";
import { findSuspects, type Suspect } from "@/lib/analysis";
import { COMPOUND_BY_ID, inlineName, shortName } from "@/lib/data/compounds";
import { SYMPTOM_BY_ID } from "@/lib/data/symptoms";
import { foodById, useAppData, type AppData } from "@/lib/store";


export default function PatternsPage() {
  const data = useAppData();
  const [showEarly, setShowEarly] = useState(false);
  const suspects = useMemo(() => (data ? findSuspects(data) : []), [data]);

  if (!data) return <Loading />;

  const times = [...data.meals, ...data.symptoms].map((e) => Date.parse(e.at));
  const daysLogged = times.length
    ? Math.ceil((Math.max(...times) - Math.min(...times)) / 86_400_000) + 1
    : 0;

  const visible = suspects.filter((s) => showEarly || s.strength !== "early");
  const bySymptom = new Map<string, Suspect[]>();
  for (const s of visible)
    bySymptom.set(s.symptomId, [...(bySymptom.get(s.symptomId) ?? []), s]);

  const glutenFlag = visible.some(
    (s) => s.compoundId === "gluten" && s.strength !== "early",
  );

  return (
    <>
      <PageTitle
        title="Patterns"
        lead="Compounds that often come before your symptoms, in your own log. A pattern is a clue to test, not a diagnosis."
      />

      <div className="mb-6 grid grid-cols-3 gap-3 text-center">
        <Stat value={daysLogged} label="days logged" />
        <Stat value={data.meals.length} label="meals" />
        <Stat value={data.symptoms.length} label="symptoms" />
      </div>

      {daysLogged < 14 && (
        <div className="mb-4">
          <Warning tone="amber">
            Patterns get more reliable after about 14 days of logs. Keep
            logging every meal, also on days without symptoms.
          </Warning>
        </div>
      )}

      {glutenFlag && (
        <div className="mb-4">
          <Warning>
            <strong>Gluten shows up in your patterns.</strong>{" "}
            {COMPOUND_BY_ID.gluten.warning} Ask your doctor for a tTG-IgA
            blood test.
          </Warning>
        </div>
      )}

      <label className="mb-4 flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={showEarly}
          onChange={(e) => setShowEarly(e.target.checked)}
          className="accent-[var(--accent)]"
        />
        Also show early signals (weak patterns with little data)
      </label>

      {bySymptom.size === 0 ? (
        <Card className="text-center text-sm text-muted">
          No patterns yet. Log more meals and symptoms.
        </Card>
      ) : (
        <div className="space-y-8">
          {[...bySymptom.entries()].map(([symptomId, list]) => (
            <section key={symptomId}>
              <h2 className="mb-3 font-display text-xl font-semibold">
                {SYMPTOM_BY_ID[symptomId]?.name}
                <span className="ml-2 text-sm font-normal text-muted">
                  logged {list[0].occurrences}×
                </span>
              </h2>
              <div className="space-y-3">
                {list.slice(0, 4).map((s) => (
                  <SuspectCard key={s.compoundId} s={s} data={data} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <details className="mt-10 rounded-2xl border border-line bg-card p-4 text-sm">
        <summary className="cursor-pointer font-medium">How the app finds patterns</summary>
        <div className="mt-3 space-y-2 text-muted">
          <p>
            Each compound has a typical onset time. For example, histamine
            reactions often start 15 minutes to 12 hours after a meal.
          </p>
          <p>
            For each symptom, the app checks which compounds you ate inside
            that time window. It then compares how often the symptom appears
            after the compound and how often it appears without it. This is
            the “× more likely” number.
          </p>
          <p>
            Many foods contain more than one compound. If two compounds
            usually appear in the same meals, the app cannot tell them apart.
            An elimination experiment can.
          </p>
          <p>
            The evidence badge shows what science says about the link in
            general. The pattern badge shows what your own log says.
          </p>
        </div>
      </details>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <Card className="px-2 py-3">
      <p className="font-display text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  );
}

function SuspectCard({ s, data }: { s: Suspect; data: AppData }) {
  const compound = COMPOUND_BY_ID[s.compoundId];
  const symptom = SYMPTOM_BY_ID[s.symptomId]?.name.toLowerCase();
  const [lo, hi] = compound.onsetHours;
  const windowText =
    lo === 0
      ? `within ${hi} h`
      : `${lo < 1 ? `${Math.round(lo * 60)} min` : `${lo} h`}–${hi} h after`;
  const times = s.lift >= 10 ? "over 10" : s.lift.toFixed(1);

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/compounds/${s.compoundId}`}
          className="font-semibold underline-offset-2 hover:underline"
        >
          {compound.name}
        </Link>
        <StrengthBadge strength={s.strength} />
        {s.knownEvidence ? (
          <EvidenceBadge evidence={s.knownEvidence} />
        ) : (
          <span className="rounded-full border border-dashed border-line px-2 py-0.5 text-xs text-muted">
            No known link in science
          </span>
        )}
      </div>

      <p className="mt-2 text-sm">
        Your {symptom} came {windowText} {inlineName(s.compoundId)}{" "}
        <strong>
          {s.hits} of {s.occurrences} times
        </strong>
        . In your log, {symptom} is <strong>{times}× more likely</strong> in
        that window after it than at other times.
      </p>

      {s.topFoods.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          Main foods:{" "}
          {s.topFoods
            .map((f) => `${foodById(data, f.foodId)?.name ?? f.foodId} (${f.count}×)`)
            .join(", ")}
        </p>
      )}

      {s.eatenWith.length > 0 && (
        <p className="mt-2 text-xs text-amber">
          You usually eat this together with{" "}
          {s.eatenWith.map(shortName).join(" and ")}. The log alone cannot
          tell them apart.
        </p>
      )}

      {compound.warning && s.compoundId === "gluten" && (
        <p className="mt-2 text-xs font-medium text-warn">{compound.warning}</p>
      )}

      <div className="mt-3 flex gap-3 text-sm">
        <Link
          href={`/experiments?compound=${s.compoundId}`}
          className="font-medium text-accent hover:underline"
        >
          Test it with an experiment →
        </Link>
      </div>
    </Card>
  );
}
