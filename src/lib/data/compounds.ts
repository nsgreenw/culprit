/*
 * SPDX-License-Identifier: CC-BY-SA-4.0
 * This data file is licensed under CC BY-SA 4.0 (see LICENSE-DATA).
 * Contribution rules for data: see CONTRIBUTING.md.
 */

/**
 * Starter compound database.
 *
 * Every link between a compound and a symptom carries an evidence level:
 * - strong:   established in clinical guidelines or consistent controlled trials.
 * - moderate: controlled trials exist, but results vary or apply to a subgroup.
 * - weak:     mechanism, animal data, case reports, or anecdote only.
 *
 * PROTOTYPE DATA: a qualified reviewer (dietitian / physician) must check
 * every entry and source before a public release.
 */

export type Evidence = "strong" | "moderate" | "weak";
export type Origin = "plant" | "animal" | "both" | "additive";

export interface SymptomLink {
  symptomId: string;
  evidence: Evidence;
}

export interface Source {
  label: string;
  url?: string;
}

export interface Compound {
  id: string;
  name: string;
  origin: Origin;
  summary: string;
  /** Who is most likely to react. */
  whoReacts: string;
  /** Hours after eating when symptoms usually start: [earliest, latest]. */
  onsetHours: [number, number];
  links: SymptomLink[];
  /** Safety note shown prominently, e.g. test before elimination. */
  warning?: string;
  sources: Source[];
}

export const EVIDENCE_LABELS: Record<Evidence, string> = {
  strong: "Strong evidence",
  moderate: "Moderate evidence",
  weak: "Weak evidence",
};

export const EVIDENCE_WEIGHT: Record<Evidence, number> = {
  strong: 1,
  moderate: 0.7,
  weak: 0.4,
};

