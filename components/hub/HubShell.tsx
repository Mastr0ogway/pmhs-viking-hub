"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import { Database, ShieldCheck, Sparkles } from "lucide-react";
import { AdminMaintenanceModal } from "@/components/hub/AdminMaintenanceModal";
import { CommandSearchModal } from "@/components/hub/CommandSearchModal";
import { HeroSection, type QuickChipItem } from "@/components/hub/HeroSection";
import { Navbar } from "@/components/hub/Navbar";
import { OverviewDashboard } from "@/components/hub/OverviewDashboard";
import { RecordPreviewDrawer } from "@/components/hub/RecordPreviewDrawer";
import { ClubsView } from "@/components/hub/views/ClubsView";
import { GuidesView } from "@/components/hub/views/GuidesView";
import { PathwaysView } from "@/components/hub/views/PathwaysView";
import { formatEasternTimestamp, parseGuideSteps } from "@/lib/format";
import {
  findRecordById,
  formatRecordHash,
  KIND_TO_VIEW,
  parseHubHash,
  type HubRecordRef,
  type HubView,
} from "@/lib/hub-records";
import {
  buildSearchIndex,
  QUICK_SEARCHES,
  searchHub,
} from "@/lib/search";
import type { HubDataPayload } from "@/types/hub";

interface HubShellProps {
  data: HubDataPayload;
}

