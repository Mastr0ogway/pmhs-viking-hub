"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  GitBranch,
  GraduationCap,
  Layers,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { CategoryPill } from "@/components/hub/ui/CategoryPill";
import { CourseProgressionFlowchart } from "@/components/hub/ui/CourseProgressionFlowchart";
import { SectionHeader } from "@/components/hub/ui/SectionHeader";
import {
  parseProgressionSteps,
  parseStructuredProgramList,
  tallyByField,
} from "@/lib/format";
import type { HubRecordRef } from "@/lib/hub-records";
import type { AcademicPathwayRecord } from "@/types/hub";

interface PathwaysViewProps {
  records: readonly AcademicPathwayRecord[];
  selectedTrack: string;
  onSelectTrack: (track: string) => void;
  onOpenRecord: (ref: HubRecordRef) => void;
  onOpenSearch: (initialQuery?: string) => void;
}

export function PathwaysView({
  records,
  selectedTrack,
  onSelectTrack,
  onOpenRecord,
  onOpenSearch,
}: PathwaysViewProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");

  const trackTypes = useMemo(
    () => tallyByField(records, (p) => p.Track_Type),
    [records],
  );

  const departments = useMemo(
    () => tallyByField(records, (p) => p.Department),
    [records],
  );

  const activeTrack = useMemo(() => {
    if (selectedTrack === "ALL") return "ALL";
    return trackTypes.some((t) => t.name === selectedTrack)
      ? selectedTrack
      : "ALL";
  }, [selectedTrack, trackTypes]);

  const activeDepartment = useMemo(() => {
    if (selectedDepartment === "ALL") return "ALL";
    return departments.some((d) => d.name === selectedDepartment)
      ? selectedDepartment
      : "ALL";
  }, [selectedDepartment, departments]);

  const hasActiveFilter =
    activeTrack !== "ALL" || activeDepartment !== "ALL";

  const filteredPathways = useMemo(() => {
    return records.filter((pathway) => {
      const track = pathway.Track_Type.trim() || "Uncategorized";
      const dept = pathway.Department.trim() || "Uncategorized";

      if (activeTrack !== "ALL" && track !== activeTrack) {
        return false;
      }
      if (activeDepartment !== "ALL" && dept !== activeDepartment) {
        return false;
      }
      return true;
    });
  }, [records, activeTrack, activeDepartment]);

  function handleResetFilters() {
    onSelectTrack("ALL");
    setSelectedDepartment("ALL");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Curriculum & Course Progression"
        title="Academic Pathways & Acceleration"
        description="Explore Pittsford Mendon course acceleration policies, AP & Honors progressions, Social Studies electives, BOCES / EMCC career programs, and the master Program of Studies."
        count={records.length}
        countLabel="pathways"
        icon={<GraduationCap className="h-6 w-6" aria-hidden="true" />}
        onOpenSearch={() => onOpenSearch("")}
      />

      {/* Department & Track Filter Bar */}
      <section
        aria-label="Academic Pathway Filters"
        className="space-y-3.5 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs"
      >
        {/* Primary Row: Track Type Pills */}
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Filter by Track Type
          </p>
          <div
            role="tablist"
            aria-label="Filter pathways by track type"
            className="flex items-center gap-2 overflow-x-auto pb-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTrack === "ALL"}
              onClick={() => onSelectTrack("ALL")}
              className={`inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                activeTrack === "ALL"
                  ? "border-navy bg-navy text-white shadow-xs"
                  : "border-slate-200 bg-surface text-navy hover:border-gold hover:bg-gold-light"
              }`}
            >
              <span>All Tracks</span>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-extrabold ${
                  activeTrack === "ALL"
                    ? "bg-gold text-navy-dark"
                    : "bg-navy/10 text-navy"
                }`}
              >
                {records.length}
              </span>
            </button>

            {trackTypes.map((track) => {
              const isSelected = activeTrack === track.name;
              return (
                <button
                  key={track.name}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() =>
                    onSelectTrack(isSelected ? "ALL" : track.name)
                  }
                  className={`inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    isSelected
                      ? "border-navy bg-navy text-white shadow-xs"
                      : "border-slate-200 bg-surface text-navy hover:border-gold hover:bg-gold-light"
                  }`}
                >
                  <span>{track.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-extrabold ${
                      isSelected
                        ? "bg-gold text-navy-dark"
                        : "bg-navy/10 text-navy"
                    }`}
                  >
                    {track.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Row: Department Pills */}
        <div className="border-t border-slate-100 pt-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Filter by Department
          </p>
          <div
            role="tablist"
            aria-label="Filter pathways by department"
            className="flex items-center gap-2 overflow-x-auto pb-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeDepartment === "ALL"}
              onClick={() => setSelectedDepartment("ALL")}
              className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                activeDepartment === "ALL"
                  ? "border-navy bg-navy text-white"
                  : "border-slate-200 bg-surface text-slate-700 hover:border-gold hover:bg-gold-light hover:text-navy-dark"
              }`}
            >
              <span>All Departments</span>
            </button>

            {departments.map((dept) => {
              const isSelected = activeDepartment === dept.name;
              return (
                <button
                  key={dept.name}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() =>
                    setSelectedDepartment(isSelected ? "ALL" : dept.name)
                  }
                  className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    isSelected
                      ? "border-navy bg-navy text-white"
                      : "border-slate-200 bg-surface text-slate-700 hover:border-gold hover:bg-gold-light hover:text-navy-dark"
                  }`}
                >
                  <span>{dept.name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                      isSelected
                        ? "bg-gold text-navy-dark"
                        : "bg-navy/10 text-navy"
                    }`}
                  >
                    {dept.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Counter & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600">
            <span className="font-semibold text-navy">
              Showing {filteredPathways.length} of {records.length} pathways
            </span>
            {activeTrack !== "ALL" && (
              <span className="rounded-full border border-gold/50 bg-gold-light px-2.5 py-0.5 font-semibold text-navy-dark">
                Track: {activeTrack}
              </span>
            )}
            {activeDepartment !== "ALL" && (
              <span className="rounded-full border border-navy/15 bg-surface px-2.5 py-0.5 font-semibold text-navy">
                Dept: {activeDepartment}
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

      {/*Zero-Results State when Track + Department mismatch*/}
      {filteredPathways.length === 0 && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-2xs">
          <h2 className="text-base font-extrabold text-navy">
            No academic pathways match both selected filters
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Reset the track or department filter to view all {records.length}{" "}
            academic pathways.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white transition hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <RotateCcw className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            <span>Show All {records.length} Pathways</span>
          </button>
        </div>
      )}

      {/* Pathways Explorer Grid */}
      {filteredPathways.length > 0 && (
        <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredPathways.map((pathway) => {
            const isAccelerationPolicy =
              pathway.Track_Type.trim() === "Acceleration Policy";
            const progressionSteps = parseProgressionSteps(
              pathway.Prerequisites_And_Eligibility,
            );
            const hasFlowchart = progressionSteps.length >= 2;
            const parsedPrograms = parseStructuredProgramList(
              pathway.Description_And_Details,
            );
            const hasProgramBadges = parsedPrograms.items.length >= 2;

            // Span full width on desktop for Acceleration Policy or multi-stage progression flowcharts
            const spanFullWidth = isAccelerationPolicy || hasFlowchart;

            return (
              <motion.button
                layout
                key={pathway.Pathway_ID}
                type="button"
                onClick={() =>
                  onOpenRecord({ kind: "pathway", record: pathway })
                }
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 text-left transition duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  spanFullWidth ? "md:col-span-2" : ""
                } ${
                  isAccelerationPolicy
                    ? "border-2 border-gold bg-gradient-to-br from-gold-light/60 via-white to-white shadow-md hover:shadow-lg"
                    : "border border-slate-200/90 bg-white shadow-2xs hover:border-gold hover:shadow-md"
                }`}
              >
                {isAccelerationPolicy && (
                  <div
                    aria-hidden="true"
                    className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-navy via-gold to-navy"
                  />
                )}

                <div>
                  {/* Highlighted Banner for Acceleration Policy */}
                  {isAccelerationPolicy && (
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gold shadow-2xs">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        Featured PCSD Acceleration &amp; Placement Policy
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryPill tone="gold">
                        {pathway.Track_Type}
                      </CategoryPill>
                      <CategoryPill tone="navy">
                        {pathway.Grade_Levels}
                      </CategoryPill>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {pathway.Pathway_ID}
                    </span>
                  </div>

                  <p className="mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Layers
                      className="h-3.5 w-3.5 text-navy"
                      aria-hidden="true"
                    />
                    <span>{pathway.Department}</span>
                  </p>

                  <h2 className="mt-1.5 text-lg font-extrabold leading-snug text-navy group-hover:text-navy-light sm:text-xl">
                    {pathway.Program_Or_Course_Title}
                  </h2>

                  {/* Description or Structured Program / Elective Badges */}
                  {hasProgramBadges ? (
                    <div className="mt-3 space-y-3">
                      {parsedPrograms.leadSummary && (
                        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                          {parsedPrograms.leadSummary}
                        </p>
                      )}
                      <div className="rounded-xl border border-slate-200/90 bg-surface/80 p-3.5">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-navy">
                          {parsedPrograms.listHeading}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {parsedPrograms.items.map((item) => {
                            const isApItem = /\b(AP|Honors)\b/i.test(item);
                            return (
                              <span
                                key={item}
                                className={
                                  isApItem
                                    ? "inline-flex items-center rounded-lg border border-gold/60 bg-gold-light px-2.5 py-1 text-xs font-bold text-navy-dark"
                                    : "inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"
                                }
                              >
                                {item}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      {pathway.Description_And_Details}
                    </p>
                  )}

                  {/* Prerequisites OR Visual Course Progression Flowchart */}
                  <div
                    className={`mt-4 rounded-xl border p-4 ${
                      hasFlowchart
                        ? "border-navy/15 bg-surface"
                        : isAccelerationPolicy
                          ? "border-gold/60 bg-gold-light/50"
                          : "border-slate-200/80 bg-surface"
                    }`}
                  >
                    <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-navy">
                      {hasFlowchart ? (
                        <>
                          <GitBranch
                            className="h-3.5 w-3.5 text-gold"
                            aria-hidden="true"
                          />
                          <span>
                            Interactive Multi-Year Course Progression Flowchart (
                            {progressionSteps.length} Stages)
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            className="h-3.5 w-3.5 text-gold"
                            aria-hidden="true"
                          />
                          <span>Prerequisites &amp; Eligibility</span>
                        </>
                      )}
                    </p>

                    {hasFlowchart ? (
                      <div className="mt-3">
                        <CourseProgressionFlowchart steps={progressionSteps} />
                      </div>
                    ) : (
                      <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-700">
                        {pathway.Prerequisites_And_Eligibility}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-navy">
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <BookOpen
                      className="h-3.5 w-3.5 text-navy"
                      aria-hidden="true"
                    />
                    <span>
                      Inspect complete pathway details &amp; official link
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-navy">
                    <span>Open</span>
                    <ArrowUpRight
                      className="h-4 w-4 text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