export const COMPOUNDS: Compound[] = [
  {
    id: "gluten",
    name: "Gluten",
    origin: "plant",
    summary:
      "A protein group in wheat, barley, and rye. In celiac disease it triggers an immune attack on the small intestine. Some people without celiac also report symptoms.",
    whoReacts:
      "About 1% of people have celiac disease, and many do not know. Others have wheat allergy or non-celiac gluten sensitivity.",
    onsetHours: [1, 72],
    links: [
      { symptomId: "bloating", evidence: "strong" },
      { symptomId: "diarrhea", evidence: "strong" },
      { symptomId: "abdominal-pain", evidence: "strong" },
      { symptomId: "fatigue", evidence: "strong" },
      { symptomId: "rash", evidence: "strong" },
      { symptomId: "mouth-ulcers", evidence: "moderate" },
      { symptomId: "constipation", evidence: "moderate" },
      { symptomId: "brain-fog", evidence: "moderate" },
      { symptomId: "joint-pain", evidence: "moderate" },
      { symptomId: "headache", evidence: "moderate" },
      { symptomId: "low-mood", evidence: "weak" },
    ],
    warning:
      "Get a celiac blood test BEFORE you remove gluten. The test needs gluten in your diet to work. If you stop first, the result can be falsely negative.",
    sources: [
      {
        label: "NIDDK — Celiac disease",
        url: "https://www.niddk.nih.gov/health-information/digestive-diseases/celiac-disease",
      },
      {
        label: "Catassi et al. 2015, Nutrients 7(6):4966 — Salerno criteria for non-celiac gluten sensitivity",
      },
      {
        label: "Rash link: dermatitis herpetiformis is the skin form of celiac disease (NIDDK)",
      },
    ],
  },
  {
    id: "fodmaps",
    name: "FODMAPs (fermentable sugars)",
    origin: "both",
    summary:
      "Short-chain sugars and fibers (fructans, GOS, lactose, excess fructose, polyols) that the small intestine absorbs poorly. Gut bacteria ferment them, which makes gas and draws in water.",
    whoReacts:
      "People with IBS or a sensitive gut. The low-FODMAP diet helps about 50–75% of people with IBS in trials.",
    onsetHours: [0.5, 24],
    links: [
      { symptomId: "bloating", evidence: "strong" },
      { symptomId: "gas", evidence: "strong" },
      { symptomId: "abdominal-pain", evidence: "strong" },
      { symptomId: "diarrhea", evidence: "strong" },
      { symptomId: "constipation", evidence: "moderate" },
      { symptomId: "fatigue", evidence: "weak" },
    ],
    sources: [
      {
        label: "Monash University — FODMAPs and IBS",
        url: "https://www.monashfodmap.com/about-fodmap-and-ibs/",
      },
      {
        label: "Skodje et al. 2018, Gastroenterology 154(3):529 — fructans, not gluten, caused symptoms in self-reported gluten sensitivity",
      },
    ],
  },
  {
    id: "lactose",
    name: "Lactose",
    origin: "animal",
    summary:
      "The sugar in milk. Without enough of the enzyme lactase, lactose reaches the colon and ferments.",
    whoReacts:
      "Most adults in the world make less lactase after childhood. Hard aged cheese and butter contain very little lactose.",
    onsetHours: [0.5, 6],
    links: [
      { symptomId: "bloating", evidence: "strong" },
      { symptomId: "gas", evidence: "strong" },
      { symptomId: "diarrhea", evidence: "strong" },
      { symptomId: "abdominal-pain", evidence: "strong" },
      { symptomId: "nausea", evidence: "moderate" },
    ],
    sources: [
      {
        label: "NIDDK — Lactose intolerance",
        url: "https://www.niddk.nih.gov/health-information/digestive-diseases/lactose-intolerance",
      },
    ],
  },
  {
    id: "casein",
    name: "Milk protein (casein & whey)",
    origin: "animal",
    summary:
      "The proteins in dairy. A milk allergy is an immune reaction to them. This is different from lactose intolerance.",
    whoReacts:
      "Milk allergy is common in young children and less common in adults. Some adults report non-allergic reactions; the evidence for these is limited.",
    onsetHours: [0, 48],
    links: [
      { symptomId: "hives", evidence: "strong" },
      { symptomId: "rash", evidence: "moderate" },
      { symptomId: "wheeze", evidence: "strong" },
      { symptomId: "diarrhea", evidence: "moderate" },
      { symptomId: "congestion", evidence: "weak" },
      { symptomId: "acne", evidence: "weak" },
    ],
    warning:
      "Swelling of the lips, tongue, or throat, or trouble breathing, is an emergency. Call emergency services.",
    sources: [
      {
        label: "NIAID — Guidelines for the diagnosis and management of food allergy (2010)",
      },
    ],
  },
  {
    id: "histamine",
    name: "Histamine",
    origin: "both",
    summary:
      "A compound that builds up in aged, fermented, cured, and leftover foods, and in some fish. The body breaks it down with the enzyme DAO.",
    whoReacts:
      "People with low DAO activity (histamine intolerance). Very high levels in spoiled fish make anyone sick (scombroid poisoning).",
    onsetHours: [0.25, 12],
    links: [
      { symptomId: "headache", evidence: "moderate" },
      { symptomId: "migraine", evidence: "moderate" },
      { symptomId: "flushing", evidence: "moderate" },
      { symptomId: "hives", evidence: "moderate" },
      { symptomId: "itching", evidence: "moderate" },
      { symptomId: "congestion", evidence: "moderate" },
      { symptomId: "palpitations", evidence: "moderate" },
      { symptomId: "diarrhea", evidence: "moderate" },
      { symptomId: "abdominal-pain", evidence: "weak" },
      { symptomId: "anxiety", evidence: "weak" },
      { symptomId: "poor-sleep", evidence: "weak" },
    ],
    sources: [
      {
        label: "Maintz & Novak 2007, Am J Clin Nutr 85(5):1185 — Histamine and histamine intolerance",
      },
      {
        label: "Skypala et al. 2015, Clin Transl Allergy 5:34 — food additives, vasoactive amines and salicylates",
      },
    ],
  },
  {
    id: "tyramine",
    name: "Tyramine",
    origin: "both",
    summary:
      "An amine that forms as protein ages. It is high in aged cheese, cured meat, and fermented foods.",
    whoReacts:
      "Some migraine sufferers. People who take MAO-inhibitor drugs must limit it for safety.",
    onsetHours: [0.5, 24],
    links: [
      { symptomId: "migraine", evidence: "moderate" },
      { symptomId: "headache", evidence: "moderate" },
      { symptomId: "palpitations", evidence: "weak" },
    ],
    sources: [
      {
        label: "Hindiyeh et al. 2020, Headache 60(7):1300 — diet and nutrition in migraine triggers",
      },
    ],
  },
  {
    id: "salicylates",
    name: "Salicylates",
    origin: "plant",
    summary:
      "Natural plant chemicals related to aspirin. Levels are high in many spices, berries, dried fruit, tea, and mint.",
    whoReacts:
      "A small group of people, often those who also react to aspirin (for example with nasal polyps or asthma).",
    onsetHours: [0.5, 24],
    links: [
      { symptomId: "congestion", evidence: "moderate" },
      { symptomId: "wheeze", evidence: "moderate" },
      { symptomId: "hives", evidence: "moderate" },
      { symptomId: "headache", evidence: "weak" },
      { symptomId: "abdominal-pain", evidence: "weak" },
      { symptomId: "rash", evidence: "weak" },
    ],
    sources: [
      {
        label: "Skypala et al. 2015, Clin Transl Allergy 5:34 — food additives, vasoactive amines and salicylates",
      },
    ],
  },
  {
    id: "lectins",
    name: "Lectins (raw legumes)",
    origin: "plant",
    summary:
      "Proteins that bind to sugars on cells. Phytohaemagglutinin in raw or undercooked kidney beans causes acute food poisoning. Proper boiling destroys most of it.",
    whoReacts:
      "Anyone who eats raw or undercooked beans. Claims that cooked lectins cause chronic disease have weak evidence.",
    onsetHours: [1, 6],
    links: [
      { symptomId: "nausea", evidence: "strong" },
      { symptomId: "diarrhea", evidence: "strong" },
      { symptomId: "abdominal-pain", evidence: "strong" },
      { symptomId: "bloating", evidence: "weak" },
      { symptomId: "joint-pain", evidence: "weak" },
      { symptomId: "fatigue", evidence: "weak" },
    ],
    sources: [
      {
        label: "FDA Bad Bug Book, 2nd ed. (2012) — Phytohaemagglutinin (kidney bean lectin)",
      },
    ],
  },
  {
    id: "oxalates",
    name: "Oxalates",
    origin: "plant",
    summary:
      "Compounds that bind calcium. They are very high in spinach, rhubarb, beets, almonds, and some other nuts and seeds.",
    whoReacts:
      "People who form calcium-oxalate kidney stones, and people with fat malabsorption. Links to joint pain and fatigue are mostly anecdotal.",
    onsetHours: [6, 72],
    links: [
      { symptomId: "joint-pain", evidence: "weak" },
      { symptomId: "fatigue", evidence: "weak" },
      { symptomId: "muscle-aches", evidence: "weak" },
    ],
    warning:
      "Oxalates are a strong risk factor for kidney stones. Stone pain is a sharp pain in the back or side. See a doctor for it.",
    sources: [
      {
        label: "NIDDK — Eating, diet & nutrition for kidney stones",
        url: "https://www.niddk.nih.gov/health-information/urologic-diseases/kidney-stones/eating-diet-nutrition",
      },
      {
        label: "Mitchell et al. 2019, Am J Physiol Renal Physiol 316(3):F409 — dietary oxalate and kidney stones",
      },
    ],
  },
  {
    id: "glycoalkaloids",
    name: "Glycoalkaloids (solanine)",
    origin: "plant",
    summary:
      "Natural defense chemicals in nightshade plants. Levels are highest in green or sprouted potatoes and potato skins.",
    whoReacts:
      "Anyone at high doses, for example from green potatoes. A link between normal nightshade intake and joint pain is popular but not proven.",
    onsetHours: [2, 24],
    links: [
      { symptomId: "nausea", evidence: "strong" },
      { symptomId: "diarrhea", evidence: "strong" },
      { symptomId: "abdominal-pain", evidence: "strong" },
      { symptomId: "headache", evidence: "moderate" },
      { symptomId: "joint-pain", evidence: "weak" },
    ],
    sources: [
      {
        label: "Friedman 2006, J Agric Food Chem 54(23):8655 — potato glycoalkaloids in the diet",
      },
    ],
  },
  {
    id: "capsaicin",
    name: "Capsaicin",
    origin: "plant",
    summary:
      "The hot compound in chili peppers. It activates pain receptors in the mouth and gut.",
    whoReacts:
      "People with reflux or IBS often react. Tolerance varies a lot between people.",
    onsetHours: [0, 8],
    links: [
      { symptomId: "reflux", evidence: "moderate" },
      { symptomId: "abdominal-pain", evidence: "moderate" },
      { symptomId: "diarrhea", evidence: "moderate" },
      { symptomId: "flushing", evidence: "moderate" },
    ],
    sources: [
      {
        label: "Gonlachanvit 2010, J Neurogastroenterol Motil 16(2):131 — spicy diet and functional GI disorders",
      },
    ],
  },
  {
    id: "goitrogens",
    name: "Goitrogens",
    origin: "plant",
    summary:
      "Compounds in raw cruciferous vegetables, soy, and cassava that can reduce iodine uptake by the thyroid.",
    whoReacts:
      "Mostly people with iodine deficiency who eat very large amounts. Normal intake of cooked vegetables shows little effect in studies.",
    onsetHours: [24, 72],
    links: [
      { symptomId: "fatigue", evidence: "weak" },
      { symptomId: "low-mood", evidence: "weak" },
    ],
    sources: [
      {
        label: "Felker et al. 2016, Nutr Rev 74(4):248 — goitrin and thiocyanate from brassica vegetables and thyroid risk",
      },
    ],
  },
  {
    id: "phytates",
    name: "Phytates (phytic acid)",
    origin: "plant",
    summary:
      "The storage form of phosphorus in grains, beans, nuts, and seeds. Phytates bind iron, zinc, and calcium and reduce their absorption.",
    whoReacts:
      "People whose diet depends on grains and legumes can become low in iron or zinc. Phytates do not cause acute symptoms.",
    onsetHours: [24, 72],
    links: [{ symptomId: "fatigue", evidence: "weak" }],
    sources: [
      {
        label: "Gupta et al. 2015, J Food Sci Technol 52(2):676 — phytic acid and micronutrient bioavailability",
      },
    ],
  },
  {
    id: "caffeine",
    name: "Caffeine",
    origin: "plant",
    summary:
      "A stimulant in coffee, tea, cocoa, and energy drinks. Its effect can last 6 hours or more.",
    whoReacts:
      "Everyone at high doses. Slow caffeine metabolizers react more, and for longer.",
    onsetHours: [0, 10],
    links: [
      { symptomId: "poor-sleep", evidence: "strong" },
      { symptomId: "anxiety", evidence: "strong" },
      { symptomId: "palpitations", evidence: "moderate" },
      { symptomId: "reflux", evidence: "moderate" },
      { symptomId: "headache", evidence: "moderate" },
      { symptomId: "diarrhea", evidence: "weak" },
    ],
    sources: [
      {
        label: "Drake et al. 2013, J Clin Sleep Med 9(11):1195 — caffeine 0, 3, or 6 hours before bed",
      },
    ],
  },
  {
    id: "alcohol",
    name: "Alcohol",
    origin: "additive",
    summary:
      "Ethanol in beer, wine, and spirits. It irritates the gut, disturbs sleep, and blocks histamine breakdown.",
    whoReacts: "Everyone, in a dose-dependent way.",
    onsetHours: [0, 24],
    links: [
      { symptomId: "poor-sleep", evidence: "strong" },
      { symptomId: "reflux", evidence: "strong" },
      { symptomId: "headache", evidence: "strong" },
      { symptomId: "flushing", evidence: "strong" },
      { symptomId: "diarrhea", evidence: "moderate" },
      { symptomId: "low-mood", evidence: "moderate" },
      { symptomId: "anxiety", evidence: "moderate" },
    ],
    sources: [
      {
        label: "NIAAA — Alcohol's effects on health",
        url: "https://www.niaaa.nih.gov/alcohols-effects-health",
      },
    ],
  },
  {
    id: "sulfites",
    name: "Sulfites",
    origin: "additive",
    summary:
      "Preservatives in wine, dried fruit, some processed meats, and pickled foods.",
    whoReacts:
      "About 3–10% of people with asthma. Reactions in people without asthma are uncommon.",
    onsetHours: [0, 2],
    links: [
      { symptomId: "wheeze", evidence: "strong" },
      { symptomId: "flushing", evidence: "moderate" },
      { symptomId: "hives", evidence: "moderate" },
      { symptomId: "headache", evidence: "weak" },
    ],
    warning:
      "If you have asthma and get a tight chest after food, talk to your doctor. Keep your inhaler with you.",
    sources: [
      {
        label: "Vally & Misso 2012, Gastroenterol Hepatol Bed Bench 5(1):16 — adverse reactions to sulphite additives",
      },
    ],
  },
  {
    id: "nickel",
    name: "Dietary nickel",
    origin: "plant",
    summary:
      "A metal that plants take up from soil. It is high in cocoa, legumes, nuts, oats, and whole grains.",
    whoReacts:
      "Some people with a nickel contact allergy get skin flares from high-nickel food (systemic nickel allergy).",
    onsetHours: [6, 48],
    links: [
      { symptomId: "rash", evidence: "moderate" },
      { symptomId: "itching", evidence: "moderate" },
      { symptomId: "bloating", evidence: "weak" },
    ],
    sources: [
      {
        label: "Sharma 2013, Indian J Dermatol 58(3):240 — low nickel diet in dermatology",
      },
    ],
  },
];

export const COMPOUND_BY_ID: Record<string, Compound> = Object.fromEntries(
  COMPOUNDS.map((c) => [c.id, c]),
);

/** "FODMAPs (fermentable sugars)" -> "FODMAPs". */
export function shortName(id: string): string {
  return COMPOUND_BY_ID[id]?.name.split(" (")[0] ?? id;
}

/** Short name for use inside a sentence: lower case, but keeps acronyms. */
export function inlineName(id: string): string {
  const name = shortName(id);
  return /^[A-Z]{2,}/.test(name) ? name : name.toLowerCase();
}
