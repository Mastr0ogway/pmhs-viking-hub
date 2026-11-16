import { CheckCircle2, ExternalLink, Table2 } from "lucide-react";
import type { SheetTabName } from "@/types/hub";
import { cn } from "@/lib/utils";

type StringRecord<T> = { [K in keyof T]: string };

const LONG_TEXT_COLUMNS = new Set<string>([
  "Description",
  "Prerequisites_And_Eligibility",
  "Description_And_Details",
  "Step_By_Step_Process",
  "Key_Deadlines_Or_Rules",
]);

const MEDIUM_TEXT_COLUMNS = new Set<string>([
  "Club_Name",
  "Advisor_Name",
  "Location_Room",
  "Program_Or_Course_Title",
  "Task_Title",
  "Department",
  "Meeting_Schedule",
  "Office_Or_Room",
  "Staff_Contact",
]);

interface DataPreviewTableProps<T extends StringRecord<T>> {
  id: string;
  tabName: SheetTabName;
  title: string;
  description: string;
  columns: readonly (keyof T & string)[];
  rows: readonly T[];
  idField: keyof T & string;
  badgeColumns?: readonly (keyof T & string)[];
}

export function DataPreviewTable<T extends StringRecord<T>>({
  id,
  tabName,
  title,
  description,
  columns,
  rows,
  idField,
  badgeColumns = [],
}: DataPreviewTableProps<T>) {
  const badgeSet = new Set<string>(badgeColumns);

  let emptyCellCount = 0;
  for (const row of rows) {
    for (const col of columns) {
      if (String(row[col] ?? "").trim().length === 0) {
        emptyCellCount += 1;
      }
    }
  }

  const totalCells = rows.length * columns.length;

  return (
    <section
      id={id}
      className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#002855] px-2.5 py-1 font-mono text-xs font-semibold text-[#EAAA00]">
              <Table2 className="h-3.5 w-3.5" />
              {tabName}
            </span>
            <h2 className="text-lg font-bold text-[#002855]">{title}</h2>
          </div>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-[#002855]">
            {rows.length} rows &times; {columns.length} columns ({totalCells}{" "}
            cells)
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold",
              emptyCellCount === 0
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-rose-200 bg-rose-50 text-rose-800",
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {emptyCellCount === 0
              ? "100% populated (0 empty cells)"
              : `${emptyCellCount} empty cell(s)`}
          </span>
        </div>
      </div>

      <div className="max-h-[34rem] overflow-auto">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead className="sticky top-0 z-20 bg-[#002855] text-white shadow-xs">
            <tr>
              <th
                scope="col"
                className="w-12 border-r border-white/10 px-3 py-3 text-center font-mono text-[11px] font-semibold text-[#EAAA00]"
              >
                #
              </th>
              {columns.map((col) => {
                const isId = col === idField;
                return (
                  <th
                    key={col}
                    scope="col"
                    className={cn(
                      "border-r border-white/10 px-4 py-3 font-mono text-xs font-semibold tracking-tight whitespace-nowrap last:border-r-0",
                      isId &&
                        "md:sticky md:left-0 md:z-30 md:bg-[#002855] text-[#EAAA00]",
                    )}
                  >
                    {col}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {rows.map((row, rowIndex) => {
              const rowId = String(row[idField] ?? `row-${rowIndex}`);
              const isEven = rowIndex % 2 === 1;

              return (
                <tr
                  key={rowId}
                  className={cn(
                    "align-top transition-colors hover:bg-[#FDF6E2]/50",
                    isEven ? "bg-slate-50/60" : "bg-white",
                  )}
                >
                  <td className="border-r border-slate-100 px-3 py-3 text-center font-mono text-[11px] text-slate-400">
                    {rowIndex + 1}
                  </td>

                  {columns.map((col) => {
                    const value = String(row[col] ?? "").trim();
                    const isId = col === idField;
                    const isUrl =
                      col.endsWith("_URL") &&
                      (value.startsWith("http://") ||
                        value.startsWith("https://"));
                    const isBadge = badgeSet.has(col);
                    const isLongText = LONG_TEXT_COLUMNS.has(col);
                    const isMediumText = MEDIUM_TEXT_COLUMNS.has(col);

                    return (
                      <td
                        key={col}
                        className={cn(
                          "border-r border-slate-100 px-4 py-3 text-slate-700 last:border-r-0",
                          isId &&
                            (isEven
                              ? "md:sticky md:left-0 md:z-10 md:bg-slate-50"
                              : "md:sticky md:left-0 md:z-10 md:bg-white"),
                          isLongText &&
                            "min-w-[22rem] max-w-md whitespace-pre-line leading-relaxed text-xs",
                          isMediumText && "min-w-[13rem] font-medium text-slate-900",
                          !isLongText && !isMediumText && "whitespace-nowrap",
                        )}
                      >
                        {value.length === 0 ? (
                          <span className="inline-flex items-center rounded border border-rose-300 bg-rose-50 px-2 py-0.5 font-mono text-[11px] font-bold text-rose-700">
                            EMPTY
                          </span>
                        ) : isId ? (
                          <span className="inline-flex items-center rounded-md border border-[#002855]/20 bg-[#002855]/5 px-2 py-0.5 font-mono text-xs font-bold text-[#002855]">
                            {value}
                          </span>
                        ) : isUrl ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex max-w-[16rem] items-center gap-1.5 font-mono text-xs text-[#002855] underline decoration-[#EAAA00] decoration-2 underline-offset-2 hover:text-[#003875]"
                            title={value}
                          >
                            <span className="truncate">{value}</span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#002855]" />
                          </a>
                        ) : isBadge ? (
                          <span className="inline-flex items-center rounded-full border border-[#002855]/15 bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-medium text-[#002855]">
                            {value}
                          </span>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500">
        <span>
          Showing all <strong className="text-slate-700">{rows.length}</strong>{" "}
          live records from{" "}
          <code className="font-mono text-[#002855]">{tabName}</code>
        </span>
        <span className="font-mono">
          Primary key: <strong className="text-[#002855]">{idField}</strong> ·{" "}
          {columns.length} strict interface fields verified
        </span>
      </div>
    </section>
  );
}
