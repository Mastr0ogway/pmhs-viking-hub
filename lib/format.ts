export interface CategoryTally {
  name: string;
  count: number;
}

export interface ParsedDescription {
  cleanText: string;
  editorialNotes: string[];
}

const EDITORIAL_NOTE_REGEX =
  /\s*\((?:Note:|EDGE CASE FLAG:|Currently shows\b|Listed as\b)[^)]*\)\.?\s*/gi;

/**
 * Strips internal CMS audit parentheticals such as "(Note: Listed as [enter description here]...)"
 * or "(EDGE CASE FLAG: ...)" from student-facing card descriptions while preserving them
 * for the muted "Record details" drawer footer.
 */
export function parseStudentDescription(rawText: string): ParsedDescription {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { cleanText: "", editorialNotes: [] };
  }

  const editorialNotes: string[] = [];
  const cleanText = trimmed
    .replace(EDITORIAL_NOTE_REGEX, (match) => {
      const cleanedMatch = match
        .trim()
        .replace(/^\(/, "")
        .replace(/\)\.?$/, "")
        .trim();
      if (cleanedMatch) {
        editorialNotes.push(cleanedMatch);
      }
      return " ";
    })
    .replace(/\s{2,}/g, " ")
    .trim();

  return {
    cleanText: cleanText || trimmed,
    editorialNotes,
  };
}

export function cleanStudentDescription(rawText: string): string {
  return parseStudentDescription(rawText).cleanText;
}

export const cleanDescription = cleanStudentDescription;

export interface ProgressionStep {
  stepNumber: number;
  stageLabel: string | null;
  courseText: string;
  options: string[];
  hasAcceleratedOption: boolean;
}

/**
 * Splits "->" delimited course progression strings into structured flowchart nodes.
 * Extracts optional stage labels before ":" (e.g. "Grade 9") and splits " or " course options.
 */
export function parseProgressionSteps(rawText: string): ProgressionStep[] {
  const trimmed = rawText.trim();
  if (!trimmed || !trimmed.includes("->")) {
    return [];
  }

  const segments = trimmed
    .split(/\s*->\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length < 2) {
    return [];
  }

  return segments.map((segment, idx) => {
    const colonIndex = segment.indexOf(":");
    let stageLabel: string | null = null;
    let courseText = segment;

    if (colonIndex > 0 && colonIndex < 24) {
      stageLabel = segment.slice(0, colonIndex).trim();
      courseText = segment.slice(colonIndex + 1).trim();
    }

    const options = courseText
      .split(/\s+or\s+/i)
      .map((opt) => opt.trim())
      .filter(Boolean);

    const hasAcceleratedOption = /\b(AP|Honors|Accelerated)\b/i.test(courseText);

    return {
      stepNumber: idx + 1,
      stageLabel,
      courseText,
      options: options.length > 0 ? options : [courseText],
      hasAcceleratedOption,
    };
  });
}

export interface ParsedProgramDetails {
  leadSummary: string;
  listHeading: string | null;
  items: string[];
}

/**
 * Detects "Programs include: ..." or "Electives include ..." lists in pathway descriptions
 * and splits comma-separated items (ignoring commas inside parentheses and stripping leading "and ").
 */
export function parseStructuredProgramList(
  rawText: string,
): ParsedProgramDetails {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { leadSummary: "", listHeading: null, items: [] };
  }

  const match = trimmed.match(
    /^(.*?)(?:^|\.\s+)(Programs|Electives|Courses)\s+include:?\s+(.+?)\.?$/i,
  );

  if (!match) {
    return { leadSummary: trimmed, listHeading: null, items: [] };
  }

  const leadPrefix = match[1]?.trim() ?? "";
  const leadSummary = leadPrefix
    ? leadPrefix.endsWith(".")
      ? leadPrefix
      : `${leadPrefix}.`
    : "";
  const kindWord = match[2] ?? "Programs";
  const rawList = match[3]?.trim() ?? "";

  const items: string[] = [];
  let current = "";
  let depth = 0;

  for (const ch of rawList) {
    if (ch === "(") depth += 1;
    if (ch === ")" && depth > 0) depth -= 1;
    if (ch === "," && depth === 0) {
      items.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) {
    items.push(current.trim());
  }

  const cleanedItems = items
    .map((item) => item.replace(/^and\s+/i, "").replace(/\.$/, "").trim())
    .filter(Boolean);

  if (cleanedItems.length < 2) {
    return { leadSummary: trimmed, listHeading: null, items: [] };
  }

  return {
    leadSummary,
    listHeading: `${kindWord} Included (${cleanedItems.length})`,
    items: cleanedItems,
  };
}

