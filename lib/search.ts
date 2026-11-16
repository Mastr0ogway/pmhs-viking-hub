import type { HubDataPayload } from "@/types/hub";
import { cleanStudentDescription } from "@/lib/format";
import {
  getRecordCategory,
  getRecordId,
  getRecordSubtitle,
  getRecordTitle,
  KIND_GROUP_HEADING,
  type HubRecordKind,
  type HubRecordRef,
} from "@/lib/hub-records";

export interface HighlightRange {
  start: number;
  end: number;
}

export interface SearchResultItem {
  id: string;
  ref: HubRecordRef;
  title: string;
  category: string;
  subtitle: string;
  snippet: string;
  snippetFieldLabel: string;
  score: number;
  matchedTerms: string[];
}

export interface SearchResultGroup {
  kind: HubRecordKind;
  heading: string;
  items: SearchResultItem[];
}

interface IndexedField {
  label: string;
  rawText: string;
  normText: string;
  words: string[];
  weight: number;
  isTitle?: boolean;
}

interface IndexedDocument {
  id: string;
  ref: HubRecordRef;
  title: string;
  category: string;
  subtitle: string;
  defaultSnippet: string;
  fields: IndexedField[];
}

export interface SearchIndex {
  documents: IndexedDocument[];
}

export const SEARCH_ALIASES: ReadonlyArray<{
  terms: readonly string[];
  expandsTo: readonly string[];
}> = [
  {
    terms: [
      "working papers",
      "working paper",
      "work papers",
      "work permit",
      "job permit",
      "employment",
      "job",
    ],
    expandsTo: ["work permit", "working papers", "employment certificate"],
  },
  {
    terms: ["boces", "cte", "vocational", "trade school", "career center", "emcc"],
    expandsTo: ["emcc", "eastern monroe career center", "boces", "career and technical"],
  },
  {
    terms: ["nhs", "honor society"],
    expandsTo: ["national honor society", "nhs", "community service"],
  },
  {
    terms: ["volunteering", "volunteer", "service hours", "community service"],
    expandsTo: ["community service", "volunteer", "national honor society"],
  },
  {
    terms: [
      "accelerate",
      "accelerated",
      "skip ahead",
      "instructional challenge",
      "double accelerated",
    ],
    expandsTo: ["acceleration", "double accelerated", "instructional challenge"],
  },
  {
    terms: ["transcript", "transcripts", "parchment"],
    expandsTo: ["transcripts", "parchment", "naviance", "common app"],
  },
  {
    terms: ["college apps", "college application", "common app", "naviance"],
    expandsTo: ["common app", "naviance", "transcripts"],
  },
  {
    terms: ["mental health", "stress", "anxiety", "therapy", "social worker", "wellness"],
    expandsTo: ["mental health", "counseling", "wellness", "social worker", "sources of strength"],
  },
  {
    terms: ["mun", "model un"],
    expandsTo: ["model un", "model united nations"],
  },
  {
    terms: ["coding", "programming", "cs", "ai"],
    expandsTo: ["computer science", "coding"],
  },
  {
    terms: ["lgbtq", "pride", "gsa"],
    expandsTo: ["gsa", "gender and sexuality"],
  },
  {
    terms: ["dnd", "d and d", "d&d"],
    expandsTo: ["dungeons and dragons"],
  },
  {
    terms: ["ski", "skiing", "snowboarding"],
    expandsTo: ["snowsports", "ski"],
  },
  {
    terms: ["summer", "sei"],
    expandsTo: ["summer enrichment", "sei"],
  },
];

export const QUICK_SEARCHES = [
  { label: "Working Papers", query: "working papers" },
  { label: "Course Acceleration", query: "course acceleration" },
  { label: "Community Service (Room 252A)", query: "community service" },
  { label: "Model UN", query: "model un" },
  { label: "EMCC / BOCES", query: "boces" },
  { label: "College Transcripts", query: "transcripts" },
] as const;

const SHORT_WHOLE_WORD_TERMS = new Set<string>([
  "ap",
  "un",
  "cs",
  "ai",
  "id",
  "pe",
]);

