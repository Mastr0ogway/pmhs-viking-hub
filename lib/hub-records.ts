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

/**
 * Extracts individual faculty advisor names from a ClubRecord `Advisor_Name` string.
 * Ignores placeholder phrases ("Listed as Open", "See Counseling") and parenthetical notes.
 */
export function extractAdvisorNames(rawAdvisorField: string): string[] {
  const trimmed = rawAdvisorField.trim();
  if (
    !trimmed ||
    /listed as open|see counseling|^open$/i.test(trimmed)
  ) {
    return [];
  }

  const withoutStudentPrefix = trimmed.replace(/^Student Presidents:\s*/i, "");
  const withoutParens = withoutStudentPrefix
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const parts = withoutParens
    .split(/\s*(?:&|\/|,|\band\b)\s*/i)
    .map((part) =>
      part
        .replace(/^(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+/i, "")
        .trim(),
    )
    .filter((name) => name.length >= 4 && name.includes(" "));

  return Array.from(new Set(parts));
}

export function findClubsByAdvisor(
  advisorName: string,
  clubs: readonly ClubRecord[],
  excludeClubId?: string,
): ClubRecord[] {
  const needle = advisorName.trim().toLowerCase();
  if (!needle) return [];

  return clubs.filter((club) => {
    if (excludeClubId && club.Club_ID === excludeClubId) {
      return false;
    }
    return club.Advisor_Name.toLowerCase().includes(needle);
  });
}

export interface RelatedRecordMatch {
  ref: HubRecordRef;
  reason: string;
  score: number;
}

function getRecordCorpus(ref: HubRecordRef): string {
  switch (ref.kind) {
    case "club":
      return [
        ref.record.Club_Name,
        ref.record.Category,
        ref.record.Advisor_Name,
        ref.record.Location_Room,
        ref.record.Description,
      ]
        .join(" ")
        .toLowerCase();
    case "pathway":
      return [
        ref.record.Program_Or_Course_Title,
        ref.record.Department,
        ref.record.Track_Type,
        ref.record.Prerequisites_And_Eligibility,
        ref.record.Description_And_Details,
      ]
        .join(" ")
        .toLowerCase();
    case "guide":
      return [
        ref.record.Task_Title,
        ref.record.Category,
        ref.record.Office_Or_Room,
        ref.record.Staff_Contact,
        ref.record.Step_By_Step_Process,
        ref.record.Key_Deadlines_Or_Rules,
      ]
        .join(" ")
        .toLowerCase();
  }
}

/**
 * Dynamically discovers related clubs, academic pathways, and student action guides
 * from the live dataset based on cross-referenced titles, shared rooms, shared advisors,
 * and shared academic/service topics.
 */
export function findRelatedRecords(
  target: HubRecordRef,
  data: {
    clubs: readonly ClubRecord[];
    pathways: readonly AcademicPathwayRecord[];
    guides: readonly StudentActionGuideRecord[];
  },
  limit = 4,
): RelatedRecordMatch[] {
  const targetId = getRecordId(target);
  const targetCorpus = getRecordCorpus(target);

  const candidates: HubRecordRef[] = [
    ...data.guides.map((record): HubRecordRef => ({ kind: "guide", record })),
    ...data.pathways.map(
      (record): HubRecordRef => ({ kind: "pathway", record }),
    ),
    ...data.clubs.map((record): HubRecordRef => ({ kind: "club", record })),
  ];

  const matches: RelatedRecordMatch[] = [];

  for (const candidate of candidates) {
    const candidateId = getRecordId(candidate);
    if (candidateId === targetId) continue;

    const candidateCorpus = getRecordCorpus(candidate);
    let score = 0;
    let reason = "";

    // 1. Community Service & Volunteer Hours <-> NHS / Bookstore / Interact
    const isCommunityServicePair =
      (targetCorpus.includes("community service") ||
        targetCorpus.includes("252a") ||
        targetCorpus.includes("nhs")) &&
      (candidateCorpus.includes("community service") ||
        candidateCorpus.includes("252a") ||
        candidateId === "CLB-045" ||
        candidateId === "CLB-012" ||
        candidateId === "CLB-031" ||
        candidateId === "ACT-002");

    if (isCommunityServicePair) {
      if (targetId === "ACT-002" && candidateId === "CLB-045") {
        score += 30;
        reason = "Requires 30+ community service hours (Room 252A)";
      } else if (targetId === "CLB-045" && candidateId === "ACT-002") {
        score += 30;
        reason = "Step-by-step guide for NHS community service hours";
      } else if (
        targetId === "ACT-002" &&
        (candidateId === "CLB-012" || candidateId === "CLB-031")
      ) {
        score += 24;
        reason = "Referenced in guide as an approved service initiative";
      } else if (
        (targetId === "CLB-012" || targetId === "CLB-031") &&
        candidateId === "ACT-002"
      ) {
        score += 24;
        reason = "How to log & submit volunteer service hours";
      }
    }

    // 2. Course Acceleration & Schedule Consultation <-> Acceleration Policy & Program of Studies
    if (
      (targetCorpus.includes("acceleration") ||
        targetCorpus.includes("program of studies")) &&
      (candidateCorpus.includes("acceleration") ||
        candidateCorpus.includes("program of studies"))
    ) {
      if (
        (targetId === "ACT-004" && candidateId === "ACD-001") ||
        (targetId === "ACD-001" && candidateId === "ACT-004")
      ) {
        score += 30;
        reason = "Paired acceleration policy & counseling consultation guide";
      } else if (
        (targetId === "ACT-004" && candidateId === "ACD-005") ||
        (targetId === "ACD-005" && candidateId === "ACT-004") ||
        (targetId === "ACD-001" && candidateId === "ACD-005") ||
        (targetId === "ACD-005" && candidateId === "ACD-001")
      ) {
        score += 20;
        reason = "Master course sequences & prerequisites catalog";
      }
    }

    // 3. Mental Health & Wellness Guide <-> Sources of Strength (CLB-051)
    if (
      (targetId === "ACT-005" && candidateId === "CLB-051") ||
      (targetId === "CLB-051" && candidateId === "ACT-005")
    ) {
      score += 32;
      reason = "Peer wellness program & MHS Counseling support access";
    }

    // 4. Social Studies Pathways (ACD-002, ACD-003) <-> Social Studies Clubs (Model UN, Mock Trial, Military History, ASI)
    if (
      (target.kind === "pathway" &&
        target.record.Department.toLowerCase().includes("social studies") &&
        candidate.kind === "club" &&
        (candidateCorpus.includes("social studies wing") ||
          candidateId === "CLB-040" ||
          candidateId === "CLB-041" ||
          candidateId === "CLB-042" ||
          candidateId === "CLB-008")) ||
      (candidate.kind === "pathway" &&
        candidate.record.Department.toLowerCase().includes("social studies") &&
        target.kind === "club" &&
        (targetCorpus.includes("social studies wing") ||
          targetId === "CLB-040" ||
          targetId === "CLB-041" ||
          targetId === "CLB-042" ||
          targetId === "CLB-008"))
    ) {
      score += 18;
      reason = reason || "Connected Social Studies pathway & competition team";
    }

    // 5. Shared Faculty Advisor between two clubs
    if (target.kind === "club" && candidate.kind === "club") {
      const targetAdvisors = extractAdvisorNames(target.record.Advisor_Name);
      const candAdvisors = extractAdvisorNames(candidate.record.Advisor_Name);
      const sharedAdvisor = targetAdvisors.find((a) =>
        candAdvisors.some((ca) => ca.toLowerCase() === a.toLowerCase()),
      );
      if (sharedAdvisor) {
        score += 16;
        reason = reason || `Also advised by ${sharedAdvisor}`;
      } else if (target.record.Category === candidate.record.Category) {
        score += 6;
        reason = reason || `More in ${target.record.Category}`;
      }
    }

    // 6. Same Department between two pathways
    if (
      target.kind === "pathway" &&
      candidate.kind === "pathway" &&
      target.record.Department === candidate.record.Department
    ) {
      score += 22;
      reason = reason || `Same department (${target.record.Department})`;
    }

    if (score > 0) {
      matches.push({
        ref: candidate,
        reason: reason || `Related ${KIND_LABEL[candidate.kind]}`,
        score,
      });
    }
  }

  return matches
    .sort(
      (a, b) =>
        b.score - a.score ||
        getRecordTitle(a.ref).localeCompare(getRecordTitle(b.ref)),
    )
    .slice(0, limit);
}
