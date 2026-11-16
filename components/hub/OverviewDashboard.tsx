"use client";

import {
  ArrowRight,
  CheckCircle2,
  Compass,
  GraduationCap,
  MapPin,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { CategoryPill } from "@/components/hub/ui/CategoryPill";
import { parseGuideSteps, tallyByField } from "@/lib/format";
import { useGuideProgress } from "@/lib/guide-progress";
import type { HubRecordRef, HubView } from "@/lib/hub-records";
import type {
  AcademicPathwayRecord,
  ClubRecord,
  StudentActionGuideRecord,
} from "@/types/hub";

interface OverviewDashboardProps {
  clubs: readonly ClubRecord[];
  pathways: readonly AcademicPathwayRecord[];
  guides: readonly StudentActionGuideRecord[];
  onSelectView: (view: HubView) => void;
  onSelectClubCategory: (category: string) => void;
  onSelectPathwayTrack: (track: string) => void;
  onSelectGuideCategory: (category: string) => void;
  onOpenRecord: (ref: HubRecordRef) => void;
}

export function OverviewDashboard({
  clubs,
  pathways,
  guides,
  onSelectView,
  onSelectClubCategory,
  onSelectPathwayTrack,
  onSelectGuideCategory,
  onOpenRecord,
}: OverviewDashboardProps) {
  const clubCategories = tallyByField(clubs, (c) => c.Category);
  const pathwayTracks = tallyByField(pathways, (p) => p.Track_Type);
  const guideCategories = tallyByField(guides, (g) => g.Category);
  const { getCompletedSteps, isHydrated } = useGuideProgress();

  return (
    <div className="space-y-10">
      {/* 1. Three Core Pillar Feature Cards */}
      <section aria-label="Core Navigation Pillars">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Pillar 1: Clubs & Activities */}
          <article className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition duration-150 hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-md">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-gold shadow-xs transition group-hover:bg-navy-light">
                    <Users className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Extracurriculars
                    </p>
                    <h2 className="text-lg font-extrabold text-navy">
                      Clubs &amp; Activities
                    </h2>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center rounded-full border border-gold/50 bg-gold-light px-3 py-1 font-mono text-xs font-extrabold text-navy-dark">
                  {clubs.length} clubs
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Discover student organizations, competition teams, music and
                arts ensembles, affinity groups, and service clubs—complete with
                verified faculty advisors and meeting rooms.
              </p>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {clubCategories.length} Categories · Click to Filter
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {clubCategories.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => onSelectClubCategory(cat.name)}
                      className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-slate-200 bg-surface px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-gold hover:bg-gold-light hover:text-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <span>{cat.name}</span>
                      <span className="rounded bg-navy/10 px-1.5 py-0.2 font-mono text-[11px] font-bold text-navy">
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => onSelectView("clubs")}
                className="inline-flex w-full items-center justify-between rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white transition hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span>Browse All {clubs.length} Clubs &amp; Activities</span>
                <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </article>

          {/* Pillar 2: Academic Pathways & Acceleration */}
          <article className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition duration-150 hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-md">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-gold shadow-xs transition group-hover:bg-navy-light">
                    <GraduationCap className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Curriculum &amp; Tracks
                    </p>
                    <h2 className="text-lg font-extrabold text-navy">
                      Academic Pathways
                    </h2>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center rounded-full border border-gold/50 bg-gold-light px-3 py-1 font-mono text-xs font-extrabold text-navy-dark">
                  {pathways.length} pathways
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Navigate course acceleration policies, AP &amp; Honors
                progressions, Social Studies electives, Eastern Monroe Career
                Center (EMCC / BOCES), and the MHS Program of Studies.
              </p>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {pathwayTracks.length} Track Types · Click to Filter
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {pathwayTracks.map((track) => (
                    <button
                      key={track.name}
                      type="button"
                      onClick={() => onSelectPathwayTrack(track.name)}
                      className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-slate-200 bg-surface px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-gold hover:bg-gold-light hover:text-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <span>{track.name}</span>
                      <span className="rounded bg-navy/10 px-1.5 py-0.2 font-mono text-[11px] font-bold text-navy">
                        {track.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => onSelectView("pathways")}
                className="inline-flex w-full items-center justify-between rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white transition hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span>Explore Academic Pathways</span>
                <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </article>

          {/* Pillar 3: "How Do I...?" Student Action Guides */}
          <article className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition duration-150 hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-md">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-gold shadow-xs transition group-hover:bg-navy-light">
                    <Compass className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Step-By-Step Procedures
                    </p>
                    <h2 className="text-lg font-extrabold text-navy">
                      &ldquo;How Do I...?&rdquo; Guides
                    </h2>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center rounded-full border border-gold/50 bg-gold-light px-3 py-1 font-mono text-xs font-extrabold text-navy-dark">
                  {guides.length} guides
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Follow clear step-by-step instructions for working papers,
                community service hours (Room 252A), Common App &amp; Naviance
                transcripts, course consultations, and student wellness.
              </p>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {guideCategories.length} Guide Categories · Click to Filter
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {guideCategories.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => onSelectGuideCategory(cat.name)}
                      className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-slate-200 bg-surface px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-gold hover:bg-gold-light hover:text-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <span>{cat.name}</span>
                      <span className="rounded bg-navy/10 px-1.5 py-0.2 font-mono text-[11px] font-bold text-navy">
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => onSelectView("guides")}
                className="inline-flex w-full items-center justify-between rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white transition hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span>Open Student Action Guides</span>
                <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* 2. Featured High-Priority Student Guides Strip */}
      <section
        aria-label="Featured High-Priority Student Action Guides"
        className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.15em] text-navy">
              <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              <span>Featured High-Priority Student Guides</span>
            </div>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-navy sm:text-2xl">
              Common School Tasks, Demystified
            </h2>
            <p className="mt-1 text-xs text-slate-600 sm:text-sm">
              Click any guide to view the exact room number, staff contact, key
              deadlines, and step-by-step instructions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectView("guides")}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-navy/15 bg-surface px-3.5 py-2 text-xs font-bold text-navy transition hover:border-gold hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:self-auto"
          >
            <span>View all {guides.length} guides</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {guides.map((guide) => {
            const { steps, isNumbered } = parseGuideSteps(
              guide.Step_By_Step_Process,
            );
            const totalSteps = steps.length;
            const completedCount = isHydrated
              ? getCompletedSteps(guide.Guide_ID, totalSteps).length
              : 0;
            const isAllCompleted =
              totalSteps > 0 && completedCount === totalSteps;
            const hasStarted = completedCount > 0 && !isAllCompleted;

            return (
              <button
                key={guide.Guide_ID}
                type="button"
                onClick={() => onOpenRecord({ kind: "guide", record: guide })}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-surface/70 p-4 text-left transition duration-150 hover:-translate-y-0.5 hover:border-gold hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <CategoryPill tone="gold">{guide.Category}</CategoryPill>
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      {guide.Guide_ID}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-extrabold leading-snug text-navy group-hover:text-navy-light">
                    {guide.Task_Title}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-start gap-1.5">
                      <MapPin
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy"
                        aria-hidden="true"
                      />
                      <span className="line-clamp-2 font-medium">
                        {guide.Office_Or_Room}
                      </span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <UserCheck
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                      <span className="line-clamp-1">
                        {guide.Target_Audience}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3 text-xs font-bold text-navy">
                  {isAllCompleted ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-800">
                      <CheckCircle2
                        className="h-3.5 w-3.5 text-emerald-600"
                        aria-hidden="true"
                      />
                      <span>Completed ✓</span>
                    </span>
                  ) : hasStarted ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold-light px-2 py-0.5 text-[11px] font-extrabold text-navy-dark">
                      <CheckCircle2
                        className="h-3.5 w-3.5 text-navy"
                        aria-hidden="true"
                      />
                      <span>
                        {completedCount}/{totalSteps} steps done
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <CheckCircle2
                        className="h-3.5 w-3.5 text-emerald-600"
                        aria-hidden="true"
                      />
                      {isNumbered || totalSteps > 1
                        ? `${totalSteps} steps`
                        : "Quick reference"}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-navy transition-transform group-hover:translate-x-0.5">
                    Open &rarr;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
