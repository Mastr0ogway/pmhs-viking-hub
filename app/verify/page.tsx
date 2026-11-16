import Link from "next/link";
import { ArrowLeft, Compass, GraduationCap, Users } from "lucide-react";
import { DataPreviewTable } from "@/components/hub/DataPreviewTable";
import { MetricCard } from "@/components/hub/MetricCard";
import { StatusBanner } from "@/components/hub/StatusBanner";
import { tallyByField } from "@/lib/format";
import { getActiveSpreadsheetId, getAllHubData } from "@/lib/sheets";
import { CLUB_COLUMNS, GUIDE_COLUMNS, PATHWAY_COLUMNS } from "@/types/hub";

export const revalidate = 60;

export default async function VerifyPage() {
  const { clubs, pathways, guides, fetchedAt } = await getAllHubData();
  const spreadsheetId = getActiveSpreadsheetId();

  const clubCategories = tallyByField(clubs, (c) => c.Category);
  const pathwayTracks = tallyByField(pathways, (p) => p.Track_Type);
  const pathwayDepartments = tallyByField(pathways, (p) => p.Department);
  const guideCategories = tallyByField(guides, (g) => g.Category);

  const totalRecords = clubs.length + pathways.length + guides.length;

  return (
    <main className="min-h-screen bg-surface py-8 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-3.5 py-2 text-xs font-bold text-navy shadow-2xs transition hover:border-gold hover:bg-gold-light"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Viking Hub Portal</span>
          </Link>
        </div>

        <StatusBanner
          fetchedAt={fetchedAt}
          spreadsheetId={spreadsheetId}
          totalRecords={totalRecords}
        />

        <section aria-label="Live Sheet Metric Summary">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <MetricCard
              tabName="Clubs_Directory"
              label="Clubs Directory"
              count={clubs.length}
              expectedCount={58}
              columnCount={CLUB_COLUMNS.length}
              categoryHeading="Detected Categories"
              categories={clubCategories}
              icon={<Users className="h-5 w-5" />}
              anchorHref="#clubs-preview"
            />

            <MetricCard
              tabName="Academic_Pathways"
              label="Academic Pathways"
              count={pathways.length}
              expectedCount={6}
              columnCount={PATHWAY_COLUMNS.length}
              categoryHeading="Detected Track Types"
              categories={pathwayTracks}
              secondarySummary={`Across ${pathwayDepartments.length} unique departments: ${pathwayDepartments.map((d) => d.name).join(" · ")}`}
              icon={<GraduationCap className="h-5 w-5" />}
              anchorHref="#pathways-preview"
            />

            <MetricCard
              tabName="Student_Action_Guides"
              label="Student Action Guides"
              count={guides.length}
              expectedCount={5}
              columnCount={GUIDE_COLUMNS.length}
              categoryHeading="Detected Categories"
              categories={guideCategories}
              icon={<Compass className="h-5 w-5" />}
              anchorHref="#guides-preview"
            />
          </div>
        </section>

        <div className="space-y-8">
          <DataPreviewTable
            id="clubs-preview"
            tabName="Clubs_Directory"
            title="Clubs Directory — Live Parsed Records"
            description="Complete live CSV feed mapped to ClubRecord (all 10 columns)."
            columns={CLUB_COLUMNS}
            rows={clubs}
            idField="Club_ID"
            badgeColumns={["Category", "Data_Status"]}
          />

          <DataPreviewTable
            id="pathways-preview"
            tabName="Academic_Pathways"
            title="Academic Pathways — Live Parsed Records"
            description="Complete live CSV feed mapped to AcademicPathwayRecord (all 8 columns)."
            columns={PATHWAY_COLUMNS}
            rows={pathways}
            idField="Pathway_ID"
            badgeColumns={["Track_Type", "Grade_Levels"]}
          />

          <DataPreviewTable
            id="guides-preview"
            tabName="Student_Action_Guides"
            title="Student Action Guides — Live Parsed Records"
            description="Complete live CSV feed mapped to StudentActionGuideRecord (all 9 columns)."
            columns={GUIDE_COLUMNS}
            rows={guides}
            idField="Guide_ID"
            badgeColumns={["Category", "Target_Audience"]}
          />
        </div>
      </div>
    </main>
  );
}
