import Link from "next/link";
import { Card, EvidenceBadge, PageTitle } from "@/components/ui";
import { COMPOUNDS, type Evidence } from "@/lib/data/compounds";

const ORIGIN_LABEL = {
  plant: "Plant",
  animal: "Animal",
  both: "Plant & animal",
  additive: "Drink / additive",
};

const rank: Record<Evidence, number> = { strong: 3, moderate: 2, weak: 1 };

export default function CompoundsPage() {
  return (
    <>
      <PageTitle
        title="Compounds"
        lead="The food compounds the app tracks, the symptoms they are linked to, and how strong the science is for each link."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {COMPOUNDS.map((c) => {
          const best = c.links.reduce<Evidence>(
            (b, l) => (rank[l.evidence] > rank[b] ? l.evidence : b),
            "weak",
          );
          return (
            <Link key={c.id} href={`/compounds/${c.id}`}>
              <Card className="h-full transition hover:border-accent/50">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold">{c.name}</h2>
                  <span className="shrink-0 text-xs text-muted">
                    {ORIGIN_LABEL[c.origin]}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{c.summary}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                  <span>Best link:</span>
                  <EvidenceBadge evidence={best} />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
