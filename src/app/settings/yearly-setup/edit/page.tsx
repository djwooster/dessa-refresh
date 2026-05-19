"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, Zap, ClipboardList, ChevronDown, X, CheckCircle2, CalendarClock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

const WINDOW_OPTIONS = [
  { count: 1, desc: "Annual Assessment",                    labels: ["Annual Assessment"] },
  { count: 2, desc: "Pre & Post Assessment",                labels: ["Pre-Assessment", "Post-Assessment"] },
  { count: 3, desc: "Pre, Mid & Post Assessment",           labels: ["Pre-Assessment", "Mid-Assessment", "Post-Assessment"] },
  { count: 4, desc: "Pre, Mid 1, Mid 2 & Post Assessment",  labels: ["Pre-Assessment", "Mid 1 Assessment", "Mid 2 Assessment", "Post-Assessment"] },
  { count: 5, desc: "Pre, Mid 1, Mid 2, Mid 3 & Post Assessment", labels: ["Pre-Assessment", "Mid 1 Assessment", "Mid 2 Assessment", "Mid 3 Assessment", "Post-Assessment"] },
];

const DEFAULT_DATES: Record<number, string[]> = {
  1: ["2025-08-01"],
  2: ["2025-08-01", "2026-05-28"],
  3: ["2025-08-01", "2026-01-01", "2026-05-28"],
  4: ["2025-08-01", "2025-11-01", "2026-02-01", "2026-05-28"],
  5: ["2025-08-01", "2025-10-01", "2026-01-01", "2026-03-01", "2026-05-28"],
};

const DEFAULT_COUNT = 3;

const DEFAULT_STATE = {
  windowCount: DEFAULT_COUNT,
  dates: DEFAULT_DATES[DEFAULT_COUNT],
  assessment: "screener" as const,
  conditionalAssignment: true,
  tScore: "40",
  resetEachWindow: false,
  siteLeaderManage: false,
};

