import React from "react";
import { Zap, ClipboardList } from "lucide-react";

export const WINDOW_OPTIONS = [
  { count: 1, desc: "Annual Assessment", labels: ["Annual Assessment"] },
  {
    count: 2,
    desc: "Pre & Post Assessment",
    labels: ["Pre-Assessment", "Post-Assessment"],
  },
  {
    count: 3,
    desc: "Pre, Mid & Post Assessment",
    labels: ["Pre-Assessment", "Mid-Assessment", "Post-Assessment"],
  },
  {
    count: 4,
    desc: "Pre, Mid 1, Mid 2 & Post Assessment",
    labels: [
      "Pre-Assessment",
      "Mid 1 Assessment",
      "Mid 2 Assessment",
      "Post-Assessment",
    ],
  },
  {
    count: 5,
    desc: "Pre, Mid 1, Mid 2, Mid 3 & Post Assessment",
    labels: [
      "Pre-Assessment",
      "Mid 1 Assessment",
      "Mid 2 Assessment",
      "Mid 3 Assessment",
      "Post-Assessment",
    ],
  },
];

export const DEFAULT_DATES: Record<number, string[]> = {
  1: ["2025-08-01"],
  2: ["2025-08-01", "2026-05-28"],
  3: ["2025-08-01", "2026-01-01", "2026-05-28"],
  4: ["2025-08-01", "2025-11-01", "2026-02-01", "2026-05-28"],
  5: ["2025-08-01", "2025-10-01", "2026-01-01", "2026-03-01", "2026-05-28"],
};

export const DEFAULT_COUNT = 3;

export type WindowConfig = {
  assessment: "screener" | "full" | null;
  conditionalAssignment: boolean | null;
  tScore: string;
  resetBehavior: "rescreen" | "skip" | "rescreen-threshold" | null;
};

export type SiteCustomConfig = {
  windowCount: number;
  dates: string[];
  windowConfigs: WindowConfig[];
  groupName?: string;
};

export const DEFAULT_WINDOW_CONFIG: WindowConfig = {
  assessment: null,
  conditionalAssignment: null,
  tScore: "40",
  resetBehavior: null,
};

export const DEFAULT_STATE = {
  windowCount: DEFAULT_COUNT,
  dates: DEFAULT_DATES[DEFAULT_COUNT],
  assessment: null as "screener" | "full" | null,
  conditionalAssignment: null as boolean | null,
  tScore: "40",
  resetBehavior: null as "rescreen" | "skip" | null,
  windowConfigs: Array(DEFAULT_COUNT)
    .fill(null)
    .map(() => ({ ...DEFAULT_WINDOW_CONFIG })) as WindowConfig[],
  siteLeaderManage: null as boolean | null,
};

