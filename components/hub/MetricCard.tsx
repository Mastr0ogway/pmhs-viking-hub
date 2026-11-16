import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { SheetTabName } from "@/types/hub";
import { cn } from "@/lib/utils";

export interface CategoryCount {
  name: string;
  count: number;
}

interface MetricCardProps {
  tabName: SheetTabName;
  label: string;
  count: number;
  expectedCount: number;
  columnCount: number;
  categoryHeading: string;
  categories: CategoryCount[];
  secondarySummary?: string;
  icon: ReactNode;
  anchorHref: string;
}

export function MetricCard({
  tabName,
  label,
  count,
  expectedCount,
  columnCount,
  categoryHeading,
  categories,
  secondarySummary,
  icon,
  anchorHref,
}: MetricCardProps) {
  const matchesExpected = count === expectedCount;

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#002855] text-[#EAAA00] shadow-xs">
              {icon}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#002855]">{label}</h2>
              <p className="font-mono text-xs text-slate-500">{tabName}</p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
              matchesExpected
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-amber-300 bg-amber-50 text-amber-900",
            )}
          >
            {matchesExpected ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            )}
            <span>Expected {expectedCount}</span>
          </span>
        </div>

        <div className="mt-5 flex items-baseline gap-3 border-b border-slate-100 pb-5">
          <span className="text-4xl font-extrabold tracking-tight text-[#002855]">
            {count}
          </span>
          <span className="text-sm font-medium text-slate-600">
            live {count === 1 ? "record" : "records"} ·{" "}
            <span className="font-mono text-xs text-slate-500">
              {columnCount} columns mapped
            </span>
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>{categoryHeading}</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-[#002855]">
              {categories.length} unique
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <span
                key={cat.name}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                <span>{cat.name}</span>
                <span className="rounded bg-[#002855]/10 px-1.5 py-0.2 font-mono text-[11px] font-bold text-[#002855]">
                  {cat.count}
                </span>
              </span>
            ))}
          </div>

          {secondarySummary ? (
            <p className="mt-3 text-xs text-slate-500">{secondarySummary}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3">
        <a
          href={anchorHref}
          className="inline-flex items-center text-xs font-semibold text-[#002855] hover:text-[#003875] hover:underline"
        >
          Inspect all {count} parsed rows &darr;
        </a>
      </div>
    </article>
  );
}
