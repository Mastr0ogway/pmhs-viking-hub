"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Compass,
  CornerDownLeft,
  GraduationCap,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { QuickChipItem } from "@/components/hub/HeroSection";
import { CategoryPill } from "@/components/hub/ui/CategoryPill";
import { HighlightedText } from "@/components/hub/ui/HighlightedText";
import { Kbd } from "@/components/hub/ui/Kbd";
import { useDialogFocusTrap } from "@/components/hub/ui/useDialogFocusTrap";
import {
  getRecordCategory,
  getRecordId,
  getRecordSubtitle,
  getRecordTitle,
  type HubRecordKind,
  type HubRecordRef,
} from "@/lib/hub-records";
import {
  searchHub,
  type SearchIndex,
  type SearchResultGroup,
  type SearchResultItem,
} from "@/lib/search";
import { cn } from "@/lib/utils";
import type {
  AcademicPathwayRecord,
  ClubRecord,
  StudentActionGuideRecord,
} from "@/types/hub";

interface CommandSearchModalProps {
  open: boolean;
  query: string;
  onQueryChange: (nextQuery: string) => void;
  onClose: () => void;
  onSelectRecord: (ref: HubRecordRef) => void;
  searchIndex: SearchIndex;
  quickChips: readonly QuickChipItem[];
  clubs: readonly ClubRecord[];
  pathways: readonly AcademicPathwayRecord[];
  guides: readonly StudentActionGuideRecord[];
}

function KindIcon({
  kind,
  active,
}: {
  kind: HubRecordKind;
  active: boolean;
}) {
  const iconClass = cn(
    "h-4 w-4 shrink-0",
    active ? "text-gold" : "text-navy",
  );
  if (kind === "guide") return <Compass className={iconClass} aria-hidden="true" />;
  if (kind === "pathway")
    return <GraduationCap className={iconClass} aria-hidden="true" />;
  return <Users className={iconClass} aria-hidden="true" />;
}