export function HubShell({ data }: HubShellProps) {
  const { clubs, pathways, guides, fetchedAt } = data;

  const [activeView, setActiveView] = useState<HubView>("overview");
  const [selectedClubCategory, setSelectedClubCategory] =
    useState<string>("ALL");
  const [clubFilterQuery, setClubFilterQuery] = useState<string>("");
  const [selectedPathwayTrack, setSelectedPathwayTrack] =
    useState<string>("ALL");
  const [selectedGuideCategory, setSelectedGuideCategory] =
    useState<string>("ALL");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewRecord, setPreviewRecord] = useState<HubRecordRef | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const searchIndex = useMemo(
    () => buildSearchIndex({ clubs, pathways, guides }),
    [clubs, pathways, guides],
  );

  const totalGuideSteps = useMemo(
    () =>
      guides.reduce(
        (sum, guide) =>
          sum + parseGuideSteps(guide.Step_By_Step_Process).steps.length,
        0,
      ),
    [guides],
  );

  // Filter quick-jump chips to those that match >= 1 live record
  const liveQuickChips = useMemo<QuickChipItem[]>(
    () =>
      QUICK_SEARCHES.filter(
        (chip) => searchHub(searchIndex, chip.query).length > 0,
      ),
    [searchIndex],
  );

  const pushViewHash = useCallback((view: HubView) => {
    if (typeof window === "undefined") return;
    const targetHash = view === "overview" ? "" : `#${view}`;
    const nextUrl = `${window.location.pathname}${window.location.search}${targetHash}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, "", nextUrl);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const selectView = useCallback(
    (view: HubView) => {
      setActiveView(view);
      setPreviewRecord(null);
      pushViewHash(view);
    },
    [pushViewHash],
  );

  const handleSelectClubCategoryFromOverview = useCallback(
    (category: string) => {
      setSelectedClubCategory(category);
      setActiveView("clubs");
      setPreviewRecord(null);
      pushViewHash("clubs");
    },
    [pushViewHash],
  );

  const handleSelectPathwayTrackFromOverview = useCallback(
    (track: string) => {
      setSelectedPathwayTrack(track);
      setActiveView("pathways");
      setPreviewRecord(null);
      pushViewHash("pathways");
    },
    [pushViewHash],
  );

  const handleSelectGuideCategoryFromOverview = useCallback(
    (category: string) => {
      setSelectedGuideCategory(category);
      setActiveView("guides");
      setPreviewRecord(null);
      pushViewHash("guides");
    },
    [pushViewHash],
  );

  const handleFilterClubsByAdvisor = useCallback(
    (advisorName: string) => {
      setSelectedClubCategory("ALL");
      setClubFilterQuery(advisorName);
      setPreviewRecord(null);
      setActiveView("clubs");
      if (typeof window !== "undefined") {
        const nextUrl = `${window.location.pathname}${window.location.search}#clubs`;
        window.history.replaceState(null, "", nextUrl);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [],
  );

  const openSearch = useCallback((initialQuery = "") => {
    setPreviewRecord(null);
    setAdminModalOpen(false);
    setSearchQuery(initialQuery);
    setSearchOpen(true);
  }, []);

  const openAdminModal = useCallback(() => {
    setSearchOpen(false);
    setPreviewRecord(null);
    setAdminModalOpen(true);
  }, []);

  const handleSelectRecord = useCallback(
    (ref: HubRecordRef) => {
      const targetView = KIND_TO_VIEW[ref.kind];
      const wasDrawerAlreadyOpen = previewRecord !== null;

      setActiveView(targetView);
      setSearchOpen(false);
      setAdminModalOpen(false);
      setPreviewRecord(ref);

      if (typeof window !== "undefined") {
        const recordHash = formatRecordHash(ref);
        const nextUrl = `${window.location.pathname}${window.location.search}${recordHash}`;
        if (wasDrawerAlreadyOpen) {
          // Switching between related records inside an already-open drawer replaces the current drawer entry
          window.history.replaceState(null, "", nextUrl);
        } else if (window.location.hash !== recordHash) {
          // Opening a record from a closed drawer state pushes a history entry so mobile Back closes the drawer
          window.history.pushState(null, "", nextUrl);
        }
      }
    },
    [previewRecord],
  );

  const handleCloseDrawer = useCallback(() => {
    setPreviewRecord(null);
    if (typeof window !== "undefined") {
      const baseHash = activeView === "overview" ? "" : `#${activeView}`;
      const nextUrl = `${window.location.pathname}${window.location.search}${baseHash}`;
      // Replace the URL hash so closing via X / Esc / backdrop does not leave a zombie drawer entry behind in history
      window.history.replaceState(null, "", nextUrl);
    }
  }, [activeView]);

  // Sync URL hash & browser Back/Forward navigation (supports #view?id=RECORD_ID)
  useEffect(() => {
    function syncFromLocation() {
      const { view, recordId } = parseHubHash(window.location.hash);

      if (recordId) {
        const matched = findRecordById({ clubs, pathways, guides }, recordId);
        if (matched) {
          const targetView = view ?? KIND_TO_VIEW[matched.kind];
          setActiveView(targetView);
          setPreviewRecord(matched);
          return;
        }
      }

      if (view) {
        setActiveView(view);
        setPreviewRecord(null);
      } else if (!window.location.hash.replace(/^#/, "").trim()) {
        setActiveView("overview");
        setPreviewRecord(null);
      }
    }

    syncFromLocation();
    window.addEventListener("hashchange", syncFromLocation);
    window.addEventListener("popstate", syncFromLocation);
    return () => {
      window.removeEventListener("hashchange", syncFromLocation);
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, [clubs, pathways, guides]);

  // Global keyboard shortcuts: ⌘K / Ctrl+K and "/"
  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if (adminModalOpen) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPreviewRecord(null);
        setSearchOpen((prev) => !prev);
        return;
      }

      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        const target = event.target as HTMLElement | null;
        const tagName = target?.tagName?.toLowerCase();
        const isEditable =
          tagName === "input" ||
          tagName === "textarea" ||
          tagName === "select" ||
          target?.isContentEditable;

        if (!isEditable && !searchOpen) {
          event.preventDefault();
          setPreviewRecord(null);
          setSearchQuery("");
          setSearchOpen(true);
        }
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [searchOpen, adminModalOpen]);

  const easternTimestamp = formatEasternTimestamp(fetchedAt);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-surface text-slate-900">
        {/* Skip to Main Content Link for Keyboard Users */}
        <a
          href="#hub-panel"
          className="no-print sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-navy focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-gold focus:shadow-lg"
        >
          Skip to main content
        </a>

        <Navbar
          activeView={activeView}
          onSelectView={selectView}
          onOpenSearch={() => openSearch("")}
          onOpenAdmin={openAdminModal}
          clubCount={clubs.length}
          pathwayCount={pathways.length}
          guideCount={guides.length}
          fetchedAt={fetchedAt}
        />

        <main
          id="hub-panel"
          role="tabpanel"
          aria-labelledby={`hub-tab-${activeView}`}
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        >
          <motion.div
            key={activeView}
            initial={{ opacity: 1, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="space-y-10"
          >
            {activeView === "overview" && (
              <>
                <HeroSection
                  clubCount={clubs.length}
                  quickChips={liveQuickChips}
                  onOpenSearch={(q) => openSearch(q ?? "")}
                />
                <OverviewDashboard
                  clubs={clubs}
                  pathways={pathways}
                  guides={guides}
                  onSelectView={selectView}
                  onSelectClubCategory={handleSelectClubCategoryFromOverview}
                  onSelectPathwayTrack={handleSelectPathwayTrackFromOverview}
                  onSelectGuideCategory={handleSelectGuideCategoryFromOverview}
                  onOpenRecord={handleSelectRecord}
                />
              </>
            )}

            {activeView === "clubs" && (
              <ClubsView
                records={clubs}
                selectedCategory={selectedClubCategory}
                onSelectCategory={setSelectedClubCategory}
                filterQuery={clubFilterQuery}
                onFilterQueryChange={setClubFilterQuery}
                onOpenRecord={handleSelectRecord}
                onOpenSearch={(q) => openSearch(q ?? "")}
              />
            )}

            {activeView === "pathways" && (
              <PathwaysView
                records={pathways}
                selectedTrack={selectedPathwayTrack}
                onSelectTrack={setSelectedPathwayTrack}
                onOpenRecord={handleSelectRecord}
                onOpenSearch={(q) => openSearch(q ?? "")}
              />
            )}

            {activeView === "guides" && (
              <GuidesView
                records={guides}
                selectedCategory={selectedGuideCategory}
                onSelectCategory={setSelectedGuideCategory}
                onOpenRecord={handleSelectRecord}
                onOpenSearch={(q) => openSearch(q ?? "")}
              />
            )}
          </motion.div>
        </main>

        {/* Institutional Footer */}
        <footer className="no-print mt-12 border-t border-slate-200/80 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-semibold text-navy">
                <ShieldCheck
                  className="h-4 w-4 text-emerald-600"
                  aria-hidden="true"
                />
                <span>PMHS Student &amp; Family Navigation Hub</span>
              </span>
              <span>·</span>
              <span>
                Live Google Sheet CMS (
                {clubs.length + pathways.length + guides.length} records) ·
                Synced {easternTimestamp} ET
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openAdminModal}
                aria-haspopup="dialog"
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-gold/50 bg-gold-light px-3 py-1.5 font-bold text-navy-dark transition hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              >
                <Sparkles className="h-3.5 w-3.5 text-navy" aria-hidden="true" />
                <span>
                  How Maintenance &amp; Safety Works (Admin &amp; CMS Info)
                </span>
              </button>

              <Link
                href="/verify"
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-3 py-1.5 font-semibold text-navy transition hover:border-gold hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <Database
                  className="h-3.5 w-3.5 text-gold"
                  aria-hidden="true"
                />
                <span>CMS Data Verification (/verify)</span>
              </Link>
            </div>
          </div>
        </footer>

        {/* Command-K Global Spotlight Search Modal */}
        <CommandSearchModal
          open={searchOpen}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onClose={() => setSearchOpen(false)}
          onSelectRecord={handleSelectRecord}
          searchIndex={searchIndex}
          quickChips={liveQuickChips}
          clubs={clubs}
          pathways={pathways}
          guides={guides}
        />

        {/* Shared Record Quick-Preview Slide-Over Drawer */}
        <RecordPreviewDrawer
          recordRef={previewRecord}
          data={{ clubs, pathways, guides }}
          onClose={handleCloseDrawer}
          onSelectRecord={handleSelectRecord}
          onFilterClubsByAdvisor={handleFilterClubsByAdvisor}
          onOpenSearch={() => openSearch("")}
        />

        {/* How Maintenance & Safety Works (Admin & CMS Info) Modal */}
        <AdminMaintenanceModal
          open={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          clubCount={clubs.length}
          pathwayCount={pathways.length}
          guideCount={guides.length}
          totalGuideSteps={totalGuideSteps}
          fetchedAt={fetchedAt}
        />
      </div>
    </MotionConfig>
  );
}
