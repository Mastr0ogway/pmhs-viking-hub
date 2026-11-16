"use client";

import { Search, Sparkles } from "lucide-react";
import { Kbd } from "@/components/hub/ui/Kbd";

export interface QuickChipItem {
  label: string;
  query: string;
}

interface HeroSectionProps {
  clubCount: number;
  quickChips: readonly QuickChipItem[];
  onOpenSearch: (initialQuery?: string) => void;
}

export function HeroSection({
  clubCount,
  quickChips,
  onOpenSearch,
}: HeroSectionProps) {
  return (
    <section
      aria-label="Pittsford Mendon Navigation Hero"
      className="relative overflow-hidden rounded-3xl border border-navy/15 bg-navy text-white shadow-xl"
    >
      {/* Decorative Gold & Navy-Light Radial Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/4 h-80 w-80 rounded-full bg-gold/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -bottom-28 h-96 w-96 rounded-full bg-navy-light/90 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="h-1.5 w-full bg-gradient-to-r from-gold via-gold-light to-gold"
      />

      <div className="relative mx-auto max-w-4xl px-6 py-10 text-center sm:px-10 sm:py-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-navy-dark/80 px-3.5 py-1 text-xs font-semibold tracking-wide text-gold">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Pittsford Mendon High School · Viking Resource Hub</span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Your Guide to{" "}
          <span className="text-gold">Pittsford Mendon.</span>
        </h1>

        <p className="mx-auto mt-3.5 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
          Find student clubs and faculty advisors, map out AP, Honors, and
          accelerated coursework, and get step-by-step instructions for everyday
          school forms.
        </p>

        {/* Tactile Spotlight Search Bar Button */}
        <div className="mx-auto mt-7 max-w-2xl">
          <button
            type="button"
            onClick={() => onOpenSearch("")}
            className="group flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-white/20 bg-white px-4 py-3.5 text-left text-slate-600 shadow-lg transition duration-150 hover:-translate-y-0.5 hover:border-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/50 sm:px-5 sm:py-4"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-gold transition group-hover:bg-navy-light">
                <Search className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="truncate text-xs font-medium text-slate-500 sm:text-sm">
                Search {clubCount}+ clubs, AP &amp; accelerated courses, working
                papers, or advisors...
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-1.5">
              <Kbd className="border-navy/20 bg-surface px-2 py-1 text-xs font-bold text-navy">
                ⌘K
              </Kbd>
            </span>
          </button>
        </div>

        {/* Quick-Jump Filter Chips */}
        {quickChips.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-gold/90">
              Quick Jump:
            </span>
            {quickChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => onOpenSearch(chip.query)}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-navy-dark/70 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-gold hover:bg-gold hover:text-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