export function CommandSearchModal({
  open,
  query,
  onQueryChange,
  onClose,
  onSelectRecord,
  searchIndex,
  quickChips,
  clubs,
  pathways,
  guides,
}: CommandSearchModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [activeIndex, setActiveIndex] = useState(0);

  useDialogFocusTrap({
    open,
    dialogRef,
    initialFocusRef: inputRef,
    onClose,
  });

  const trimmedQuery = query.trim();

  // Default starter groups when query is empty so keyboard navigation works immediately
  const starterGroups = useMemo<SearchResultGroup[]>(() => {
    const guideItems: SearchResultItem[] = guides.map((g) => {
      const ref: HubRecordRef = { kind: "guide", record: g };
      return {
        id: getRecordId(ref),
        ref,
        title: getRecordTitle(ref),
        category: getRecordCategory(ref),
        subtitle: getRecordSubtitle(ref),
        snippet: g.Key_Deadlines_Or_Rules,
        snippetFieldLabel: "Key Rule",
        score: 1,
        matchedTerms: [],
      };
    });

    const pathwayItems: SearchResultItem[] = pathways.slice(0, 3).map((p) => {
      const ref: HubRecordRef = { kind: "pathway", record: p };
      return {
        id: getRecordId(ref),
        ref,
        title: getRecordTitle(ref),
        category: getRecordCategory(ref),
        subtitle: getRecordSubtitle(ref),
        snippet: p.Prerequisites_And_Eligibility,
        snippetFieldLabel: "Prerequisites",
        score: 1,
        matchedTerms: [],
      };
    });

    const groups: SearchResultGroup[] = [];
    if (guideItems.length > 0) {
      groups.push({
        kind: "guide",
        heading: "Student Action Guides",
        items: guideItems,
      });
    }
    if (pathwayItems.length > 0) {
      groups.push({
        kind: "pathway",
        heading: "Featured Academic Pathways",
        items: pathwayItems,
      });
    }
    return groups;
  }, [guides, pathways]);

  const resultGroups = useMemo<SearchResultGroup[]>(() => {
    if (!trimmedQuery) return starterGroups;
    return searchHub(searchIndex, trimmedQuery);
  }, [searchIndex, starterGroups, trimmedQuery]);

  const flatItems = useMemo<SearchResultItem[]>(
    () => resultGroups.flatMap((group) => group.items),
    [resultGroups],
  );

  const indexById = useMemo<Map<string, number>>(
    () => new Map(flatItems.map((item, idx) => [item.id, idx])),
    [flatItems],
  );

  const safeActiveIndex =
    flatItems.length === 0
      ? 0
      : Math.min(activeIndex, Math.max(0, flatItems.length - 1));

  const activeItem = flatItems[safeActiveIndex] ?? null;

  useEffect(() => {
    if (!open || !activeItem) return;
    const el = optionRefs.current[activeItem.id];
    el?.scrollIntoView({ block: "nearest" });
  }, [activeItem, open]);

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (flatItems.length > 0) {
        setActiveIndex((prev) => (prev + 1) % flatItems.length);
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (flatItems.length > 0) {
        setActiveIndex(
          (prev) => (prev - 1 + flatItems.length) % flatItems.length,
        );
      }
      return;
    }

    if (event.key === "Enter" && activeItem) {
      event.preventDefault();
      onSelectRecord(activeItem.ref);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-12 sm:p-6 sm:pt-[10vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Spotlight Search across Viking Hub"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy-dark/65 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Modal Panel */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="relative z-10 flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Top Gold Accent Bar */}
            <div
              aria-hidden="true"
              className="h-1 w-full bg-gradient-to-r from-gold via-gold-light to-gold"
            />

            {/* Search Input Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 sm:px-5">
              <Search className="h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="hub-spotlight-listbox"
                aria-activedescendant={
                  activeItem ? `spotlight-opt-${activeItem.id}` : undefined
                }
                value={query}
                onChange={(e) => {
                  onQueryChange(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Search clubs, advisors, working papers, BOCES / EMCC, AP tracks, NHS..."
                className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-base"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    onQueryChange("");
                    setActiveIndex(0);
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search query"
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-surface hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Spotlight Search"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-surface px-2 py-1 text-xs font-semibold text-slate-600 transition hover:border-navy/30 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span>Esc</span>
              </button>
            </div>

            {/* Quick-Jump Synonym Chips when query is empty */}
            {!trimmedQuery && quickChips.length > 0 && (
              <div className="border-b border-slate-100 bg-surface/70 px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-navy">
                    <Sparkles
                      className="h-3 w-3 text-gold"
                      aria-hidden="true"
                    />
                    Popular Searches:
                  </span>
                  {quickChips.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        onQueryChange(chip.query);
                        setActiveIndex(0);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-navy transition hover:border-gold hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Listbox */}
            <div
              id="hub-spotlight-listbox"
              role="listbox"
              aria-label="Search Results"
              className="flex-1 overflow-y-auto p-3 sm:p-4"
            >
              {flatItems.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-bold text-navy">
                    No matching records for &ldquo;{trimmedQuery}&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try searching for a club name (e.g. &ldquo;Model UN&rdquo;,
                    &ldquo;Robotics&rdquo;), an advisor, &ldquo;Working
                    Papers&rdquo;, &ldquo;BOCES&rdquo;, or &ldquo;NHS&rdquo;.
                  </p>
                  {quickChips.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      {quickChips.map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => {
                            onQueryChange(chip.query);
                            setActiveIndex(0);
                            inputRef.current?.focus();
                          }}
                          className="rounded-full border border-navy/15 bg-surface px-3 py-1 text-xs font-semibold text-navy transition hover:border-gold hover:bg-gold-light"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {resultGroups.map((group) => (
                    <div
                      key={group.kind}
                      role="group"
                      aria-label={group.heading}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                          {group.heading}
                        </span>
                        <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] font-bold text-navy">
                          {group.items.length}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const itemIndex = indexById.get(item.id) ?? 0;
                          const isSelected = itemIndex === safeActiveIndex;

                          return (
                            <button
                              key={item.id}
                              ref={(el) => {
                                optionRefs.current[item.id] = el;
                              }}
                              id={`spotlight-opt-${item.id}`}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onMouseEnter={() => setActiveIndex(itemIndex)}
                              onClick={() => onSelectRecord(item.ref)}
                              className={cn(
                                "group flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left transition-colors focus:outline-none",
                                isSelected
                                  ? "border-gold bg-gold-light/65 shadow-2xs"
                                  : "border-transparent bg-white hover:bg-surface",
                              )}
                            >
                              <div className="flex min-w-0 flex-1 items-start gap-3">
                                <div
                                  className={cn(
                                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                                    isSelected
                                      ? "border-navy bg-navy text-gold"
                                      : "border-slate-200 bg-surface text-navy",
                                  )}
                                >
                                  <KindIcon
                                    kind={item.ref.kind}
                                    active={isSelected}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-extrabold text-navy">
                                      <HighlightedText
                                        text={item.title}
                                        terms={item.matchedTerms}
                                      />
                                    </span>
                                    <CategoryPill
                                      tone={isSelected ? "gold" : "navy"}
                                    >
                                      {item.category}
                                    </CategoryPill>
                                  </div>

                                  <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                                    <HighlightedText
                                      text={item.subtitle}
                                      terms={item.matchedTerms}
                                    />
                                  </p>

                                  {item.snippet && (
                                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                      <span className="font-semibold text-slate-400">
                                        {item.snippetFieldLabel}:{" "}
                                      </span>
                                      <HighlightedText
                                        text={item.snippet}
                                        terms={item.matchedTerms}
                                      />
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-1.5 self-center">
                                <span className="hidden font-mono text-[10px] font-semibold text-slate-400 sm:inline">
                                  {item.id}
                                </span>
                                <span
                                  className={cn(
                                    "inline-flex h-6 w-6 items-center justify-center rounded-md border text-xs transition-opacity",
                                    isSelected
                                      ? "border-navy/20 bg-navy text-gold opacity-100"
                                      : "border-slate-200 bg-surface text-slate-400 opacity-0 group-hover:opacity-100",
                                  )}
                                  aria-hidden="true"
                                >
                                  <CornerDownLeft className="h-3 w-3" />
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-surface px-4 py-2.5 text-[11px] text-slate-500 sm:px-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                  <span>Navigate</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Kbd>↵</Kbd>
                  <span>Inspect Record</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Kbd>Esc</Kbd>
                  <span>Close</span>
                </span>
              </div>

              <span className="font-mono text-[11px] font-semibold text-navy">
                {clubs.length} clubs · {pathways.length} pathways ·{" "}
                {guides.length} guides
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
