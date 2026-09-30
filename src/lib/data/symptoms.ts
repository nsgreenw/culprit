/*
 * SPDX-License-Identifier: CC-BY-SA-4.0
 * This data file is licensed under CC BY-SA 4.0 (see LICENSE-DATA).
 * Contribution rules for data: see CONTRIBUTING.md.
 */

export type BodySystem =
  | "digestive"
  | "head"
  | "skin"
  | "joints"
  | "breathing"
  | "energy"
  | "mood"
  | "heart";

export interface Symptom {
  id: string;
  name: string;
  system: BodySystem;
}

export const BODY_SYSTEM_LABELS: Record<BodySystem, string> = {
  digestive: "Digestive",
  head: "Head",
  skin: "Skin",
  joints: "Joints & muscles",
  breathing: "Nose & breathing",
  energy: "Energy & sleep",
  mood: "Mood & mind",
  heart: "Heart",
};

export const SYMPTOMS: Symptom[] = [
  { id: "bloating", name: "Bloating", system: "digestive" },
  { id: "gas", name: "Gas", system: "digestive" },
  { id: "abdominal-pain", name: "Stomach pain or cramps", system: "digestive" },
  { id: "diarrhea", name: "Diarrhea", system: "digestive" },
  { id: "constipation", name: "Constipation", system: "digestive" },
  { id: "nausea", name: "Nausea", system: "digestive" },
  { id: "reflux", name: "Heartburn or reflux", system: "digestive" },
  { id: "mouth-ulcers", name: "Mouth ulcers", system: "digestive" },
  { id: "headache", name: "Headache", system: "head" },
  { id: "migraine", name: "Migraine", system: "head" },
  { id: "brain-fog", name: "Brain fog", system: "head" },
  { id: "rash", name: "Rash or eczema", system: "skin" },
  { id: "hives", name: "Hives", system: "skin" },
  { id: "itching", name: "Itching", system: "skin" },
  { id: "flushing", name: "Flushing", system: "skin" },
  { id: "acne", name: "Acne", system: "skin" },
  { id: "joint-pain", name: "Joint pain or stiffness", system: "joints" },
  { id: "muscle-aches", name: "Muscle aches", system: "joints" },
  { id: "congestion", name: "Stuffy or runny nose", system: "breathing" },
  { id: "wheeze", name: "Wheeze or tight chest", system: "breathing" },
  { id: "fatigue", name: "Fatigue", system: "energy" },
  { id: "poor-sleep", name: "Poor sleep", system: "energy" },
  { id: "anxiety", name: "Anxiety or jitters", system: "mood" },
  { id: "low-mood", name: "Low mood", system: "mood" },
  { id: "palpitations", name: "Racing or pounding heart", system: "heart" },
];

export const SYMPTOM_BY_ID: Record<string, Symptom> = Object.fromEntries(
  SYMPTOMS.map((s) => [s.id, s]),
);
