# Viking Hub — Project Guardrails

## 1. Live Google Sheets Data Integrity (`lib/sheets.ts` & `types/hub.ts`)
- **Preserve strict runtime column validation** in `lib/sheets.ts` against the compile-time exhaustive column lists (`CLUB_COLUMNS`, `PATHWAY_COLUMNS`, `GUIDE_COLUMNS`) in `types/hub.ts`. Never weaken or bypass the header-mismatch validation, as Google's `gviz` CSV endpoint silently returns HTTP 200 with the first sheet tab when a requested tab name is missing or renamed.
- **Zero mock data or silent fallbacks:** Never introduce dummy arrays, placeholder records, static fallback JSON files, or silent `try/catch` blocks that return empty arrays or fake data when a sheet fetch or parse fails. Always surface failures loudly via `SheetFetchError` with descriptive context.
- Keep `types/hub.ts` interfaces and `*_COLUMNS` arrays strictly aligned with the live Google Sheet column headers.

## 2. Tailwind Brand Tokens (`app/globals.css`)
- **Always use the `@theme` brand tokens** defined in `app/globals.css` instead of raw hex arbitrary values (`#002855`, `#003875`, `#001a38`, `#EAAA00`, `#FDF6E2`, `#F8FAFC`):
  - Navy: `bg-navy`, `text-navy`, `border-navy` (plus `navy-light`, `navy-dark`)
  - Gold: `text-gold`, `bg-gold`, `border-gold` (plus `gold-light`)
  - Surface: `bg-surface`
- Apply opacity modifiers directly to theme tokens (e.g., `bg-navy/10`, `border-gold/40`, `bg-navy-dark/80`) rather than hardcoded hex colors.
- Apply this convention to all upcoming Phase 2–4 components and `app/layout.tsx` when modified in Phase 2; leave existing Phase 1 preview components (`StatusBanner`, `MetricCard`, `DataPreviewTable`) untouched unless explicitly asked to refactor them.
