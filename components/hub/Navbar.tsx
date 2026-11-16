"use client";

import { useRef, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  ExternalLink,
  GraduationCap,
  Info,
  LayoutGrid,
  Phone,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { Kbd } from "@/components/hub/ui/Kbd";
import { formatEasternTimestamp } from "@/lib/format";
import { HUB_VIEWS, type HubView } from "@/lib/hub-records";
import { cn } from "@/lib/utils";

interface NavbarProps {
  activeView: HubView;
  onSelectView: (view: HubView) => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  clubCount: number;
  pathwayCount: number;
  guideCount: number;
  fetchedAt: string;
}

export function Navbar({
  activeView,
  onSelectView,
  onOpenSearch,
  onOpenAdmin,
  clubCount,
  pathwayCount,
  guideCount,
  fetchedAt,
}: NavbarProps) {
  const tabRefs = useRef<Record<HubView, HTMLButtonElement | null>>({
    overview: null,
    clubs: null,
    pathways: null,
    guides: null,
  });

  const easternTime = formatEasternTimestamp(fetchedAt);

  const navItems: ReadonlyArray<{
    id: HubView;
    label: string;
    shortLabel: string;
    count?: number;
    icon: typeof LayoutGrid;
  }> = [
    {
      id: "overview",
      label: "Overview",
      shortLabel: "Overview",
      icon: LayoutGrid,
    },
    {
      id: "clubs",
      label: "Clubs & Activities",
      shortLabel: "Clubs",
      count: clubCount,
      icon: Users,
    },
    {
      id: "pathways",
      label: "Academic Pathways",
      shortLabel: "Pathways",
      count: pathwayCount,
      icon: GraduationCap,
    },
    {
      id: "guides",
      label: "How Do I...? Guides",
      shortLabel: "Guides",
      count: guideCount,
      icon: Compass,
    },
  ];

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % HUB_VIEWS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + HUB_VIEWS.length) % HUB_VIEWS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = HUB_VIEWS.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const targetView = HUB_VIEWS[nextIndex];
      onSelectView(targetView);
      tabRefs.current[targetView]?.focus();
    }
  }

  return (
    <>
      {/* 1. Top Institutional Utility Bar */}
      <div className="border-b border-white/10 bg-navy-dark text-xs text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 font-semibold tracking-tight text-white">
              <Shield className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              <span className="hidden sm:inline">
                Pittsford Mendon High School · Student &amp; Family Navigation Hub
              </span>
              <span className="sm:hidden">PMHS · Viking Hub</span>
            </span>

            <button
              type="button"
              onClick={onOpenAdmin}
              aria-haspopup="dialog"
              aria-label="Live Synced — Open How Maintenance & Safety Works (Admin & CMS Info)"
              title={`Connected to live PMHS Google Sheet CMS · Last synced ${easternTime} ET · Click for Admin & Safety Info`}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-navy/80 px-2.5 py-0.5 text-[11px] font-semibold text-gold transition hover:border-gold hover:bg-gold hover:text-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span>Live Synced</span>
              <Info className="h-3 w-3 opacity-85" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <a
              href="https://mhs.pittsfordschools.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-slate-200 transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span>Official MHS Site</span>
              <span aria-hidden="true">↗</span>
            </a>

            <span className="text-white/20" aria-hidden="true">
              |
            </span>

            <a
              href="https://www.pittsfordschools.org/parents-students/infinite-campus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-slate-200 transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span>Infinite Campus</span>
              <ExternalLink className="hidden h-3 w-3 sm:inline" aria-hidden="true" />
              <span className="sm:hidden" aria-hidden="true">
                ↗
              </span>
            </a>

            <span className="hidden text-white/20 md:inline" aria-hidden="true">
              |
            </span>

            <a
              href="tel:5852671660"
              className="hidden items-center gap-1.5 font-semibold text-gold transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:inline-flex"
            >
              <Phone className="h-3 w-3" aria-hidden="true" />
              <span>Counseling: (585) 267-1660</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Sticky Glassmorphic Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Brand Lockup */}
            <button
              type="button"
              onClick={() => onSelectView("overview")}
              className="group inline-flex shrink-0 items-center gap-2.5 rounded-xl py-1 pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-gold shadow-xs transition group-hover:bg-navy-light">
                <Shield className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold tracking-tight text-navy">
                    Viking Hub
                  </span>
                  <span className="rounded-md bg-gold px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-navy-dark">
                    PMHS
                  </span>
                </div>
                <p className="hidden text-[11px] font-medium text-slate-500 sm:block">
                  Mendon Student &amp; Family Portal
                </p>
              </div>
            </button>

            {/* Desktop Animated Tab Switcher */}
            <div
              role="tablist"
              aria-label="Viking Hub Sections"
              className="hidden items-center gap-1 rounded-xl border border-slate-200/90 bg-surface p-1 lg:flex"
            >
              {navItems.map((item, idx) => {
                const isActive = activeView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    ref={(el) => {
                      tabRefs.current[item.id] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`hub-tab-${item.id}`}
                    aria-selected={isActive}
                    aria-controls="hub-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => onSelectView(item.id)}
                    onKeyDown={(e) => handleTabKeyDown(e, idx)}
                    className={cn(
                      "relative inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                      isActive
                        ? "text-white"
                        : "text-slate-600 hover:text-navy",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeNavTab"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 38,
                        }}
                        className="absolute inset-0 rounded-lg bg-navy shadow-xs"
                      />
                    )}
                    <Icon
                      className={cn(
                        "relative z-10 h-3.5 w-3.5",
                        isActive ? "text-gold" : "text-slate-500",
                      )}
                      aria-hidden="true"
                    />
                    <span className="relative z-10 whitespace-nowrap">
                      {item.label}
                    </span>
                    {typeof item.count === "number" && (
                      <span
                        className={cn(
                          "relative z-10 rounded-full px-1.5 py-0.2 font-mono text-[11px] font-bold",
                          isActive
                            ? "bg-gold text-navy-dark"
                            : "bg-navy/10 text-navy",
                        )}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Compact Search ⌘K Trigger Button */}
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Open Spotlight Search (Command K)"
              className="inline-flex shrink-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-surface px-3 py-2 text-xs font-semibold text-navy shadow-2xs transition hover:border-gold/80 hover:bg-gold-light/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <Search className="h-4 w-4 text-navy" aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
              <Kbd>⌘K</Kbd>
            </button>
          </div>

          {/* Mobile & Tablet Horizontal Scrollable Tab Bar */}
          <div
            role="tablist"
            aria-label="Viking Hub Sections (Mobile)"
            className="scrollbar-none -mx-4 flex items-center gap-1.5 overflow-x-auto border-t border-slate-200/70 px-4 py-2 lg:hidden"
          >
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="hub-panel"
                  onClick={() => onSelectView(item.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                    isActive
                      ? "bg-navy text-white shadow-2xs"
                      : "bg-surface text-slate-600 hover:text-navy",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5",
                      isActive ? "text-gold" : "text-slate-500",
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                  {typeof item.count === "number" && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 font-mono text-[10px] font-bold",
                        isActive
                          ? "bg-gold text-navy-dark"
                          : "bg-navy/10 text-navy",
                      )}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>
    </>
  );
}
