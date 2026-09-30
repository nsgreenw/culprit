"use client";

import { useMemo } from "react";
import { Button, Loading, formatDay } from "@/components/ui";
import { findSuspects, recentSymptomCounts } from "@/lib/analysis";
import { COMPOUND_BY_ID, EVIDENCE_LABELS } from "@/lib/data/compounds";
import { SYMPTOM_BY_ID } from "@/lib/data/symptoms";
import { useAppData } from "@/lib/store";

export default function ReportPage() {
  const data = useAppData();
  const suspects = useMemo(
    () => (data ? findSuspects(data).filter((s) => s.strength !== "early") : []),
    [data],
  );
  const counts = useMemo(() => (data ? recentSymptomCounts(data, 30) : new Map()), [data]);
  if (!data) return <Loading />;

  const times = [...data.meals, ...data.symptoms].map((e) => e.at).sort();

  return (
    <article className="space-y-6 text-sm print:text-xs">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Food & symptom summary</h1>
          <p className="text-muted">
            {times.length
              ? `Log from ${formatDay(times[0])} to ${formatDay(times[times.length - 1])}`
              : "No entries"}{" "}
            · {data.meals.length} meals · {data.symptoms.length} symptoms · made{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>
        <Button className="print:hidden" onClick={() => window.print()}>
          Print / PDF
        </Button>
      </div>

      <p className="rounded-lg border border-line p-3 text-muted">
        The patient made this summary with a self-tracking app. The patterns are
        statistical links in self-reported data. They are not a diagnosis.
      </p>

      <section>
        <h2 className="mb-2 font-semibold">Symptoms in the last 30 days</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-1 font-medium">Symptom</th>
              <th className="py-1 font-medium">Times</th>
              <th className="py-1 font-medium">Mean severity (1–5)</th>
            </tr>
          </thead>
          <tbody>
            {[...counts.entries()]
              .sort((a, b) => b[1].n - a[1].n)
              .map(([id, c]) => (
                <tr key={id} className="border-b border-line/60">
                  <td className="py-1">{SYMPTOM_BY_ID[id]?.name}</td>
                  <td className="py-1 tabular-nums">{c.n}</td>
                  <td className="py-1 tabular-nums">{(c.sev / c.n).toFixed(1)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Possible food triggers</h2>
        {suspects.length ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-1 font-medium">Symptom</th>
                <th className="py-1 font-medium">Compound</th>
                <th className="py-1 font-medium">In log</th>
                <th className="py-1 font-medium">Relative risk</th>
                <th className="py-1 font-medium">Literature</th>
              </tr>
            </thead>
            <tbody>
              {suspects.slice(0, 12).map((s) => (
                <tr key={s.symptomId + s.compoundId} className="border-b border-line/60">
                  <td className="py-1">{SYMPTOM_BY_ID[s.symptomId]?.name}</td>
                  <td className="py-1">{COMPOUND_BY_ID[s.compoundId]?.name}</td>
                  <td className="py-1 tabular-nums">
                    {s.hits}/{s.occurrences}
                  </td>
                  <td className="py-1 tabular-nums">
                    {s.lift >= 10 ? ">10" : s.lift.toFixed(1)}×
                  </td>
                  <td className="py-1">
                    {s.knownEvidence ? EVIDENCE_LABELS[s.knownEvidence] : "No known link"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted">No clear patterns yet.</p>
        )}
      </section>

      {data.experiments.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Elimination experiments</h2>
          <ul className="list-disc pl-5">
            {data.experiments.map((e) => (
              <li key={e.id}>
                {COMPOUND_BY_ID[e.compoundId]?.name}: started {formatDay(e.startedAt)},{" "}
                {e.endedAt
                  ? `result: ${e.conclusion === "reacted" ? "reacted on reintroduction" : e.conclusion === "no-reaction" ? "no reaction on reintroduction" : "unclear"}`
                  : "in progress"}
              </li>
            ))}
          </ul>
        </section>
      )}

      {suspects.some((s) => s.compoundId === "gluten") && (
        <p className="font-medium text-warn">
          Gluten appears in the patterns. Please consider celiac serology
          while the patient still eats gluten.
        </p>
      )}
    </article>
  );
}
