"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FoodForm } from "@/components/food-form";
import { SymptomForm } from "@/components/symptom-form";
import { Timeline } from "@/components/timeline";
import { Button, Card, Loading, StrengthBadge } from "@/components/ui";
import { findSuspects } from "@/lib/analysis";
import { COMPOUND_BY_ID, inlineName } from "@/lib/data/compounds";
import { SYMPTOM_BY_ID } from "@/lib/data/symptoms";
import { demoData } from "@/lib/demo";
import { actions, backupDue, useAppData } from "@/lib/store";

export default function TodayPage() {
  const data = useAppData();
  const [panel, setPanel] = useState<"food" | "symptom" | null>(null);

  const top = useMemo(
    () => (data ? findSuspects(data).find((s) => s.strength !== "early") : undefined),
    [data],
  );

  if (!data) return <Loading />;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const activeExperiment = data.experiments.find((e) => !e.endedAt);
  const empty = !data.meals.length && !data.symptoms.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {new Date().toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h1>
        <p className="mt-1 text-muted">
          Log each meal and each symptom. The app looks for the links.
        </p>
      </div>

      {panel ? (
        <Card className="p-5">
          <h2 className="mb-4 font-display text-xl font-semibold">
            {panel === "food" ? "Log food or drink" : "Log a symptom"}
          </h2>
          {panel === "food" ? (
            <FoodForm data={data} onDone={() => setPanel(null)} />
          ) : (
            <SymptomForm onDone={() => setPanel(null)} />
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPanel("food")}
            className="rounded-2xl bg-accent p-5 text-left text-paper transition hover:opacity-90"
          >
            <span className="block font-display text-xl font-semibold">+ Food</span>
            <span className="text-sm opacity-80">Meal, snack, or drink</span>
          </button>
          <button
            onClick={() => setPanel("symptom")}
            className="rounded-2xl border border-warn/30 bg-warn-soft p-5 text-left text-warn transition hover:opacity-90"
          >
            <span className="block font-display text-xl font-semibold">+ Symptom</span>
            <span className="text-sm opacity-80">How you feel</span>
          </button>
        </div>
      )}

      {backupDue(data) && (
        <Link href="/settings" className="block">
          <div className="rounded-xl border border-amber/30 bg-amber-soft px-4 py-3 text-sm text-amber">
            <strong>Back up your log.</strong> Your data lives only on this
            device. Export a backup file so you do not lose it →
          </div>
        </Link>
      )}

      {activeExperiment && (
        <Link href="/experiments" className="block">
          <Card className="flex items-center justify-between hover:border-accent/50">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">
                Experiment in progress
              </p>
              <p className="font-medium">
                {activeExperiment.reintroducedAt ? "Adding back" : "Avoiding"}{" "}
                {COMPOUND_BY_ID[activeExperiment.compoundId]?.name}
              </p>
            </div>
            <span className="text-accent">→</span>
          </Card>
        </Link>
      )}

      {top && (
        <Link href="/patterns" className="block">
          <Card className="hover:border-accent/50">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-muted">
                Top pattern so far
              </p>
              <StrengthBadge strength={top.strength} />
            </div>
            <p className="mt-1 font-medium">
              {SYMPTOM_BY_ID[top.symptomId]?.name} often follows{" "}
              {inlineName(top.compoundId)}
            </p>
            <p className="text-sm text-muted">
              {top.hits} of {top.occurrences} times · see all patterns →
            </p>
          </Card>
        </Link>
      )}

      {empty ? (
        <Card className="text-center">
          <p className="font-display text-lg font-semibold">Start with one meal</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Patterns need about 2 weeks of logs. Log everything you eat and
            drink, also on good days.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => actions.replaceAll(demoData())}
          >
            Load 4 weeks of sample data
          </Button>
        </Card>
      ) : (
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-semibold">Today</h2>
            <Link href="/history" className="text-sm text-accent">
              Full history →
            </Link>
          </div>
          <Timeline data={data} since={startOfDay.getTime()} />
        </div>
      )}
    </div>
  );
}
