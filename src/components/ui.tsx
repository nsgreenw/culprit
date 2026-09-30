import type { ReactNode } from "react";
import { EVIDENCE_LABELS, type Evidence } from "@/lib/data/compounds";
import type { Strength } from "@/lib/analysis";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-line bg-card p-4 ${className}`}>
      {children}
    </div>
  );
}

export function PageTitle({
  title,
  lead,
}: {
  title: string;
  lead?: ReactNode;
}) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      {lead && <p className="mt-2 max-w-prose text-muted">{lead}</p>}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary: "bg-accent text-paper hover:opacity-90",
    secondary: "border border-line bg-card hover:bg-line/40",
    ghost: "text-muted hover:text-ink hover:bg-line/40",
    danger: "border border-warn/40 text-warn hover:bg-warn-soft",
  }[variant];
  return (
    <button
      {...props}
      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

const EVIDENCE_STYLE: Record<Evidence, string> = {
  strong: "bg-accent text-paper border-accent",
  moderate: "bg-accent-soft text-accent border-accent/30",
  weak: "bg-transparent text-muted border-line",
};

export function EvidenceBadge({ evidence }: { evidence: Evidence }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${EVIDENCE_STYLE[evidence]}`}
      title="How strong the science is for this link in general"
    >
      <Dots n={evidence === "strong" ? 3 : evidence === "moderate" ? 2 : 1} />
      {EVIDENCE_LABELS[evidence]}
    </span>
  );
}

function Dots({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i <= n ? "bg-current" : "bg-current opacity-25"
          }`}
        />
      ))}
    </span>
  );
}

const STRENGTH_STYLE: Record<Strength, { label: string; cls: string }> = {
  strong: { label: "Strong pattern", cls: "bg-warn-soft text-warn" },
  possible: { label: "Possible pattern", cls: "bg-amber-soft text-amber" },
  early: { label: "Early signal", cls: "bg-line/60 text-muted" },
};

export function StrengthBadge({ strength }: { strength: Strength }) {
  const s = STRENGTH_STYLE[strength];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}
      title="How strong the pattern is in YOUR log"
    >
      {s.label}
    </span>
  );
}

export function Warning({
  children,
  tone = "warn",
}: {
  children: ReactNode;
  tone?: "warn" | "amber";
}) {
  const cls =
    tone === "warn"
      ? "border-warn/30 bg-warn-soft text-warn"
      : "border-amber/30 bg-amber-soft text-amber";
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${cls}`} role="note">
      {children}
    </div>
  );
}

export function Loading() {
  return (
    <div className="space-y-3" aria-busy>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-line/40" />
      ))}
    </div>
  );
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/** Value for <input type="datetime-local"> in local time. */
export function toLocalInput(date = new Date()) {
  const off = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - off).toISOString().slice(0, 16);
}
