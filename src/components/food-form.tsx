"use client";

import { useMemo, useState } from "react";
import { COMPOUNDS, inlineName, shortName } from "@/lib/data/compounds";
import { LEVEL_LABELS, type Food, type Level } from "@/lib/data/foods";
import { actions, allFoods, foodById, type AppData } from "@/lib/store";
import { Button, toLocalInput } from "./ui";

export function FoodForm({
  data,
  onDone,
}: {
  data: AppData;
  onDone: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [when, setWhen] = useState(() => toLocalInput());
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);

  const foods = allFoods(data);
  const recent = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of data.meals.slice(0, 60))
      for (const id of m.foodIds) counts.set(id, (counts.get(id) ?? 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id)
      .filter((id) => foodById(data, id));
  }, [data]);

  const q = query.trim().toLowerCase();
  const matches = q
    ? foods.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 8)
    : [];

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const compoundsInMeal = useMemo(() => {
    const max = new Map<string, number>();
    for (const id of selected) {
      const food = foodById(data, id);
      for (const [c, lvl] of Object.entries(food?.compounds ?? {}))
        max.set(c, Math.max(max.get(c) ?? 0, lvl));
    }
    return [...max.entries()].sort((a, b) => b[1] - a[1]);
  }, [selected, data]);

  const active = data.experiments.find((e) => !e.endedAt && !e.reintroducedAt);
  const conflict =
    active && compoundsInMeal.some(([c]) => c === active.compoundId)
      ? active.compoundId
      : null;

  const submit = () => {
    actions.addMeal({
      at: new Date(when).toISOString(),
      foodIds: selected,
      note: note.trim() || undefined,
    });
    onDone();
  };

  if (creating)
    return (
      <CustomFoodForm
        initialName={query}
        onCancel={() => setCreating(false)}
        onCreated={(food) => {
          setSelected((s) => [...s, food.id]);
          setQuery("");
          setCreating(false);
        }}
      />
    );

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium" htmlFor="food-search">
          What did you eat or drink?
        </label>
        <input
          id="food-search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search: eggs, coffee, pizza…"
          className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2.5 outline-none focus:border-accent"
        />
      </div>

      {q && (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {matches.map((f) => (
            <li key={f.id}>
              <button
                onClick={() => {
                  toggle(f.id);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-line/40"
              >
                <span>{f.name}</span>
                <span className="text-xs text-muted">
                  {Object.keys(f.compounds)
                    .map((c) => shortName(c))
                    .join(", ") || "No tracked compounds"}
                </span>
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => setCreating(true)}
              className="w-full px-3 py-2 text-left text-sm text-accent hover:bg-line/40"
            >
              + Add “{query.trim()}” as a new food
            </button>
          </li>
        </ul>
      )}

      {!q && recent.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted">
            You often log
          </p>
          <div className="flex flex-wrap gap-2">
            {recent.map((id) => (
              <Chip
                key={id}
                active={selected.includes(id)}
                onClick={() => toggle(id)}
              >
                {foodById(data, id)!.name}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div className="rounded-xl bg-paper p-3">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted">
            This meal
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => (
              <Chip key={id} active onClick={() => toggle(id)}>
                {foodById(data, id)?.name} ✕
              </Chip>
            ))}
          </div>
          {compoundsInMeal.length > 0 && (
            <p className="mt-3 text-sm text-muted">
              Contains:{" "}
              {compoundsInMeal
                .map(
                  ([c, lvl]) =>
                    `${shortName(c)} (${LEVEL_LABELS[lvl as Level].toLowerCase()})`,
                )
                .join(", ")}
            </p>
          )}
        </div>
      )}

      {conflict && (
        <p className="rounded-xl border border-amber/30 bg-amber-soft px-3 py-2 text-sm text-amber">
          This meal contains {inlineName(conflict)}. You avoid it in your
          current experiment. Log it anyway if you ate it: an honest log
          gives a clearer result.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium">When</span>
          <input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Note (optional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Restaurant, big portion…"
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2"
          />
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button disabled={!selected.length || !when} onClick={submit}>
          Save meal
        </Button>
      </div>
    </div>
  );
}

function CustomFoodForm({
  initialName,
  onCancel,
  onCreated,
}: {
  initialName: string;
  onCancel: () => void;
  onCreated: (food: Food) => void;
}) {
  const [name, setName] = useState(initialName.trim());
  const [levels, setLevels] = useState<Record<string, Level>>({});

  const set = (id: string, lvl: Level | 0) =>
    setLevels((l) => {
      const next = { ...l };
      if (lvl) next[id] = lvl;
      else delete next[id];
      return next;
    });

  return (
    <div className="space-y-4">
      <label className="block text-sm">
        <span className="font-medium">Food name</span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2.5"
        />
      </label>
      <div>
        <p className="text-sm font-medium">Which compounds does it contain?</p>
        <p className="text-xs text-muted">
          Not sure? Leave them at “None”. Tip: log a mixed dish as its
          ingredients instead.
        </p>
        <div className="mt-2 divide-y divide-line rounded-xl border border-line">
          {COMPOUNDS.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
            >
              <span>{c.name}</span>
              <select
                value={levels[c.id] ?? 0}
                onChange={(e) => set(c.id, Number(e.target.value) as Level | 0)}
                className="rounded-lg border border-line bg-paper px-2 py-1"
              >
                <option value={0}>None</option>
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
              </select>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Back
        </Button>
        <Button
          disabled={!name.trim()}
          onClick={() =>
            onCreated(
              actions.addCustomFood({
                name: name.trim(),
                group: "Other",
                compounds: levels,
              }),
            )
          }
        >
          Add food
        </Button>
      </div>
    </div>
  );
}

export function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? "border-accent bg-accent text-paper"
          : "border-line bg-card hover:border-accent/50"
      }`}
    >
      {children}
    </button>
  );
}
