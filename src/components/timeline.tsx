"use client";

import { shortName } from "@/lib/data/compounds";
import { SYMPTOM_BY_ID } from "@/lib/data/symptoms";
import { actions, foodById, type AppData } from "@/lib/store";
import { formatDay, formatTime } from "./ui";

type Item =
  | { kind: "meal"; id: string; at: string; title: string; detail: string; note?: string }
  | { kind: "symptom"; id: string; at: string; title: string; severity: number; note?: string };

export function Timeline({
  data,
  since,
}: {
  data: AppData;
  /** Only show entries at or after this time (ms). */
  since?: number;
}) {
  const items: Item[] = [
    ...data.meals.map((m): Item => {
      const foods = m.foodIds.map((id) => foodById(data, id)).filter(Boolean);
      const compounds = new Set(foods.flatMap((f) => Object.keys(f!.compounds)));
      return {
        kind: "meal",
        id: m.id,
        at: m.at,
        title: foods.map((f) => f!.name).join(", "),
        detail: [...compounds]
          .map((c) => shortName(c))
          .join(" · "),
        note: m.note,
      };
    }),
    ...data.symptoms.map(
      (s): Item => ({
        kind: "symptom",
        id: s.id,
        at: s.at,
        title: SYMPTOM_BY_ID[s.symptomId]?.name ?? s.symptomId,
        severity: s.severity,
        note: s.note,
      }),
    ),
  ]
    .filter((i) => since === undefined || Date.parse(i.at) >= since)
    .sort((a, b) => b.at.localeCompare(a.at));

  if (!items.length)
    return <p className="py-6 text-center text-sm text-muted">No entries yet.</p>;

  const days = new Map<string, Item[]>();
  for (const item of items) {
    const key = new Date(item.at).toDateString();
    days.set(key, [...(days.get(key) ?? []), item]);
  }

  return (
    <div className="space-y-6">
      {[...days.entries()].map(([key, dayItems]) => (
        <section key={key}>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            {formatDay(dayItems[0].at)}
          </h3>
          <ol className="relative space-y-2 border-l border-line pl-4">
            {dayItems.map((item) => (
              <li key={item.id} className="group relative">
                <span
                  className={`absolute -left-[21px] top-3 h-2.5 w-2.5 rounded-full ring-4 ring-paper ${
                    item.kind === "meal" ? "bg-accent" : "bg-warn"
                  }`}
                />
                <div className="flex items-start justify-between gap-3 rounded-xl bg-card px-3 py-2 ring-1 ring-line">
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="mr-2 tabular-nums text-muted">
                        {formatTime(item.at)}
                      </span>
                      <span className="font-medium">{item.title}</span>
                      {item.kind === "symptom" && (
                        <span className="ml-2 text-xs text-warn">
                          {"●".repeat(item.severity)}
                          <span className="opacity-25">
                            {"●".repeat(5 - item.severity)}
                          </span>
                        </span>
                      )}
                    </p>
                    {item.kind === "meal" && item.detail && (
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {item.detail}
                      </p>
                    )}
                    {item.note && (
                      <p className="mt-0.5 text-xs italic text-muted">
                        {item.note}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      item.kind === "meal"
                        ? actions.deleteMeal(item.id)
                        : actions.deleteSymptom(item.id)
                    }
                    className="text-xs text-muted opacity-60 hover:text-warn hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Delete ${item.title}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
