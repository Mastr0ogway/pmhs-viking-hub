# PMHS Viking Hub — Student & Family Navigation Hub

**Viking Hub** is the student-and-family navigation portal for **Pittsford Mendon High School (PMHS)**. It unifies student clubs and activities, AP/Honors and accelerated academic pathways, and interactive step-by-step `"How Do I...?"` school procedure guides into a single, searchable experience—powered live by a **Google Sheets CMS** so staff and student leaders can keep school information accurate year-round without writing code.

---

## 1. Architecture Overview

| Layer | Technology & Responsibility |
| :--- | :--- |
| **Framework & Routing** | **Next.js 16 (App Router) + TypeScript** — Server Components fetch and validate live Google Sheets CSV data on the server (`app/page.tsx` and `app/verify/page.tsx`) with **60-second Incremental Static Regeneration (`revalidate = 60`)**. |
| **Live Google Sheets CMS (`lib/sheets.ts`)** | Fetches public CSV exports from Google's `gviz/tq?tqx=out:csv` endpoint via `fetchSheet()` and `getAllHubData()`, parsed with **PapaParse**. |
| **Zero-Mock-Data & Strict Header Validation (`types/hub.ts`)** | Every sheet fetch is validated at runtime against exhaustive column contracts (`CLUB_COLUMNS`, `PATHWAY_COLUMNS`, `GUIDE_COLUMNS`). Because Google's `gviz` endpoint silently returns HTTP 200 with the first tab if a requested tab name is missing or renamed, `lib/sheets.ts` verifies exact column headers and throws a descriptive `SheetFetchError` rather than falling back to mock or mismatched data. |
| **Interactive Client Shell (`components/hub/`)** | Includes the Sticky Mendon Navy/Gold Navbar (`Navbar.tsx`), Overview Dashboard (`OverviewDashboard.tsx`), Command-K (`⌘K`) Global Spotlight Search (`CommandSearchModal.tsx`, `lib/search.ts`), Interactive Club Explorer (`views/ClubsView.tsx`), Academic Pathways & Progression Flowchart Explorer (`views/PathwaysView.tsx`, `ui/CourseProgressionFlowchart.tsx`), Interactive Student Action Checklists (`views/GuidesView.tsx`, `ui/GuideChecklist.tsx`), Slide-Over Record Drawer with URL Deep-Linking (`RecordPreviewDrawer.tsx`), and the Executive Governance Modal (`AdminMaintenanceModal.tsx`). |
| **Styling & Brand Tokens (`app/globals.css`)** | **Tailwind CSS v4** configured with `@theme` institutional tokens: Mendon Navy (`bg-navy`, `bg-navy-light`, `bg-navy-dark`), Viking Gold (`text-gold`, `bg-gold`, `bg-gold-light`), and Surface (`bg-surface`). |
| **Privacy & On-Device State (`lib/guide-progress.ts`)** | 100% public read-only architecture with zero logins, zero user accounts, and zero cookies. Student checklist progress is saved solely on the visitor's own device in `localStorage` (`viking_hub_guide_progress_v1`) via an SSR-safe `useSyncExternalStore` store. |

---

## 2. How to Update Content Without Coding (Google Sheets CMS)

Authorized Counseling staff, club advisors, and Student Council / Computer Science Club officers can update content directly in the **PMHS Master Admin CMS Google Sheet**. Changes automatically appear on the live website within **60 seconds**—no coding, Git commits, or Vercel redeployments required.

### The 4 Master Google Sheet Tabs

1. **`Overview_And_Instructions` (Admin Reference Tab)**
   - Contains maintainer instructions, editorial conventions, and governance notes inside the spreadsheet.
2. **`Clubs_Directory` (Live Data Tab — 10 Required Columns)**
   - Exact headers: `Club_ID`, `Club_Name`, `Category`, `Advisor_Name`, `Meeting_Schedule`, `Location_Room`, `Description`, `Data_Status`, `Official_Source_URL`, `Last_Verified`
   - Rows with a blank `Club_ID` are ignored. Adding a new category value in `Category` automatically generates a new filter pill on the site.
