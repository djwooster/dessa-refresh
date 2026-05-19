"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Info, Zap, ClipboardList, ChevronDown, X, CheckCircle2, CalendarClock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { SuccessToast } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/client";

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

type WindowConfig = {
  conditionalAssignment: boolean;
  tScore: string;
  resetBehavior: "rescreen" | "skip";
};

const DEFAULT_WINDOW_CONFIG: WindowConfig = {
  conditionalAssignment: true,
  tScore: "40",
  resetBehavior: "rescreen",
};

const DEFAULT_STATE = {
  windowCount: DEFAULT_COUNT,
  dates: DEFAULT_DATES[DEFAULT_COUNT],
  assessment: "screener" as const,
  conditionalAssignment: true,
  tScore: "40",
  resetBehavior: "rescreen" as "rescreen" | "skip",
  sameConfigAllWindows: true,
  windowConfigs: Array(DEFAULT_COUNT).fill(null).map(() => ({ ...DEFAULT_WINDOW_CONFIG })) as WindowConfig[],
  siteLeaderManage: false,
};

function ReviewPanel({
  windowCount, dates, labels, assessment, conditionalAssignment, tScore, resetBehavior,
  sameConfigAllWindows, windowConfigs, siteLeaderManage,
  onBack, onSave, saving,
}: {
  windowCount: number; dates: string[]; labels: string[]; assessment: "screener" | "full";
  conditionalAssignment: boolean; tScore: string; resetBehavior: "rescreen" | "skip";
  sameConfigAllWindows: boolean; windowConfigs: WindowConfig[]; siteLeaderManage: boolean;
  onBack: () => void; onSave: () => void; saving?: boolean;
}) {
  const windowDesc = WINDOW_OPTIONS.find((o) => o.count === windowCount)!.desc;
  const row = (label: string, value: React.ReactNode) => (
    <div key={label} className="flex justify-between items-baseline gap-6 py-2.5 border-b border-[#f0f4f8] last:border-0">
      <span className="text-sm font-semibold text-gray-700 shrink-0">{label}</span>
      <span className="text-sm text-gray-500 text-right">{value}</span>
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onBack} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e8ecf0]">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900">Review your setup</h2>
            <p className="text-sm text-gray-500 mt-0.5">2025–2026 School Year</p>
          </div>
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh] space-y-5">
          {/* Rating windows */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Rating Windows</p>
            {row("Schedule", `${windowCount} windows — ${windowDesc}`)}
            {dates.map((d, i) => row(labels[i], d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"))}
          </div>
          {/* Assessment */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Teacher Completed Assessments</p>
            {row("Starting assessment", assessment === "screener" ? "Screener" : "Full Assessment")}
            {assessment === "screener" && row("Conditional full DESSA", conditionalAssignment ? `T-Score ≤ ${tScore}` : "Disabled")}
            {assessment === "screener" && conditionalAssignment && row("If previously below threshold", resetBehavior === "rescreen" ? "Re-screen them" : "Skip to full DESSA")}
            {assessment === "screener" && row("Per-window config", sameConfigAllWindows ? "Same for all windows" : "Configured per window")}
          </div>
          {/* Student assessments */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Student Completed Assessments</p>
            {row("Site Leader access control", siteLeaderManage ? "Enabled" : "Disabled")}
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-t border-[#e8ecf0]">
          <button onClick={onBack} className="h-9 px-4 rounded-lg border border-[#d1d5db] text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
            Back to Edit
          </button>
          <button onClick={onSave} disabled={saving} className="h-9 px-5 rounded-lg bg-[#1a4e8a] text-white text-sm font-semibold hover:bg-[#15407a] transition-colors cursor-pointer disabled:opacity-60">
            {saving ? "Saving…" : "Save Setup"}
          </button>
        </div>
      </div>
    </div>
  );
}

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

const MOCK_SITES = [
  "Lincoln Elementary", "Roosevelt Middle", "Washington High",
  "Jefferson Elementary", "Adams Middle", "Madison High", "Monroe Elementary",
];

const SITES_IN_OTHER_OVERRIDES: Record<string, string> = {
  "Jefferson Elementary": "North Region Group",
  "Adams Middle": "North Region Group",
};

function EditSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOverride = searchParams.get("override") === "true";

  const [overrideName, setOverrideName] = useState("");
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [siteConflict, setSiteConflict] = useState<string | null>(null);

  const toggleSite = (site: string) => {
    const conflict = SITES_IN_OTHER_OVERRIDES[site];
    if (conflict && !selectedSites.includes(site)) {
      setSiteConflict(site);
      return;
    }
    setSelectedSites((prev) => prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site]);
  };

  const supabase = createClient();
  const existingId = searchParams.get("id");

  const [windowCount, setWindowCount] = useState(DEFAULT_STATE.windowCount);
  const [dates, setDates] = useState<string[]>(DEFAULT_STATE.dates);
  const [assessment, setAssessment] = useState<"screener" | "full">(DEFAULT_STATE.assessment);
  const [conditionalAssignment, setConditionalAssignment] = useState(DEFAULT_STATE.conditionalAssignment);
  const [tScore, setTScore] = useState(DEFAULT_STATE.tScore);
  const [resetBehavior, setResetBehavior] = useState<"rescreen" | "skip">(DEFAULT_STATE.resetBehavior);
  const [sameConfigAllWindows, setSameConfigAllWindows] = useState(DEFAULT_STATE.sameConfigAllWindows);
  const [windowConfigs, setWindowConfigs] = useState<WindowConfig[]>(DEFAULT_STATE.windowConfigs);
  const [siteLeaderManage, setSiteLeaderManage] = useState(DEFAULT_STATE.siteLeaderManage);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLastYear, setShowLastYear] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const initialStateRef = useRef({
    windowCount: DEFAULT_STATE.windowCount,
    dates: DEFAULT_STATE.dates,
    assessment: DEFAULT_STATE.assessment as "screener" | "full",
    conditionalAssignment: DEFAULT_STATE.conditionalAssignment,
    tScore: DEFAULT_STATE.tScore,
    resetBehavior: DEFAULT_STATE.resetBehavior as "rescreen" | "skip",
    sameConfigAllWindows: DEFAULT_STATE.sameConfigAllWindows,
    windowConfigs: DEFAULT_STATE.windowConfigs,
    siteLeaderManage: DEFAULT_STATE.siteLeaderManage,
    overrideName: "",
    selectedSites: [] as string[],
  });

  // Load existing setup when editing
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
        const wc = data.yearly_setup_window_configs?.find((c: { window_index: number }) => c.window_index === i);
        return wc
          ? { conditionalAssignment: wc.conditional_assignment, tScore: wc.t_score, resetBehavior: wc.reset_behavior as "rescreen" | "skip" }
          : { ...DEFAULT_WINDOW_CONFIG };
      });
      const loadedSites = data.yearly_setup_sites?.map((s: { site_name: string }) => s.site_name) ?? [];
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

  const saveToSupabase = async () => {
    setSaving(true);
    const payload = {
      is_default: !isOverride,
      group_name: isOverride ? overrideName || null : null,
      year: "2025-2026",
      window_count: windowCount,
      dates,
      assessment_type: assessment,
      conditional_assignment: conditionalAssignment,
      t_score: tScore,
      reset_behavior: resetBehavior,
      same_config_all_windows: sameConfigAllWindows,
      site_leader_manage: siteLeaderManage,
    };

    let setupId = existingId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    if (existingId) {
      await db.from("yearly_setups").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", existingId);
    } else {
      const { data } = await db.from("yearly_setups").insert(payload).select("id").single();
      setupId = data?.id ?? null;
    }

    if (setupId) {
      if (isOverride) {
        await db.from("yearly_setup_sites").delete().eq("setup_id", setupId);
        if (selectedSites.length) {
          await db.from("yearly_setup_sites").insert(selectedSites.map((s: string) => ({ setup_id: setupId, site_name: s })));
        }
      }
      await db.from("yearly_setup_window_configs").delete().eq("setup_id", setupId);
      if (!sameConfigAllWindows) {
        await db.from("yearly_setup_window_configs").insert(
          windowConfigs.map((wc, i) => ({
            setup_id: setupId,
            window_index: i,
            conditional_assignment: wc.conditionalAssignment,
            t_score: wc.tScore,
            reset_behavior: wc.resetBehavior,
          }))
        );
      }
    }

    setSaving(false);
  };

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

  const initial = initialStateRef.current;
  const isDirty =
    windowCount !== initial.windowCount ||
    JSON.stringify(dates) !== JSON.stringify(initial.dates) ||
    assessment !== initial.assessment ||
    conditionalAssignment !== initial.conditionalAssignment ||
    tScore !== initial.tScore ||
    resetBehavior !== initial.resetBehavior ||
    sameConfigAllWindows !== initial.sameConfigAllWindows ||
    JSON.stringify(windowConfigs) !== JSON.stringify(initial.windowConfigs) ||
    siteLeaderManage !== initial.siteLeaderManage ||
    overrideName !== initial.overrideName ||
    JSON.stringify([...selectedSites].sort()) !== JSON.stringify([...initial.selectedSites].sort());

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
    setResetBehavior(LAST_YEAR.resetEachWindow ? "rescreen" : "skip");
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
    setWindowConfigs((prev) => {
      if (count > prev.length) return [...prev, ...Array(count - prev.length).fill(null).map(() => ({ ...DEFAULT_WINDOW_CONFIG }))];
      return prev.slice(0, count);
    });
  };

  const updateWindowConfig = (i: number, patch: Partial<WindowConfig>) =>
    setWindowConfigs((prev) => prev.map((c, idx) => idx === i ? { ...c, ...patch } : c));

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
      {showReview && (
        <ReviewPanel
          windowCount={windowCount} dates={dates} labels={labels}
          assessment={assessment} conditionalAssignment={conditionalAssignment}
          tScore={tScore} resetBehavior={resetBehavior}
          sameConfigAllWindows={sameConfigAllWindows} windowConfigs={windowConfigs}
          siteLeaderManage={siteLeaderManage}
          onBack={() => setShowReview(false)}
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
              onClick={() => setShowReview(true)}
              className="h-9 px-4 rounded-lg bg-[#1a4e8a] text-white text-sm font-semibold hover:bg-[#15407a] transition-colors cursor-pointer"
            >
              Review &amp; Save
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
            <div style={{ padding: "2px" }}>
            <div className="relative rounded-xl flex items-center justify-between gap-4 px-4 py-3" style={{ background: "#eef2f8", animation: "border-glow 3s ease-in-out infinite" }}>
              <style>{`@keyframes border-glow { 0%, 100% { box-shadow: 0 0 0 1px #c7d7ee; } 50% { box-shadow: 0 0 0 1px #1a4e8a, 0 0 10px 3px rgba(26,78,138,0.2); } }`}</style>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 0 — Site selection (override only) */}
      {isOverride && (
        <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6 mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Site Selection</h2>
          <p className="text-sm text-gray-500 mb-6">
            You can give certain sites their own schedule — allowing for different timing, a different number of rating windows, or a different starting assessment.
          </p>

          {/* Group name */}
          <div className="mb-6 pb-6 border-b border-[#f0f4f8]">
            <p className="text-[14px] font-semibold text-gray-800 mb-2">Group name</p>
            <input
              type="text"
              value={overrideName}
              onChange={(e) => setOverrideName(e.target.value)}
              placeholder="e.g. Downtown Sites, North Region"
              className="w-80 h-9 px-3 border border-[#d1d5db] rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0]"
            />
          </div>

          {/* Site picker */}
          <div>
            <p className="text-[14px] font-semibold text-gray-800 mb-1">Which sites should follow this schedule?</p>
            <p className="text-sm text-gray-500 mb-3">Select one or more sites. Sites already in another override are marked.</p>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_SITES.map((site) => {
                const inOther = SITES_IN_OTHER_OVERRIDES[site];
                const isSelected = selectedSites.includes(site);
                return (
                  <button
                    key={site}
                    onClick={() => toggleSite(site)}
                    className={`flex items-center justify-between text-left rounded-xl border-2 px-4 py-2.5 transition-all cursor-pointer ${
                      isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${isSelected ? "text-[#1a4e8a]" : "text-gray-800"}`}>{site}</span>
                    {inOther && !isSelected && (
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 shrink-0 ml-2">In {inOther}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conflict modal */}
          {siteConflict && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30" onClick={() => setSiteConflict(null)} />
              <div className="relative bg-white rounded-xl border border-[#e8ecf0] shadow-xl p-6 w-[440px]">
                <h2 className="text-[16px] font-bold text-gray-900 mb-2">Site already in another override</h2>
                <p className="text-sm text-gray-500 mb-6">
                  <strong>{siteConflict}</strong> is currently in <strong>{SITES_IN_OTHER_OVERRIDES[siteConflict]}</strong>. Would you like to move it to this group instead?
                </p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setSiteConflict(null)} className="h-9 px-4 rounded-lg border border-[#d1d5db] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Keep in current group</button>
                  <button
                    onClick={() => {
                      setSelectedSites((prev) => [...prev, siteConflict!]);
                      setSiteConflict(null);
                    }}
                    className="h-9 px-4 rounded-lg bg-[#1a4e8a] text-white text-sm font-semibold hover:bg-[#15407a] transition-colors cursor-pointer"
                  >
                    Move to this group
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rating Windows */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Rating Windows</h2>
        <p className="text-[14px] text-gray-500 mb-6">
          Each period is called a rating window — you'll see this term throughout your reports and data filters. Choose based on your school's calendar and how often you want to track progress. Common setups range from 2 to 4 windows per year.
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

      {/* Conditional assignment — only shown when screener is selected */}
      <AnimatePresence initial={false}>
        {assessment === "screener" && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Screener Configuration</h2>
              <p className="text-sm text-gray-500 mb-6">
                The DESSA screener gives a quick overall score. You can still require a full DESSA for students who score below a set threshold.
              </p>
              <div className="space-y-6">
                {/* Conditional threshold */}
                <div>
                  <p className="text-[14px] font-semibold text-gray-800 mb-1">
                    Should students who score below a threshold automatically require a full DESSA?
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    If a student's screener score falls below the number you set, their educator will be prompted to complete a full DESSA. We recommend a threshold of 40, which indicates a Need For Instruction.
                  </p>
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
                        Yes — assign a full DESSA when a student's T-Score is at or below
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={tScore}
                          onChange={(e) => setTScore(e.target.value)}
                          disabled={!conditionalAssignment}
                          className="w-16 h-8 px-2 border border-[#d1d5db] rounded-lg text-sm text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0] disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm text-gray-500">T-Score</span>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Reset behavior — only shown when conditional is enabled */}
                <AnimatePresence initial={false}>
                  {conditionalAssignment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[#f0f4f8] pt-5">
                        <p className="text-[14px] font-semibold text-gray-800 mb-1">
                          If a student previously scored below the threshold, what should happen in the next rating window?
                        </p>
                        <p className="text-sm text-gray-500 mb-3">
                          Re-screening lets teachers do a quick check first. Going straight to the full DESSA gives you richer data on any student who has previously reached the needs level.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { value: "rescreen", label: "Re-screen them", sublabel: "Start with the screener — they may have improved since the last window." },
                            { value: "skip",     label: "Skip to full DESSA", sublabel: "Go straight to the full assessment for any student who previously scored below the threshold." },
                          ] as const).map(({ value, label, sublabel }) => (
                            <button
                              key={value}
                              onClick={() => setResetBehavior(value)}
                              className={`text-left rounded-xl border-2 px-4 py-3 transition-all cursor-pointer ${
                                resetBehavior === value ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"
                              }`}
                            >
                              <p className={`text-[14px] font-bold mb-1 ${resetBehavior === value ? "text-[#1a4e8a]" : "text-gray-900"}`}>{label}</p>
                              <p className="text-sm text-gray-500 leading-snug">{sublabel}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Same config for all windows */}
                <div className="border-t border-[#f0f4f8] pt-5">
                  <p className="text-[14px] font-semibold text-gray-800 mb-1">
                    Do all rating windows share the same configuration?
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    If your assessment schedule or threshold changes across windows, you can configure each window independently.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {([
                      { value: true,  label: "Yes, same for all windows" },
                      { value: false, label: "No, configure each window" },
                    ] as const).map(({ value, label }) => (
                      <button
                        key={String(value)}
                        onClick={() => setSameConfigAllWindows(value)}
                        className={`text-left rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                          sameConfigAllWindows === value ? "border-[#1a4e8a] bg-[#eef2f8] text-[#1a4e8a]" : "border-[#e8ecf0] bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Per-window config */}
                  <AnimatePresence initial={false}>
                    {!sameConfigAllWindows && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 pt-2">
                          {windowConfigs.map((cfg, i) => {
                            const winLabel = WINDOW_OPTIONS.find((o) => o.count === windowCount)!.labels[i];
                            return (
                              <div key={i} className="rounded-xl border border-[#e8ecf0] p-4">
                                <p className="text-[14px] font-bold text-gray-800 mb-3">{winLabel}</p>
                                <div className="space-y-3">
                                  <label className="flex items-center gap-3 cursor-pointer group">
                                    <div
                                      onClick={() => updateWindowConfig(i, { conditionalAssignment: !cfg.conditionalAssignment })}
                                      className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                                        cfg.conditionalAssignment ? "bg-[#1a4e8a] border-[#1a4e8a]" : "border-gray-300 group-hover:border-gray-400"
                                      }`}
                                    >
                                      {cfg.conditionalAssignment && (
                                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                          <path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-700">Assign full DESSA at or below T-Score</span>
                                      <input
                                        type="number"
                                        value={cfg.tScore}
                                        onChange={(e) => updateWindowConfig(i, { tScore: e.target.value })}
                                        disabled={!cfg.conditionalAssignment}
                                        className="w-16 h-7 px-2 border border-[#d1d5db] rounded-lg text-sm text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 disabled:opacity-40 disabled:cursor-not-allowed"
                                      />
                                    </div>
                                  </label>
                                  {cfg.conditionalAssignment && (
                                    <div className="grid grid-cols-2 gap-2 pl-7">
                                      {([
                                        { value: "rescreen", label: "Re-screen them" },
                                        { value: "skip",     label: "Skip to full DESSA" },
                                      ] as const).map(({ value, label }) => (
                                        <button
                                          key={value}
                                          onClick={() => updateWindowConfig(i, { resetBehavior: value })}
                                          className={`text-left rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                                            cfg.resetBehavior === value ? "border-[#1a4e8a] bg-[#eef2f8] text-[#1a4e8a]" : "border-[#e8ecf0] bg-white text-gray-700 hover:border-gray-300"
                                          }`}
                                        >
                                          {label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Completed Assessments */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Student Completed Assessments</h2>
        <p className="text-sm text-gray-500 mb-6">
          If your program has enabled student completed assessments, they will automatically be available for students to complete unless you de-activate them.
        </p>

        <div>
          <p className="text-[14px] font-semibold text-gray-800 mb-1">
            Should Site Leaders be able to control when students can access their assessments within each rating window?
          </p>
          <p className="text-sm text-gray-500 mb-3">
            This gives Site Leaders control over when students can access their self-assessment within a rating window. For example, a Site Leader might open the teacher assessment first, then turn on the student assessment later in the window — or do the reverse.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: true,  label: "Yes", sublabel: "Site Leaders can open and close student access at their sites independently." },
              { value: false, label: "No",  sublabel: "Student assessments open automatically at the start of each rating window." },
            ] as const).map(({ value, label, sublabel }) => (
              <button
                key={String(value)}
                onClick={() => setSiteLeaderManage(value)}
                className={`text-left rounded-xl border-2 px-4 py-3 transition-all cursor-pointer ${
                  siteLeaderManage === value ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"
                }`}
              >
                <p className={`text-[14px] font-bold mb-1 ${siteLeaderManage === value ? "text-[#1a4e8a]" : "text-gray-900"}`}>{label}</p>
                <p className="text-sm text-gray-500 leading-snug">{sublabel}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
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
