import { ImageResponse } from "next/og";

export const alt =
  "PMHS Viking Hub — Pittsford Mendon High School Student & Family Navigation Hub";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const NAVY = "rgb(0, 40, 85)";
const NAVY_DARK = "rgb(0, 26, 56)";
const GOLD = "rgb(234, 170, 0)";
const GOLD_LIGHT = "rgb(253, 246, 226)";
const SURFACE = "rgb(248, 250, 252)";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: NAVY,
          color: "white",
          padding: "56px 64px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Accent Strip & Institutional Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: NAVY_DARK,
              border: `2px solid ${GOLD}`,
              borderRadius: "9999px",
              padding: "10px 22px",
              fontSize: "20px",
              fontWeight: 700,
              color: GOLD,
            }}
          >
            <span>Pittsford Mendon High School · Viking Resource Hub</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: GOLD,
              color: NAVY_DARK,
              borderRadius: "12px",
              padding: "8px 18px",
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            PMHS
          </div>
        </div>

        {/* Center Headline & Subheadline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "980px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: "68px",
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ marginRight: "18px" }}>Your Guide to</span>
            <span style={{ color: GOLD }}>Pittsford Mendon.</span>
          </div>

          <div
            style={{
              fontSize: "28px",
              lineHeight: 1.4,
              color: SURFACE,
              opacity: 0.92,
            }}
          >
            Search 58+ student clubs &amp; advisors, explore AP and accelerated
            coursework flowcharts, and follow interactive checklists for school
            procedures.
          </div>
        </div>

        {/* Bottom Feature Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(255,255,255,0.16)",
            paddingTop: "28px",
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                backgroundColor: GOLD_LIGHT,
                color: NAVY_DARK,
                borderRadius: "14px",
                padding: "12px 22px",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              58+ Clubs &amp; Activities
            </div>
            <div
              style={{
                display: "flex",
                backgroundColor: GOLD_LIGHT,
                color: NAVY_DARK,
                borderRadius: "14px",
                padding: "12px 22px",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              Academic Pathways &amp; AP Tracks
            </div>
            <div
              style={{
                display: "flex",
                backgroundColor: GOLD_LIGHT,
                color: NAVY_DARK,
                borderRadius: "14px",
                padding: "12px 22px",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              “How Do I...?” Checklists
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "20px",
              fontWeight: 700,
              color: GOLD,
            }}
          >
            pmhs-viking-hub.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