export function normalizeSearchText(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function makeField(
  label: string,
  rawText: string,
  weight: number,
  isTitle = false,
): IndexedField {
  const normText = normalizeSearchText(rawText);
  const words = normText ? normText.split(" ") : [];
  return { label, rawText: rawText.trim(), normText, words, weight, isTitle };
}

export function buildSearchIndex(
  data: Pick<HubDataPayload, "clubs" | "pathways" | "guides">,
): SearchIndex {
  const documents: IndexedDocument[] = [];

  for (const guide of data.guides) {
    const ref: HubRecordRef = { kind: "guide", record: guide };
    documents.push({
      id: getRecordId(ref),
      ref,
      title: getRecordTitle(ref),
      category: getRecordCategory(ref),
      subtitle: getRecordSubtitle(ref),
      defaultSnippet: guide.Step_By_Step_Process,
      fields: [
        makeField("Title", guide.Task_Title, 10, true),
        makeField("Category", guide.Category, 5),
        makeField("Office / Room", guide.Office_Or_Room, 4),
        makeField("Staff Contact", guide.Staff_Contact, 4),
        makeField("Audience", guide.Target_Audience, 3),
        makeField("Deadlines & Rules", guide.Key_Deadlines_Or_Rules, 2),
        makeField("Steps", guide.Step_By_Step_Process, 2),
      ],
    });
  }

  for (const pathway of data.pathways) {
    const ref: HubRecordRef = { kind: "pathway", record: pathway };
    documents.push({
      id: getRecordId(ref),
      ref,
      title: getRecordTitle(ref),
      category: getRecordCategory(ref),
      subtitle: getRecordSubtitle(ref),
      defaultSnippet: pathway.Description_And_Details,
      fields: [
        makeField("Title", pathway.Program_Or_Course_Title, 10, true),
        makeField("Track", pathway.Track_Type, 5),
        makeField("Department", pathway.Department, 5),
        makeField("Grades", pathway.Grade_Levels, 3),
        makeField("Prerequisites", pathway.Prerequisites_And_Eligibility, 2),
        makeField("Details", pathway.Description_And_Details, 1),
      ],
    });
  }

  for (const club of data.clubs) {
    const ref: HubRecordRef = { kind: "club", record: club };
    const cleanDesc = cleanStudentDescription(club.Description);
    documents.push({
      id: getRecordId(ref),
      ref,
      title: getRecordTitle(ref),
      category: getRecordCategory(ref),
      subtitle: getRecordSubtitle(ref),
      defaultSnippet: cleanDesc,
      fields: [
        makeField("Club Name", club.Club_Name, 10, true),
        makeField("Category", club.Category, 5),
        makeField("Advisor", club.Advisor_Name, 4),
        makeField("Location", club.Location_Room, 3),
        makeField("Schedule", club.Meeting_Schedule, 2),
        makeField("Description", cleanDesc, 1),
      ],
    });
  }

  return { documents };
}

interface QueryTermGroup {
  variants: string[];
}

function buildQueryGroups(rawQuery: string): QueryTermGroup[] {
  let remaining = normalizeSearchText(rawQuery);
  if (!remaining) return [];

  const groups: QueryTermGroup[] = [];

  // 1. Extract known multi-word alias phrases first (longest first)
  const phraseEntries: Array<{ phrase: string; expandsTo: readonly string[] }> = [];
  for (const entry of SEARCH_ALIASES) {
    for (const term of entry.terms) {
      const normTerm = normalizeSearchText(term);
      if (normTerm.includes(" ")) {
        phraseEntries.push({ phrase: normTerm, expandsTo: entry.expandsTo });
      }
    }
  }
  phraseEntries.sort((a, b) => b.phrase.length - a.phrase.length);

  for (const { phrase, expandsTo } of phraseEntries) {
    const padded = ` ${remaining} `;
    const target = ` ${phrase} `;
    if (padded.includes(target)) {
      const variantSet = new Set<string>([
        phrase,
        ...expandsTo.map((e) => normalizeSearchText(e)),
      ]);
      groups.push({ variants: Array.from(variantSet).filter(Boolean) });
      remaining = padded.replace(target, " ").trim().replace(/\s+/g, " ");
    }
  }

  // 2. Split remaining words into individual token groups
  const tokens = remaining ? remaining.split(" ").filter(Boolean) : [];
  for (const token of tokens) {
    if (token === "and" || token === "or" || token === "the") {
      continue;
    }
    const variantSet = new Set<string>([token]);
    for (const entry of SEARCH_ALIASES) {
      const normalizedTerms = entry.terms.map((t) => normalizeSearchText(t));
      if (normalizedTerms.includes(token)) {
        for (const expanded of entry.expandsTo) {
          variantSet.add(normalizeSearchText(expanded));
        }
      }
    }
    groups.push({ variants: Array.from(variantSet).filter(Boolean) });
  }

  return groups;
}

function scoreVariantInField(
  variant: string,
  field: IndexedField,
): number {
  if (!variant || !field.normText) return 0;

  const isShortWholeWord =
    variant.length <= 2 || SHORT_WHOLE_WORD_TERMS.has(variant);

  if (variant.includes(" ")) {
    // Multi-word phrase variant
    const paddedField = ` ${field.normText} `;
    if (paddedField.includes(` ${variant} `)) {
      return field.weight * (field.normText === variant ? 2.2 : 1.6);
    }
    if (field.normText.includes(variant)) {
      return field.weight * 1.25;
    }
    return 0;
  }

  if (isShortWholeWord) {
    if (field.words.includes(variant)) {
      return field.weight * 1.6;
    }
    return 0;
  }

  // Exact word match
  if (field.words.includes(variant)) {
    return field.weight * (field.normText === variant ? 2.0 : 1.5);
  }

  // Word-prefix match
  if (field.words.some((w) => w.startsWith(variant))) {
    return field.weight * 1.25;
  }

  // Substring match for 4+ char terms
  if (variant.length >= 4 && field.normText.includes(variant)) {
    return field.weight * 1.0;
  }

  return 0;
}

function buildSnippet(rawText: string, matchedTerms: string[]): string {
  const clean = rawText.trim();
  if (!clean) return "";

  const lower = clean.toLowerCase();
  let earliestIndex = -1;
  for (const term of matchedTerms) {
    const idx = lower.indexOf(term.toLowerCase());
    if (idx !== -1 && (earliestIndex === -1 || idx < earliestIndex)) {
      earliestIndex = idx;
    }
  }

  if (earliestIndex <= 28 || clean.length <= 120) {
    return clean.length > 130 ? `${clean.slice(0, 127).trimEnd()}…` : clean;
  }

  const start = Math.max(0, earliestIndex - 32);
  const end = Math.min(clean.length, start + 125);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < clean.length ? "…" : "";
  return `${prefix}${clean.slice(start, end).trim()}${suffix}`;
}

export function searchHub(
  index: SearchIndex,
  rawQuery: string,
): SearchResultGroup[] {
  const groups = buildQueryGroups(rawQuery);
  if (groups.length === 0) return [];

  const matchedItems: SearchResultItem[] = [];

  for (const doc of index.documents) {
    let totalScore = 0;
    let allGroupsMatched = true;
    const matchedTermsSet = new Set<string>();
    let bestNonTitleField: IndexedField | null = null;
    let bestNonTitleScore = 0;

    for (const group of groups) {
      let bestGroupScore = 0;
      let bestVariant = "";

      for (const field of doc.fields) {
        for (const variant of group.variants) {
          const score = scoreVariantInField(variant, field);
          if (score > bestGroupScore) {
            bestGroupScore = score;
            bestVariant = variant;
          }
          if (!field.isTitle && score > bestNonTitleScore) {
            bestNonTitleScore = score;
            bestNonTitleField = field;
          }
        }
      }

      if (bestGroupScore === 0) {
        allGroupsMatched = false;
        break;
      }

      totalScore += bestGroupScore;
      if (bestVariant) {
        matchedTermsSet.add(bestVariant);
        for (const part of bestVariant.split(" ")) {
          if (part.length >= 2) matchedTermsSet.add(part);
        }
      }
    }

    if (!allGroupsMatched) continue;

    const matchedTerms = Array.from(matchedTermsSet);
    const snippetSource = bestNonTitleField?.rawText || doc.defaultSnippet;
    const snippetFieldLabel = bestNonTitleField?.label || "Summary";

    matchedItems.push({
      id: doc.id,
      ref: doc.ref,
      title: doc.title,
      category: doc.category,
      subtitle: doc.subtitle,
      snippet: buildSnippet(snippetSource, matchedTerms),
      snippetFieldLabel,
      score: totalScore,
      matchedTerms,
    });
  }

  const sectionOrder: readonly HubRecordKind[] = ["guide", "pathway", "club"];
  const grouped: SearchResultGroup[] = [];

  for (const kind of sectionOrder) {
    const items = matchedItems
      .filter((item) => item.ref.kind === kind)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

    if (items.length > 0) {
      grouped.push({
        kind,
        heading: KIND_GROUP_HEADING[kind],
        items,
      });
    }
  }

  return grouped;
}

export function findHighlightRanges(
  text: string,
  terms: readonly string[],
): HighlightRange[] {
  if (!text || terms.length === 0) return [];

  const lowerText = text.toLowerCase();
  const rawRanges: HighlightRange[] = [];

  for (const rawTerm of terms) {
    const term = rawTerm.trim().toLowerCase();
    if (!term) continue;

    const requireWholeWord =
      term.length <= 2 || SHORT_WHOLE_WORD_TERMS.has(term);

    let pos = 0;
    while (pos < lowerText.length) {
      const idx = lowerText.indexOf(term, pos);
      if (idx === -1) break;

      const end = idx + term.length;
      if (requireWholeWord) {
        const beforeOk = idx === 0 || !/[a-z0-9]/i.test(lowerText[idx - 1]);
        const afterOk =
          end === lowerText.length || !/[a-z0-9]/i.test(lowerText[end]);
        if (beforeOk && afterOk) {
          rawRanges.push({ start: idx, end });
        }
      } else {
        rawRanges.push({ start: idx, end });
      }

      pos = idx + 1;
    }
  }

  if (rawRanges.length === 0) return [];

  rawRanges.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: HighlightRange[] = [rawRanges[0]];

  for (let i = 1; i < rawRanges.length; i++) {
    const current = rawRanges[i];
    const prev = merged[merged.length - 1];
    if (current.start <= prev.end) {
      prev.end = Math.max(prev.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}
