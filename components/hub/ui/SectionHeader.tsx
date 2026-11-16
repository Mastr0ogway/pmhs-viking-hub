import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Kbd } from "@/components/hub/ui/Kbd";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  count: number;
  countLabel: string;
  icon: ReactNode;
  onOpenSearch: () => void;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  count,
  countLabel,
  icon,
  onOpenSearch,
}: SectionHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-navy/15 bg-navy text-white shadow-md">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="h-1 w-full bg-gradient-to-r from-gold via-gold-light to-gold"
      />

      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-navy-dark text-gold shadow-sm">
            {icon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
                {eyebrow}
              </span>
              <span className="inline-flex items-center rounded-full border border-gold/40 bg-navy-dark/80 px-2.5 py-0.5 font-mono text-xs font-semibold text-gold">
                {count} {countLabel}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-200">
              {description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSearch}
          className="inline-flex shrink-0 items-center gap-3 self-start rounded-xl border border-white/20 bg-navy-dark/80 px-4 py-2.5 text-xs font-semibold text-white transition hover:border-gold/60 hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:self-center"
        >
          <Search className="h-4 w-4 text-gold" />
          <span>Search all records</span>
          <Kbd variant="dark">⌘K</Kbd>
        </button>
      </div>
    </div>
  );
}
