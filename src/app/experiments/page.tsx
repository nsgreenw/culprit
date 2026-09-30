"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  Button,
  Card,
  Loading,
  PageTitle,
  Warning,
  formatDay,
  formatTime,
} from "@/components/ui";
import { experimentReport, type PhaseStats } from "@/lib/analysis";
import { COMPOUND_BY_ID, COMPOUNDS, inlineName } from "@/lib/data/compounds";
import type { Food } from "@/lib/data/foods";
import {
  actions,
  allFoods,
  foodById,
  useAppData,
  type AppData,
  type Experiment,
} from "@/lib/store";

export default function ExperimentsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Experiments />
    </Suspense>
  );
}

function Experiments() {
  const data = useAppData();
  const params = useSearchParams();
  if (!data) return <Loading />;

  const active = data.experiments.find((e) => !e.endedAt);
  const past = data.experiments.filter((e) => e.endedAt);

  return (
    <>
      <PageTitle
        title="Experiments"
        lead="An elimination experiment is the best way to test a suspect. Avoid it for a few weeks, then add it back and watch what happens."
      />
      {active ? (
        <ActiveExperiment data={data} exp={active} />
      ) : (
        <StartForm data={data} initial={params.get("compound") ?? ""} />
      )}

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-semibold">Past experiments</h2>
          <div className="space-y-2">
            {past.map((e) => (
              <Card key={e.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{COMPOUND_BY_ID[e.compoundId]?.name}</p>
                  <p className="text-xs text-muted">
                    {formatDay(e.startedAt)} – {formatDay(e.endedAt!)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    e.conclusion === "reacted"
                      ? "bg-warn-soft text-warn"
                      : e.conclusion === "no-reaction"
                        ? "bg-accent-soft text-accent"
                        : "bg-line/60 text-muted"
                  }`}
                >
                  {e.conclusion === "reacted"
                    ? "Reacted"
                    : e.conclusion === "no-reaction"
                      ? "No reaction"
                      : "Unclear"}
                </span>
              </Card>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function foodsWith(data: AppData, compoundId: string): Food[] {
  return allFoods(data)
    .filter((f) => f.compounds[compoundId])
    .sort((a, b) => (b.compounds[compoundId] ?? 0) - (a.compounds[compoundId] ?? 0));
}

function StartForm({ data, initial }: { data: AppData; initial: string }) {
  const [compoundId, setCompoundId] = useState(
    COMPOUND_BY_ID[initial] ? initial : "",
  );
  const [days, setDays] = useState(21);
  const [testedAck, setTestedAck] = useState(false);
  const compound = COMPOUND_BY_ID[compoundId];
  const needsAck = compoundId === "gluten";

  return (
    <Card className="space-y-4 p-5">
      <h2 className="font-display text-xl font-semibold">Start an experiment</h2>
      <label className="block text-sm">
        <span className="font-medium">What do you want to test?</span>
        <select
          value={compoundId}
          onChange={(e) => setCompoundId(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2.5"
        >
          <option value="">Choose a compound…</option>
          {COMPOUNDS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className="text-sm font-medium">How long do you avoid it?</legend>
        <div className="mt-2 flex gap-2">
          {[14, 21, 28].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              aria-pressed={days === d}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
                days === d ? "border-accent bg-accent text-paper" : "border-line"
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted">
          Most people use 2–4 weeks. Slow reactions (skin, joints, energy)
          need the longer time.
        </p>
      </fieldset>

      {compound && (
        <>
          {compound.warning && (
            <Warning>
              <strong>Important:</strong> {compound.warning}
            </Warning>
          )}
          {needsAck && (
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={testedAck}
                onChange={(e) => setTestedAck(e.target.checked)}
                className="mt-1 accent-[var(--accent)]"
              />
              I had a celiac test, or I talked to my doctor about it and I
              choose to go ahead.
            </label>
          )}
          <AvoidList data={data} compoundId={compoundId} />
        </>
      )}

      <Button
        className="w-full"
        disabled={!compound || (needsAck && !testedAck)}
        onClick={() => actions.startExperiment(compoundId, days)}
      >
        Start: avoid {compound ? inlineName(compoundId) : "it"} for {days} days
      </Button>
    </Card>
  );
}

function AvoidList({ data, compoundId }: { data: AppData; compoundId: string }) {
  const foods = foodsWith(data, compoundId);
  const main = foods.filter((f) => (f.compounds[compoundId] ?? 0) >= 2);
  const low = foods.filter((f) => f.compounds[compoundId] === 1);
  return (
    <div className="rounded-xl bg-paper p-3 text-sm">
      <p className="font-medium">Foods to avoid</p>
      <p className="mt-1">{main.map((f) => f.name).join(" · ") || "—"}</p>
      {low.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          Low amounts (avoid if you react strongly):{" "}
          {low.map((f) => f.name).join(" · ")}
        </p>
      )}
      <p className="mt-2 text-xs text-muted">
        This list is not complete. Check labels on packaged food.
      </p>
    </div>
  );
}

function ActiveExperiment({ data, exp }: { data: AppData; exp: Experiment }) {
  const compound = COMPOUND_BY_ID[exp.compoundId];
  const report = experimentReport(data, exp);
  const name = inlineName(exp.compoundId);
  const progress = Math.min(report.dayOfElimination / exp.eliminationDays, 1);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted">
          {report.phase === "eliminate" ? "Step 1 of 2 · Avoid it" : "Step 2 of 2 · Add it back"}
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold">{compound.name}</h2>

        {report.phase === "eliminate" && (
          <>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-line/60">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted">
              Day {Math.min(report.dayOfElimination, exp.eliminationDays)} of{" "}
              {exp.eliminationDays}
            </p>
            {report.eliminationComplete ? (
              <p className="mt-4 text-sm">
                You finished the avoid step. Now add {name} back: eat a normal
                portion each day for 3 days. Log every symptom. Stop if strong
                symptoms come back.
              </p>
            ) : (
              <p className="mt-4 text-sm">
                Avoid all foods with {name}. Keep logging every meal and
                symptom. The app warns you if a logged meal contains it.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant={report.eliminationComplete ? "primary" : "secondary"}
                onClick={() => actions.reintroduce(exp.id)}
              >
                {report.eliminationComplete ? "Start to add it back" : "Add it back early"}
              </Button>
              <Button variant="ghost" onClick={() => actions.endExperiment(exp.id, "unclear")}>
                Stop experiment
              </Button>
            </div>
          </>
        )}

        {report.phase === "reintroduce" && (
          <>
            <p className="mt-3 text-sm">
              Eat a normal portion of {name} each day for up to 3 days. Log
              every symptom. Then compare the numbers below and record the
              result.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button variant="danger" onClick={() => actions.endExperiment(exp.id, "reacted")}>
                I reacted
              </Button>
              <Button variant="secondary" onClick={() => actions.endExperiment(exp.id, "no-reaction")}>
                No reaction
              </Button>
              <Button variant="ghost" onClick={() => actions.endExperiment(exp.id, "unclear")}>
                Unclear
              </Button>
            </div>
          </>
        )}
      </Card>

      {report.slips.length > 0 && (
        <Warning tone="amber">
          <strong>
            {report.slips.length} logged meal{report.slips.length > 1 ? "s" : ""} contained{" "}
            {name}
          </strong>{" "}
          while you avoided it:{" "}
          {report.slips
            .slice(0, 3)
            .map(
              (s) =>
                `${formatDay(s.at)} ${formatTime(s.at)} (${s.foodIds
                  .map((id) => foodById(data, id)?.name)
                  .join(", ")})`,
            )
            .join("; ")}
          . Slips make the result less clear.
        </Warning>
      )}

      <Card>
        <h3 className="font-medium">Your symptoms per day</h3>
        <p className="text-xs text-muted">
          Symptoms with a known link to {name} are in the dark bar.
        </p>
        <div className="mt-4 space-y-3">
          {[report.baseline, report.elimination, report.reintroduction]
            .filter((p): p is PhaseStats => !!p)
            .map((p, _, all) => (
              <PhaseBar
                key={p.label}
                p={p}
                max={Math.max(...all.map((x) => x.symptomsPerDay), 0.1)}
              />
            ))}
        </div>
      </Card>

      <details className="rounded-2xl border border-line bg-card p-4">
        <summary className="cursor-pointer text-sm font-medium">Foods to avoid</summary>
        <div className="mt-3">
          <AvoidList data={data} compoundId={exp.compoundId} />
        </div>
      </details>

      <p className="text-xs text-muted">
        Learn more about{" "}
        <Link href={`/compounds/${exp.compoundId}`} className="text-accent underline">
          {compound.name}
        </Link>
        . Discuss your result with a doctor or dietitian.
      </p>
    </div>
  );
}

function PhaseBar({ p, max }: { p: PhaseStats; max: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>
          {p.label}
          <span className="ml-1 text-xs text-muted">({p.days} d)</span>
        </span>
        <span className="tabular-nums text-muted">
          {p.symptomsPerDay.toFixed(1)}/day
          {p.avgSeverity > 0 && ` · severity ${p.avgSeverity.toFixed(1)}`}
        </span>
      </div>
      <div className="relative mt-1 h-3 overflow-hidden rounded-full bg-line/50">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-warn/30"
          style={{ width: `${(p.symptomsPerDay / max) * 100}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-warn"
          style={{ width: `${(p.linkedPerDay / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

