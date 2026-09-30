import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, EvidenceBadge, Warning } from "@/components/ui";
import {
  COMPOUND_BY_ID,
  COMPOUNDS,
  inlineName,
  type Evidence,
} from "@/lib/data/compounds";
import { FOODS, LEVEL_LABELS, type Level } from "@/lib/data/foods";
import { SYMPTOM_BY_ID } from "@/lib/data/symptoms";

export function generateStaticParams() {
  return COMPOUNDS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/compounds/[id]">) {
  const { id } = await params;
  return { title: `${COMPOUND_BY_ID[id]?.name ?? "Compound"} · Culprit` };
}

const ORDER: Evidence[] = ["strong", "moderate", "weak"];

export default async function CompoundPage({ params }: PageProps<"/compounds/[id]">) {
  const { id } = await params;
  const c = COMPOUND_BY_ID[id];
  if (!c) notFound();

  const foods = FOODS.filter((f) => f.compounds[id]).sort(
    (a, b) => (b.compounds[id] ?? 0) - (a.compounds[id] ?? 0),
  );
  const [lo, hi] = c.onsetHours;
  const onset = `${lo < 1 ? `${Math.round(lo * 60)} minutes` : `${lo} hours`} to ${hi} hours`;

  return (
    <article className="space-y-6">
      <div>
        <Link href="/compounds" className="text-sm text-accent">
          ← All compounds
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          {c.name}
        </h1>
        <p className="mt-2 text-muted">{c.summary}</p>
      </div>

      {c.warning && <Warning>{c.warning}</Warning>}

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Who reacts</p>
          <p className="mt-1 text-sm">{c.whoReacts}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Typical onset</p>
          <p className="mt-1 text-sm">{onset} after you eat it</p>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Linked symptoms</h2>
        <Card className="divide-y divide-line p-0">
          {ORDER.flatMap((ev) =>
            c.links
              .filter((l) => l.evidence === ev)
              .map((l) => (
                <div key={l.symptomId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span>{SYMPTOM_BY_ID[l.symptomId]?.name}</span>
                  <EvidenceBadge evidence={l.evidence} />
                </div>
              )),
          )}
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Where you find it</h2>
        {([3, 2, 1] as Level[]).map((lvl) => {
          const list = foods.filter((f) => f.compounds[id] === lvl);
          if (!list.length) return null;
          return (
            <p key={lvl} className="mb-2 text-sm">
              <span className="mr-2 font-medium">{LEVEL_LABELS[lvl]}:</span>
              <span className="text-muted">{list.map((f) => f.name).join(" · ")}</span>
            </p>
          );
        })}
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Sources</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {c.sources.map((s) => (
            <li key={s.label}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer" className="text-accent underline">
                  {s.label}
                </a>
              ) : (
                s.label
              )}
            </li>
          ))}
        </ul>
      </section>

      <Link
        href={`/experiments?compound=${id}`}
        className="inline-block rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-paper"
      >
        Test {inlineName(id)} with an experiment
      </Link>
    </article>
  );
}
