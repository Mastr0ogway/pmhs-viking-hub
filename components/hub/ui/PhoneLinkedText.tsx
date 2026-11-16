"use client";

import { parsePhoneSegments } from "@/lib/format";

interface PhoneLinkedTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text containing US phone numbers with clickable `tel:` links.
 * IMPORTANT: Only use inside non-button containers (such as `<article>` cards or the Drawer)
 * to avoid nested `<a href="tel:...">` inside `<button>`.
 */
export function PhoneLinkedText({ text, className }: PhoneLinkedTextProps) {
  const segments = parsePhoneSegments(text);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "phone" && segment.href) {
          return (
            <a
              key={`${segment.href}-${index}`}
              href={segment.href}
              className="rounded-xs font-bold text-navy underline decoration-gold/80 underline-offset-2 transition hover:bg-gold-light hover:text-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {segment.value}
            </a>
          );
        }
        return <span key={index}>{segment.value}</span>;
      })}
    </span>
  );
}
