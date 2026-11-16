"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownAZ,
  ArrowUpRight,
  Clock,
  FolderKanban,
  LayoutGrid,
  List,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { CategoryPill } from "@/components/hub/ui/CategoryPill";
import { SectionHeader } from "@/components/hub/ui/SectionHeader";
import { cleanDescription, tallyByField } from "@/lib/format";
import type { HubRecordRef } from "@/lib/hub-records";
import type { ClubRecord } from "@/types/hub";

export type ClubSortMode = "category" | "az";
export type ClubViewMode = "cards" | "compact";

interface ClubsViewProps {
  records: readonly ClubRecord[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenRecord: (ref: HubRecordRef) => void;
  onOpenSearch: (initialQuery?: string) => void;
}

export function ClubsView({
  records,
  selectedCategory,
  onSelectCategory,
  onOpenRecord,
  onOpenSearch,
}: ClubsViewProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [sortMode, setSortMode] = useState<ClubSortMode>("category");
  const [viewMode, setViewMode] = useState<ClubViewMode>("cards");

  const categories = useMemo(
    () => tallyByField(records, (c) => c.Category),
    [records],
  );

  // Ensure selectedCategory falls back to "ALL" if not found in live categories
  const activeCategory = useMemo(() => {
    if (selectedCategory === "ALL") return "ALL";
    return categories.some((c) => c.name === selectedCategory)
      ? selectedCategory
      : "ALL";
  }, [categories, selectedCategory]);

  const normalizedQuery = filterQuery.trim().toLowerCase();
  const hasActiveFilter =
    activeCategory !== "ALL" || normalizedQuery.length > 0;

  const filteredClubs = useMemo(() => {
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    const matched = records.filter((club) => {
      const catName = club.Category.trim() || "Uncategorized";
      if (activeCategory !== "ALL" && catName !== activeCategory) {
        return false;
      }

      if (tokens.length === 0) {
        return true;
      }

      const searchableBlob = [
        club.Club_Name,
        club.Category,
        club.Advisor_Name,
        club.Location_Room,
        club.Meeting_Schedule,
        club.Club_ID,
        cleanDescription(club.Description),
      ]
        .join(" ")
        .toLowerCase();

      return tokens.every((token) => searchableBlob.includes(token));
    });

    if (sortMode === "az") {
      return [...matched].sort((a, b) =>
        a.Club_Name.localeCompare(b.Club_Name),
      );
    }

    return [...matched].sort(
      (a, b) =>
        a.Category.localeCompare(b.Category) ||
        a.Club_Name.localeCompare(b.Club_Name),
    );
  }, [records, activeCategory, normalizedQuery, sortMode]);

  const groupedCategories = useMemo(() => {
    const map = new Map<string, ClubRecord[]>();
    for (const club of filteredClubs) {
      const cat = club.Category.trim() || "Uncategorized";
      const list = map.get(cat) ?? [];
      list.push(club);
      map.set(cat, list);
    }
    return categories
      .filter((c) => map.has(c.name))
      .map((c) => ({
        name: c.name,
        clubs: map.get(c.name) ?? [],
      }));
  }, [filteredClubs, categories]);

  function handleResetFilters() {
    onSelectCategory("ALL");
    setFilterQuery("");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Extracurricular Directory"
        title="Clubs & Activities"
        description="Explore all official Pittsford Mendon student organizations, competition teams, ensembles, and affinity groups. Filter by category or advisor, or click any club to inspect full details."
        count={records.length}
        countLabel="active clubs"
        icon={<Users className="h-6 w-6" aria-hidden="true" />}
        onOpenSearch={() => onOpenSearch("")}
      />

      {/* Interactive Filter & Control Bar */}
      <section
        aria-label="Club Directory Filters and View Controls"
        className="sticky top-16 z-20 space-y-3.5 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-md"
      >
        {/* 1. Horizontally Scrollable Category Filter Pills */}
        <div
          role="tablist"
          aria-label="Filter clubs by category"
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
            <span>All Clubs</span>
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

        {/* 2. In-Tab Filter Input + Sort & View Mode Toggles */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Instant In-Tab Filter Input */}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter clubs by name, advisor, room, or keyword..."
              aria-label="Filter clubs by name, advisor, room, or keyword"
              className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-surface py-2 pr-10 pl-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/50 sm:text-sm"
            />
            {filterQuery.length > 0 && (
              <button
                type="button"
                onClick={() => setFilterQuery("")}
                aria-label="Clear club filter"
                className="absolute top-1/2 right-2.5 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/70 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Sort & Density Segmented Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Toggle: A-Z vs. By Category */}
            <div
              role="group"
              aria-label="Sort clubs"
              className="inline-flex min-h-[40px] items-center rounded-xl border border-slate-200 bg-surface p-1"
            >
              <button
                type="button"
                onClick={() => setSortMode("category")}
                aria-pressed={sortMode === "category"}
                className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  sortMode === "category"
                    ? "bg-navy text-gold shadow-2xs"
                    : "text-slate-600 hover:text-navy"
                }`}
              >
                <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
                <span>By Category</span>
              </button>
              <button
                type="button"
                onClick={() => setSortMode("az")}
                aria-pressed={sortMode === "az"}
                className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  sortMode === "az"
                    ? "bg-navy text-gold shadow-2xs"
                    : "text-slate-600 hover:text-navy"
                }`}
              >
                <ArrowDownAZ className="h-3.5 w-3.5" aria-hidden="true" />
                <span>A–Z</span>
              </button>
            </div>

            {/* Density Toggle: Cards vs. Compact List */}
            <div
              role="group"
              aria-label="Club view mode"
              className="inline-flex min-h-[40px] items-center rounded-xl border border-slate-200 bg-surface p-1"
            >
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                aria-pressed={viewMode === "cards"}
                className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  viewMode === "cards"
                    ? "bg-navy text-gold shadow-2xs"
                    : "text-slate-600 hover:text-navy"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                aria-pressed={viewMode === "compact"}
                className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  viewMode === "compact"
                    ? "bg-navy text-gold shadow-2xs"
                    : "text-slate-600 hover:text-navy"
                }`}
              >
                <List className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Compact List</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Live Results Counter & Reset Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600">
            <span className="font-semibold text-navy">
              Showing {filteredClubs.length} of {records.length} clubs
            </span>
            {activeCategory !== "ALL" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold-light px-2.5 py-0.5 font-semibold text-navy-dark">
                <span>Category: {activeCategory}</span>
              </span>
            )}
            {normalizedQuery.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-navy/15 bg-surface px-2.5 py-0.5 font-semibold text-navy">
                <span>Filter: &ldquo;{filterQuery.trim()}&rdquo;</span>
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
      {filteredClubs.length === 0 && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-2xs sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy/10 text-navy">
            <Search className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-navy">
            No clubs match your current filter
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-600 sm:text-sm">
            We couldn&apos;t find any clubs matching{" "}
            {normalizedQuery ? (
              <span className="font-bold text-navy">
                &ldquo;{filterQuery.trim()}&rdquo;
              </span>
            ) : (
              "your selection"
            )}
            {activeCategory !== "ALL" ? (
              <>
                {" "}
                inside{" "}
                <span className="font-bold text-navy">{activeCategory}</span>
              </>
            ) : null}
            . Try searching across all categories or launching global spotlight
            search.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {activeCategory !== "ALL" && (
              <button
                type="button"
                onClick={() => onSelectCategory("ALL")}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white transition hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <RotateCcw className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                <span>Search Across All {records.length} Clubs</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-xs font-bold text-navy transition hover:border-gold hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span>Reset All Filters</span>
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

      {/* Results View: Grouped by Category OR Flat A-Z */}
      {filteredClubs.length > 0 && sortMode === "category" && (
        <div className="space-y-9">
          {groupedCategories.map((group) => (
            <section key={group.name} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-extrabold tracking-tight text-navy">
                    {group.name}
                  </h2>
                  <span className="rounded-full border border-gold/50 bg-gold-light px-2.5 py-0.5 font-mono text-xs font-bold text-navy-dark">
                    {group.clubs.length}
                  </span>
                </div>
              </div>

              {viewMode === "cards" ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  {group.clubs.map((club) => (
                    <ClubCardItem
                      key={club.Club_ID}
                      club={club}
                      onOpenRecord={onOpenRecord}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div layout className="space-y-2">
                  {group.clubs.map((club) => (
                    <ClubCompactRowItem
                      key={club.Club_ID}
                      club={club}
                      onOpenRecord={onOpenRecord}
                    />
                  ))}
                </motion.div>
              )}
            </section>
          ))}
        </div>
      )}

      {filteredClubs.length > 0 && sortMode === "az" && (
        <section aria-label="Alphabetical Club Directory" className="space-y-4">
          {viewMode === "cards" ? (
            <motion.div
              layout
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredClubs.map((club) => (
                <ClubCardItem
                  key={club.Club_ID}
                  club={club}
                  onOpenRecord={onOpenRecord}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div layout className="space-y-2">
              {filteredClubs.map((club) => (
                <ClubCompactRowItem
                  key={club.Club_ID}
                  club={club}
                  onOpenRecord={onOpenRecord}
                />
              ))}
            </motion.div>
          )}
        </section>
      )}
    </div>
  );
}

interface ClubItemProps {
  club: ClubRecord;
  onOpenRecord: (ref: HubRecordRef) => void;
}

function ClubCardItem({ club, onOpenRecord }: ClubItemProps) {
  const cleanedDescription = cleanDescription(club.Description);

  return (
    <motion.button
      layout
      type="button"
      onClick={() => onOpenRecord({ kind: "club", record: club })}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-2xs transition duration-150 hover:-translate-y-0.5 hover:border-gold hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <CategoryPill tone="navy">{club.Category}</CategoryPill>
          <span className="font-mono text-[11px] font-semibold text-slate-400">
            {club.Club_ID}
          </span>
        </div>

        <h3 className="mt-3 text-base font-extrabold leading-snug text-navy group-hover:text-navy-light">
          {club.Club_Name}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
          {cleanedDescription}
        </p>
      </div>

      <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3.5 text-xs text-slate-600">
        <div className="flex items-start gap-2">
          <User
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy"
            aria-hidden="true"
          />
          <span className="line-clamp-1 font-medium text-slate-800">
            {club.Advisor_Name}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 text-slate-500">
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
            <MapPin
              className="h-3.5 w-3.5 shrink-0 text-slate-400"
              aria-hidden="true"
            />
            <span className="truncate">{club.Location_Room}</span>
          </span>

          <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-navy">
            <span>Details</span>
            <ArrowUpRight
              className="h-3.5 w-3.5 text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Clock
            className="h-3 w-3 shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <span className="truncate">{club.Meeting_Schedule}</span>
        </div>
      </div>
    </motion.button>
  );
}

function ClubCompactRowItem({ club, onOpenRecord }: ClubItemProps) {
  return (
    <motion.button
      layout
      type="button"
      onClick={() => onOpenRecord({ kind: "club", record: club })}
      className="group flex min-h-[52px] w-full flex-col justify-between gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-left shadow-2xs transition hover:border-gold hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
        <span className="font-mono text-[11px] font-bold text-slate-400">
          {club.Club_ID}
        </span>
        <span className="truncate text-sm font-extrabold text-navy group-hover:text-navy-light">
          {club.Club_Name}
        </span>
        <CategoryPill tone="navy">{club.Category}</CategoryPill>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 sm:shrink-0 sm:justify-end">
        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
          <User className="h-3.5 w-3.5 text-navy" aria-hidden="true" />
          <span className="max-w-[180px] truncate">{club.Advisor_Name}</span>
        </span>

        <span className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 font-medium text-slate-600">
          <MapPin className="h-3 w-3 text-slate-400" aria-hidden="true" />
          <span className="max-w-[140px] truncate">{club.Location_Room}</span>
        </span>

        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </div>
    </motion.button>
  );
}
