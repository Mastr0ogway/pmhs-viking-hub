import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KbdProps {
  children: ReactNode;
  variant?: "light" | "dark";
  className?: string;
}

export function Kbd({ children, variant = "light", className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-tight select-none",
        variant === "light"
          ? "border-slate-200 bg-surface text-navy shadow-2xs"
          : "border-gold/40 bg-navy-dark/80 text-gold",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
