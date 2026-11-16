import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CategoryPillProps {
  children: ReactNode;
  tone?: "navy" | "gold" | "neutral";
  className?: string;
}

export function CategoryPill({
  children,
  tone = "navy",
  className,
}: CategoryPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight",
        tone === "navy" && "border-navy/15 bg-navy/5 text-navy",
        tone === "gold" && "border-gold/50 bg-gold-light text-navy-dark",
        tone === "neutral" && "border-slate-200 bg-surface text-slate-700",
        className,
      )}
    >
      {children}
    </span >
  );
}
