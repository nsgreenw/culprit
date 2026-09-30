"use client";

import { useState } from "react";
import { BODY_SYSTEM_LABELS, SYMPTOMS, type BodySystem } from "@/lib/data/symptoms";
import { actions, type SymptomEntry } from "@/lib/store";
import { Chip } from "./food-form";
import { Button, toLocalInput } from "./ui";

const SEVERITY_LABELS = ["Very mild", "Mild", "Moderate", "Strong", "Severe"];

export function SymptomForm({ onDone }: { onDone: () => void }) {
  const [symptomId, setSymptomId] = useState<string | null>(null);
  const [severity, setSeverity] = useState<SymptomEntry["severity"]>(3);
  const [when, setWhen] = useState(() => toLocalInput());
  const [note, setNote] = useState("");

  const systems = Object.keys(BODY_SYSTEM_LABELS) as BodySystem[];

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">What do you feel?</p>
      <div className="space-y-3">
        {systems.map((sys) => (
          <div key={sys}>
            <p className="mb-1.5 text-xs uppercase tracking-wide text-muted">
              {BODY_SYSTEM_LABELS[sys]}
            </p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.filter((s) => s.system === sys).map((s) => (
                <Chip
                  key={s.id}
                  active={symptomId === s.id}
                  onClick={() => setSymptomId(s.id)}
                >
                  {s.name}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>

      <fieldset>
        <legend className="text-sm font-medium">How strong?</legend>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {SEVERITY_LABELS.map((label, i) => {
            const value = (i + 1) as SymptomEntry["severity"];
            return (
              <button
                key={label}
                onClick={() => setSeverity(value)}
                aria-pressed={severity === value}
                className={`rounded-xl border px-1 py-2 text-center text-xs transition ${
                  severity === value
                    ? "border-accent bg-accent text-paper"
                    : "border-line bg-card"
                }`}
              >
                <span className="block text-base font-semibold">{value}</span>
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium">When did it start?</span>
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
            placeholder="Stress, bad sleep, period…"
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2"
          />
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button
          disabled={!symptomId || !when}
          onClick={() => {
            actions.addSymptom({
              at: new Date(when).toISOString(),
              symptomId: symptomId!,
              severity,
              note: note.trim() || undefined,
            });
            onDone();
          }}
        >
          Save symptom
        </Button>
      </div>
    </div>
  );
}