3. **`Academic_Pathways` (Live Data Tab — 8 Required Columns)**
   - Exact headers: `Pathway_ID`, `Department`, `Program_Or_Course_Title`, `Grade_Levels`, `Track_Type`, `Prerequisites_And_Eligibility`, `Description_And_Details`, `Official_Source_URL`
   - **Visual Flowchart Syntax**: Writing `"->"` between stages in `Prerequisites_And_Eligibility` (e.g., `Grade 9: Global History 9 -> Grade 10: Global History 10 or AP European History -> ...`) automatically renders a multi-stage visual progression flowchart.
   - **Program/Elective Badges Syntax**: Including `Programs include: A, B, C.` or `Electives include A, B, C.` in `Description_And_Details` automatically renders scannable program badges.
4. **`Student_Action_Guides` (Live Data Tab — 9 Required Columns)**
   - Exact headers: `Guide_ID`, `Task_Title`, `Category`, `Target_Audience`, `Office_Or_Room`, `Staff_Contact`, `Step_By_Step_Process`, `Key_Deadlines_Or_Rules`, `Official_URL`
   - **Interactive Checklist Syntax**: Formatting `Step_By_Step_Process` as `Step 1: ... Step 2: ... Step 3: ...` automatically splits the text into interactive, checkable steps with a progress bar. Single-paragraph guides render with a `"Mark as done"` toggle.

> **Important CMS Rule:** Never rename the 3 live tab names (`Clubs_Directory`, `Academic_Pathways`, `Student_Action_Guides`) or alter the row-1 column header names unless updating `types/hub.ts` and `lib/sheets.ts` at the same time.

---

## 3. Local Development Setup

### Prerequisites
- **Node.js** `>= 20.x` and **npm**

### Step-by-Step Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env.local` and set your Google Sheet ID:
   ```bash
   cp .env.example .env.local
   ```
   In `.env.local`:
   ```env
   NEXT_PUBLIC_SPREADSHEET_ID=1-ISkIy25T4lW8bFitajkR7LMeePuCiOaKhwDVqBqFVs
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   - Open [`http://localhost:3000`](http://localhost:3000) to view the student & family application.
   - Open [`http://localhost:3000/verify`](http://localhost:3000/verify) to inspect the **CMS Data Verification Dashboard** (verifies live record counts, column headers, and raw parsed rows across all 3 data tabs).

4. **Run quality & build checks before pushing:**
   ```bash
   ./node_modules/.bin/tsc --noEmit
   npm run lint
   npm run build
   ```

---

## 4. Annual May Leadership Handoff Checklist

To guarantee multi-year continuity across graduating classes, the **Faculty Advisor / Sponsor retains permanent Owner access** on all core infrastructure, while **Editor / Admin access rotates every May** from outgoing to incoming Computer Science Club and Student Council leads:

- [ ] **1. Master Google Sheet Ownership & Editor Rotation**
  - Verify the **Faculty Advisor / Counseling Sponsor** remains the permanent **Owner** of the Master Google Sheet (`Anyone with the link: Viewer` enabled so the Next.js server can read the CSV endpoints).
  - Grant **Editor** access to incoming Student Council and Computer Science Club officers, and remove Editor access for graduating seniors.
- [ ] **2. GitHub Repository Handoff**
  - Verify the **Faculty Advisor** retains permanent **Owner** access on the GitHub Organization / repository.
  - Add incoming Computer Science Club technical leads as **Maintainers / Admins** and remove graduating seniors after May handoff.
- [ ] **3. Vercel Production Project Handoff**
  - Verify the **Faculty Advisor** retains permanent **Owner** access on the Vercel project and confirm `NEXT_PUBLIC_SPREADSHEET_ID` is set in Vercel Environment Variables (`Production`, `Preview`, `Development`).
  - Grant incoming Computer Science Club leads access to inspect deployment logs and domains.
- [ ] **4. September Fall Rollover & Live Verification Drill**
  - Each September (and during the May handoff meeting), review club advisors, room numbers, and deadlines in the Master Google Sheet and update the `Last_Verified` column.
  - Perform a live test cell edit together and visit `/verify` after 60 seconds to confirm the change synced cleanly with zero `SheetFetchError` alerts.
