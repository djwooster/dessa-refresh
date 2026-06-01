"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Info,
  Zap,
  ClipboardList,
  X,
  CheckCircle2,
  CalendarClock,
  Calendar,
  Users,
  Check,
  Building2,
  Ban,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { SuccessToast } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/client";

// ─── Constants ────────────────────────────────────────────────────────────────

const WINDOW_OPTIONS = [
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

const DEFAULT_DATES: Record<number, string[]> = {
  1: ["2025-08-01"],
  2: ["2025-08-01", "2026-05-28"],
  3: ["2025-08-01", "2026-01-01", "2026-05-28"],
  4: ["2025-08-01", "2025-11-01", "2026-02-01", "2026-05-28"],
  5: ["2025-08-01", "2025-10-01", "2026-01-01", "2026-03-01", "2026-05-28"],
};

const DEFAULT_COUNT = 3;

type WindowConfig = {
  assessment: "screener" | "full";
  conditionalAssignment: boolean;
  tScore: string;
  resetBehavior: "rescreen" | "skip";
};

const DEFAULT_WINDOW_CONFIG: WindowConfig = {
  assessment: "screener",
  conditionalAssignment: true,
  tScore: "40",
  resetBehavior: "rescreen",
};

const DEFAULT_STATE = {
  windowCount: DEFAULT_COUNT,
  dates: DEFAULT_DATES[DEFAULT_COUNT],
  assessment: "screener" as "screener" | "full",
  conditionalAssignment: true,
  tScore: "40",
  resetBehavior: "rescreen" as "rescreen" | "skip",
  sameConfigAllWindows: true,
  windowConfigs: Array(DEFAULT_COUNT)
    .fill(null)
    .map(() => ({ ...DEFAULT_WINDOW_CONFIG })) as WindowConfig[],
  siteLeaderManage: false,
};

const BAND_COLORS = [
  { bg: "#dcf0e5", text: "#166534" },
  { bg: "#dbeafe", text: "#1e40af" },
  { bg: "#ede9fe", text: "#5b21b6" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#fce7f3", text: "#9d174d" },
];

const MONTH_NAMES = [
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

function WizardTimeline({
  dates,
  labels,
}: {
  dates: string[];
  labels: string[];
}) {
  const parsed = dates.map((d) => (d ? new Date(d + "T00:00:00") : null));
  const valid = parsed.filter(Boolean) as Date[];
  if (valid.length === 0) return null;

  const rangeStart = valid[0];
  const rangeEnd = new Date(rangeStart.getFullYear() + 1, 7, 1);

  const rangeMs = rangeEnd.getTime() - rangeStart.getTime();
  const pct = (d: Date) =>
    Math.max(
      0,
      Math.min(100, ((d.getTime() - rangeStart.getTime()) / rangeMs) * 100),
    );

  const ticks: Date[] = [];
  const cur = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const endM = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);
  while (cur <= endM) {
    ticks.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-4">
        {ticks.map((m, i) => {
          const isFirst = i === 0;
          const isLast = i === ticks.length - 1;
          return (
            <span
              key={i}
              className="absolute text-[12px] text-gray-400"
              style={
                isFirst
                  ? { left: 0 }
                  : isLast
                    ? { right: 0 }
                    : {
                        left: `${(i / (ticks.length - 1)) * 100}%`,
                        transform: "translateX(-50%)",
                      }
              }
            >
              {MONTH_NAMES[m.getMonth()]}
            </span>
          );
        })}
      </div>
      <div className="relative h-9 rounded-lg overflow-hidden flex">
        {parsed.map((date, i) => {
          if (!date) return null;
          const next = parsed[i + 1];
          const width = pct(next ?? rangeEnd) - pct(date);
          const color = BAND_COLORS[i % BAND_COLORS.length];
          const shortLabel =
            labels[i]?.replace(/\s*-?\s*Assessment/i, "").trim() || `W${i + 1}`;
          return (
            <div
              key={i}
              className="flex items-center justify-center overflow-hidden shrink-0"
              style={{ width: `${width}%`, backgroundColor: color.bg }}
            >
              <span
                className="text-[10px] font-bold truncate px-1"
                style={{ color: color.text }}
              >
                {shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ASSESSMENT_OPTIONS = [
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

// ─── Step definitions ─────────────────────────────────────────────────────────

type StepId =
  | "sites"
  | "windows"
  | "dates"
  | "assessment"
  | "students";

const STEP_DEFS: Record<
  StepId,
  {
    label: string;
    desc: string;
    icon: React.ElementType;
    title: string;
    subtitle: string;
  }
> = {
  sites: {
    label: "Site Selection",
    desc: "Choose which sites follow this schedule",
    icon: Building2,
    title: "Site Selection",
    subtitle:
      "Choose which sites should follow this override schedule.",
  },
  windows: {
    label: "Rating Windows",
    desc: "Choose how many windows per year",
    icon: CalendarClock,
    title: "Rating Windows",
    subtitle:
      "Each period is called a rating window — you'll see this term throughout your reports and data filters. Choose based on your school's calendar and how often you want to track progress.",
  },
  dates: {
    label: "Window Dates",
    desc: "Set the start date for each window",
    icon: Calendar,
    title: "Window Start Dates",
    subtitle:
      "Set the opening date for each rating window. These dates determine when teachers can begin submitting assessments for that period.",
  },
  assessment: {
    label: "Teacher Assessments",
    desc: "Configure assessment per window",
    icon: ClipboardList,
    title: "Teacher Completed Assessments",
    subtitle:
      "Choose the assessment type for each rating window. Each window can use a different form, and screener windows can automatically escalate students who score below a threshold.",
  },
  students: {
    label: "Student Assessments",
    desc: "Configure student self-report access",
    icon: Users,
    title: "Student Completed Assessments",
    subtitle:
      "If your program has enabled student completed assessments, they will automatically be available for students to complete unless you de-activate them.",
  },
};

// ─── Mock / last-year data ────────────────────────────────────────────────────

const LAST_YEAR = {
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

const MOCK_SITES = [
  "Lincoln Elementary",
  "Roosevelt Middle",
  "Washington High",
  "Jefferson Elementary",
  "Adams Middle",
  "Madison High",
  "Monroe Elementary",
];

const SITES_IN_OTHER_OVERRIDES: Record<string, string> = {};

// ─── Shared modals (identical to /edit) ───────────────────────────────────────

function ReviewPanel({
  windowCount, dates, labels, assessment, conditionalAssignment, tScore, resetBehavior,
  sameConfigAllWindows, windowConfigs, siteLeaderManage, isOverride, onBack, onGoToStep, onSave, saving,
}: {
  windowCount: number; dates: string[]; labels: string[]; assessment: "screener" | "full";
  conditionalAssignment: boolean; tScore: string; resetBehavior: "rescreen" | "skip";
  sameConfigAllWindows: boolean; windowConfigs: WindowConfig[]; siteLeaderManage: boolean; isOverride: boolean;
  onBack: () => void; onGoToStep: (stepId: StepId) => void; onSave: () => void; saving?: boolean;
}) {
  const windowDesc = WINDOW_OPTIONS.find((o) => o.count === windowCount)!.desc;
  const row = (label: string, value: React.ReactNode) => (
    <div key={label} className="flex flex-col gap-1 py-2.5 border-b border-[#f0f4f8] last:border-0">
      <span className="text-[12px] font-medium text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-700">{value}</span>
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onBack} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#e8ecf0]">
          <div>
            <h2 className="text-[24px] font-bold text-gray-900">
              Review your setup
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-gray-500">2025–2026 School Year</p>
              {isOverride && (
                <span className="text-[11px] font-semibold text-[#1a4e8a] bg-[#eef2f8] border border-[#c7d7ee] rounded-full px-2 py-0.5">
                  Custom schedule
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-8 py-6 overflow-y-auto max-h-[75vh] space-y-4 bg-[#f8fafc]">
          <div className="border border-[#e8ecf0] rounded-xl p-5 bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[18px] font-semibold text-gray-800">Rating Windows</p>
              <button onClick={() => onGoToStep("windows")} className="text-[13px] font-semibold text-[#1a4e8a] hover:underline cursor-pointer">Edit</button>
            </div>
            {row("Schedule", `${windowCount} windows — ${windowDesc}`)}
            <div className="mt-4 mb-3">
              <WizardTimeline dates={dates} labels={labels} />
            </div>
            <div className="flex justify-between pt-1">
              {dates.map((d, i) => (
                <div key={i} className={`flex flex-col gap-1 flex-1 ${i === dates.length - 1 ? "items-end" : ""}`}>
                  <span className="text-[12px] font-medium text-gray-400">{labels[i]}</span>
                  <span className="text-sm font-semibold text-gray-700">{d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[#e8ecf0] rounded-xl p-5 bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[18px] font-semibold text-gray-800">Teacher Completed Assessments</p>
              <button onClick={() => onGoToStep("assessment")} className="text-[13px] font-semibold text-[#1a4e8a] hover:underline cursor-pointer">Edit</button>
            </div>
            {windowConfigs.map((wc, i) => {
              const wLabel = labels[i];
              const typeLabel = wc.assessment === "screener" ? "Screener" : "Full Assessment";
              const threshold = wc.assessment === "screener" && wc.conditionalAssignment ? ` · Auto-assigns full DESSA when screener score is ${wc.tScore} or below` : wc.assessment === "screener" ? " · No auto-assignment" : "";
              return row(wLabel, `${typeLabel}${threshold}`);
            })}
          </div>
          <div className="border border-[#e8ecf0] rounded-xl p-5 bg-white">
            <p className="text-[18px] font-semibold text-gray-800 mb-2">Student Completed Assessments</p>
            <div className="flex items-center gap-2 py-2 text-sm text-gray-700">
              {siteLeaderManage
                ? <Check size={14} className="text-green-600 shrink-0" strokeWidth={2.5} />
                : <Ban size={14} className="text-gray-400 shrink-0" strokeWidth={1.75} />
              }
              <span>
                {siteLeaderManage
                  ? "Site Leaders can control when students access their assessments"
                  : "Student assessments open automatically at the start of each rating window"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-8 py-5 bg-[#f8fafc] border-t border-[#e8ecf0]">
          <button onClick={onBack} className="h-9 px-4 rounded-lg border border-[#d1d5db] text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
            Back to Edit
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="h-9 px-5 rounded-lg bg-[#1a4e8a] text-white text-sm font-semibold hover:bg-[#15407a] transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Setup"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  onDiscard,
  onKeep,
}: {
  onDiscard: () => void;
  onKeep: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onKeep} />
      <div className="relative bg-white rounded-xl border border-[#e8ecf0] shadow-xl p-6 w-[400px]">
        <h2 className="text-[16px] font-bold text-gray-900 mb-2">
          Discard changes?
        </h2>
        <p className="text-[14px] text-gray-500 mb-6">
          You have unsaved changes. If you leave now they will be lost.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onKeep}
            className="h-9 px-4 rounded-lg border border-[#d1d5db] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Keep Editing
          </button>
          <button
            onClick={onDiscard}
            className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function LastYearModal({
  onClose,
  onUse,
}: {
  onClose: () => void;
  onUse: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[680px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e8ecf0]">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900">
              Last Year's Setup
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {LAST_YEAR.year} School Year
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Rating Windows
            </p>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {LAST_YEAR.windowCount} windows — {LAST_YEAR.windowDesc}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {LAST_YEAR.windows.map((w) => (
                <div
                  key={w.label}
                  className="bg-[#f8fafc] rounded-lg px-3 py-2.5 border border-[#edf0f4]"
                >
                  <p className="text-sm font-semibold text-gray-400 mb-0.5">
                    {w.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {w.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-[#f0f4f8] pt-5">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Teacher Completed Assessments
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[14px] font-semibold text-gray-700">
                  Type
                </span>
                <span className="text-[14px] text-gray-500">
                  {LAST_YEAR.assessment} ({LAST_YEAR.assessmentDesc})
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[14px] font-semibold text-gray-700">
                  Conditional T-Score
                </span>
                <span className="text-[14px] text-gray-500">
                  ≤ {LAST_YEAR.tScore}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-[#f0f4f8] pt-5">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Student Completed Assessments
            </p>
            <div className="flex justify-between items-baseline">
              <span className="text-[14px] font-semibold text-gray-700">
                Site Leader management
              </span>
              <span className="text-[14px] text-gray-500">
                {LAST_YEAR.siteLeaderManage ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-t border-[#e8ecf0]">
          <p className="text-sm text-gray-400">
            Applying this will replace your current selections.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-[#d1d5db] text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={onUse}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1a4e8a] text-white text-sm font-semibold hover:bg-[#15407a] transition-colors cursor-pointer"
            >
              <CheckCircle2 size={14} strokeWidth={2} />
              Use Last Year's Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function EditSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOverride = searchParams.get("override") === "true";
  const existingId = searchParams.get("id");
  const fromPastYear = searchParams.get("fromPastYear") === "true";
  const supabase = createClient();

  // Override-specific state
  const [overrideName, setOverrideName] = useState("");
  const [selectedSites, setSelectedSites] = useState<string[]>([]);

  // Form state
  const [windowCount, setWindowCount] = useState(DEFAULT_STATE.windowCount);
  const [dates, setDates] = useState<string[]>(DEFAULT_STATE.dates);
  const [assessment, setAssessment] = useState<"screener" | "full">(
    DEFAULT_STATE.assessment,
  );
  const [conditionalAssignment, setConditionalAssignment] = useState(
    DEFAULT_STATE.conditionalAssignment,
  );
  const [tScore, setTScore] = useState(DEFAULT_STATE.tScore);
  const [resetBehavior, setResetBehavior] = useState<"rescreen" | "skip">(
    DEFAULT_STATE.resetBehavior,
  );
  const [sameConfigAllWindows, setSameConfigAllWindows] = useState(
    DEFAULT_STATE.sameConfigAllWindows,
  );
  const [windowConfigs, setWindowConfigs] = useState<WindowConfig[]>(
    DEFAULT_STATE.windowConfigs,
  );
  const [siteLeaderManage, setSiteLeaderManage] = useState(
    DEFAULT_STATE.siteLeaderManage,
  );

  // UI state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLastYear, setShowLastYear] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initialStateRef = useRef({
    ...DEFAULT_STATE,
    overrideName: "",
    selectedSites: [] as string[],
  });

  // ─── Apply past year on mount ──────────────────────────────────────────────

  useEffect(() => {
    if (!fromPastYear) return;
    setWindowCount(LAST_YEAR.windowCount);
    setDates(LAST_YEAR.windows.map((w) => w.iso));
    setWindowConfigs(
      Array(LAST_YEAR.windowCount).fill(null).map(() => ({
        assessment: "screener" as const,
        conditionalAssignment: LAST_YEAR.conditionalAssignment,
        tScore: LAST_YEAR.tScore,
        resetBehavior: LAST_YEAR.resetEachWindow ? "rescreen" as const : "skip" as const,
      }))
    );
    setSiteLeaderManage(LAST_YEAR.siteLeaderManage);
    setShowReview(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Load existing setup ───────────────────────────────────────────────────

  useEffect(() => {
    if (!existingId) return;
    async function load() {
      const { data: raw } = await supabase
        .from("yearly_setups")
        .select("*, yearly_setup_sites(*), yearly_setup_window_configs(*)")
        .eq("id", existingId!)
        .single();
      if (!raw) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = raw as any;
      const loadedConfigs = [...Array(data.window_count)].map((_, i) => {
        const wc = data.yearly_setup_window_configs?.find(
          (c: { window_index: number }) => c.window_index === i,
        );
        return wc
          ? {
              assessment: (wc.assessment_type ?? data.assessment_type ?? "screener") as "screener" | "full",
              conditionalAssignment: wc.conditional_assignment,
              tScore: wc.t_score,
              resetBehavior: wc.reset_behavior as "rescreen" | "skip",
            }
          : { ...DEFAULT_WINDOW_CONFIG, assessment: (data.assessment_type ?? "screener") as "screener" | "full" };
      });
      const loadedSites =
        data.yearly_setup_sites?.map(
          (s: { site_name: string }) => s.site_name,
        ) ?? [];
      const loadedOverrideName = data.group_name ?? "";
      setWindowCount(data.window_count);
      setDates(data.dates);
      setAssessment(data.assessment_type as "screener" | "full");
      setConditionalAssignment(data.conditional_assignment);
      setTScore(data.t_score);
      setResetBehavior(data.reset_behavior as "rescreen" | "skip");
      setSameConfigAllWindows(data.same_config_all_windows);
      setSiteLeaderManage(data.site_leader_manage);
      setWindowConfigs(loadedConfigs);
      setSelectedSites(loadedSites);
      setOverrideName(loadedOverrideName);
      initialStateRef.current = {
        windowCount: data.window_count,
        dates: data.dates,
        assessment: data.assessment_type as "screener" | "full",
        conditionalAssignment: data.conditional_assignment,
        tScore: data.t_score,
        resetBehavior: data.reset_behavior as "rescreen" | "skip",
        sameConfigAllWindows: data.same_config_all_windows,
        windowConfigs: loadedConfigs,
        siteLeaderManage: data.site_leader_manage,
        overrideName: loadedOverrideName,
        selectedSites: loadedSites,
      };
    }
    load();
  }, [existingId]);

  // ─── Save ──────────────────────────────────────────────────────────────────

  const saveToSupabase = async () => {
    setSaving(true);
    const derivedAssessment = windowConfigs.some((wc) => wc.assessment === "screener") ? "screener" : "full";
    const payload = {
      is_default: !isOverride,
      group_name: isOverride ? overrideName || null : null,
      year: "2025-2026",
      window_count: windowCount,
      dates,
      assessment_type: derivedAssessment,
      conditional_assignment: windowConfigs.some((wc) => wc.conditionalAssignment),
      t_score: windowConfigs[0]?.tScore ?? tScore,
      reset_behavior: windowConfigs[0]?.resetBehavior ?? resetBehavior,
      same_config_all_windows: false,
      site_leader_manage: siteLeaderManage,
    };
    let setupId = existingId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    if (existingId) {
      await db
        .from("yearly_setups")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", existingId);
    } else {
      const { data } = await db
        .from("yearly_setups")
        .insert(payload)
        .select("id")
        .single();
      setupId = data?.id ?? null;
    }
    if (setupId) {
      if (isOverride) {
        await db.from("yearly_setup_sites").delete().eq("setup_id", setupId);
        if (selectedSites.length) {
          await db.from("yearly_setup_sites").insert(
            selectedSites.map((s: string) => ({
              setup_id: setupId,
              site_name: s,
            })),
          );
        }
      }
      await db
        .from("yearly_setup_window_configs")
        .delete()
        .eq("setup_id", setupId);
      await db.from("yearly_setup_window_configs").insert(
        windowConfigs.map((wc, i) => ({
          setup_id: setupId,
          window_index: i,
          conditional_assignment: wc.conditionalAssignment,
          t_score: wc.tScore,
          reset_behavior: wc.resetBehavior,
        })),
      );
    }
    setSaving(false);
  };

  // ─── Derived state ─────────────────────────────────────────────────────────

  const initial = initialStateRef.current;
  const isDirty =
    windowCount !== initial.windowCount ||
    JSON.stringify(dates) !== JSON.stringify(initial.dates) ||
    JSON.stringify(windowConfigs) !== JSON.stringify(initial.windowConfigs) ||
    siteLeaderManage !== initial.siteLeaderManage ||
    overrideName !== initial.overrideName ||
    JSON.stringify([...selectedSites].sort()) !==
      JSON.stringify([...initial.selectedSites].sort());

  const getStepSequence = (): StepId[] => {
    const seq: StepId[] = [];
    if (isOverride) seq.push("sites");
    seq.push("windows", "dates", "assessment", "students");
    return seq;
  };

  const stepSequence = getStepSequence();
  const currentStepId = stepSequence[currentStepIndex];
  const totalSteps = stepSequence.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const visibleSteps = stepSequence.map((id) => ({ id, ...STEP_DEFS[id] }));
  const currentStepDef = STEP_DEFS[currentStepId];
  const labels = WINDOW_OPTIONS.find((o) => o.count === windowCount)!.labels;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCancel = () => {
    if (isDirty) setShowConfirm(true);
    else router.push("/settings/yearly-setup");
  };

  const handleNext = () => {
    if (isLastStep) setShowReview(true);
    else setCurrentStepIndex((i) => i + 1);
  };

  const handlePrev = () => setCurrentStepIndex((i) => i - 1);

  const handleDelete = async () => {
    if (!existingId) return;
    setDeleting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    await db
      .from("yearly_setup_window_configs")
      .delete()
      .eq("setup_id", existingId);
    await db.from("yearly_setup_sites").delete().eq("setup_id", existingId);
    await db.from("yearly_setups").delete().eq("id", existingId);
    setDeleting(false);
    router.push("/settings/yearly-setup");
  };

  const handleCountChange = (count: number) => {
    setWindowCount(count);
    setDates(DEFAULT_DATES[count]);
    setWindowConfigs((prev) => {
      if (count > prev.length)
        return [
          ...prev,
          ...Array(count - prev.length)
            .fill(null)
            .map(() => ({ ...DEFAULT_WINDOW_CONFIG })),
        ];
      return prev.slice(0, count);
    });
  };

  const updateWindowConfig = (i: number, patch: Partial<WindowConfig>) =>
    setWindowConfigs((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    );

  const updateDate = (i: number, date: string) =>
    setDates(dates.map((d, idx) => (idx === i ? date : d)));

  const toggleSite = (site: string) => {
    setSelectedSites((prev) =>
      prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site],
    );
  };

  const applyLastYear = () => {
    setWindowCount(LAST_YEAR.windowCount);
    setDates(LAST_YEAR.windows.map((w) => w.iso));
    setAssessment("screener");
    setConditionalAssignment(LAST_YEAR.conditionalAssignment);
    setTScore(LAST_YEAR.tScore);
    setResetBehavior(LAST_YEAR.resetEachWindow ? "rescreen" : "skip");
    setSiteLeaderManage(LAST_YEAR.siteLeaderManage);
    setWindowConfigs(
      Array(LAST_YEAR.windowCount).fill(null).map(() => ({
        assessment: "screener" as const,
        conditionalAssignment: LAST_YEAR.conditionalAssignment,
        tScore: LAST_YEAR.tScore,
        resetBehavior: LAST_YEAR.resetEachWindow ? "rescreen" as const : "skip" as const,
      })),
    );
    setShowLastYear(false);
  };

  // ─── Step content ──────────────────────────────────────────────────────────

  const renderStepContent = () => {
    switch (currentStepId) {
      case "sites":
        return (
          <div className="space-y-8">
            <div>
              <p className="text-[14px] font-semibold text-gray-800 mb-1">
                Which sites should follow this schedule?
              </p>
              <p className="text-sm text-gray-500 mb-3">
                Select one or more sites.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {MOCK_SITES.filter((site) => !SITES_IN_OTHER_OVERRIDES[site] || selectedSites.includes(site)).map((site) => {
                  const isSelected = selectedSites.includes(site);
                  return (
                    <button
                      key={site}
                      onClick={() => toggleSite(site)}
                      className={`text-left rounded-xl border px-4 py-2.5 transition-all cursor-pointer ${isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}
                    >
                      <span className={`text-sm font-semibold ${isSelected ? "text-[#1a4e8a]" : "text-gray-800"}`}>
                        {site}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-gray-800 mb-1">
                {selectedSites.length > 0
                  ? `Name this group of ${selectedSites.length} ${selectedSites.length === 1 ? "site" : "sites"}`
                  : "Name this group"}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                This name will appear in your Custom Schedules list.
              </p>
              <input
                type="text"
                value={overrideName}
                onChange={(e) => setOverrideName(e.target.value)}
                placeholder="e.g. Downtown Sites, North Region"
                className="w-80 h-9 px-3 border border-[#d1d5db] rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0]"
              />
            </div>
          </div>
        );

      case "windows":
        return (
          <div className="grid grid-cols-5 gap-2">
            {WINDOW_OPTIONS.map(({ count, desc }) => {
              const isSelected = windowCount === count;
              return (
                <button
                  key={count}
                  onClick={() => handleCountChange(count)}
                  className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-[18px] font-bold ${isSelected ? "bg-[#1a4e8a] text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    {count}
                  </div>
                  <p className={`text-base font-semibold mb-1 leading-snug ${isSelected ? "text-[#1a4e8a]" : "text-gray-600"}`}>
                    {count === 1 ? "1 Window" : `${count} Windows`}
                  </p>
                  <p className="text-sm text-gray-500 leading-snug">{desc}</p>
                </button>
              );
            })}
          </div>
        );

      case "dates":
        return (
          <div className="space-y-16">
            <div>
              <div className="flex flex-wrap gap-6">
                {dates.map((date, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1"
                    style={{ width: 140 }}
                  >
                    <label className="text-[13px] font-semibold text-gray-700">
                      {labels[i]}
                    </label>
                    <DatePicker
                      value={date}
                      onChange={(v) => updateDate(i, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                padding: 12,
                backgroundColor: "white",
                border: "1px solid #dbdbdb",
                borderRadius: 12,
              }}
            >
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {searchParams.get("year")?.replace("-", "–") ?? "2025–2026"}
              </p>
              <p className="text-[20px] font-semibold text-gray-800 mb-1">
                Year at a Glance
              </p>
              <p className="text-[13.5px] text-gray-500 mb-3">
                A preview of your rating windows across the school year
              </p>
              <WizardTimeline dates={dates} labels={labels} />
            </div>
          </div>
        );

      case "assessment": {
        const perWindowCard = (cfg: WindowConfig, i: number) => {
          const color = BAND_COLORS[i % BAND_COLORS.length];
          return (
            <div key={i} className="rounded-xl border border-[#e8ecf0] bg-white overflow-hidden">
              <div className="flex items-center justify-between gap-2.5 px-5 py-3.5 border-b border-[#f0f4f8]" style={{ borderLeftWidth: 4, borderLeftColor: color.text, borderLeftStyle: "solid", backgroundColor: color.text + "14" }}>
                <p className="text-[18px] font-bold text-gray-800">{labels[i]}</p>
                <span className="text-sm text-gray-500">
                  {dates[i] ? `Opens ${new Date(dates[i] + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "—"}
                </span>
              </div>
              <div className="px-5 py-4 space-y-4">
                {/* Assessment type + Q1 — grouped container */}
                <div className="bg-[#f8fafc] rounded-xl border border-[#e8ecf0] overflow-hidden">
                  <div className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Starting Assessment type</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {ASSESSMENT_OPTIONS.map(({ value, icon: Icon, label, desc }) => {
                        const isSelected = cfg.assessment === value;
                        return (
                          <button
                            key={value}
                            onClick={() => updateWindowConfig(i, { assessment: value as "screener" | "full" })}
                            className={`text-left rounded-xl border p-3.5 transition-all cursor-pointer ${isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${isSelected ? "bg-[#1a4e8a]" : "bg-gray-100"}`}>
                              <Icon size={15} className={isSelected ? "text-white" : "text-gray-500"} strokeWidth={1.75} />
                            </div>
                            <p className={`text-sm font-semibold mb-0.5 ${isSelected ? "text-[#1a4e8a]" : "text-gray-600"}`}>{label}</p>
                            <p className="text-xs text-gray-500 leading-snug">{desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {cfg.assessment === "screener" && (
                      <motion.div
                        key="q1"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[#e8ecf0] px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <Switch
                              checked={cfg.conditionalAssignment}
                              onCheckedChange={(v) => updateWindowConfig(i, { conditionalAssignment: v })}
                              className="cursor-pointer"
                            />
                            <span className={`text-sm select-none transition-colors ${cfg.conditionalAssignment ? "text-gray-700" : "text-gray-400"}`}>Assign the full DESSA to students scoring at or below a T-Score of</span>
                            <Select
                              value={cfg.tScore}
                              onValueChange={(v) => updateWindowConfig(i, { tScore: v })}
                              disabled={!cfg.conditionalAssignment}
                            >
                              <SelectTrigger className="w-20 h-7 text-sm cursor-pointer bg-white disabled:cursor-not-allowed disabled:opacity-40">
                                <SelectValue render={<span>{cfg.tScore}</span>} />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, idx) => String((idx + 1) * 5)).map((v) => (
                                  <SelectItem key={v} value={v}>{v}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Q2 — previous window context, separate container */}
                <AnimatePresence initial={false}>
                  {cfg.assessment === "screener" && i > 0 && i < windowCount - 1 && (
                    <motion.div
                      key="q2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="bg-[#f8fafc] rounded-xl border border-[#e8ecf0] px-4 py-4">
                        <p className="text-sm font-semibold text-gray-800 mb-0.5">Follow-up assessment</p>
                        <p className="text-[13px] text-gray-500 mb-3">For students who scored below the threshold in the {labels[i - 1]}.</p>
                        <div className="grid grid-cols-2 gap-2">
                          {([
                            { value: "rescreen", icon: Zap, label: "Screener", sublabel: "Start fresh — they may have improved." },
                            { value: "skip", icon: ClipboardList, label: "Full DESSA", sublabel: "Skip straight to the full assessment." },
                          ] as const).map(({ value, icon: Icon, label, sublabel }) => {
                            const isSelected = cfg.resetBehavior === value;
                            return (
                              <button
                                key={value}
                                onClick={() => updateWindowConfig(i, { resetBehavior: value })}
                                className={`text-left rounded-xl border p-3.5 transition-all cursor-pointer ${isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}
                              >
                                <p className={`text-sm font-semibold mb-0.5 ${isSelected ? "text-[#1a4e8a]" : "text-gray-600"}`}>{label}</p>
                                <p className="text-xs text-gray-500 leading-snug">{sublabel}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        };

        return (
          <div className="space-y-6">
            {/* Same settings toggle */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-[#e8ecf0]">
              <Switch
                checked={sameConfigAllWindows}
                onCheckedChange={(same) => {
                  setSameConfigAllWindows(same);
                  if (same) setWindowConfigs((prev) => prev.map(() => ({ ...prev[0] })));
                }}
                className="cursor-pointer shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-gray-700">Same settings for all windows</p>
                <p className="text-[13px] text-gray-500">Use the same assessment type and escalation settings across every window.</p>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {sameConfigAllWindows ? (
                <motion.div key="unified" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <div className="rounded-xl border border-[#e8ecf0] bg-white overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-[#f0f4f8]" style={{ borderLeftWidth: 4, borderLeftColor: "#1a4e8a", borderLeftStyle: "solid", backgroundColor: "#1a4e8a14" }}>
                      <p className="text-[18px] font-bold text-gray-800">All {windowCount} Windows</p>
                    </div>
                    <div className="px-5 py-4 space-y-5">
                      <p className="text-sm font-semibold text-gray-700 mb-2.5">Assessment type</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {ASSESSMENT_OPTIONS.map(({ value, icon: Icon, label, desc }) => {
                          const isSelected = windowConfigs[0].assessment === value;
                          return (
                            <button
                              key={value}
                              onClick={() => setWindowConfigs((prev) => prev.map((c) => ({ ...c, assessment: value as "screener" | "full" })))}
                              className={`text-left rounded-xl border p-3.5 transition-all cursor-pointer ${isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${isSelected ? "bg-[#1a4e8a]" : "bg-gray-100"}`}>
                                <Icon size={15} className={isSelected ? "text-white" : "text-gray-500"} strokeWidth={1.75} />
                              </div>
                              <p className={`text-sm font-semibold mb-0.5 ${isSelected ? "text-[#1a4e8a]" : "text-gray-600"}`}>{label}</p>
                              <p className="text-xs text-gray-500 leading-snug">{desc}</p>
                            </button>
                          );
                        })}
                      </div>
                      <AnimatePresence initial={false}>
                        {windowConfigs[0].assessment === "screener" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-[#f0f4f8] pt-4">
                              <div className="bg-[#f8fafc] rounded-xl border border-[#e8ecf0] px-4 py-4">
                                <p className="text-sm font-semibold text-gray-700 mb-0.5">Conditional escalation</p>
                                <p className="text-[13px] text-gray-500 mb-3">Automatically assign the full DESSA to students who score at or below a T-Score threshold.</p>
                                <div className="flex items-center gap-2.5">
                                  <Select
                                    value={windowConfigs[0].conditionalAssignment ? "yes" : "no"}
                                    onValueChange={(v) => setWindowConfigs((prev) => prev.map((c) => ({ ...c, conditionalAssignment: v === "yes" })))}
                                  >
                                    <SelectTrigger className="w-24 cursor-pointer">
                                      <SelectValue render={<span>{windowConfigs[0].conditionalAssignment ? "Yes" : "No"}</span>} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes</SelectItem>
                                      <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {windowConfigs[0].conditionalAssignment && (
                                    <>
                                      <span className="text-[13px] text-gray-400 whitespace-nowrap">at T-Score ≤</span>
                                      <Select
                                        value={windowConfigs[0].tScore}
                                        onValueChange={(v) => setWindowConfigs((prev) => prev.map((c) => ({ ...c, tScore: v })))}
                                      >
                                        <SelectTrigger className="w-20 cursor-pointer">
                                          <SelectValue render={<span>{windowConfigs[0].tScore}</span>} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: 12 }, (_, idx) => String((idx + 1) * 5)).map((v) => (
                                            <SelectItem key={v} value={v}>{v}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="per-window" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-16">
                  {windowConfigs.map((cfg, i) => perWindowCard(cfg, i))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }

      case "students":
        return (
          <div className="space-y-8">
            {/* <Alert className="border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-[#4a5c9c]">
              <Info />
              <AlertTitle className="text-[#132d78]">About this setting</AlertTitle>
              <AlertDescription className="text-[#132d78] opacity-80">
                When Site Leaders control access, students can only submit assessments during open rating windows, keeping your data clean and tied to the right time period.
              </AlertDescription>
            </Alert> */}
            <div>
            <p className="text-[16px] font-semibold text-gray-800 mb-1">Should Site Leaders be able to control when students can access their assessments?</p>
            <p className="text-base text-gray-500 mb-5">This gives Site Leaders control over when students can access their self-assessment within a rating window.</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: true, icon: Check, label: "Yes", sublabel: "Site Leaders can open and close student access at their sites independently." },
                { value: false, icon: Ban, label: "No", sublabel: "Student assessments open automatically at the start of each rating window." },
              ] as const).map(({ value, icon: Icon, label, sublabel }) => (
                <button key={String(value)} onClick={() => setSiteLeaderManage(value)}
                  className={`text-left rounded-xl border px-4 py-3 transition-all cursor-pointer ${siteLeaderManage === value ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={16} className={siteLeaderManage === value ? "text-[#1a4e8a]" : "text-gray-400"} strokeWidth={2} />
                    <p className={`text-base font-semibold ${siteLeaderManage === value ? "text-[#1a4e8a]" : "text-gray-600"}`}>{label}</p>
                  </div>
                  <p className="text-base text-gray-500 leading-snug">{sublabel}</p>
                </button>
              ))}
            </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Modals */}
      {showConfirm && (
        <ConfirmModal
          onDiscard={() => router.push("/settings/yearly-setup")}
          onKeep={() => setShowConfirm(false)}
        />
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white rounded-xl border border-[#e8ecf0] shadow-xl p-6 w-[400px]">
            <h2 className="text-[16px] font-bold text-gray-900 mb-2">
              Delete this setup?
            </h2>
            <p className="text-[14px] text-gray-500 mb-6">
              All data for this setup will be permanently deleted. This cannot
              be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="h-9 px-4 rounded-lg border border-[#d1d5db] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete Setup"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showReview && (
        <ReviewPanel
          windowCount={windowCount}
          dates={dates}
          labels={labels}
          assessment={assessment}
          conditionalAssignment={conditionalAssignment}
          tScore={tScore}
          resetBehavior={resetBehavior}
          sameConfigAllWindows={sameConfigAllWindows}
          windowConfigs={windowConfigs}
          siteLeaderManage={siteLeaderManage}
          isOverride={isOverride}
          onBack={() => setShowReview(false)}
          onGoToStep={(stepId) => { setShowReview(false); setCurrentStepIndex(stepSequence.indexOf(stepId)); }}
          onSave={async () => {
            await saveToSupabase();
            setShowReview(false);
            toast.custom((t) => (
              <SuccessToast
                id={t}
                title="Setup saved"
                description="Don't forget to configure rating window reminder emails."
                actionLabel="Set reminders"
                onAction={() =>
                  router.push("/settings/rating-window-reminders")
                }
              />
            ));
            router.push("/settings/yearly-setup");
          }}
          saving={saving}
        />
      )}
      {showLastYear && (
        <LastYearModal
          onClose={() => setShowLastYear(false)}
          onUse={applyLastYear}
        />
      )}

      {/* Two-column body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Right panel — step content */}
        <main className="flex-1 overflow-y-auto bg-[#fcfcfc]">
          <div className="max-w-[800px] mx-auto py-8">
            <p className="text-[12px] font-bold text-[#1a4e8a] uppercase tracking-widest mb-4">
              Step {currentStepIndex + 1} of {totalSteps}
            </p>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
                {currentStepDef.title}
              </h1>
              {currentStepId === "dates" && (
                <span className="shrink-0 text-[12px] font-medium text-[#1a4e8a] bg-[#1676b712] border border-[#c7d7ee] rounded-md px-2 py-1">
                  {windowCount} {windowCount === 1 ? "window" : "windows"}{" "}
                  selected
                </span>
              )}
            </div>
            {currentStepId !== "students" && (
              <p className="text-[16px] text-gray-500 mb-10 leading-relaxed max-w-[750px]">
                {currentStepDef.subtitle}
              </p>
            )}
            {renderStepContent()}

            {/* Step footer */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#f0f4f8]">
              <div className="flex items-center gap-4">
                {!isFirstStep ? (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1.5 text-[13.5px] font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} strokeWidth={2} />
                    Back
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    className="text-[13px] font-medium text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                {existingId && isFirstStep && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-[13px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Delete Setup
                  </button>
                )}
              </div>
              <button
                onClick={handleNext}
                className="h-10 px-7 rounded-lg bg-[#1a4e8a] text-white text-[13.5px] font-semibold hover:bg-[#15407a] transition-colors cursor-pointer"
              >
                {isLastStep ? "Review & Save" : "Save and continue"}
              </button>
            </div>
          </div>
        </main>

        {/* Right panel — step list */}
        <aside className="w-[300px] shrink-0 bg-[#f8fafc] border-l border-[#e8ecf0] px-8 py-10 overflow-y-auto">
          {visibleSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const isLast = idx === visibleSteps.length - 1;
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex gap-4 -mx-4 px-4 rounded-xl transition-colors duration-150 ${isCompleted ? "cursor-pointer group hover:bg-[#e8f0f9]" : ""}`}
                onClick={
                  isCompleted ? () => setCurrentStepIndex(idx) : undefined
                }
              >
                {/* Circle + connector */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    animate={{
                      backgroundColor:
                        isCompleted || isActive ? "#1a4e8a" : "#e8ecf0",
                      scale: isActive ? [1, 1.14, 1] : 1,
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isCompleted ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <Check
                            size={15}
                            className="text-white"
                            strokeWidth={2.5}
                          />
                        </motion.span>
                      ) : (
                        <motion.span
                          key={step.id}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <Icon
                            size={15}
                            className={
                              isActive ? "text-white" : "text-gray-400"
                            }
                            strokeWidth={1.75}
                          />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  {!isLast && (
                    <motion.div
                      className="w-px my-2"
                      animate={{
                        backgroundColor: isCompleted ? "#1a4e8a" : "#d1d9e0",
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      style={{ height: 44 }}
                    />
                  )}
                </div>
                {/* Text */}
                <div
                  className={!isLast ? "pb-[44px]" : ""}
                  style={{ paddingTop: 6 }}
                >
                  <p
                    className={`text-[13.5px] font-semibold leading-snug transition-colors duration-200 ${isActive ? "text-gray-900" : isCompleted ? "text-gray-600 group-hover:text-gray-900" : "text-gray-400"}`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`text-[12px] mt-0.5 leading-snug transition-colors duration-200 ${isActive ? "text-gray-400" : isCompleted ? "text-gray-400 group-hover:text-gray-500" : "text-gray-300"}`}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </aside>
      </div>
    </div>
  );
}

export default function EditSetupPageWrapper() {
  return (
    <Suspense>
      <EditSetupPage />
    </Suspense>
  );
}
