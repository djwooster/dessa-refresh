export interface AssessmentWindow {
  id: string;
  label: string;
  shortLabel: string;
  date: string;
  dateObj: Date;
  status: "completed" | "current" | "upcoming";
}

export const WINDOWS: AssessmentWindow[] = [
  {
    id: "pre",
    label: "Pre-Assessment",
    shortLabel: "Pre",
    date: "Aug 01, 2025",
    dateObj: new Date("2025-08-01"),
    status: "completed",
  },
  {
    id: "mid",
    label: "Mid-Assessment",
    shortLabel: "Mid",
    date: "Jan 01, 2026",
    dateObj: new Date("2026-01-01"),
    status: "current",
  },
  {
    id: "post",
    label: "Post-Assessment",
    shortLabel: "Post",
    date: "May 28, 2026",
    dateObj: new Date("2026-05-28"),
    status: "upcoming",
  },
];

export const TODAY = new Date("2026-05-13");
export const DAYS_UNTIL_POST = 15;

export const STATUS_COLOR = {
  completed: "#22c55e",
  current: "#1a4e8a",
  upcoming: "#cbd5e1",
} as const;
