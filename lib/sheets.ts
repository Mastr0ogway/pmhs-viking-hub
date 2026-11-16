import Papa from "papaparse";
import {
  CLUB_COLUMNS,
  GUIDE_COLUMNS,
  PATHWAY_COLUMNS,
  type AcademicPathwayRecord,
  type ClubRecord,
  type HubDataPayload,
  type SheetTabName,
  type StudentActionGuideRecord,
} from "@/types/hub";

export const DEFAULT_SPREADSHEET_ID =
  "1-ISkIy25T4lW8bFitajkR7LMeePuCiOaKhwDVqBqFVs";

export function getActiveSpreadsheetId(overrideId?: string): string {
  return (
    overrideId?.trim() ||
    process.env.NEXT_PUBLIC_SPREADSHEET_ID?.trim() ||
    DEFAULT_SPREADSHEET_ID
  );
}

export class SheetFetchError extends Error {
  readonly sheetName: string;

  constructor(sheetName: string, message: string) {
    super(`[Viking Hub · ${sheetName}] ${message}`);
    this.name = "SheetFetchError";
    this.sheetName = sheetName;
  }
}

export function buildSheetUrl(
  sheetName: SheetTabName,
  spreadsheetIdOverride?: string,
): string {
  const spreadsheetId = getActiveSpreadsheetId(spreadsheetIdOverride);
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

type StringRecord<T> = { [K in keyof T]: string };

export async function fetchSheet<T extends StringRecord<T>>(
  sheetName: SheetTabName,
  columns: readonly (keyof T & string)[],
  idField: keyof T & string,
  spreadsheetIdOverride?: string,
): Promise<T[]> {
  const url = buildSheetUrl(sheetName, spreadsheetIdOverride);

  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 60 } });
  } catch (cause) {
    throw new SheetFetchError(
      sheetName,
      `Network request failed for ${url}: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }

  if (!res.ok) {
    throw new SheetFetchError(
      sheetName,
      `Google Sheet request failed with HTTP ${res.status} ${res.statusText} (${url})`,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("text/csv")) {
    throw new SheetFetchError(
      sheetName,
      `Expected text/csv response from Google Sheets but received "${contentType || "unknown"}". Verify that spreadsheet "${getActiveSpreadsheetId(spreadsheetIdOverride)}" is publicly readable.`,
    );
  }

  const csvText = await res.text();
  if (!csvText.trim()) {
    throw new SheetFetchError(
      sheetName,
      `Received empty CSV body from ${url}.`,
    );
  }

  const parsed = Papa.parse<T>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (val) => val.trim(),
  });

  if (parsed.errors.length > 0) {
    const details = parsed.errors
      .slice(0, 5)
      .map((err) => `row ${err.row ?? "?"}: ${err.code} (${err.message})`)
      .join("; ");
    throw new SheetFetchError(
      sheetName,
      `CSV parsing failed with ${parsed.errors.length} error(s): ${details}`,
    );
  }

  // Guard against renamed/missing tabs (Google's gviz endpoint returns HTTP 200 with the first tab when a sheet name is unknown)
  const actualHeaders = parsed.meta.fields ?? [];
  const expectedSet = new Set<string>(columns);
  const actualSet = new Set<string>(actualHeaders);
  const missingColumns = columns.filter((col) => !actualSet.has(col));
  const unexpectedColumns = actualHeaders.filter(
    (col) => !expectedSet.has(col),
  );

  if (missingColumns.length > 0 || unexpectedColumns.length > 0) {
    throw new SheetFetchError(
      sheetName,
      `Column header mismatch. Missing columns: [${missingColumns.join(", ") || "none"}]. Unexpected columns: [${unexpectedColumns.join(", ") || "none"}]. Received headers: [${actualHeaders.join(", ")}]. Verify the "${sheetName}" tab name and column headers in Google Sheets.`,
    );
  }

  const records = parsed.data.filter((row) => {
    const primaryId = String(row[idField] ?? "").trim();
    return primaryId.length > 0;
  });

  if (records.length === 0) {
    throw new SheetFetchError(
      sheetName,
      `Tab "${sheetName}" returned 0 records with a non-blank ${idField}.`,
    );
  }

  return records;
}

export async function getAllHubData(): Promise<HubDataPayload> {
  const [clubs, pathways, guides] = await Promise.all([
    fetchSheet<ClubRecord>("Clubs_Directory", CLUB_COLUMNS, "Club_ID"),
    fetchSheet<AcademicPathwayRecord>(
      "Academic_Pathways",
      PATHWAY_COLUMNS,
      "Pathway_ID",
    ),
    fetchSheet<StudentActionGuideRecord>(
      "Student_Action_Guides",
      GUIDE_COLUMNS,
      "Guide_ID",
    ),
  ]);

  return {
    clubs,
    pathways,
    guides,
    fetchedAt: new Date().toISOString(),
  };
}