/**
 * Deterministic Eastern Time (America/New_York) formatter so Server and Client
 * components render identical strings without hydration mismatches.
 */
export function formatEasternTimestamp(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    return isoTimestamp;
  }
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Splits "Step 1: ... Step 2: ..." strings into discrete step items.
 * Falls back to a single-element array with the full text when not numbered.
 */
export function splitSteps(rawProcess: string): string[] {
  const trimmed = rawProcess.trim();
  if (!trimmed) return [];

  const matches = Array.from(trimmed.matchAll(/Step\s+\d+\s*:\s*/gi));
  if (matches.length === 0) {
    return [trimmed];
  }

  const steps: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const start = (currentMatch.index ?? 0) + currentMatch[0].length;
    const end =
      i + 1 < matches.length ? (matches[i + 1].index ?? trimmed.length) : trimmed.length;
    const stepBody = trimmed.slice(start, end).trim();
    if (stepBody) {
      steps.push(stepBody);
    }
  }

  return steps.length > 0 ? steps : [trimmed];
}

export interface ParsedGuideSteps {
  steps: string[];
  isNumbered: boolean;
}

/**
 * Parses a guide's `Step_By_Step_Process` into discrete step items and indicates
 * whether the source text uses numbered "Step N:" markers (vs. a single-paragraph guide like ACT-005).
 */
export function parseGuideSteps(rawProcess: string): ParsedGuideSteps {
  const trimmed = rawProcess.trim();
  if (!trimmed) {
    return { steps: [], isNumbered: false };
  }

  const hasNumberedMarkers = /Step\s+\d+\s*:\s*/i.test(trimmed);
  const steps = splitSteps(trimmed);
  return {
    steps,
    isNumbered: hasNumberedMarkers && steps.length > 0,
  };
}

export interface PhoneTextSegment {
  type: "text" | "phone";
  value: string;
  href?: string;
}

const US_PHONE_REGEX = /(?:\(\d{3}\)\s*|\b\d{3}-)\d{3}-\d{4}\b/g;

/**
 * Splits text containing US phone numbers (e.g. "585-267-1660" or "(585) 267-1660")
 * into plain text and clickable `tel:` segments, while keeping numbers preceded by "Fax"
 * as plain text so users do not dial a fax line.
 */
export function parsePhoneSegments(rawText: string): PhoneTextSegment[] {
  if (!rawText) {
    return [];
  }

  const segments: PhoneTextSegment[] = [];
  let lastIndex = 0;

  for (const match of rawText.matchAll(US_PHONE_REGEX)) {
    const idx = match.index ?? 0;
    const matchedText = match[0];
    const prefixContext = rawText.slice(Math.max(0, idx - 10), idx);
    const isFax = /fax\s*:?\s*$/i.test(prefixContext);

    if (idx > lastIndex) {
      segments.push({
        type: "text",
        value: rawText.slice(lastIndex, idx),
      });
    }

    if (isFax) {
      segments.push({
        type: "text",
        value: matchedText,
      });
    } else {
      const digits = matchedText.replace(/\D/g, "");
      segments.push({
        type: "phone",
        value: matchedText,
        href: `tel:${digits}`,
      });
    }

    lastIndex = idx + matchedText.length;
  }

  if (lastIndex < rawText.length) {
    segments.push({
      type: "text",
      value: rawText.slice(lastIndex),
    });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: rawText }];
}

export function tallyByField<T>(
  records: readonly T[],
  selector: (item: T) => string,
): CategoryTally[] {
  const counts = new Map<string, number>();
  for (const item of records) {
    const key = selector(item).trim() || "Uncategorized";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
