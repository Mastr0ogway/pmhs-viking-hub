export interface ClubRecord {
  Club_ID: string;
  Club_Name: string;
  Category: string;
  Advisor_Name: string;
  Meeting_Schedule: string;
  Location_Room: string;
  Description: string;
  Data_Status: string;
  Official_Source_URL: string;
  Last_Verified: string;
}

export interface AcademicPathwayRecord {
  Pathway_ID: string;
  Department: string;
  Program_Or_Course_Title: string;
  Grade_Levels: string;
  Track_Type: string;
  Prerequisites_And_Eligibility: string;
  Description_And_Details: string;
  Official_Source_URL: string;
}

export interface StudentActionGuideRecord {
  Guide_ID: string;
  Task_Title: string;
  Category: string;
  Target_Audience: string;
  Office_Or_Room: string;
  Staff_Contact: string;
  Step_By_Step_Process: string;
  Key_Deadlines_Or_Rules: string;
  Official_URL: string;
}

export interface HubDataPayload {
  clubs: ClubRecord[];
  pathways: AcademicPathwayRecord[];
  guides: StudentActionGuideRecord[];
  fetchedAt: string;
}

export type SheetTabName =
  | "Clubs_Directory"
  | "Academic_Pathways"
  | "Student_Action_Guides";

export const CLUB_COLUMNS = [
  "Club_ID",
  "Club_Name",
  "Category",
  "Advisor_Name",
  "Meeting_Schedule",
  "Location_Room",
  "Description",
  "Data_Status",
  "Official_Source_URL",
  "Last_Verified",
] as const satisfies readonly (keyof ClubRecord)[];

export const PATHWAY_COLUMNS = [
  "Pathway_ID",
  "Department",
  "Program_Or_Course_Title",
  "Grade_Levels",
  "Track_Type",
  "Prerequisites_And_Eligibility",
  "Description_And_Details",
  "Official_Source_URL",
] as const satisfies readonly (keyof AcademicPathwayRecord)[];

export const GUIDE_COLUMNS = [
  "Guide_ID",
  "Task_Title",
  "Category",
  "Target_Audience",
  "Office_Or_Room",
  "Staff_Contact",
  "Step_By_Step_Process",
  "Key_Deadlines_Or_Rules",
  "Official_URL",
] as const satisfies readonly (keyof StudentActionGuideRecord)[];

// Compile-time exhaustiveness assertions: ensure every interface key is listed in its column array.
type AssertAllKeys<T, Cols extends readonly (keyof T)[]> = Exclude<
  keyof T,
  Cols[number]
> extends never
  ? true
  : never;

const _assertClubColumns: AssertAllKeys<ClubRecord, typeof CLUB_COLUMNS> = true;
const _assertPathwayColumns: AssertAllKeys<
  AcademicPathwayRecord,
  typeof PATHWAY_COLUMNS
> = true;
const _assertGuideColumns: AssertAllKeys<
  StudentActionGuideRecord,
  typeof GUIDE_COLUMNS
> = true;
void _assertClubColumns;
void _assertPathwayColumns;
void _assertGuideColumns;
