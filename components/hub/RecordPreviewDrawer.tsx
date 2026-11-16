"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  GitBranch,
  GraduationCap,
  Info,
  Layers,
  Link2,
  MapPin,
  PhoneCall,
  Printer,
  Search,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { CategoryPill } from "@/components/hub/ui/CategoryPill";
import { CourseProgressionFlowchart } from "@/components/hub/ui/CourseProgressionFlowchart";
import { GuideChecklist } from "@/components/hub/ui/GuideChecklist";
import { PhoneLinkedText } from "@/components/hub/ui/PhoneLinkedText";
import { useCopyFeedback } from "@/components/hub/ui/useCopyFeedback";
import { useDialogFocusTrap } from "@/components/hub/ui/useDialogFocusTrap";
import {
  parseProgressionSteps,
  parseStructuredProgramList,
  parseStudentDescription,
} from "@/lib/format";
import {
  extractAdvisorNames,
  findClubsByAdvisor,
  findRelatedRecords,
  formatRecordHash,
  getRecordCategory,
  getRecordId,
  getRecordSubtitle,
  getRecordTitle,
  getRecordUrl,
  KIND_LABEL,
  type HubRecordRef,
} from "@/lib/hub-records";
import type { HubDataPayload } from "@/types/hub";

interface RecordPreviewDrawerProps {
  recordRef: HubRecordRef | null;
  data: Pick<HubDataPayload, "clubs" | "pathways" | "guides">;
  onClose: () => void;
  onSelectRecord: (ref: HubRecordRef) => void;
  onFilterClubsByAdvisor: (advisorName: string) => void;
  onOpenSearch: () => void;
}

