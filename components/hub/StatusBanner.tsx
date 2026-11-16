import { Clock, Database, ExternalLink, ShieldCheck } from "lucide-react";

interface StatusBannerProps {
  fetchedAt: string;
  spreadsheetId: string;
  totalRecords: number;
}

export function StatusBanner({
  fetchedAt,
  spreadsheetId,
  totalRecords,
}: StatusBannerProps) {
  const parsedDate = new Date(fetchedAt);
  const easternTimestamp = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(parsedDate);

  const sheetViewUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  return (
    <header className="relative overflow-hidden rounded-2xl border border-[#002855]/20 bg-[#002855] text-white shadow-lg">
      <div
        aria-hidden="true"
        className="h-1.5 w-full bg-gradient-to-r from-[#EAAA00] via-[#FACC15] to-[#EAAA00]"
      />

      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#EAAA00]/40 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#EAAA00]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span>Connected to Live PMHS Google Sheet CMS</span>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EAAA00]">
                Pittsford Mendon High School · Phase 1 Data Verification
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                PMHS Student &amp; Family Navigation Hub{" "}
                <span className="text-[#EAAA00]">(&ldquo;Viking Hub&rdquo;)</span>
              </h1>
            </div>

            <p className="max-w-3xl text-sm leading-relaxed text-slate-200">
              Live CSV synchronization diagnostics across{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-[#EAAA00]">
                Clubs_Directory
              </code>
              ,{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-[#EAAA00]">
                Academic_Pathways
              </code>
              , and{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-[#EAAA00]">
                Student_Action_Guides
              </code>{" "}
              with strict runtime header verification and zero mock fallbacks.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2.5 rounded-xl border border-white/15 bg-[#001a38]/80 p-4 text-xs text-slate-200 sm:min-w-[21rem]">
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <Clock className="h-3.5 w-3.5 text-[#EAAA00]" />
                Fetched (ET)
              </span>
              <span className="font-mono font-medium text-white">
                {easternTimestamp}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">ISO Timestamp</span>
              <time
                dateTime={fetchedAt}
                className="font-mono text-[11px] text-slate-200"
              >
                {fetchedAt}
              </time>
            </div>

            <div className="my-0.5 border-t border-white/10" />

            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Live Payload
              </span>
              <span className="font-semibold text-white">
                {totalRecords} verified records · ISR 60s
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <Database className="h-3.5 w-3.5 text-[#EAAA00]" />
                Sheet ID
              </span>
              <a
                href={sheetViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={spreadsheetId}
                className="inline-flex items-center gap-1 font-mono text-[11px] text-[#EAAA00] underline-offset-2 hover:underline"
              >
                <span>
                  {spreadsheetId.slice(0, 10)}&hellip;{spreadsheetId.slice(-6)}
                </span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
