"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BASE_PATH } from "@/lib/site";

const LINKS = [
  { href: "/", label: "Today", icon: "M4 12h16M12 4v16" },
  { href: "/history", label: "History", icon: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
  { href: "/patterns", label: "Patterns", icon: "M4 18 9 12l4 3 7-9" },
  { href: "/experiments", label: "Experiments", icon: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" },
  { href: "/compounds", label: "Compounds", icon: "M4 6h16M4 12h16M4 18h10" },
];

export function Nav() {
  const path = usePathname();
  const active = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE_PATH}/icon.svg`} alt="" className="h-7 w-7" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Elimination
            </span>
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  active(l.href)
                    ? "bg-ink text-paper"
                    : "text-muted hover:bg-line/60 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/settings"
            className="text-sm text-muted hover:text-ink"
            aria-label="Settings and data"
          >
            Data
          </Link>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        <div className="grid grid-cols-5">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-1 py-2 text-[11px] ${
                active(l.href) ? "text-accent" : "text-muted"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d={l.icon} />
              </svg>
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
