"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
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

const TSCORE_RANGES = [
  { label: "Need for Instruction", value: "≤ 40", bg: "#fecaca", text: "#b91c1c", flex: 2 },
  { label: "Typical",              value: "41–59", bg: "#dbeafe", text: "#1e40af", flex: 3 },
  { label: "Strength",             value: "≥ 60",  bg: "#dcfce7", text: "#166534", flex: 2 },
];

function TScoreInfoTooltip() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ bottom: 0, right: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPos({
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(true);
  };

  return (
    <div
      ref={iconRef}
      className="inline-flex items-center cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setOpen(false)}
    >
      <Info size={13} className="text-gray-400" strokeWidth={1.75} />
      {open && (
        <div
          className="fixed w-[260px] bg-white border border-[#e8ecf0] rounded-xl shadow-lg p-4 z-[100]"
          style={{ bottom: pos.bottom, right: pos.right }}
        >
          <p className="text-[12px] font-semibold text-gray-700 mb-3">T-Score ranges</p>
          <div className="h-5 rounded-md overflow-hidden flex mb-3">
            {TSCORE_RANGES.map(({ label, value, bg, text, flex }) => (
              <div key={label} className="flex items-center justify-center" style={{ flex, backgroundColor: bg }}>
                <span className="text-[9px] font-bold" style={{ color: text }}>{value}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {TSCORE_RANGES.map(({ label, value, bg, text }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: bg, border: "1px solid #e5e7eb" }} />
                <span className="text-[12px] text-gray-600 flex-1">{label}</span>
                <span className="text-[12px] font-semibold" style={{ color: text }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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

// ─── Screen definitions ────────────────────────────────────────────────────────

type ScreenDef = {
  id: string;
  title: string;
  subtitle?: string;
  helpTitle?: string;
  helpBody?: React.ReactNode;
};

function buildScreens(
  isOverride: boolean,
  windowCount: number,
  windowConfigs: WindowConfig[],
  labels: string[],
): ScreenDef[] {
  const screens: ScreenDef[] = [];

  if (isOverride) {
    screens.push({
      id: "name",
      title: "What should we call this group?",
      subtitle: "Give this custom schedule a name so Site Leaders and admins can identify it.",
    });
    screens.push({
      id: "sites",
      title: "Which sites are in this group?",
      subtitle: "Select all sites that should follow this custom schedule.",
    });
  }

  screens.push({
    id: "window-count",
    title: "How many rating windows do you need this year?",
    helpTitle: "About Rating Windows",
    helpBody: (
      <div className="space-y-3 text-[14px] text-gray-600 leading-relaxed">
        <p>A rating window is a period during the school year when teachers complete DESSA assessments for their students.</p>
        <p>Most programs use <strong>3 windows</strong> — Pre, Mid, and Post — which lets you track social-emotional growth across the year.</p>
        <p>Choose a number that matches your program&apos;s schedule. You can adjust this in future years.</p>
      </div>
    ),
  });

  for (let i = 0; i < windowCount; i++) {
    screens.push({
      id: `date-${i}`,
      title: `When does ${labels[i]} open?`,
      subtitle: "This is the first day teachers can begin submitting assessments for this window.",
      helpTitle: "About Start Dates",
      helpBody: (
        <div className="space-y-3 text-[14px] text-gray-600 leading-relaxed">
          <p>The start date is when this rating window opens. Once it opens, teachers can begin submitting assessments for students in this period.</p>
          <p>Good choices are dates that align with your school calendar — the start of a semester, after a break, or at the beginning of a grading period.</p>
          <p>Make sure there&apos;s enough time between windows for teachers to complete their assessments.</p>
        </div>
      ),
    });
  }

  for (let i = 0; i < windowCount; i++) {
    screens.push({
      id: `assess-type-${i}`,
      title: `What assessment will teachers use for ${labels[i]}?`,
      helpTitle: "Screener vs. Full Assessment",
      helpBody: (
        <div className="space-y-4 text-[14px] text-gray-600 leading-relaxed">
          <div>
            <p className="font-semibold text-gray-800 mb-1">Screener</p>
            <p>A short, 8-item form that quickly identifies students who may need additional support. Includes the DESSA 2 mini and DESSA HSE-mini.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">Full Assessment</p>
            <p>A comprehensive form measuring eight social-emotional competencies in depth. Includes the DESSA 2 and DESSA HSE.</p>
          </div>
          <p className="text-gray-500 text-[13px]">Many programs use a screener for most windows and only escalate to the full assessment when a student scores below a threshold.</p>
        </div>
      ),
    });

    if (windowConfigs[i]?.assessment === "screener") {
      screens.push({
        id: `assess-escalate-${i}`,
        title: `Should students who score below a threshold in ${labels[i]} automatically receive the full DESSA?`,
        helpTitle: "Auto-Escalation",
        helpBody: (
          <div className="space-y-3 text-[14px] text-gray-600 leading-relaxed">
            <p>When enabled, students who score at or below the T-Score threshold are automatically assigned the full DESSA — no manual review needed by teachers.</p>
            <p>A T-Score of <strong>40 or below</strong> is the standard cutoff for <strong>Need for Instruction</strong>, indicating the student may benefit from targeted social-emotional support.</p>
            <p>You can set the threshold higher or lower based on your program&apos;s criteria.</p>
          </div>
        ),
      });

      if (i < windowCount - 1 && windowConfigs[i + 1]?.assessment === "screener") {
        screens.push({
          id: `assess-handoff-${i}`,
          title: `For students who score below the threshold in ${labels[i]}, how should they begin ${labels[i + 1]}?`,
          helpTitle: "Carrying Over Low Scorers",
          helpBody: (
            <div className="space-y-3 text-[14px] text-gray-600 leading-relaxed">
              <p>When a student scores below the threshold in one window, you decide how they start the next.</p>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Screen again</p>
                <p>They take the screener again. Useful if enough time has passed that their score may have changed.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Full DESSA</p>
                <p>They skip the screener and go straight to the full assessment in the next window.</p>
              </div>
            </div>
          ),
        });
      }
    }
  }

  screens.push({
    id: "students",
    title: "Who controls when students can access their self-assessments?",
    helpTitle: "Student Self-Assessment Access",
    helpBody: (
      <div className="space-y-3 text-[14px] text-gray-600 leading-relaxed">
        <p>The DESSA student self-report lets students rate themselves on social-emotional skills.</p>
        <p>By default, student assessments open automatically when a rating window opens — no extra step needed.</p>
        <p>If you enable Site Leader management, each Site Leader can choose exactly when students at their site can access their self-assessment within the window, giving them more control over timing.</p>
      </div>
    ),
  });

  return screens;
}

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
  windowConfigs, siteLeaderManage, isOverride, onBack, onGoToScreen, onSave, saving,
}: {
  windowCount: number; dates: string[]; labels: string[]; assessment: "screener" | "full";
  conditionalAssignment: boolean; tScore: string; resetBehavior: "rescreen" | "skip";
  windowConfigs: WindowConfig[]; siteLeaderManage: boolean; isOverride: boolean;
  onBack: () => void; onGoToScreen: (screenId: string) => void; onSave: () => void; saving?: boolean;
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
              <button onClick={() => onGoToScreen("window-count")} className="text-[13px] font-semibold text-[#1a4e8a] hover:underline cursor-pointer">Edit</button>
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
              <button onClick={() => onGoToScreen("assess-type-0")} className="text-[13px] font-semibold text-[#1a4e8a] hover:underline cursor-pointer">Edit</button>
            </div>
            {windowConfigs.map((wc, i) => {
              const typeLabel = wc.assessment === "screener" ? "Screener" : "Full DESSA";
              const autoAssign = wc.assessment === "screener" ? (wc.conditionalAssignment ? `Need for Instruction at T-Score ${wc.tScore} or below` : "No") : "Not applicable";
              return (
                <div key={i} className="flex py-2.5 border-b border-[#f0f4f8] last:border-0">
                  <div className="flex flex-col gap-1 w-48 shrink-0">
                    <span className="text-[12px] font-medium text-gray-400">{labels[i]}</span>
                    <span className="text-sm font-medium text-gray-700">{typeLabel}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium text-gray-400">Auto-assign DESSA</span>
                    <span className="text-sm font-medium text-gray-700">{autoAssign}</span>
                  </div>
                </div>
              );
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
                  {LAST_YEAR.tScore} or below
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
  const [windowConfigs, setWindowConfigs] = useState<WindowConfig[]>(
    DEFAULT_STATE.windowConfigs,
  );
  const [siteLeaderManage, setSiteLeaderManage] = useState(
    DEFAULT_STATE.siteLeaderManage,
  );

  // UI state
  const [currentScreenId, setCurrentScreenId] = useState(isOverride ? "name" : "window-count");
  const [helpOpen, setHelpOpen] = useState(false);
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

  const labels = WINDOW_OPTIONS.find((o) => o.count === windowCount)!.labels;
  const screenSequence = useMemo(
    () => buildScreens(isOverride, windowCount, windowConfigs, labels),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOverride, windowCount, JSON.stringify(windowConfigs), labels.join(",")],
  );
  const currentScreenIdx = Math.max(0, screenSequence.findIndex((s) => s.id === currentScreenId));
  const currentScreen = screenSequence[currentScreenIdx] ?? screenSequence[0];
  const totalScreens = screenSequence.length;
  const isFirstScreen = currentScreenIdx === 0;
  const isLastScreen = currentScreenIdx === totalScreens - 1;
  const progress = totalScreens > 0 ? ((currentScreenIdx + 1) / totalScreens) * 100 : 0;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCancel = () => {
    if (isDirty) setShowConfirm(true);
    else router.push("/settings/yearly-setup");
  };

  const currentScreenValid = () => {
    if (currentScreen.id === "name") return overrideName.trim().length > 0;
    if (currentScreen.id === "sites") return selectedSites.length > 0;
    return true;
  };

  const handleNext = () => {
    if (!currentScreenValid()) return;
    if (isLastScreen) { setShowReview(true); return; }
    const next = screenSequence[currentScreenIdx + 1];
    if (next) setCurrentScreenId(next.id);
  };

  const handlePrev = () => {
    const prev = screenSequence[currentScreenIdx - 1];
    if (prev) setCurrentScreenId(prev.id);
  };

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

  // ─── Screen content ────────────────────────────────────────────────────────

  const renderScreenContent = (screenId: string) => {
    // ── Override: group name ───────────────────────────────────────────────
    if (screenId === "name") {
      return (
        <input
          type="text"
          value={overrideName}
          onChange={(e) => setOverrideName(e.target.value)}
          placeholder="e.g. Downtown Sites, North Region"
          className="w-full max-w-sm bg-transparent border-0 border-b-2 border-[#d1d5db] text-[20px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#1565c0] pb-2"
          autoFocus
        />
      );
    }

    // ── Override: site selection ───────────────────────────────────────────
    if (screenId === "sites") {
      return (
        <div className="grid grid-cols-2 gap-2">
          {MOCK_SITES.filter((site) => !SITES_IN_OTHER_OVERRIDES[site] || selectedSites.includes(site)).map((site) => {
            const isSelected = selectedSites.includes(site);
            return (
              <button
                key={site}
                onClick={() => toggleSite(site)}
                className={`flex items-center gap-3 text-left rounded-xl border px-4 py-3 transition-all cursor-pointer ${isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}
              >
                <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${isSelected ? "bg-[#1a4e8a] border-[#1a4e8a]" : "border-gray-300"}`}>
                  {isSelected && (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`text-[14px] font-semibold ${isSelected ? "text-[#1a4e8a]" : "text-gray-800"}`}>{site}</span>
              </button>
            );
          })}
        </div>
      );
    }

    // ── Window count ───────────────────────────────────────────────────────
    if (screenId === "window-count") {
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
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-[18px] font-bold ${isSelected ? "bg-[#1a4e8a] text-white" : "bg-gray-100 text-gray-500"}`}>
                  {count}
                </div>
                <p className={`text-[14px] font-semibold mb-1 leading-snug ${isSelected ? "text-[#1a4e8a]" : "text-gray-600"}`}>
                  {count === 1 ? "1 Window" : `${count} Windows`}
                </p>
                <p className="text-[12px] text-gray-500 leading-snug">{desc}</p>
              </button>
            );
          })}
        </div>
      );
    }

    // ── Date picker (one per window) ──────────────────────────────────────
    const dateMatch = screenId.match(/^date-(\d+)$/);
    if (dateMatch) {
      const i = parseInt(dateMatch[1]);
      return (
        <div className="space-y-10">
          <DatePicker value={dates[i]} onChange={(v) => updateDate(i, v)} />
          {dates.some(Boolean) && (
            <div className="bg-white border border-[#e8ecf0] rounded-xl p-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {searchParams.get("year")?.replace("-", "–") ?? "2025–2026"}
              </p>
              <p className="text-[15px] font-semibold text-gray-800 mb-3">Year at a glance</p>
              <WizardTimeline dates={dates} labels={labels} />
            </div>
          )}
        </div>
      );
    }

    // ── Assessment type (one per window) ──────────────────────────────────
    const assessTypeMatch = screenId.match(/^assess-type-(\d+)$/);
    if (assessTypeMatch) {
      const i = parseInt(assessTypeMatch[1]);
      const cfg = windowConfigs[i];
      return (
        <div className="space-y-3">
          {ASSESSMENT_OPTIONS.map(({ value, icon: Icon, label, desc, summary }) => {
            const isSelected = cfg?.assessment === value;
            return (
              <button
                key={value}
                onClick={() => updateWindowConfig(i, { assessment: value as "screener" | "full" })}
                className={`w-full text-left rounded-xl border-2 p-5 flex items-start gap-4 transition-all cursor-pointer ${isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? "bg-[#1a4e8a]" : "bg-gray-100"}`}>
                  <Icon size={16} className={isSelected ? "text-white" : "text-gray-500"} strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <p className={`text-[15px] font-semibold mb-0.5 ${isSelected ? "text-[#1a4e8a]" : "text-gray-800"}`}>{label}</p>
                  <p className="text-[13px] text-gray-500 leading-snug">{summary}</p>
                  <p className="text-[12px] text-gray-400 mt-1">{desc}</p>
                </div>
                {isSelected && <CheckCircle2 size={18} className="text-[#1a4e8a] shrink-0 mt-0.5" strokeWidth={2} />}
              </button>
            );
          })}
        </div>
      );
    }

    // ── Auto-escalation (screener windows only) ────────────────────────────
    const assessEscalateMatch = screenId.match(/^assess-escalate-(\d+)$/);
    if (assessEscalateMatch) {
      const i = parseInt(assessEscalateMatch[1]);
      const cfg = windowConfigs[i];
      return (
        <div className="space-y-3">
          {([
            { value: true, label: "Yes, auto-assign", desc: "Students scoring below the threshold automatically receive the full DESSA." },
            { value: false, label: "No, skip it", desc: "Teachers will manage escalation manually." },
          ] as const).map(({ value, label, desc }) => {
            const isSelected = cfg?.conditionalAssignment === value;
            return (
              <button
                key={String(value)}
                onClick={() => updateWindowConfig(i, { conditionalAssignment: value })}
                className={`w-full text-left rounded-xl border-2 p-5 flex items-start gap-4 transition-all cursor-pointer ${isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}
              >
                <div className="flex-1">
                  <p className={`text-[15px] font-semibold mb-0.5 ${isSelected ? "text-[#1a4e8a]" : "text-gray-800"}`}>{label}</p>
                  <p className="text-[13px] text-gray-500">{desc}</p>
                </div>
                {isSelected && <CheckCircle2 size={18} className="text-[#1a4e8a] shrink-0 mt-0.5" strokeWidth={2} />}
              </button>
            );
          })}
          <AnimatePresence initial={false}>
            {cfg?.conditionalAssignment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 pt-2 pl-2">
                  <span className="text-[14px] text-gray-600">Assign full DESSA to students scoring at or below T-Score</span>
                  <input
                    type="number"
                    value={cfg.tScore}
                    onChange={(e) => updateWindowConfig(i, { tScore: e.target.value })}
                    className="w-16 h-8 px-2 text-sm text-center border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:border-[#1565c0]"
                  />
                  <TScoreInfoTooltip />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // ── Handoff (low scorers into next screener window) ────────────────────
    const assessHandoffMatch = screenId.match(/^assess-handoff-(\d+)$/);
    if (assessHandoffMatch) {
      const i = parseInt(assessHandoffMatch[1]);
      return (
        <div className="space-y-3">
          {([
            { value: "rescreen" as const, label: "Screen again", desc: `They take the screener again in ${labels[i + 1]}.` },
            { value: "skip" as const, label: "Full DESSA", desc: `They go straight to the full assessment in ${labels[i + 1]}.` },
          ]).map(({ value, label, desc }) => {
            const isSelected = windowConfigs[i + 1]?.resetBehavior === value;
            return (
              <button
                key={value}
                onClick={() => updateWindowConfig(i + 1, { resetBehavior: value })}
                className={`w-full text-left rounded-xl border-2 p-5 flex items-start gap-4 transition-all cursor-pointer ${isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}
              >
                <div className="flex-1">
                  <p className={`text-[15px] font-semibold mb-0.5 ${isSelected ? "text-[#1a4e8a]" : "text-gray-800"}`}>{label}</p>
                  <p className="text-[13px] text-gray-500">{desc}</p>
                </div>
                {isSelected && <CheckCircle2 size={18} className="text-[#1a4e8a] shrink-0 mt-0.5" strokeWidth={2} />}
              </button>
            );
          })}
        </div>
      );
    }

    // ── Students ───────────────────────────────────────────────────────────
    if (screenId === "students") {
      return (
        <div className="space-y-3">
          {([
            { value: false, label: "Automatic", desc: "Student assessments open at the start of each rating window. No extra step needed." },
            { value: true, label: "Site Leader controlled", desc: "Site Leaders choose when students at their site can access their self-assessment within the window." },
          ] as const).map(({ value, label, desc }) => {
            const isSelected = siteLeaderManage === value;
            return (
              <button
                key={String(value)}
                onClick={() => setSiteLeaderManage(value)}
                className={`w-full text-left rounded-xl border-2 p-5 flex items-start gap-4 transition-all cursor-pointer ${isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}
              >
                <div className="flex-1">
                  <p className={`text-[15px] font-semibold mb-0.5 ${isSelected ? "text-[#1a4e8a]" : "text-gray-800"}`}>{label}</p>
                  <p className="text-[13px] text-gray-500">{desc}</p>
                </div>
                {isSelected && <CheckCircle2 size={18} className="text-[#1a4e8a] shrink-0 mt-0.5" strokeWidth={2} />}
              </button>
            );
          })}
        </div>
      );
    }

    return null;
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  // (legacy perWindowCard kept below for reference during transition)
  const _perWindowCard = (cfg: WindowConfig, i: number) => {
          const color = BAND_COLORS[i % BAND_COLORS.length];
          const nextIsScreener = i < windowCount - 1 && windowConfigs[i + 1]?.assessment === "screener";
          return (
            <div key={i} className="rounded-xl border border-[#e8ecf0] bg-white overflow-visible">
              <div className="flex items-center justify-between gap-2.5 px-5 py-3.5 border-b border-[#f0f4f8]" style={{ borderLeftWidth: 4, borderLeftColor: color.text, borderLeftStyle: "solid", backgroundColor: color.text + "14" }}>
                <p className="text-[18px] font-bold text-gray-800">{labels[i]}</p>
                <span className="text-sm text-gray-500">
                  {dates[i] ? `Opens ${new Date(dates[i] + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "—"}
                </span>
              </div>
              <div className="px-5 py-4">
                <div className="bg-[#f8fafc] rounded-xl border border-[#e8ecf0] overflow-visible">
                  <div className="px-4 py-4">
                    <p className="text-base font-semibold text-gray-700 mb-3">Assessment type</p>
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
                            <input
                              type="number"
                              value={cfg.tScore}
                              onChange={(e) => updateWindowConfig(i, { tScore: e.target.value })}
                              disabled={!cfg.conditionalAssignment}
                              className="w-16 h-7 px-2 text-sm text-center border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:border-[#1565c0] disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                            <TScoreInfoTooltip />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Low-scorer handoff — forward-looking, belongs to this window's screener outcome */}
              <AnimatePresence initial={false}>
                {cfg.assessment === "screener" && nextIsScreener && (
                  <motion.div
                    key="handoff"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#c7d7ee] bg-[#f0f6ff] rounded-b-xl px-5 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <ArrowRight size={14} className="text-[#1a4e8a] shrink-0" strokeWidth={2} />
                        <p className="text-sm font-semibold text-gray-800">Students scoring below the threshold</p>
                      </div>
                      <p className="text-[13px] text-gray-500 mb-3 pl-5">
                        How should they begin {labels[i + 1]}?
                      </p>
                      <div className="pl-5 grid grid-cols-2 gap-2">
                        {([
                          { value: "rescreen", label: "Screen again", sublabel: `They take the screener again in ${labels[i + 1]}.` },
                          { value: "skip", label: "Full DESSA", sublabel: `They go straight to the full assessment in ${labels[i + 1]}.` },
                        ] as const).map(({ value, label, sublabel }) => {
                          const isSelected = windowConfigs[i + 1]?.resetBehavior === value;
                          return (
                            <button
                              key={value}
                              onClick={() => updateWindowConfig(i + 1, { resetBehavior: value })}
                              className={`text-left rounded-xl border p-3.5 transition-all cursor-pointer ${isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#c7d7ee] bg-white hover:border-[#a3bfdf]"}`}
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
          );
  };

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
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-xl border border-[#e8ecf0] shadow-xl p-6 w-[400px]">
            <h2 className="text-[16px] font-bold text-gray-900 mb-2">Delete this setup?</h2>
            <p className="text-[14px] text-gray-500 mb-6">All data for this setup will be permanently deleted. This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="h-9 px-4 rounded-lg border border-[#d1d5db] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60">
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
          windowConfigs={windowConfigs}
          siteLeaderManage={siteLeaderManage}
          isOverride={isOverride}
          onBack={() => setShowReview(false)}
          onGoToScreen={(screenId) => { setShowReview(false); setCurrentScreenId(screenId); }}
          onSave={async () => {
            await saveToSupabase();
            setShowReview(false);
            toast.custom((t) => (
              <SuccessToast
                id={t}
                title="Setup saved"
                description="Don't forget to configure rating window reminder emails."
                actionLabel="Set reminders"
                onAction={() => router.push("/settings/rating-window-reminders")}
              />
            ));
            router.push("/settings/yearly-setup");
          }}
          saving={saving}
        />
      )}
      {showLastYear && (
        <LastYearModal onClose={() => setShowLastYear(false)} onUse={applyLastYear} />
      )}

      {/* 60px progress header */}
      <header className="h-[60px] shrink-0 flex items-center gap-5 px-8 border-b border-[#e8ecf0] bg-white">
        <button
          onClick={handleCancel}
          className="text-[13px] font-medium text-gray-400 hover:text-gray-700 transition-colors cursor-pointer shrink-0"
        >
          Cancel
        </button>
        <div className="flex-1 h-1.5 bg-[#e8ecf0] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#1a4e8a] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>
        <span className="text-[13px] text-gray-400 shrink-0 tabular-nums">
          {currentScreenIdx + 1} / {totalScreens}
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[900px] mx-auto px-8 py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="flex items-start justify-between gap-6 mb-3">
                <h1 className="text-[30px] font-medium leading-tight" style={{ color: "#2a2c32" }}>
                  {currentScreen.title}
                </h1>
                {currentScreen.helpTitle && (
                  <button
                    onClick={() => setHelpOpen(true)}
                    className="shrink-0 mt-2 w-7 h-7 rounded-full border border-[#d1d5db] flex items-center justify-center text-gray-400 hover:text-[#1a4e8a] hover:border-[#1a4e8a] transition-colors cursor-pointer"
                  >
                    <HelpCircle size={14} strokeWidth={1.75} />
                  </button>
                )}
              </div>
              {currentScreen.subtitle && (
                <p className="text-[16px] text-gray-500 mb-10 leading-relaxed">
                  {currentScreen.subtitle}
                </p>
              )}
              <div className={currentScreen.subtitle ? "" : "mt-10"}>
                {renderScreenContent(currentScreen.id)}
              </div>

              {/* In-content navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#f0f4f8]">
                {!isFirstScreen ? (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1.5 text-[13.5px] font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} strokeWidth={2} />
                    Back
                  </button>
                ) : currentScreen.id === "window-count" && !fromPastYear ? (
                  <button
                    onClick={() => setShowLastYear(true)}
                    className="text-[13px] text-[#1a4e8a] hover:underline cursor-pointer"
                  >
                    Use last year&apos;s setup →
                  </button>
                ) : (
                  <div />
                )}
                <button
                  onClick={handleNext}
                  disabled={!currentScreenValid()}
                  className="h-10 px-7 rounded-lg bg-[#1a4e8a] text-white text-[13.5px] font-semibold hover:bg-[#15407a] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1a4e8a]"
                >
                  {isLastScreen ? "Review & Save" : "Continue"}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Contextual help slide-out */}
      <AnimatePresence>
        {helpOpen && currentScreen.helpTitle && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHelpOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 bottom-0 w-[400px] bg-white border-l border-[#e8ecf0] shadow-2xl z-50 flex flex-col"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-[#e8ecf0]">
                <h2 className="text-[17px] font-bold text-gray-900">{currentScreen.helpTitle}</h2>
                <button
                  onClick={() => setHelpOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-8 py-6">
                {currentScreen.helpBody}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
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

