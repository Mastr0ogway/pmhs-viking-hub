"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  FileSpreadsheet,
  HardDrive,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { formatEasternTimestamp } from "@/lib/format";
import { GUIDE_PROGRESS_STORAGE_KEY } from "@/lib/guide-progress";
import { ISR_REVALIDATE_SECONDS } from "@/lib/hub-config";

interface AdminMaintenanceModalProps {
  open: boolean;
  onClose: () => void;
  clubCount: number;
  pathwayCount: number;
  guideCount: number;
  totalGuideSteps: number;
  fetchedAt: string;
}

export function AdminMaintenanceModal({
  open,
  onClose,
  clubCount,
  pathwayCount,
  guideCount,
  totalGuideSteps,
  fetchedAt,
}: AdminMaintenanceModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 30);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  const easternTime = formatEasternTimestamp(fetchedAt);
  const totalRecords = clubCount + pathwayCount + guideCount;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy-dark/70 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Modal Dialog Container */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative z-10 flex h-full w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-3xl sm:border sm:border-navy/20"
          >
            {/* Top Navy Header */}
            <div className="relative shrink-0 overflow-hidden border-b border-navy/15 bg-navy px-6 py-5 text-white sm:px-8 sm:py-6">
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-gold via-gold-light to-gold"
              />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-navy-dark/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gold">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      Architecture, Governance &amp; Continuity Briefing
                    </span>
                  </div>
                  <h2
                    id="admin-modal-title"
                    className="mt-2.5 text-xl font-extrabold tracking-tight text-white sm:text-2xl"
                  >
                    How Maintenance &amp; Safety Works
                  </h2>
                  <p className="mt-1 text-xs text-slate-200 sm:text-sm">
                    Overview for the Superintendent&apos;s Student Advisory
                    Council (SSAC), PMHS Administration, and future student
                    maintainers.
                  </p>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close maintenance and safety modal"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-navy-dark/70 text-slate-200 transition hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Body */}
            <div className="flex-1 space-y-7 overflow-y-auto p-6 sm:p-8">
              {/* SECTION 1: LIVE CMS TELEMETRY STRIP */}
              <section
                aria-label="Live CMS Telemetry"
                className="rounded-2xl border border-slate-200/90 bg-surface p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy">
                      1. Live CMS Telemetry ({totalRecords} Verified Records)
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700">
                      <Clock
                        className="h-3.5 w-3.5 text-navy"
                        aria-hidden="true"
                      />
                      <span>Synced {easternTime} ET</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg border border-gold/50 bg-gold-light px-2.5 py-1 font-mono text-[11px] font-extrabold text-navy-dark">
                      <RefreshCw className="h-3 w-3" aria-hidden="true" />
                      <span>ISR Revalidate: {ISR_REVALIDATE_SECONDS}s</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-200/90 bg-white p-3.5">
                    <p className="font-mono text-2xl font-extrabold text-navy">
                      {clubCount}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-600">
                      Clubs &amp; Activities
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/90 bg-white p-3.5">
                    <p className="font-mono text-2xl font-extrabold text-navy">
                      {pathwayCount}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-600">
                      Academic Pathways
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/90 bg-white p-3.5">
                    <p className="font-mono text-2xl font-extrabold text-navy">
                      {guideCount}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-600">
                      Action Guides
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/90 bg-white p-3.5">
                    <p className="font-mono text-2xl font-extrabold text-navy">
                      {totalGuideSteps}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-600">
                      Checklist Steps
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-200/80 pt-3.5 sm:flex-row sm:items-center">
                  <p className="text-xs text-slate-600">
                    Inspect raw column schemas, tab endpoints, and live parsed
                    records on the verification dashboard.
                  </p>
                  <Link
                    href="/verify"
                    onClick={onClose}
                    className="inline-flex min-h-[38px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white transition hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <Database
                      className="h-3.5 w-3.5 text-gold"
                      aria-hidden="true"
                    />
                    <span>Open /verify Diagnostics</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 text-gold"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </section>

              {/* SECTION 2: ZERO-CODE GOOGLE SHEETS WORKFLOW (3-STEP VISUAL DIAGRAM) */}
              <section
                aria-label="Zero-Code Google Sheets Workflow"
                className="space-y-3.5"
              >
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy">
                    2. Zero-Code Google Sheets Workflow
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    Staff and student officers never need to touch code or run a
                    deployment to update club advisors, room numbers, or action
                    guides after current student developers graduate.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                  {/* Step 1 */}
                  <div className="relative flex flex-col justify-between rounded-2xl border border-navy/15 bg-white p-4 shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gold">
                          <span>Step 01</span>
                        </span>
                        <FileSpreadsheet
                          className="h-4 w-4 text-navy"
                          aria-hidden="true"
                        />
                      </div>
                      <h4 className="mt-3 text-sm font-extrabold text-navy">
                        Edit Master Google Sheet
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        Counseling staff, club advisors, or authorized Student
                        Council officers update a row in{" "}
                        <code className="rounded bg-surface px-1 py-0.5 font-mono text-[11px] text-navy">
                          Clubs_Directory
                        </code>
                        ,{" "}
                        <code className="rounded bg-surface px-1 py-0.5 font-mono text-[11px] text-navy">
                          Academic_Pathways
                        </code>
                        , or{" "}
                        <code className="rounded bg-surface px-1 py-0.5 font-mono text-[11px] text-navy">
                          Student_Action_Guides
                        </code>
                        .
                      </p>
                    </div>

                    <div
                      aria-hidden="true"
                      className="my-2 flex items-center justify-center md:hidden"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gold bg-gold-light text-navy-dark">
                        <ArrowDown className="h-3 w-3" />
                      </span>
                    </div>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 -right-3.5 z-10 hidden -translate-y-1/2 md:flex"
                    >
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gold bg-navy text-gold shadow-xs">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex flex-col justify-between rounded-2xl border border-navy/15 bg-white p-4 shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gold">
                          <span>Step 02</span>
                        </span>
                        <RefreshCw
                          className="h-4 w-4 text-navy"
                          aria-hidden="true"
                        />
                      </div>
                      <h4 className="mt-3 text-sm font-extrabold text-navy">
                        Server Re-Fetches &amp; Validates
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        Next.js Incremental Static Regeneration (ISR) re-reads
                        the sheet every{" "}
                        <strong className="font-bold text-navy">
                          {ISR_REVALIDATE_SECONDS} seconds
                        </strong>{" "}
                        in the background and validates every column header
                        against strict TypeScript contracts.
                      </p>
                    </div>

                    <div
                      aria-hidden="true"
                      className="my-2 flex items-center justify-center md:hidden"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gold bg-gold-light text-navy-dark">
                        <ArrowDown className="h-3 w-3" />
                      </span>
                    </div>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 -right-3.5 z-10 hidden -translate-y-1/2 md:flex"
                    >
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gold bg-navy text-gold shadow-xs">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col justify-between rounded-2xl border border-navy/15 bg-white p-4 shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gold">
                          <span>Step 03</span>
                        </span>
                        <CheckCircle2
                          className="h-4 w-4 text-emerald-600"
                          aria-hidden="true"
                        />
                      </div>
                      <h4 className="mt-3 text-sm font-extrabold text-navy">
                        Live Across All Views &amp; ⌘K
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        Updated records automatically appear across the
                        Overview, filterable directories, progression
                        flowcharts, checklists, and global{" "}
                        <code className="rounded bg-surface px-1 py-0.5 font-mono text-[11px] text-navy">
                          ⌘K
                        </code>{" "}
                        spotlight search—with zero code changes.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: DISTRICT SAFETY, PRIVACY & ACCESSIBILITY */}
              <section
                aria-label="District Safety, Privacy, and Accessibility"
                className="space-y-3.5"
              >
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy">
                    3. Privacy, Safety &amp; Accessibility Architecture
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    Designed around{" "}
                    <strong className="font-bold text-navy">
                      NY Ed Law § 2-d
                    </strong>
                    , <strong className="font-bold text-navy">FERPA</strong>,
                    and{" "}
                    <strong className="font-bold text-navy">
                      WCAG 2.1 AA
                    </strong>{" "}
                    principles with verifiable architectural safeguards:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/90 bg-surface p-4">
                    <p className="flex items-center gap-2 text-xs font-extrabold text-navy">
                      <Lock
                        className="h-4 w-4 text-gold"
                        aria-hidden="true"
                      />
                      <span>Public Read-Only · Zero Logins or Cookies</span>
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      Requires no student logins, accounts, or cookies.
                      Visitors&apos; browsers never contact Google Sheets
                      directly—the server fetches and caches the public CSV
                      tabs.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/90 bg-surface p-4">
                    <p className="flex items-center gap-2 text-xs font-extrabold text-navy">
                      <HardDrive
                        className="h-4 w-4 text-gold"
                        aria-hidden="true"
                      />
                      <span>On-Device Checklist Storage Only</span>
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      Action guide checklist progress is stored solely on the
                      visitor&apos;s own device via one browser{" "}
                      <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-navy">
                        localStorage
                      </code>{" "}
                      key (
                      <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-navy">
                        {GUIDE_PROGRESS_STORAGE_KEY}
                      </code>
                      ) and is never transmitted anywhere.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/90 bg-surface p-4">
                    <p className="flex items-center gap-2 text-xs font-extrabold text-navy">
                      <UserCheck
                        className="h-4 w-4 text-gold"
                        aria-hidden="true"
                      />
                      <span>Staff &amp; Office Contact Routing</span>
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      No student accounts, grades, schedules, or private
                      records. Contact routing points to staff and offices; any
                      student-leader names are ones the club chose to publish.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/90 bg-surface p-4">
                    <p className="flex items-center gap-2 text-xs font-extrabold text-navy">
                      <ShieldAlert
                        className="h-4 w-4 text-gold"
                        aria-hidden="true"
                      />
                      <span>Runtime Column Validation &amp; Accessibility</span>
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      Strict runtime column checks (
                      <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-navy">
                        SheetFetchError
                      </code>
                      ) catch tab/column mismatches immediately. Built with
                      semantic landmarks, full keyboard navigation, visible
                      focus rings, and reduced-motion support.
                    </p>
                  </div>
                </div>

                <p className="flex items-center gap-1.5 text-[11px] italic text-slate-500">
                  <Eye className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  <span>
                    Note: Formal accessibility audit and district data-privacy
                    review recommended before official adoption.
                  </span>
                </p>
              </section>

              {/* SECTION 4: ANNUAL MAY LEADERSHIP HANDOFF PROTOCOL */}
              <section
                aria-label="Annual May Leadership Handoff Protocol"
                className="rounded-2xl border border-gold/50 bg-gold-light/45 p-5"
              >
                <div className="flex items-start gap-2.5">
                  <CalendarCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-navy"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy-dark">
                      4. Annual May Leadership Handoff Protocol
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-navy-dark/90">
                      To guarantee multi-year continuity, the{" "}
                      <strong className="font-extrabold">
                        Faculty Sponsor / Advisor retains permanent Owner access
                      </strong>{" "}
                      on the Master Google Sheet, GitHub Organization, and
                      Vercel project, while{" "}
                      <strong className="font-extrabold">
                        Editor / Admin access rotates every May
                      </strong>{" "}
                      from outgoing to incoming Computer Science Club and
                      Student Council leads:
                    </p>
                  </div>
                </div>

                <ol className="mt-3.5 grid grid-cols-1 gap-2.5 text-xs text-navy-dark sm:grid-cols-2">
                  <li className="flex items-start gap-2.5 rounded-xl border border-gold/40 bg-white/90 p-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-navy font-mono text-[10px] font-extrabold text-gold">
                      1
                    </span>
                    <span>
                      <strong className="font-bold">
                        Master Google Sheet:
                      </strong>{" "}
                      Faculty Sponsor remains permanent Owner; grant incoming
                      Student Council &amp; CS Club officers Editor access and
                      revoke graduating seniors.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 rounded-xl border border-gold/40 bg-white/90 p-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-navy font-mono text-[10px] font-extrabold text-gold">
                      2
                    </span>
                    <span>
                      <strong className="font-bold">
                        GitHub &amp; Vercel Ownership:
                      </strong>{" "}
                      Faculty Sponsor retains permanent Owner on the GitHub
                      Organization and Vercel project while rotating maintainer
                      access to incoming CS Club leads.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 rounded-xl border border-gold/40 bg-white/90 p-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-navy font-mono text-[10px] font-extrabold text-gold">
                      3
                    </span>
                    <span>
                      <strong className="font-bold">
                        Fall Rollover Audit:
                      </strong>{" "}
                      Update club advisors, room numbers, and meeting schedules
                      in the Google Sheet each September and verify{" "}
                      <code className="rounded bg-surface px-1 py-0.5 font-mono text-[10px] text-navy">
                        Last_Verified
                      </code>{" "}
                      dates.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 rounded-xl border border-gold/40 bg-white/90 p-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-navy font-mono text-[10px] font-extrabold text-gold">
                      4
                    </span>
                    <span>
                      <strong className="font-bold">
                        Live Verification Drill:
                      </strong>{" "}
                      Outgoing and incoming leads run a test cell edit together
                      and confirm zero schema errors on{" "}
                      <code className="rounded bg-surface px-1 py-0.5 font-mono text-[10px] text-navy">
                        /verify
                      </code>
                      .
                    </span>
                  </li>
                </ol>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-surface px-6 py-4 sm:px-8">
              <div className="flex items-center gap-2 text-xs font-semibold text-navy">
                <ShieldCheck
                  className="h-4 w-4 text-emerald-600"
                  aria-hidden="true"
                />
                <span>
                  PMHS Viking Hub · Built for Student, Family &amp; Staff
                  Clarity
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href="/verify"
                  onClick={onClose}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3.5 py-2 text-xs font-bold text-navy transition hover:border-gold hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <KeyRound className="h-3.5 w-3.5 text-navy" aria-hidden="true" />
                  <span>Inspect Live Schema (/verify)</span>
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-[38px] items-center justify-center rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white transition hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <span>Done (Esc)</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
