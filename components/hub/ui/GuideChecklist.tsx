"use client";

import { motion } from "framer-motion";
import { Check, CheckCircle2, RotateCcw } from "lucide-react";
import { parseGuideSteps } from "@/lib/format";
import { useGuideProgress } from "@/lib/guide-progress";
import type { StudentActionGuideRecord } from "@/types/hub";

interface GuideChecklistProps {
  guide: StudentActionGuideRecord;
  idPrefix?: string;
}

export function GuideChecklist({
  guide,
  idPrefix = "guide",
}: GuideChecklistProps) {
  const { steps, isNumbered } = parseGuideSteps(guide.Step_By_Step_Process);
  const { getCompletedSteps, toggleStep, resetGuide, isHydrated } =
    useGuideProgress();

  const totalSteps = steps.length;
  if (totalSteps === 0) {
    return null;
  }

  const completedIndices = getCompletedSteps(guide.Guide_ID, totalSteps);
  const completedCount = completedIndices.length;
  const isAllCompleted = completedCount === totalSteps && totalSteps > 0;
  const percent =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const isSingleParagraphGuide = !isNumbered && totalSteps === 1;

  return (
    <div className="space-y-3">
      {/* Progress Header & Status Strip */}
      <div className="rounded-xl border border-slate-200/90 bg-surface p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2" aria-live="polite">
            <span className="text-xs font-extrabold text-navy">
              {completedCount} of {totalSteps}{" "}
              {totalSteps === 1 ? "step" : "steps"} completed
            </span>

            {isAllCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800">
                <CheckCircle2
                  className="h-3.5 w-3.5 text-emerald-600"
                  aria-hidden="true"
                />
                <span>Completed ✓</span>
              </span>
            )}
          </div>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => resetGuide(guide.Guide_ID)}
              className="inline-flex min-h-[28px] items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-gold hover:bg-gold-light hover:text-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Smooth Animated Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-label={`Checklist progress for ${guide.Task_Title}`}
          className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200/90"
        >
          <motion.div
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`h-full rounded-full transition-colors ${
              isAllCompleted ? "bg-emerald-600" : "bg-navy"
            }`}
          />
        </div>
      </div>

      {/* Single-Paragraph Guide Variant (e.g. ACT-005) */}
      {isSingleParagraphGuide ? (
        <div className="space-y-2.5 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-navy">
            How It Works
          </p>
          <p
            className={`text-xs leading-relaxed sm:text-sm ${
              isAllCompleted ? "text-slate-500" : "text-slate-700"
            }`}
          >
            {steps[0]}
          </p>

          <label
            htmlFor={`${idPrefix}-${guide.Guide_ID}-step-0`}
            className={`mt-2 flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition select-none focus-within:ring-2 focus-within:ring-gold ${
              isAllCompleted
                ? "border-emerald-300 bg-emerald-50/80 text-emerald-900"
                : "border-navy/15 bg-surface text-navy hover:border-gold hover:bg-gold-light/60"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <input
                id={`${idPrefix}-${guide.Guide_ID}-step-0`}
                type="checkbox"
                checked={isAllCompleted}
                disabled={!isHydrated}
                onChange={() => toggleStep(guide.Guide_ID, 0, totalSteps)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                  isAllCompleted
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-navy/35 bg-white text-transparent"
                }`}
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </span>
              <span>
                {isAllCompleted
                  ? "Reviewed & marked as done"
                  : "Mark as done"}
              </span>
            </span>

            <span className="rounded-md bg-white/80 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600">
              {isAllCompleted ? "1 / 1 ✓" : "0 / 1"}
            </span>
          </label>
        </div>
      ) : (
        /* Multi-Step Interactive Checklist */
        <ol className="space-y-2">
          {steps.map((stepText, idx) => {
            const isChecked = completedIndices.includes(idx);
            const inputId = `${idPrefix}-${guide.Guide_ID}-step-${idx}`;

            return (
              <li key={idx}>
                <label
                  htmlFor={inputId}
                  className={`group flex min-h-[48px] cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-left transition select-none focus-within:ring-2 focus-within:ring-gold ${
                    isChecked
                      ? "border-emerald-200 bg-emerald-50/50 text-slate-500"
                      : "border-slate-200/90 bg-white text-slate-800 hover:border-gold hover:bg-surface/60"
                  }`}
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={isChecked}
                    disabled={!isHydrated}
                    onChange={() =>
                      toggleStep(guide.Guide_ID, idx, totalSteps)
                    }
                    className="sr-only"
                  />

                  {/* Custom Checkbox Visual */}
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                      isChecked
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-navy/30 bg-surface text-transparent group-hover:border-navy"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider ${
                          isChecked
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-navy text-gold"
                        }`}
                      >
                        Step {idx + 1}
                      </span>
                      {isChecked && (
                        <span className="text-[11px] font-bold text-emerald-700">
                          Done
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-1.5 text-xs leading-relaxed sm:text-sm ${
                        isChecked
                          ? "line-through decoration-slate-400/80 text-slate-500"
                          : "text-slate-700"
                      }`}
                    >
                      {stepText}
                    </p>
                  </div>
                </label>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
