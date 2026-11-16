import type {
  AcademicPathwayRecord,
  ClubRecord,
  StudentActionGuideRecord,
} from "@/types/hub";

export type HubView = "overview" | "clubs" | "pathways" | "guides";

export const HUB_VIEWS: readonly HubView[] = [
  "overview",
  "clubs",
  "pathways",
  "guides",
] as const;

export type HubRecordRef =
  | { kind: "club"; record: ClubRecord }
  | { kind: "pathway"; record: AcademicPathwayRecord }
  | { kind: "guide"; record: StudentActionGuideRecord };

export type HubRecordKind = HubRecordRef["kind"];

export const KIND_TO_VIEW: Record<HubRecordKind, HubView> = {
  club: "clubs",
  pathway: "pathways",
  guide: "guides",
};

export const KIND_LABEL: Record<HubRecordKind, string> = {
  club: "Club & Activity",
  pathway: "Academic Pathway",
  guide: "Student Action Guide",
};

export const KIND_GROUP_HEADING: Record<HubRecordKind, string> = {
  guide: "Student Action Guides",
  pathway: "Academic Pathways",
  club: "Clubs & Activities",
};

export function isHubView(value: string): value is HubView {
  return (HUB_VIEWS as readonly string[]).includes(value);
}

export function getRecordId(ref: HubRecordRef): string {
  switch (ref.kind) {
    case "club":
      return ref.record.Club_ID;
    case "pathway":
      return ref.record.Pathway_ID;
    case "guide":
      return ref.record.Guide_ID;
  }
}

export function getRecordTitle(ref: HubRecordRef): string {
  switch (ref.kind) {
    case "club":
      return ref.record.Club_Name;
    case "pathway":
      return ref.record.Program_Or_Course_Title;
    case "guide":
      return ref.record.Task_Title;
  }
}

export function getRecordCategory(ref: HubRecordRef): string {
  switch (ref.kind) {
    case "club":
      return ref.record.Category;
    case "pathway":
      return ref.record.Track_Type;
    case "guide":
      return ref.record.Category;
  }
}

export function getRecordUrl(ref: HubRecordRef): string {
  switch (ref.kind) {
    case "club":
      return ref.record.Official_Source_URL;
    case "pathway":
      return ref.record.Official_Source_URL;
    case "guide":
      return ref.record.Official_URL;
  }
}

export function getRecordSubtitle(ref: HubRecordRef): string {
  switch (ref.kind) {
    case "club":
      return `${ref.record.Advisor_Name} · ${ref.record.Location_Room}`;
    case "pathway":
      return `${ref.record.Department} · ${ref.record.Grade_Levels}`;
    case "guide":
      return `${ref.record.Office_Or_Room} · ${ref.record.Target_Audience}`;
  }
}

export interface ParsedHubHash {
  view: HubView | null;
  recordId: string | null;
}

export function parseHubHash(rawHash: string): ParsedHubHash {
  const cleaned = rawHash.replace(/^#/, "").trim();
  if (!cleaned) {
    return { view: null, recordId: null };
  }
  const [viewPart, queryPart] = cleaned.split("?");
  const normalizedView = viewPart?.trim().toLowerCase() ?? "";
  const view = isHubView(normalizedView) ? normalizedView : null;
  const params = new URLSearchParams(queryPart ?? "");
  const recordId = params.get("id")?.trim() || null;
  return { view, recordId };
}

export function formatRecordHash(ref: HubRecordRef): string {
  const view = KIND_TO_VIEW[ref.kind];
  const id = getRecordId(ref);
  return `#${view}?id=${encodeURIComponent(id)}`;
}

export function findRecordById(
  data: {
    clubs: readonly ClubRecord[];
    pathways: readonly AcademicPathwayRecord[];
    guides: readonly StudentActionGuideRecord[];
  },
  id: string,
): HubRecordRef | null {
  const normalized = id.trim().toUpperCase();
  if (!normalized) return null;

  const club = data.clubs.find(
    (c) => c.Club_ID.trim().toUpperCase() === normalized,
  );
  if (club) return { kind: "club", record: club };

  const pathway = data.pathways.find(
    (p) => p.Pathway_ID.trim().toUpperCase() === normalized,
  );
  if (pathway) return { kind: "pathway", record: pathway };

  const guide = data.guides.find(
    (g) => g.Guide_ID.trim().toUpperCase() === normalized,
  );
  if (guide) return { kind: "guide", record: guide };

  return null;
}
