"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Compass,
  ExternalLink,
  Link2,
  MapPin,
  PhoneCall,
  RotateCcw,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { CategoryPill } from "@/components/hub/ui/CategoryPill";
import { GuideChecklist } from "@/components/hub/ui/GuideChecklist";
import { SectionHeader } from "@/components/hub/ui/SectionHeader";
import { useCopyFeedback } from "@/components/hub/ui/useCopyFeedback";
import { parseGuideSteps, tallyByField } from "@/lib/format";
import { useGuideProgress } from "@/lib/guide-progress";
import { formatRecordHash, type HubRecordRef } from "@/lib/hub-records";
import type { StudentActionGuideRecord } from "@/types/hub";

interface GuidesViewProps {
  records: readonly StudentActionGuideRecord[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenRecord: (ref: HubRecordRef) => void;
  onOpenSearch: (initialQuery?: string) => void;
}

export function GuidesView({
  records,
  selectedCategory,
  onSelectCategory,
  onOpenRecord,
  onOpenSearch,
}: GuidesViewProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  const { getCompletedSteps, resetAllGuides, isHydrated } = useGuideProgress();
  const { copiedKey, copy } = useCopyFeedback(2000);

  const categories = useMemo(
    () => tallyByField(records, (g) => g.Category),
    [records],
  );

  const activeCategory = useMemo(() => {
    if (selectedCategory === "ALL") return "ALL";
    return categories.some((c) => c.name === selectedCategory)
      ? selectedCategory
      : "ALL";
  }, [categories, selectedCategory]);

  const normalizedQuery = filterQuery.trim().toLowerCase();
  const hasActiveFilter =
    activeCategory !== "ALL" || normalizedQuery.length > 0;

  // Compute overall student progress across all live guides
  const overallProgress = useMemo(() => {
    let totalStepsCount = 0;
    let completedStepsCount = 0;
    let startedGuidesCount = 0;
    let completedGuidesCount = 0;

    for (const guide of records) {
      const { steps } = parseGuideSteps(guide.Step_By_Step_Process);
      const count = steps.length;
      totalStepsCount += count;

      const done = getCompletedSteps(guide.Guide_ID, count).length;
      completedStepsCount += done;
      if (done > 0) {
        startedGuidesCount += 1;
      }
      if (count > 0 && done === count) {
        completedGuidesCount += 1;
      }
    }

    return {
      totalStepsCount,
      completedStepsCount,
      startedGuidesCount,
      completedGuidesCount,
    };
  }, [records, getCompletedSteps]);

  const filteredGuides = useMemo(() => {
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    return records.filter((guide) => {
      const catName = guide.Category.trim() || "Uncategorized";
      if (activeCategory !== "ALL" && catName !== activeCategory) {
        return false;
      }

      if (tokens.length === 0) {
        return true;
      }

      const searchableBlob = [
        guide.Guide_ID,
        guide.Task_Title,
        guide.Category,
        guide.Target_Audience,
        guide.Office_Or_Room,
        guide.Staff_Contact,
        guide.Step_By_Step_Process,
        guide.Key_Deadlines_Or_Rules,
      ]
        .join(" ")
        .toLowerCase();

      return tokens.every((token) => searchableBlob.includes(token));
    });
  }, [records, activeCategory, normalizedQuery]);

  function handleResetFilters() {
    onSelectCategory("ALL");
    setFilterQuery("");
  }

  function handleCopyGuideLink(guide: StudentActionGuideRecord) {
    if (typeof window === "undefined") return;
    const hash = formatRecordHash({ kind: "guide", record: guide });
    const fullUrl = `${window.location.origin}${window.location.pathname}${hash}`;
    void copy(guide.Guide_ID, fullUrl);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Interactive Step-By-Step Checklists"
        title="“How Do I...?” Student Action Guides"
        description="Check off steps as you complete working papers, community service hours, college transcript requests, and course consultations. Your checklist progress saves automatically on your device."
        count={records.length}
        countLabel="action guides"
        icon={<Compass className="h-6 w-6" aria-hidden="true" />}
        onOpenSearch={() => onOpenSearch("")}
      />

      {/* Interactive Filter, Search & Overall Progress Control Bar */}
      <section
        aria-label="Student Action Guide Filters and Progress"
        className="space-y-3.5 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs"
      >
        {/* 1. Horizontally Scrollable Category Filter Pills */}
        <div
          role="tablist"
          aria-label="Filter guides by category"
          className="flex items-center gap-2 overflow-x-auto pb-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === "ALL"}
            onClick={() => onSelectCategory("ALL")}
            className={`inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
              activeCategory === "ALL"
                ? "border-navy bg-navy text-white shadow-xs"
                : "border-slate-200 bg-surface text-navy hover:border-gold hover:bg-gold-light"
            }`}
          >
            <span>All Guides</span>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-extrabold ${
                activeCategory === "ALL"
                  ? "bg-gold text-navy-dark"
                  : "bg-navy/10 text-navy"
              }`}
            >
              {records.length}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() =>
                  onSelectCategory(isSelected ? "ALL" : cat.name)
                }
                className={`inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  isSelected
                    ? "border-navy bg-navy text-white shadow-xs"
                    : "border-slate-200 bg-surface text-navy hover:border-gold hover:bg-gold-light"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-extrabold ${
                    isSelected
                      ? "bg-gold text-navy-dark"
                      : "bg-navy/10 text-navy"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Instant Text Filter Input + Overall Progress Pill */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search guides by task, office, room, staff contact, or step..."
              aria-label="Search guides by task, office, room, staff contact, or step"
              className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-surface py-2 pr-10 pl-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/50 sm:text-sm"
            />
            {filterQuery.length > 0 && (
              <button
                type="button"
                onClick={() => setFilterQuery("")}
                aria-label="Clear guide search filter"
                className="absolute top-1/2 right-2.5 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/70 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Overall Checklist Progress Summary Pill */}
          {isHydrated && overallProgress.completedStepsCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-900">
                <CheckCircle2
                  className="h-4 w-4 text-emerald-600"
                  aria-hidden="true"
                />
                <span>
                  {overallProgress.completedStepsCount} of{" "}
                  {overallProgress.totalStepsCount} total steps completed (
                  {overallProgress.startedGuidesCount}{" "}
                  {overallProgress.startedGuidesCount === 1
                    ? "guide"
                    : "guides"}{" "}
                  active)
                </span>
              </span>

              {!confirmResetAll ? (
                <button
                  type="button"
                  onClick={() => setConfirmResetAll(true)}
                  className="inline-flex min-h-[28px] items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-900 transition hover:border-gold hover:bg-gold-light hover:text-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  <span>Reset all progress</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      resetAllGuides();
                      setConfirmResetAll(false);
                    }}
                    className="inline-flex min-h-[28px] items-center gap-1 rounded-lg bg-navy px-2.5 py-1 text-[11px] font-bold text-gold transition hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <span>Confirm reset</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetAll(false)}
                    className="inline-flex min-h-[28px] items-center rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-navy"
                  >
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Live Counter & Filter Reset Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600">
            <span className="font-semibold text-navy">
              Showing {filteredGuides.length} of {records.length} guides
            </span>
            {activeCategory !== "ALL" && (
              <span className="rounded-full border border-gold/50 bg-gold-light px-2.5 py-0.5 font-semibold text-navy-dark">
                Category: {activeCategory}
              </span>
            )}
            {normalizedQuery.length > 0 && (
              <span className="rounded-full border border-navy/15 bg-surface px-2.5 py-0.5 font-semibold text-navy">
                Filter: &ldquo;{filterQuery.trim()}&rdquo;
              </span>
            )}
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-navy/15 bg-surface px-3 py-1 font-bold text-navy transition hover:border-gold hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </section>

      {/* Zero-Results Empty State */}
      {filteredGuides.length === 0 && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-2xs sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy/10 text-navy">
            <Search className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-navy">
            No action guides match your current filter
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-600 sm:text-sm">
            Try resetting your guide filters or searching across all clubs,
            academic pathways, and guides with global spotlight search.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white transition hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <RotateCcw className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              <span>Show All {records.length} Guides</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenSearch(filterQuery.trim())}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-gold/60 bg-gold-light px-4 py-2.5 text-xs font-bold text-navy-dark transition hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            >
              <Sparkles className="h-3.5 w-3.5 text-navy" aria-hidden="true" />
              <span>Open Global Search (⌘K)</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Guide Workflow Cards */}
      {filteredGuides.length > 0 && (
        <motion.div layout className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredGuides.map((guide) => {
            const rawUrl = guide.Official_URL.trim();
            const isHttp =
              rawUrl.startsWith("http://") || rawUrl.startsWith("https://");
            const isCopied = copiedKey === guide.Guide_ID;

            return (
              <motion.article
                layout
                key={guide.Guide_ID}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition hover:border-gold/70 hover:shadow-md"
              >
                <div className="space-y-4">
                  {/* Card Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryPill tone="gold">{guide.Category}</CategoryPill>
                      <span className="inline-flex items-center gap-1 rounded-full border border-navy/15 bg-navy/5 px-2.5 py-0.5 text-xs font-semibold text-navy">
                        <Users className="h-3 w-3" aria-hidden="true" />
                        <span>{guide.Target_Audience}</span>
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {guide.Guide_ID}
                    </span>
                  </div>

                  {/* Guide Title */}
                  <h2 className="text-lg font-extrabold leading-snug text-navy sm:text-xl">
                    {guide.Task_Title}
                  </h2>

                  {/* Office & Staff Metadata Box */}
                  <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-slate-200/80 bg-surface p-3.5 text-xs text-slate-700 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <MapPin
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Office / Room
                        </p>
                        <p className="mt-0.5 font-bold text-navy">
                          {guide.Office_Or_Room}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <PhoneCall
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Staff Contact
                        </p>
                        <p className="mt-0.5 font-semibold text-slate-800">
                          {guide.Staff_Contact}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Checklist & Progress Bar */}
                  <GuideChecklist guide={guide} idPrefix="guides-view" />

                  {/* Key Deadlines & Rules Callout Box */}
                  <div className="flex items-start gap-2.5 rounded-xl border border-gold/50 bg-gold-light/60 px-4 py-3 text-xs text-navy-dark">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-navy"
                      aria-hidden="true"
                    />
                    <p className="leading-relaxed">
                      <strong className="font-extrabold">
                        Key Deadlines &amp; Rules:
                      </strong>{" "}
                      {guide.Key_Deadlines_Or_Rules}
                    </p>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 pt-4">
                  {isHttp && (
                    <a
                      href={rawUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <span>Official PCSD Page / Form</span>
                      <ExternalLink
                        className="h-3.5 w-3.5 text-gold"
                        aria-hidden="true"
                      />
                    </a>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyGuideLink(guide)}
                      className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                        isCopied
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-surface text-navy hover:border-gold hover:bg-gold-light"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check
                            className="h-3.5 w-3.5 text-emerald-600"
                            aria-hidden="true"
                          />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Link2
                            className="h-3.5 w-3.5 text-navy"
                            aria-hidden="true"
                          />
                          <span>Copy Direct Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onOpenRecord({ kind: "guide", record: guide })
                      }
                      className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-navy/15 bg-white px-3.5 py-2 text-xs font-bold text-navy transition hover:border-gold hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <span>Open Full Details</span>
                      <ArrowUpRight
                        className="h-3.5 w-3.5 text-gold"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