export function RecordPreviewDrawer({
  recordRef,
  data,
  onClose,
  onSelectRecord,
  onFilterClubsByAdvisor,
  onOpenSearch,
}: RecordPreviewDrawerProps) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const { copiedKey: copiedRecordId, copy } = useCopyFeedback(2000);

  useDialogFocusTrap({
    open: Boolean(recordRef),
    dialogRef,
    initialFocusRef: closeButtonRef,
    onClose,
  });

  async function handleCopyDirectLink(ref: HubRecordRef) {
    if (typeof window === "undefined") return;
    const recordId = getRecordId(ref);
    const shareHash = formatRecordHash(ref);
    const fullUrl = `${window.location.origin}${window.location.pathname}${shareHash}`;
    await copy(recordId, fullUrl);
  }

  return (
    <AnimatePresence>
      {recordRef && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`Details for ${getRecordTitle(recordRef)}`}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="no-print fixed inset-0 bg-navy-dark/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Slide-Over Panel */}
          <motion.aside
            ref={dialogRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
          >
            {(() => {
              const currentId = getRecordId(recordRef);
              const isCopied = copiedRecordId === currentId;
              const relatedMatches = findRelatedRecords(recordRef, data, 4);

              return (
                <>
                  {/* Top Navy Header */}
                  <div className="relative overflow-hidden border-b border-navy/15 bg-navy px-6 py-6 text-white">
                    <div
                      aria-hidden="true"
                      className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-gold via-gold-light to-gold"
                    />

                    <div className="mt-1 flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-navy-dark/80 px-3 py-1 text-xs font-bold text-gold">
                          {recordRef.kind === "club" && (
                            <Users className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {recordRef.kind === "pathway" && (
                            <GraduationCap
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          )}
                          {recordRef.kind === "guide" && (
                            <Compass
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          )}
                          <span>{KIND_LABEL[recordRef.kind]}</span>
                        </span>

                        <span className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-xs font-semibold text-slate-200">
                          {currentId}
                        </span>
                      </div>

                      <div className="no-print flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyDirectLink(recordRef)}
                          aria-label="Copy direct link to this record"
                          className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                            isCopied
                              ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-200"
                              : "border-white/15 bg-navy-dark/70 text-slate-200 hover:border-gold hover:text-gold"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check
                                className="h-3.5 w-3.5 text-emerald-300"
                                aria-hidden="true"
                              />
                              <span>Copied link!</span>
                            </>
                          ) : (
                            <>
                              <Link2
                                className="h-3.5 w-3.5 text-gold"
                                aria-hidden="true"
                              />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        <button
                          ref={closeButtonRef}
                          type="button"
                          onClick={onClose}
                          aria-label="Close detail drawer"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-navy-dark/70 text-slate-200 transition hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <h2 className="mt-3.5 text-xl font-extrabold leading-snug text-white sm:text-2xl">
                      {getRecordTitle(recordRef)}
                    </h2>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <CategoryPill tone="gold">
                        {getRecordCategory(recordRef)}
                      </CategoryPill>
                      {recordRef.kind === "pathway" && (
                        <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white">
                          {recordRef.record.Grade_Levels}
                        </span>
                      )}
                      {recordRef.kind === "guide" && (
                        <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white">
                          {recordRef.record.Target_Audience}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Body */}
                  <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    {/* CLUB RECORD BODY */}
                    {recordRef.kind === "club" &&
                      (() => {
                        const club = recordRef.record;
                        const { cleanText, editorialNotes } =
                          parseStudentDescription(club.Description);
                        const multiClubAdvisors = extractAdvisorNames(
                          club.Advisor_Name,
                        )
                          .map((name) => ({
                            name,
                            totalCount: findClubsByAdvisor(name, data.clubs)
                              .length,
                          }))
                          .filter((item) => item.totalCount > 1);

                        return (
                          <>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div className="rounded-2xl border border-slate-200 bg-surface p-4">
                                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  <User
                                    className="h-3.5 w-3.5 text-navy"
                                    aria-hidden="true"
                                  />
                                  <span>Faculty Advisor(s)</span>
                                </p>
                                <p className="mt-1 text-sm font-bold text-navy">
                                  {club.Advisor_Name}
                                </p>

                                {multiClubAdvisors.length > 0 && (
                                  <div className="no-print mt-2.5 flex flex-wrap gap-1.5 border-t border-slate-200/80 pt-2">
                                    {multiClubAdvisors.map((adv) => (
                                      <button
                                        key={adv.name}
                                        type="button"
                                        onClick={() =>
                                          onFilterClubsByAdvisor(adv.name)
                                        }
                                        className="inline-flex min-h-[28px] items-center gap-1 rounded-lg border border-gold/60 bg-gold-light px-2.5 py-1 text-[11px] font-bold text-navy-dark transition hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                                      >
                                        <span>
                                          See all {adv.totalCount} clubs by{" "}
                                          {adv.name}
                                        </span>
                                        <ArrowUpRight
                                          className="h-3 w-3"
                                          aria-hidden="true"
                                        />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-surface p-4">
                                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  <MapPin
                                    className="h-3.5 w-3.5 text-navy"
                                    aria-hidden="true"
                                  />
                                  <span>Location / Room</span>
                                </p>
                                <p className="mt-1 text-sm font-bold text-navy">
                                  {club.Location_Room}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-surface p-4 sm:col-span-2">
                                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  <Clock
                                    className="h-3.5 w-3.5 text-navy"
                                    aria-hidden="true"
                                  />
                                  <span>Meeting Schedule</span>
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                  {club.Meeting_Schedule}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                              <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy">
                                Club Overview &amp; Activities
                              </h3>
                              <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                                {cleanText}
                              </p>
                            </div>

                            {/* Muted Record Details Footer Section */}
                            <div className="rounded-2xl border border-slate-200/80 bg-surface p-4 text-xs text-slate-500">
                              <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-400">
                                <Info
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                <span>Record Details</span>
                              </p>
                              <dl className="mt-2.5 grid grid-cols-2 gap-2">
                                <div>
                                  <dt className="text-[11px] text-slate-400">
                                    Record ID
                                  </dt>
                                  <dd className="font-mono font-semibold text-slate-700">
                                    {club.Club_ID}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-[11px] text-slate-400">
                                    Last Verified
                                  </dt>
                                  <dd className="inline-flex items-center gap-1 font-mono font-semibold text-slate-700">
                                    <Calendar
                                      className="h-3 w-3 text-slate-400"
                                      aria-hidden="true"
                                    />
                                    {club.Last_Verified}
                                  </dd>
                                </div>
                                <div className="col-span-2">
                                  <dt className="text-[11px] text-slate-400">
                                    CMS Data Status
                                  </dt>
                                  <dd className="font-medium text-slate-600">
                                    {club.Data_Status}
                                  </dd>
                                </div>
                                {editorialNotes.length > 0 && (
                                  <div className="col-span-2 border-t border-slate-200/80 pt-2">
                                    <dt className="text-[11px] text-slate-400">
                                      CMS Verification Note
                                    </dt>
                                    <dd className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                                      {editorialNotes.join(" · ")}
                                    </dd>
                                  </div>
                                )}
                              </dl>
                            </div>
                          </>
                        );
                      })()}

                    {/* ACADEMIC PATHWAY RECORD BODY */}
                    {recordRef.kind === "pathway" &&
                      (() => {
                        const pathway = recordRef.record;
                        const progressionSteps = parseProgressionSteps(
                          pathway.Prerequisites_And_Eligibility,
                        );
                        const hasFlowchart = progressionSteps.length >= 2;
                        const parsedPrograms = parseStructuredProgramList(
                          pathway.Description_And_Details,
                        );
                        const hasProgramBadges =
                          parsedPrograms.items.length >= 2;

                        return (
                          <>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div className="rounded-2xl border border-slate-200 bg-surface p-4">
                                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  <Layers
                                    className="h-3.5 w-3.5 text-navy"
                                    aria-hidden="true"
                                  />
                                  <span>Department</span>
                                </p>
                                <p className="mt-1 text-sm font-bold text-navy">
                                  {pathway.Department}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-surface p-4">
                                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  <GraduationCap
                                    className="h-3.5 w-3.5 text-navy"
                                    aria-hidden="true"
                                  />
                                  <span>Eligible Grade Levels</span>
                                </p>
                                <p className="mt-1 text-sm font-bold text-navy">
                                  {pathway.Grade_Levels}
                                </p>
                              </div>
                            </div>

                            {hasFlowchart ? (
                              <div className="rounded-2xl border border-navy/15 bg-surface p-5">
                                <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-navy">
                                  <GitBranch
                                    className="h-4 w-4 text-gold"
                                    aria-hidden="true"
                                  />
                                  <span>
                                    Course Progression Flowchart (
                                    {progressionSteps.length} Stages)
                                  </span>
                                </h3>
                                <div className="mt-3">
                                  <CourseProgressionFlowchart
                                    steps={progressionSteps}
                                    compact
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-gold/50 bg-gold-light/60 p-5">
                                <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-navy-dark">
                                  <CheckCircle2
                                    className="h-4 w-4 text-navy"
                                    aria-hidden="true"
                                  />
                                  <span>Prerequisites &amp; Eligibility</span>
                                </h3>
                                <p className="mt-2 text-sm font-medium leading-relaxed text-navy-dark whitespace-pre-line">
                                  {pathway.Prerequisites_And_Eligibility}
                                </p>
                              </div>
                            )}

                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                              <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-navy">
                                <BookOpen
                                  className="h-4 w-4 text-gold"
                                  aria-hidden="true"
                                />
                                <span>
                                  Program Description &amp; Course Details
                                </span>
                              </h3>

                              {hasProgramBadges ? (
                                <div className="mt-2.5 space-y-3">
                                  {parsedPrograms.leadSummary && (
                                    <p className="text-sm leading-relaxed text-slate-700">
                                      <PhoneLinkedText
                                        text={parsedPrograms.leadSummary}
                                      />
                                    </p>
                                  )}
                                  <div className="rounded-xl border border-slate-200/80 bg-surface p-3.5">
                                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-navy">
                                      {parsedPrograms.listHeading}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {parsedPrograms.items.map((item) => {
                                        const isApItem = /\b(AP|Honors)\b/i.test(
                                          item,
                                        );
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
                                <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                                  <PhoneLinkedText
                                    text={pathway.Description_And_Details}
                                  />
                                </p>
                              )}
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-surface p-4 text-xs text-slate-500">
                              <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-400">
                                <Info
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                <span>Record Details</span>
                              </p>
                              <dl className="mt-2 grid grid-cols-2 gap-2">
                                <div>
                                  <dt className="text-[11px] text-slate-400">
                                    Pathway ID
                                  </dt>
                                  <dd className="font-mono font-semibold text-slate-700">
                                    {pathway.Pathway_ID}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-[11px] text-slate-400">
                                    Track Classification
                                  </dt>
                                  <dd className="font-semibold text-slate-700">
                                    {pathway.Track_Type}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          </>
                        );
                      })()}

                    {/* STUDENT ACTION GUIDE RECORD BODY */}
                    {recordRef.kind === "guide" &&
                      (() => {
                        const guide = recordRef.record;
                        return (
                          <>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div className="rounded-2xl border border-slate-200 bg-surface p-4">
                                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  <MapPin
                                    className="h-3.5 w-3.5 text-navy"
                                    aria-hidden="true"
                                  />
                                  <span>Where to Go (Office / Room)</span>
                                </p>
                                <p className="mt-1 text-sm font-bold text-navy">
                                  {guide.Office_Or_Room}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-surface p-4">
                                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  <PhoneCall
                                    className="h-3.5 w-3.5 text-navy"
                                    aria-hidden="true"
                                  />
                                  <span>Staff Contact</span>
                                </p>
                                <p className="mt-1 text-sm font-bold text-navy">
                                  <PhoneLinkedText text={guide.Staff_Contact} />
                                </p>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-gold/50 bg-gold-light/65 p-4">
                              <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-navy-dark">
                                <AlertCircle
                                  className="h-4 w-4 text-navy"
                                  aria-hidden="true"
                                />
                                <span>Key Deadlines &amp; Required Rules</span>
                              </p>
                              <p className="mt-1.5 text-sm font-semibold text-navy-dark">
                                {guide.Key_Deadlines_Or_Rules}
                              </p>
                            </div>

                            <div className="space-y-2.5">
                              <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy">
                                Interactive Action Checklist
                              </h3>
                              <GuideChecklist
                                guide={guide}
                                idPrefix="drawer-guide"
                              />
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-surface p-4 text-xs text-slate-500">
                              <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-400">
                                <Info
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                <span>Record Details</span>
                              </p>
                              <dl className="mt-2 grid grid-cols-2 gap-2">
                                <div>
                                  <dt className="text-[11px] text-slate-400">
                                    Guide ID
                                  </dt>
                                  <dd className="font-mono font-semibold text-slate-700">
                                    {guide.Guide_ID}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-[11px] text-slate-400">
                                    Target Audience
                                  </dt>
                                  <dd className="font-semibold text-slate-700">
                                    {guide.Target_Audience}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          </>
                        );
                      })()}

                    {/* RELATED AT MENDON CROSS-LINKS SECTION */}
                    {relatedMatches.length > 0 && (
                      <section
                        aria-label="Related PMHS Resources"
                        className="no-print space-y-2.5 rounded-2xl border border-navy/15 bg-surface p-4"
                      >
                        <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-navy">
                          <Sparkles
                            className="h-3.5 w-3.5 text-gold"
                            aria-hidden="true"
                          />
                          <span>Related at Mendon</span>
                        </p>

                        <div className="space-y-2">
                          {relatedMatches.map((match) => {
                            const matchId = getRecordId(match.ref);
                            return (
                              <button
                                key={matchId}
                                type="button"
                                onClick={() => onSelectRecord(match.ref)}
                                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-3 text-left transition hover:border-gold hover:bg-gold-light/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="rounded bg-navy px-1.5 py-0.5 font-mono text-[10px] font-bold text-gold">
                                      {KIND_LABEL[match.ref.kind]}
                                    </span>
                                    <span className="font-mono text-[10px] font-semibold text-slate-400">
                                      {matchId}
                                    </span>
                                  </div>
                                  <p className="mt-1 truncate text-xs font-extrabold text-navy group-hover:text-navy-light sm:text-sm">
                                    {getRecordTitle(match.ref)}
                                  </p>
                                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                    {match.reason} ·{" "}
                                    {getRecordSubtitle(match.ref)}
                                  </p>
                                </div>

                                <ArrowUpRight
                                  className="h-4 w-4 shrink-0 text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                  aria-hidden="true"
                                />
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Sticky Drawer Footer with Official Source Link, Print & Direct Share */}
                  <div className="no-print border-t border-slate-200 bg-surface p-5">
                    {(() => {
                      const rawUrl = getRecordUrl(recordRef).trim();
                      const isHttp =
                        rawUrl.startsWith("http://") ||
                        rawUrl.startsWith("https://");

                      return (
                        <div className="space-y-3">
                          <div className="flex flex-col gap-2 sm:flex-row">
                            {isHttp && (
                              <a
                                href={rawUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:text-sm"
                              >
                                <span>Open Official PMHS Resource</span>
                                <ExternalLink
                                  className="h-4 w-4 text-gold"
                                  aria-hidden="true"
                                />
                              </a>
                            )}

                            {recordRef.kind === "guide" && (
                              <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-xs font-bold text-navy transition hover:border-gold hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:text-sm"
                              >
                                <Printer
                                  className="h-4 w-4 text-navy"
                                  aria-hidden="true"
                                />
                                <span>Print</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleCopyDirectLink(recordRef)}
                              className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:text-sm ${
                                isCopied
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                  : "border-navy/20 bg-white text-navy hover:border-gold hover:bg-gold-light"
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check
                                    className="h-4 w-4 text-emerald-600"
                                    aria-hidden="true"
                                  />
                                  <span>Copied link!</span>
                                </>
                              ) : (
                                <>
                                  <Link2
                                    className="h-4 w-4 text-navy"
                                    aria-hidden="true"
                                  />
                                  <span>Copy Direct Link</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenSearch();
                              }}
                              className="inline-flex items-center gap-1.5 font-semibold text-navy hover:underline"
                            >
                              <Search
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              <span>Search another record (⌘K)</span>
                            </button>

                            <button
                              type="button"
                              onClick={onClose}
                              className="font-semibold text-slate-500 hover:text-navy"
                            >
                              Close (Esc)
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </>
              );
            })()}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