export const BAND_COLORS = [
  { bg: "#dcf0e5", text: "#166534" },
  { bg: "#dbeafe", text: "#1e40af" },
  { bg: "#ede9fe", text: "#5b21b6" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#fce7f3", text: "#9d174d" },
];

export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const TSCORE_RANGES = [
  {
    label: "Need for Instruction",
    value: "≤ 40",
    bg: "#fecaca",
    text: "#b91c1c",
    flex: 2,
  },
  { label: "Typical", value: "41–59", bg: "#dbeafe", text: "#1e40af", flex: 3 },
  { label: "Strength", value: "≥ 60", bg: "#dcfce7", text: "#166534", flex: 2 },
];

export const ASSESSMENT_OPTIONS = [
  {
    value: "screener",
    icon: Zap,
    label: "Screener",
    desc: "DESSA 2 mini, DESSA HSE-mini",
    summary:
      "A brief rating form that quickly identifies students who may need additional support.",
    items: ["DESSA 2 mini", "DESSA HSE-mini"],
  },
  {
    value: "full",
    icon: ClipboardList,
    label: "Full Assessment",
    desc: "DESSA 2, DESSA HSE",
    summary:
      "A comprehensive rating form measuring eight social-emotional competencies in depth.",
    items: ["DESSA 2", "DESSA HSE"],
  },
];

export type ScreenDef = {
  id: string;
  title: string;
  subtitle?: string;
  helpTitle?: string;
  helpBody?: React.ReactNode;
};

export function buildScreens(
  isOverride: boolean,
  windowCount: number,
  windowConfigs: WindowConfig[],
  labels: string[],
): ScreenDef[] {
  const screens: ScreenDef[] = [];

  if (isOverride) {
    screens.push({
      id: "sites",
      title: "Which sites are in this group?",
      subtitle: "Select all sites that should follow this custom schedule.",
    });
    screens.push({
      id: "name",
      title: "What should we call this group?",
      subtitle:
        "Give this custom schedule a name so Site Leaders and admins can identify it.",
    });
  }

  screens.push({
    id: "window-count",
    title: "How many rating windows do you need this year?",
    helpTitle: "About Rating Windows",
    helpBody: (
      <div className="space-y-3 text-[14px] text-gray-600 leading-relaxed">
        <p>
          A rating window is a period during the school year when teachers
          complete DESSA assessments for their students.
        </p>
        <p>
          Most programs use <strong>3 windows</strong> — Pre, Mid, and Post —
          which lets you track social-emotional growth across the year.
        </p>
        <p>
          Choose a number that matches your program&apos;s schedule. You can
          adjust this in future years.
        </p>
      </div>
    ),
  });

  for (let i = 0; i < windowCount; i++) {
    screens.push({
      id: `date-${i}`,
      title: `Set up your ${labels[i]}`,
      helpTitle: "About Start Dates",
      helpBody: (
        <div className="space-y-3 text-[14px] text-gray-600 leading-relaxed">
          <p>
            The start date is when this rating window opens. Once it opens,
            teachers can begin submitting assessments for students in this
            period.
          </p>
          <p>
            Good choices are dates that align with your school calendar — the
            start of a semester, after a break, or at the beginning of a grading
            period.
          </p>
          <p>
            Make sure there&apos;s enough time between windows for teachers to
            complete their assessments.
          </p>
        </div>
      ),
    });
  }

  // reset-behavior screen commented out — question now appears inline on first screener window
  /* if (windowConfigs.some((wc) => wc.assessment === "screener")) {
    screens.push({
      id: "reset-behavior",
      title: "If a student scores below the threshold on a screener in any rating window, should they automatically be assessed using the full DESSA for the rest of the year?",
      helpTitle: "Year-round Escalation",
      helpBody: (
        <div className="space-y-8 text-[14px] text-gray-600 leading-relaxed">
          <div>
            <p className="text-[18px] font-semibold text-gray-800 mb-1">Yes — full DESSA for the rest of the year</p>
            <p>Once a student scores below the threshold in any screener window, they are automatically assigned the full DESSA for every remaining window this year.</p>
          </div>
          <div>
            <p className="text-[18px] font-semibold text-gray-800 mb-1">No — start fresh each window</p>
            <p>Students begin each new window alongside everyone else, regardless of previous screener results.</p>
          </div>
          <div>
            <p className="text-[18px] font-semibold text-gray-800 mb-1">Which should I choose?</p>
            <p>Choose <strong>Yes</strong> if students who need additional support should consistently receive a deeper assessment. Choose <strong>No</strong> if you want to re-evaluate each window to track growth over time.</p>
          </div>
        </div>
      ),
    });
  } */

  /* site-overrides screen removed from default flow — custom setups are
     created from the overview page using the override wizard */

  screens.push({
    id: "students",
    title: "Who controls when students can access their self-assessments?",
    helpTitle: "Student Self-Assessment Access",
    helpBody: (
      <div className="space-y-3 text-[14px] text-gray-600 leading-relaxed">
        <p>
          The DESSA student self-report lets students rate themselves on
          social-emotional skills.
        </p>
        <p>
          By default, student assessments open automatically when a rating
          window opens — no extra step needed.
        </p>
        <p>
          If you enable Site Leader management, each Site Leader can choose
          exactly when students at their site can access their self-assessment
          within the window, giving them more control over timing.
        </p>
      </div>
    ),
  });

  return screens;
}

export const LAST_YEAR = {
  year: "2024–2025",
  windowCount: 3,
  windowDesc: "Pre, Mid & Post Assessment",
  windows: [
    { label: "Pre-Assessment", date: "Aug 1, 2024", iso: "2024-08-01" },
    { label: "Mid-Assessment", date: "Jan 1, 2025", iso: "2025-01-01" },
    { label: "Post-Assessment", date: "May 28, 2025", iso: "2025-05-28" },
  ],
  assessment: "Screener",
  assessmentDesc: "DESSA 2 mini, DESSA HSE-mini",
  conditionalAssignment: true,
  tScore: "40",
  resetEachWindow: false,
  siteLeaderManage: false,
};

export const MOCK_SITES = [
  "Adams Middle",
  "Agave High",
  "Arroyo Seco Elementary",
  "Arthur Elementary",
  "Aspen Grove Middle",
  "Bayshore Middle",
  "Birchwood Middle",
  "Blackrock High",
  "Bluehills High",
  "Bluffview Middle",
  "Bridgeview Elementary",
  "Bronzedale High",
  "Buchanan Middle",
  "Bush Elementary",
  "Cactus Wren Elementary",
  "Canyon View Middle",
  "Capstone High",
  "Carter Middle",
  "Cedarbrook Elementary",
  "Chaparral Middle",
  "Clearwater Middle",
  "Cleveland Middle",
  "Cliffside Elementary",
  "Clinton Middle",
  "Coastline High",
  "Coolidge Middle",
  "Copperfield Middle",
  "Coral Reef High",
  "Cornerstone High",
  "Cottonwood Elementary",
  "Creekside Elementary",
  "Crestwood High",
  "Desert Ridge Elementary",
  "Dolphin Bay Elementary",
  "Eagle View Elementary",
  "Eastview Middle",
  "Eisenhower High",
  "Elmwood High",
  "Fairview High",
  "Falcon Ridge High",
  "FDR Elementary",
  "Fillmore High",
  "Flint Ridge Middle",
  "Ford Elementary",
  "Garfield High",
  "Glenview Middle",
  "Goldfield Middle",
  "Granite Ridge Middle",
  "Grant Elementary",
  "Greenlawn Elementary",
  "GW Bush High",
  "Harborview Elementary",
  "Harding Elementary",
  "Harrison Prep",
  "Hawk Creek Middle",
  "Hayes Middle",
  "Heron Bay Elementary",
  "Hillcrest High",
  "Hillside High",
  "Hoover High",
  "Inland Empire Elementary",
  "Ironwood Elementary",
  "Jackson Academy",
  "Jefferson Elementary",
  "Johnson High",
  "Juniper Valley Elementary",
  "Kennedy Elementary",
  "Keystone Elementary",
  "Lakeshore Middle",
  "Lakeview Middle",
  "LBJ Middle",
  "Limestone High",
  "Lincoln Elementary",
  "Madison High",
  "Manatee Middle",
  "Maplewood High",
  "Marble Falls Elementary",
  "McKinley High",
  "Meadowbrook Elementary",
  "Mesa Verde High",
  "Mesquite Middle",
  "Milestone Middle",
  "Monroe Elementary",
  "Nixon High",
  "Northside High",
  "Oakwood Middle",
  "Obama Elementary",
  "Ocotillo Middle",
  "Osprey High",
  "Palo Verde High",
  "Parkview Elementary",
  "Pelican Cove Middle",
  "Pierce Elementary",
  "Pinecrest Elementary",
  "Pinnacle Middle",
  "Plains High",
  "Polk Elementary",
  "Pondview Middle",
  "Prairie View Middle",
  "Reagan High",
  "Redwood High",
  "Ridgecrest High",
  "Riverbend High",
  "Riverside Elementary",
  "Roadrunner Middle",
  "Roosevelt Elementary",
  "Roosevelt Middle",
  "Sage Hills High",
  "Sagebrush Middle",
  "Saguaro Elementary",
  "Sandstone Elementary",
  "Seagull Shores High",
  "Silverstone Elementary",
  "Southside Elementary",
  "Summit Elementary",
  "Sunrise Middle",
  "Sunset Elementary",
  "Taft Middle",
  "Taylor Middle",
  "Truman Middle",
  "Tumbleweed High",
  "Tyler Charter",
  "Valley High",
  "Washington High",
  "Westwood High",
  "Whitewater Middle",
  "Willowbrook Elementary",
  "Wilson High",
];

export const SITES_IN_OTHER_OVERRIDES: Record<string, string> = {};
