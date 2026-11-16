"use client";

import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import type { ProgressionStep } from "@/lib/format";

interface CourseProgressionFlowchartProps {
  steps: readonly ProgressionStep[];
  compact?: boolean;
}

export function CourseProgressionFlowchart({
  steps,
  compact = false,
}: CourseProgressionFlowchartProps) {
  if (steps.length < 2) {
    return null;
  }

  return (
    <div
      className={
        compact
          ? "space-y-2.5"
          : "grid grid-cols-1 gap-3 lg:grid-cols-4 lg:gap-4"
      }
      role="list"
      aria-label="Course progression sequence"
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div
            key={`${step.stepNumber}-${step.stageLabel ?? step.courseText}`}
            role="listitem"
            className="relative flex flex-col"
          >
            <div className="flex h-full flex-col justify-between rounded-xl border border-navy/15 bg-white p-3.5 shadow-2xs transition group-hover:border-gold/60">
              <div>
                {/* Stage Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gold">
                    <span className="font-mono text-[10px] text-white/80">
                      0{step.stepNumber}
                    </span>
                    <span>{step.stageLabel ?? `Stage ${step.stepNumber}`}</span>
                  </span>

                  {step.hasAcceleratedOption && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-gold/60 bg-gold-light px-2 py-0.5 text-[10px] font-bold text-navy-dark">
                      <Sparkles
                        className="h-2.5 w-2.5 text-navy"
                        aria-hidden="true"
                      />
                      <span>AP / Accelerated</span>
                    </span>
                  )}
                </div>

                {/* Course Options Inside Stage Node */}
                <div className="mt-3 space-y-1.5">
                  {step.options.map((option, optIdx) => {
                    const isApOption = /\b(AP|Honors|Accelerated)\b/i.test(
                      option,
                    );
                    return (
                      <div key={option}>
                        {optIdx > 0 && (
                          <div className="my-1 flex items-center gap-2">
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                              or
                            </span>
                            <div className="h-px flex-1 bg-slate-200" />
                          </div>
                        )}
                        <div
                          className={
                            isApOption
                              ? "rounded-lg border border-gold/60 bg-gold-light/70 px-2.5 py-1.5 text-xs font-extrabold text-navy-dark"
                              : "rounded-lg border border-slate-200/90 bg-surface px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                          }
                        >
                          {option}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Connector Arrow to Next Stage */}
            {!isLast && (
              <>
                {/* Mobile / Compact Vertical Connector */}
                <div
                  aria-hidden="true"
                  className={
                    compact
                      ? "my-1 flex items-center justify-center text-navy"
                      : "my-1 flex items-center justify-center text-navy lg:hidden"
                  }
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gold/50 bg-gold-light text-navy-dark">
                    <ArrowDown className="h-3 w-3" />
                  </span>
                </div>

                {/* Desktop Horizontal Connector */}
                {!compact && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 -right-3.5 z-10 hidden -translate-y-1/2 items-center justify-center lg:flex"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gold bg-navy text-gold shadow-xs">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
