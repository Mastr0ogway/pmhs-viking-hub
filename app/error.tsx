"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Database,
  ExternalLink,
  Phone,
  RefreshCw,
  Shield,
} from "lucide-react";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  const rawMessage = error?.message?.trim() ?? "";
  const isSanitizedProdError =
    !rawMessage ||
    rawMessage.includes("Server Components render") ||
    rawMessage.includes("An error occurred in the Server Components");

  return (
    <div className="flex min-h-screen flex-col justify-between bg-surface text-slate-900">
      {/* Top Institutional Bar */}
      <div className="border-b border-white/10 bg-navy-dark px-4 py-2.5 text-xs text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 font-semibold text-white">
            <Shield className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            <span>
              Pittsford Mendon High School · Student &amp; Family Navigation Hub
            </span>
          </span>
          <a
            href="tel:5852671660"
            className="inline-flex items-center gap-1 font-semibold text-gold hover:underline"
          >
            <Phone className="h-3 w-3" aria-hidden="true" />
            <span>Counseling: (585) 267-1660</span>
          </a>
        </div>
      </div>

      {/* Main Diagnostic Card */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-12 sm:px-6">
        <div className="w-full overflow-hidden rounded-3xl border-2 border-gold bg-white shadow-xl">
          <div className="border-b border-navy/15 bg-navy px-6 py-6 text-white sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-navy-dark/80 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-gold">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Live Google Sheet CMS Sync Alert</span>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Unable to Verify Live Spreadsheet Data
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-200 sm:text-sm">
              To guarantee 100% data accuracy, Viking Hub never falls back to
              outdated or placeholder records when a Google Sheet tab or column
              contract cannot be verified.
            </p>
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            <div className="rounded-2xl border border-slate-200 bg-surface p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-navy">
                Diagnostic Summary
              </p>
              {isSanitizedProdError ? (
                <p className="mt-1.5 text-xs leading-relaxed text-slate-700 sm:text-sm">
                  The server encountered an error while fetching or validating
                  the live PMHS Master Google Sheet tabs (
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-navy">
                    Clubs_Directory
                  </code>
                  ,{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-navy">
                    Academic_Pathways
                  </code>
                  , or{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-navy">
                    Student_Action_Guides
                  </code>
                  ). Verify that the spreadsheet is shared as{" "}
                  <strong className="font-semibold text-navy">
                    Anyone with the link: Viewer
                  </strong>{" "}
                  and that no tab names or row-1 column headers were renamed.
                </p>
              ) : (
                <p className="mt-1.5 font-mono text-xs leading-relaxed text-slate-800 break-words">
                  {rawMessage}
                </p>
              )}

              {error?.digest && (
                <p className="mt-2 font-mono text-[11px] text-slate-500">
                  Error Digest: {error.digest}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:text-sm"
              >
                <RefreshCw
                  className="h-4 w-4 text-gold"
                  aria-hidden="true"
                />
                <span>Retry Live Sync</span>
              </button>

              <Link
                href="/verify"
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-navy/20 bg-surface px-4 py-2.5 text-xs font-bold text-navy transition hover:border-gold hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:text-sm"
              >
                <Database
                  className="h-4 w-4 text-gold"
                  aria-hidden="true"
                />
                <span>Open /verify Diagnostics</span>
              </Link>

              <a
                href="https://mhs.pittsfordschools.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-gold hover:text-navy sm:text-sm"
              >
                <span>Official MHS Website</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500">
        PMHS Student &amp; Family Navigation Hub · Strict Runtime Schema
        Protection
      </footer>
    </div>
  );
}