function ConfirmModal({ onDiscard, onKeep }: { onDiscard: () => void; onKeep: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onKeep} />
      <div className="relative bg-white rounded-xl border border-[#e8ecf0] shadow-xl p-6 w-[400px]">
        <h2 className="text-[16px] font-bold text-gray-900 mb-2">Discard changes?</h2>
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

const LAST_YEAR = {
  year: "2024–2025",
  windowCount: 3,
  windowDesc: "Pre, Mid & Post Assessment",
  windows: [
    { label: "Pre-Assessment",  date: "Aug 1, 2024" },
    { label: "Mid-Assessment",  date: "Jan 1, 2025" },
    { label: "Post-Assessment", date: "May 28, 2025" },
  ],
  assessment: "Screener",
  assessmentDesc: "DESSA 2 mini, DESSA HSE-mini",
  conditionalAssignment: true,
  tScore: "40",
  resetEachWindow: false,
  siteLeaderManage: false,
};

function LastYearModal({
  onClose,
  onUse,
}: {
  onClose: () => void;
  onUse: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[680px] overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e8ecf0]">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900">Last Year's Setup</h2>
            <p className="text-sm text-gray-500 mt-0.5">{LAST_YEAR.year} School Year</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 space-y-5">
          {/* Rating windows */}
          <div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Rating Windows</p>
            <p className="text-sm font-semibold text-gray-700 mb-3">{LAST_YEAR.windowCount} windows — {LAST_YEAR.windowDesc}</p>
            <div className="grid grid-cols-3 gap-3">
              {LAST_YEAR.windows.map((w) => (
                <div key={w.label} className="bg-[#f8fafc] rounded-lg px-3 py-2.5 border border-[#edf0f4]">
                  <p className="text-sm font-semibold text-gray-400 mb-0.5">{w.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{w.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assessments */}
          <div className="border-t border-[#f0f4f8] pt-5">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Teacher Completed Assessments</p>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[14px] font-semibold text-gray-700">Type</span>
                <span className="text-[14px] text-gray-500">{LAST_YEAR.assessment} ({LAST_YEAR.assessmentDesc})</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[14px] font-semibold text-gray-700">Conditional T-Score</span>
                <span className="text-[14px] text-gray-500">≤ {LAST_YEAR.tScore}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[14px] font-semibold text-gray-700">Reset each window</span>
                <span className="text-[14px] text-gray-500">{LAST_YEAR.resetEachWindow ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>

          {/* Student completed assessments */}
          <div className="border-t border-[#f0f4f8] pt-5">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Student Completed Assessments</p>
            <div className="flex justify-between items-baseline">
              <span className="text-[14px] font-semibold text-gray-700">Site Leader management</span>
              <span className="text-[14px] text-gray-500">{LAST_YEAR.siteLeaderManage ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-t border-[#e8ecf0]">
          <p className="text-sm text-gray-400">Applying this will replace your current selections.</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-9 px-4 rounded-lg border border-[#d1d5db] text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
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

function Checkbox({
  checked,
  onChange,
  label,
  sublabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  sublabel?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
          checked ? "bg-[#1a4e8a] border-[#1a4e8a]" : "border-gray-300 group-hover:border-gray-400"
        }`}
      >
        {checked && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div>
        <span className="text-[14px] text-gray-700">{label}</span>
        {sublabel && <p className="text-sm text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </label>
  );
}

export default function EditSetupPage() {
  const router = useRouter();

  const [windowCount, setWindowCount] = useState(DEFAULT_STATE.windowCount);
  const [dates, setDates] = useState<string[]>(DEFAULT_STATE.dates);
  const [assessment, setAssessment] = useState<"screener" | "full">(DEFAULT_STATE.assessment);
  const [conditionalAssignment, setConditionalAssignment] = useState(DEFAULT_STATE.conditionalAssignment);
  const [tScore, setTScore] = useState(DEFAULT_STATE.tScore);
  const [resetEachWindow, setResetEachWindow] = useState(DEFAULT_STATE.resetEachWindow);
  const [siteLeaderManage, setSiteLeaderManage] = useState(DEFAULT_STATE.siteLeaderManage);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLastYear, setShowLastYear] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let el = headerRef.current?.parentElement;
    while (el && el.scrollHeight <= el.clientHeight) {
      el = el.parentElement;
    }
    if (!el) return;
    const handler = () => setScrolled((el as HTMLElement).scrollTop > 0);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el!.removeEventListener("scroll", handler);
  }, []);

  const isDirty =
    windowCount !== DEFAULT_STATE.windowCount ||
    JSON.stringify(dates) !== JSON.stringify(DEFAULT_STATE.dates) ||
    assessment !== DEFAULT_STATE.assessment ||
    conditionalAssignment !== DEFAULT_STATE.conditionalAssignment ||
    tScore !== DEFAULT_STATE.tScore ||
    resetEachWindow !== DEFAULT_STATE.resetEachWindow ||
    siteLeaderManage !== DEFAULT_STATE.siteLeaderManage;

  const applyLastYear = () => {
    setWindowCount(LAST_YEAR.windowCount);
    setDates(LAST_YEAR.windows.map((w) => {
      const [month, day, year] = w.date.split(" ");
      const months: Record<string, string> = { Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12" };
      return `${year}-${months[month]}-${day.replace(",","").padStart(2,"0")}`;
    }));
    setAssessment("screener");
    setConditionalAssignment(LAST_YEAR.conditionalAssignment);
    setTScore(LAST_YEAR.tScore);
    setResetEachWindow(LAST_YEAR.resetEachWindow);
    setSiteLeaderManage(LAST_YEAR.siteLeaderManage);
    setShowLastYear(false);
  };

  const handleBack = () => {
    if (isDirty) setShowConfirm(true);
    else router.back();
  };

  const handleCountChange = (count: number) => {
    setWindowCount(count);
    setDates(DEFAULT_DATES[count]);
  };

  const updateDate = (i: number, date: string) =>
    setDates(dates.map((d, idx) => (idx === i ? date : d)));

  const labels = WINDOW_OPTIONS.find((o) => o.count === windowCount)!.labels;

  return (
    <div>
      {showConfirm && (
        <ConfirmModal
          onDiscard={() => router.back()}
          onKeep={() => setShowConfirm(false)}
        />
      )}
      {showLastYear && (
        <LastYearModal
          onClose={() => setShowLastYear(false)}
          onUse={applyLastYear}
        />
      )}

      {/* Sticky header */}
      <motion.div
        ref={headerRef}
        className="sticky top-0 z-10 px-6"
        animate={{
          paddingTop: scrolled ? 12 : 16,
          paddingBottom: scrolled ? 12 : 16,
          backgroundColor: scrolled ? "#ffffff" : "rgba(255,255,255,0)",
          boxShadow: scrolled ? "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px #e8ecf0" : "0 0px 0px rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <AnimatePresence initial={false}>
          {!scrolled && (
            <motion.button
              key="back"
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors overflow-hidden"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <ArrowLeft size={14} />
              Back to Yearly Setup
            </motion.button>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 mb-0.5">Edit Setup</h1>
            <p className="text-[14px] text-gray-500">2025–2026 School Year</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="h-9 px-4 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success("Setup saved", {
                  description: "Your yearly setup changes have been saved.",
                });
                router.back();
              }}
              className="h-9 px-4 rounded-lg bg-[#1a4e8a] text-white text-sm font-semibold hover:bg-[#15407a] transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>

      {/* Page content */}
      <div className="px-6 pb-6">

      {/* Previous setup banner */}
      <AnimatePresence initial={false}>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 rounded-xl bg-[#eef2f8] border border-[#c7d7ee] px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#1a4e8a] flex items-center justify-center shrink-0">
                  <CalendarClock size={15} className="text-white" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a4e8a]">{LAST_YEAR.year} setup available</p>
                  <p className="text-xs text-[#3a6ea8] mt-0.5">
                    {LAST_YEAR.windowCount} windows &middot; {LAST_YEAR.assessment} &middot;{" "}
                    {LAST_YEAR.windows[0].date} – {LAST_YEAR.windows[LAST_YEAR.windows.length - 1].date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowLastYear(true)}
                  className="h-8 px-3 rounded-lg border border-[#1a4e8a] text-xs font-semibold text-[#1a4e8a] hover:bg-[#dce8f5] transition-colors cursor-pointer"
                >
                  Review &amp; Apply
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#3a6ea8] hover:bg-[#dce8f5] transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Windows */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Rating Windows</h2>
        <p className="text-[14px] text-gray-500 mb-6">
          Set the number of assessment windows and their start dates for this school year.
        </p>

        {/* Window count dropdown */}
        <div className="mb-6 pb-6 border-b border-[#f0f4f8]">
          <p className="text-[14px] font-semibold text-gray-800 mb-3">
            Number of rating windows
          </p>
          <div className="relative w-80">
            <select
              value={windowCount}
              onChange={(e) => handleCountChange(Number(e.target.value))}
              className="w-full h-9 pl-3 pr-8 border border-[#d1d5db] rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0] appearance-none cursor-pointer"
            >
              {WINDOW_OPTIONS.map(({ count, desc }) => (
                <option key={count} value={count}>
                  {count} – ({desc})
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Date fields */}
        <div className="flex gap-6">
          {dates.map((date, i) => (
            <div key={i} className="flex flex-col gap-1 w-44">
              <label className="text-[14px] font-semibold text-gray-900">
                {labels[i]}
              </label>
              <DatePicker value={date} onChange={(v) => updateDate(i, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* Assessments */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Teacher Completed Assessments</h2>

        {/* Assessment type */}
        <div>
          <p className="text-[14px] font-semibold text-gray-800 mb-3">
            Assessment type
          </p>
          {(() => {
            const options = [
              {
                value: "screener",
                icon: Zap,
                label: "Screener",
                desc: "DESSA 2 mini, DESSA HSE-mini",
                summary: "A brief rating form that quickly identifies students who may need additional support.",
                items: ["DESSA 2 mini", "DESSA HSE-mini"],
              },
              {
                value: "full",
                icon: ClipboardList,
                label: "Full Assessment",
                desc: "DESSA 2, DESSA HSE, DESSA Second Step® Assessments",
                summary: "A comprehensive rating form measuring eight social-emotional competencies in depth.",
                items: ["DESSA 2", "DESSA HSE", "DESSA Second Step® Assessments"],
              },
            ];
            const selected = options.find((o) => o.value === assessment);
            return (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {options.map(({ value, icon: Icon, label, desc }) => {
                    const isSelected = assessment === value;
                    return (
                      <button
                        key={value}
                        onClick={() => setAssessment(value as "screener" | "full")}
                        className={`text-left rounded-xl border-2 p-4 transition-all cursor-pointer ${
                          isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${isSelected ? "bg-[#1a4e8a]" : "bg-gray-100"}`}>
                          <Icon size={18} className={isSelected ? "text-white" : "text-gray-500"} strokeWidth={1.75} />
                        </div>
                        <p className={`text-[14px] font-bold mb-1 ${isSelected ? "text-[#1a4e8a]" : "text-gray-900"}`}>{label}</p>
                        <p className="text-sm text-gray-500 leading-snug">{desc}</p>
                      </button>
                    );
                  })}
                </div>
                {selected && (
                  <div className="mt-4 flex items-start gap-3 rounded-lg bg-[#eef2f8] border border-[#c7d7ee] px-4 py-3">
                    <Info size={15} className="text-[#1a4e8a] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1a4e8a] mb-2">{selected.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.items.map((item) => (
                          <span key={item} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1a4e8a] bg-white border border-[#c7d7ee] rounded-full px-2.5 py-1">
                            <svg width="10" height="10" viewBox="0 0 14 14" fill="none" className="shrink-0">
                              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M4.5 7l1.75 1.75L9.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

      </div>

      {/* Conditional assignment */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Conditional Assessment</h2>
        <p className="text-sm text-gray-500 mb-6">
          Automatically follow up a screener with a full assessment for students who score below a threshold.
        </p>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => setConditionalAssignment(!conditionalAssignment)}
              className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center mt-0.5 transition-colors cursor-pointer ${
                conditionalAssignment ? "bg-[#1a4e8a] border-[#1a4e8a]" : "border-gray-300 group-hover:border-gray-400"
              }`}
            >
              {conditionalAssignment && (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div>
              <span className="text-[14px] font-semibold text-gray-800 block mb-1">
                Assign a full assessment when a student scores below the T-Score threshold
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">T-Score threshold</span>
                <input
                  type="number"
                  value={tScore}
                  onChange={(e) => setTScore(e.target.value)}
                  disabled={!conditionalAssignment}
                  className="w-16 h-8 px-2 border border-[#d1d5db] rounded-lg text-sm text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0] disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-500">or below</span>
              </div>
            </div>
          </label>
          <Checkbox
            checked={resetEachWindow}
            onChange={setResetEachWindow}
            label="Start each rating window with a screener"
            sublabel="Students will complete a screener at the start of every window before a full assessment is conditionally assigned."
          />
        </div>
      </div>

      {/* Student Completed Assessments */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Completed Assessments</h2>
        <div className="flex items-start gap-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg px-4 py-3 mb-4">
          <Info size={15} className="text-[#1d4ed8] shrink-0 mt-0.5" />
          <p className="text-[14px] text-[#1e40af] leading-relaxed">
            If your program has enabled student completed assessments, they will automatically be available
            for students to complete unless you de-activate them.{" "}
            <a href="#" className="underline font-medium cursor-pointer">
              Learn more about managing student completed assessments
            </a>
          </p>
        </div>
        <Checkbox
          checked={siteLeaderManage}
          onChange={setSiteLeaderManage}
          label="Allow Site Leaders to manage when students can complete assessments at their assigned sites"
        />
      </div>
      </div>
    </div>
  );
}
