import type { ReactNode } from "react";
import { findHighlightRanges } from "@/lib/search";

interface HighlightedTextProps {
  text: string;
  terms: readonly string[];
  className?: string;
}

export function HighlightedText({
  text,
  terms,
  className,
}: HighlightedTextProps) {
  const ranges = findHighlightRanges(text, terms);
  if (ranges.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const parts: ReactNode[] = [];
  let cursor = 0;

  for (let i = 0; i < ranges.length; i++) {
    const { start, end } = ranges[i];
    if (start > cursor) {
      parts.push(
        <span key={`t-${i}`}>{text.slice(cursor, start)}</span>,
      );
    }
    parts.push(
      <mark
        key={`m-${i}`}
        className="rounded-xs bg-gold/35 px-0.5 font-semibold text-navy-dark"
      >
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  }

  if (cursor < text.length) {
    parts.push(<span key="t-end">{text.slice(cursor)}</span>);
  }

  return <span className={className}>{parts}</span>;
}
