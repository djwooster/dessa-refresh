"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, HelpCircle, Search, Plus, X, Info,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type WindowConfig = {
  assessment: "screener" | "full" | null;
  conditionalAssignment: boolean | null;
  tScore: string;
  resetBehavior: "rescreen" | "skip" | null;
};

type SiteCustomConfig = {
  windowCount: number;
  dates: string[];
  windowConfigs: WindowConfig[];
  groupName?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const WINDOW_OPTIONS = [
  { count: 1, desc: "Annual Assessment", labels: ["Annual Assessment"] },
  { count: 2, desc: "Pre & Post", labels: ["Pre-Assessment", "Post-Assessment"] },
  { count: 3, desc: "Pre, Mid & Post", labels: ["Pre-Assessment", "Mid-Assessment", "Post-Assessment"] },
  { count: 4, desc: "Pre, Mid 1, Mid 2 & Post", labels: ["Pre-Assessment", "Mid 1 Assessment", "Mid 2 Assessment", "Post-Assessment"] },
  { count: 5, desc: "Pre, Mid 1–3 & Post", labels: ["Pre-Assessment", "Mid 1 Assessment", "Mid 2 Assessment", "Mid 3 Assessment", "Post-Assessment"] },
];

const DEFAULT_DATES: Record<number, string[]> = {
  1: ["2025-08-01"],
  2: ["2025-08-01", "2026-05-28"],
  3: ["2025-08-01", "2026-01-01", "2026-05-28"],
  4: ["2025-08-01", "2025-11-01", "2026-02-01", "2026-05-28"],
  5: ["2025-08-01", "2025-10-01", "2026-01-01", "2026-03-01", "2026-05-28"],
};

const DEFAULT_COUNT = 3;

const DEFAULT_WINDOW_CONFIG: WindowConfig = {
  assessment: null,
  conditionalAssignment: null,
  tScore: "40",
  resetBehavior: null,
};

const BAND_COLORS = [
  { bg: "#dcf0e5", text: "#166534" },
  { bg: "#dbeafe", text: "#1e40af" },
  { bg: "#ede9fe", text: "#5b21b6" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#fce7f3", text: "#9d174d" },
];

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const TSCORE_RANGES = [
  { label: "Need for Instruction", value: "40 or below", bg: "#fecaca", text: "#b91c1c", flex: 2 },
  { label: "Typical",              value: "41–59",       bg: "#dbeafe", text: "#1e40af", flex: 3 },
  { label: "Strength",             value: "60 or above", bg: "#dcfce7", text: "#166534", flex: 2 },
];

const MOCK_SITES = [
  "Adams Middle","Agave High","Arroyo Seco Elementary","Arthur Elementary",
  "Aspen Grove Middle","Bayshore Middle","Birchwood Middle","Blackrock High",
  "Bluehills High","Bluffview Middle","Bridgeview Elementary","Bronzedale High",
  "Buchanan Middle","Bush Elementary","Cactus Wren Elementary","Canyon View Middle",
  "Capstone High","Carter Middle","Cedarbrook Elementary","Chaparral Middle",
  "Clearwater Middle","Cleveland Middle","Cliffside Elementary","Clinton Middle",
  "Coastline High","Coolidge Middle","Copperfield Middle","Coral Reef High",
  "Cornerstone High","Cottonwood Elementary","Creekside Elementary","Crestwood High",
  "Desert Ridge Elementary","Dolphin Bay Elementary","Eagle View Elementary","Eastview Middle",
  "Eisenhower High","Elmwood High","Fairview High","Falcon Ridge High",
  "FDR Elementary","Fillmore High","Flint Ridge Middle","Ford Elementary",
  "Garfield High","Glenview Middle","Goldfield Middle","Granite Ridge Middle",
  "Grant Elementary","Greenlawn Elementary","GW Bush High","Harborview Elementary",
  "Harding Elementary","Harrison Prep","Hawk Creek Middle","Hayes Middle",
  "Heron Bay Elementary","Hillcrest High","Hillside High","Hoover High",
  "Inland Empire Elementary","Ironwood Elementary","Jackson Academy","Jefferson Elementary",
  "Johnson High","Juniper Valley Elementary","Kennedy Elementary","Keystone Elementary",
  "Lakeshore Middle","Lakeview Middle","LBJ Middle","Limestone High",
  "Lincoln Elementary","Madison High","Manatee Middle","Maplewood High",
  "Marble Falls Elementary","McKinley High","Meadowbrook Elementary","Mesa Verde High",
  "Mesquite Middle","Milestone Middle","Monroe Elementary","Nixon High",
  "Northside High","Oakwood Middle","Obama Elementary","Ocotillo Middle",
  "Osprey High","Palo Verde High","Parkview Elementary","Pelican Cove Middle",
  "Pierce Elementary","Pinecrest Elementary","Pinnacle Middle","Plains High",
  "Polk Elementary","Pondview Middle","Prairie View Middle","Reagan High",
  "Redwood High","Ridgecrest High","Riverbend High","Riverside Elementary",
  "Roadrunner Middle","Roosevelt Elementary","Roosevelt Middle","Sage Hills High",
  "Sagebrush Middle","Saguaro Elementary","Sandstone Elementary","Seagull Shores High",
  "Silverstone Elementary","Southside Elementary","Summit Elementary","Sunrise Middle",
  "Sunset Elementary","Taft Middle","Taylor Middle","Truman Middle",
  "Tumbleweed High","Tyler Charter","Valley High","Washington High",
  "Westwood High","Whitewater Middle","Willowbrook Elementary","Wilson High",
];

// ─── Timeline ─────────────────────────────────────────────────────────────────

function SimpleTimeline({ dates, labels }: { dates: string[]; labels: string[] }) {
  const parsed = dates.map((d) => (d ? new Date(d + "T00:00:00") : null));
  const valid = parsed.filter(Boolean) as Date[];
  if (valid.length === 0) return null;

  const rangeStart = valid[0];
  const rangeEnd = new Date(rangeStart.getFullYear() + 1, 7, 1);
  const rangeMs = rangeEnd.getTime() - rangeStart.getTime();
  const pct = (d: Date) => Math.max(0, Math.min(100, ((d.getTime() - rangeStart.getTime()) / rangeMs) * 100));

  const ticks: Date[] = [];
  const cur = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  while (cur <= rangeEnd) { ticks.push(new Date(cur)); cur.setMonth(cur.getMonth() + 1); }

  return (
    <div className="space-y-2">
      <div className="relative h-4">
        {ticks.map((m, i) => (
          <span key={i} className="absolute text-[11px] text-gray-400"
            style={i === 0 ? { left: 0 } : i === ticks.length - 1 ? { right: 0 } : { left: `${(i / (ticks.length - 1)) * 100}%`, transform: "translateX(-50%)" }}>
            {MONTH_NAMES[m.getMonth()]}
          </span>
        ))}
      </div>
      <div className="relative h-7 rounded-md overflow-hidden flex">
        {parsed.map((date, i) => {
          if (!date) return null;
          const next = parsed[i + 1];
          const width = pct(next ?? rangeEnd) - pct(date);
          const color = BAND_COLORS[i % BAND_COLORS.length];
          const short = labels[i]?.replace(/\s*-?\s*Assessment/i, "").trim() || `W${i + 1}`;
          return (
            <div key={i} className="flex items-center justify-center overflow-hidden shrink-0" style={{ width: `${width}%`, backgroundColor: color.bg }}>
              <span className="text-[10px] font-bold truncate px-1" style={{ color: color.text }}>{short}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, subtitle, children, onHelp, step }: {
  title: string; subtitle?: string; children: React.ReactNode; onHelp?: () => void; step?: number;
}) {
  return (
    <section className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-bold text-gray-900">
            {step !== undefined && (
              <span className="text-[#1a4e8a] mr-1.5">{step}.</span>
            )}
            {title}
          </h2>
          {onHelp && (
            <button onClick={onHelp} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <HelpCircle size={15} />
            </button>
          )}
        </div>
        {subtitle && <p className="text-[14px] text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// ─── Continue button ──────────────────────────────────────────────────────────

function ContinueButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        onClick={onClick}
        className="h-9 px-6 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors cursor-pointer"
      >
        Continue
      </button>
    </div>
  );
}

// ─── Window card ──────────────────────────────────────────────────────────────

function WindowCard({
  index, label, date, cfg, colorBg, colorText,
  onDateChange, onConfigChange, onHelp,
  globalEscalation, globalTScore,
}: {
  index: number; label: string; date: string; cfg: WindowConfig;
  colorBg: string; colorText: string;
  onDateChange: (v: string) => void;
  onConfigChange: (patch: Partial<WindowConfig>) => void;
  onHelp: (title: string, body: React.ReactNode) => void;
  globalEscalation: boolean | null;
  globalTScore: string;
}) {
  return (
    <div className="rounded-xl border border-[#e8ecf0] overflow-hidden bg-white flex flex-col">
      <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: colorBg }}>
        <span className="text-[13px] font-bold" style={{ color: colorText }}>{label}</span>
      </div>

      <div className="px-4 py-4 space-y-5 flex-1">
        {/* Opening date */}
        <div>
          <p className="text-[13px] font-semibold text-gray-600 mb-1.5">Opening date</p>
          <DatePicker value={date} onChange={onDateChange} />
        </div>

        {/* Assessment type */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <p className="text-[13px] font-semibold text-gray-600">Assessment type</p>
            <button onClick={() => onHelp("Screener vs. Full Assessment", (
              <div className="space-y-6 text-[14px] text-gray-600 leading-relaxed">
                <div><p className="text-[16px] font-semibold text-gray-800 mb-1">Screener</p><p>A short, 8-item form that quickly identifies students who may need additional support. Includes the DESSA 2 mini and DESSA HSE-mini.</p></div>
                <div><p className="text-[16px] font-semibold text-gray-800 mb-1">Full Assessment</p><p>A comprehensive form measuring eight social-emotional competencies in depth. Includes the DESSA 2 and DESSA HSE.</p></div>
                <div><p className="text-[16px] font-semibold text-gray-800 mb-1">In Summary</p><p>The DESSA screener gives a quick overall score and works well when educators need to assess many students efficiently. The full DESSA takes longer but provides a score for each social-emotional competency.</p></div>
              </div>
            ))} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"><HelpCircle size={13} /></button>
          </div>
          <div className="space-y-2">
            {[
              { value: "screener" as const, label: "Screener" },
              { value: "full" as const, label: "Full DESSA" },
            ].map(({ value, label: lbl }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`assess-${index}`}
                  checked={cfg.assessment === value}
                  onChange={() => onConfigChange({ assessment: value })}
                  className="w-4 h-4 accent-[#1a4e8a] cursor-pointer"
                />
                <span className="text-[13px] text-gray-700">{lbl}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Escalation reminder — screener only, once global answer is set */}
        <AnimatePresence initial={false}>
          {cfg.assessment === "screener" && globalEscalation !== null && (
            <motion.div key="reminder" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
              <div className="flex items-center gap-2 rounded-lg bg-[#f0f7ff] border border-[#c7d7ee] px-3 py-2">
                <Info size={12} className="text-[#1a4e8a] shrink-0" />
                <span className="text-[12px] text-[#1a4e8a]">
                  {globalEscalation
                    ? `Students scoring ${globalTScore} or below will be automatically assessed using the full DESSA for the rest of the year`
                    : "No auto-escalation for this window"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const SCHOOL_YEARS = ["2024-2025", "2025-2026", "2026-2027"];
const CURRENT_YEAR = "2025-2026";
const TOTAL_SITES = 128;

function SingleSetupPage() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const isOverride = searchParams.get("override") === "true";

  // ─── Overview state ───────────────────────────────────────────────────────

  const [mode, setMode] = useState<"overview" | "editing">("overview");
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allSetups, setAllSetups] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [editingSetupId, setEditingSetupId] = useState<string | null>(null);
  const [editingIsOverride, setEditingIsOverride] = useState(isOverride);

  // ─── Form state ───────────────────────────────────────────────────────────

  const [windowCount, setWindowCount] = useState(DEFAULT_COUNT);
  const [dates, setDates] = useState<string[]>(DEFAULT_DATES[DEFAULT_COUNT]);
  const [windowConfigs, setWindowConfigs] = useState<WindowConfig[]>(
    Array(DEFAULT_COUNT).fill(null).map(() => ({ ...DEFAULT_WINDOW_CONFIG }))
  );
  const [globalEscalation, setGlobalEscalation] = useState<boolean | null>(null);
  const [globalTScore, setGlobalTScore] = useState("40");
  const [overrideName, setOverrideName] = useState("");
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [siteSearchQuery, setSiteSearchQuery] = useState("");
  const [hasSiteCustomSetups, setHasSiteCustomSetups] = useState<boolean | null>(null);
  const [siteCustomSetups, setSiteCustomSetups] = useState<Record<string, SiteCustomConfig | null>>({});
  const [selectedSiteRows, setSelectedSiteRows] = useState<string[]>([]);
  const [siteLeaderManage, setSiteLeaderManage] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpContent, setHelpContent] = useState<{ title: string; body: React.ReactNode } | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const openHelp = (title: string, body: React.ReactNode) => { setHelpContent({ title, body }); setHelpOpen(true); };

  const [overrideSiteSearch, setOverrideSiteSearch] = useState("");
  const mainRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const labels = WINDOW_OPTIONS.find((o) => o.count === windowCount)!.labels;
  const anyScreener = windowConfigs.some((wc) => wc.assessment === "screener");

  // Section order determines step numbers
  const orderedSections = editingIsOverride
    ? ["group-name", "sites", "window-count", "window-config", "students"]
    : ["window-count", "window-config", "site-schedules", "students"];
  const sectionNum = (key: string) => orderedSections.indexOf(key) + 1;

  const scrollToSection = useCallback((key: string) => {
    const el = sectionRefs.current[key];
    const main = mainRef.current;
    if (!el || !main) return;
    const rect = el.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();
    const relativeTop = rect.top - mainRect.top + main.scrollTop - 24;
    main.scrollTo({ top: Math.max(0, relativeTop), behavior: "smooth" });
  }, []);

  const handleContinue = useCallback((sectionKey: string) => {
    const currentIdx = orderedSections.indexOf(sectionKey);
    const nextStep = currentIdx + 2;
    setCurrentStep((prev) => Math.max(prev, nextStep));
    const nextKey = orderedSections[currentIdx + 1];
    if (nextKey) {
      setTimeout(() => scrollToSection(nextKey), 80);
    }
  }, [orderedSections, scrollToSection]);

  // ─── Load all setups ─────────────────────────────────────────────────────

  const loadAllSetups = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { data } = await db
      .from("yearly_setups")
      .select("*, yearly_setup_sites(*), yearly_setup_window_configs(*)")
      .order("created_at", { ascending: true });
    if (data) setAllSetups(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadAllSetups(); }, [loadAllSetups]);

  // ─── Derived overview values ──────────────────────────────────────────────

  const defaultSetup = allSetups.find((s) => s.is_default && s.year === selectedYear) ?? null;
  const overrides = allSetups.filter((s) => !s.is_default && s.year === selectedYear);
  const sitesInOverrides = overrides.reduce((acc: number, o: any) => acc + o.yearly_setup_sites.length, 0);
  const defaultSiteCount = Math.max(0, TOTAL_SITES - sitesInOverrides);

  // ─── Load setup into form ─────────────────────────────────────────────────

  const loadSetupIntoForm = useCallback((raw: any) => {
    const loadedConfigs = [...Array(raw.window_count)].map((_: unknown, i: number) => {
      const wc = raw.yearly_setup_window_configs?.find((c: { window_index: number }) => c.window_index === i);
      return wc
        ? { assessment: (wc.assessment_type ?? raw.assessment_type ?? "screener") as "screener" | "full", conditionalAssignment: wc.conditional_assignment, tScore: wc.t_score ?? "40", resetBehavior: wc.reset_behavior as "rescreen" | "skip" }
        : { ...DEFAULT_WINDOW_CONFIG, assessment: (raw.assessment_type ?? "screener") as "screener" | "full" };
    });
    setWindowCount(raw.window_count);
    setDates(raw.dates);
    setWindowConfigs(loadedConfigs);
    setSiteLeaderManage(raw.site_leader_manage);
    setOverrideName(raw.group_name ?? "Custom Group");
    setSelectedSites(raw.yearly_setup_sites?.map((s: { site_name: string }) => s.site_name) ?? []);
    const firstScreenerCfg = loadedConfigs.find((lc) => lc.assessment === "screener");
    setGlobalEscalation(firstScreenerCfg?.conditionalAssignment ?? null);
    setGlobalTScore(firstScreenerCfg?.tScore ?? "40");
    setCurrentStep(999);
  }, []);

  const startEditing = (setupId?: string, asOverride = false) => {
    if (setupId) {
      const existing = allSetups.find((s) => s.id === setupId);
      if (existing) loadSetupIntoForm(existing);
      setEditingSetupId(setupId);
    } else {
      setWindowCount(DEFAULT_COUNT);
      setDates(DEFAULT_DATES[DEFAULT_COUNT]);
      setWindowConfigs(Array(DEFAULT_COUNT).fill(null).map(() => ({ ...DEFAULT_WINDOW_CONFIG })));
      setSiteLeaderManage(null);
      setOverrideName("Custom Group");
      setSelectedSites([]);
      setGlobalEscalation(null);
      setGlobalTScore("40");
      setCurrentStep(1);
      setEditingSetupId(null);
    }
    setEditingIsOverride(asOverride);
    setMode("editing");
  };

  // ─── Countdown back to overview ───────────────────────────────────────────

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(async () => {
      await loadAllSetups();
      setShowSuccess(false);
      setMode("overview");
    }, 2500);
    return () => clearTimeout(t);
  }, [showSuccess, loadAllSetups]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleCountChange = (count: number) => {
    setWindowCount(count);
    setDates(DEFAULT_DATES[count]);
    setWindowConfigs(
      count > windowConfigs.length
        ? [...windowConfigs, ...Array(count - windowConfigs.length).fill(null).map(() => ({ ...DEFAULT_WINDOW_CONFIG }))]
        : windowConfigs.slice(0, count)
    );
  };

  const updateWindowConfig = (i: number, patch: Partial<WindowConfig>) => {
    setWindowConfigs((prev) => prev.map((wc, idx) => idx === i ? { ...wc, ...patch } : wc));
  };

  const updateDate = (i: number, v: string) => {
    setDates((prev) => prev.map((d, idx) => idx === i ? v : d));
  };

  const handleSave = async () => {
    setSaving(true);
    const derivedAssessment = windowConfigs.some((wc) => wc.assessment === "screener") ? "screener" : "full";
    const payload = {
      is_default: !editingIsOverride,
      group_name: editingIsOverride ? overrideName || null : null,
      year: selectedYear,
      window_count: windowCount,
      dates,
      assessment_type: derivedAssessment,
      conditional_assignment: anyScreener ? (globalEscalation ?? false) : false,
      t_score: globalTScore,
      reset_behavior: anyScreener && globalEscalation ? "skip" : "rescreen",
      same_config_all_windows: false,
      site_leader_manage: siteLeaderManage ?? false,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    let setupId = editingSetupId;
    if (editingSetupId) {
      await db.from("yearly_setups").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editingSetupId);
    } else {
      const { data } = await db.from("yearly_setups").insert(payload).select("id").single();
      setupId = data?.id ?? null;
    }
    if (setupId) {
      if (editingIsOverride) {
        await db.from("yearly_setup_sites").delete().eq("setup_id", setupId);
        if (selectedSites.length) {
          await db.from("yearly_setup_sites").insert(selectedSites.map((s: string) => ({ setup_id: setupId, site_name: s })));
        }
      }
      await db.from("yearly_setup_window_configs").delete().eq("setup_id", setupId);
      await db.from("yearly_setup_window_configs").insert(
        windowConfigs.map((wc, i) => ({
          setup_id: setupId,
          window_index: i,
          conditional_assignment: wc.assessment === "screener" ? (globalEscalation ?? false) : false,
          t_score: globalTScore,
          reset_behavior: wc.assessment === "screener" && globalEscalation ? "skip" : null,
          assessment_type: wc.assessment,
        }))
      );
      if (!editingIsOverride && hasSiteCustomSetups === true) {
        const groups = new Map<string, { sites: string[]; cfg: SiteCustomConfig }>();
        for (const [siteName, siteCfg] of Object.entries(siteCustomSetups)) {
          if (!siteCfg) continue;
          const key = siteCfg.groupName?.trim() || siteName;
          if (!groups.has(key)) groups.set(key, { sites: [], cfg: siteCfg });
          groups.get(key)!.sites.push(siteName);
        }
        for (const [groupName, { sites, cfg }] of groups) {
          const { data: newRecord } = await db.from("yearly_setups").insert({
            is_default: false, group_name: groupName, year: selectedYear, window_count: cfg.windowCount,
            dates: cfg.dates, assessment_type: cfg.windowConfigs.some((wc) => wc.assessment === "screener") ? "screener" : "full",
            conditional_assignment: cfg.windowConfigs.some((wc) => wc.conditionalAssignment), t_score: cfg.windowConfigs[0]?.tScore ?? "40",
            reset_behavior: cfg.windowConfigs[0]?.resetBehavior ?? "rescreen", same_config_all_windows: false, site_leader_manage: false,
          }).select("id").single();
          if (newRecord?.id) {
            await db.from("yearly_setup_sites").insert(sites.map((site) => ({ setup_id: newRecord.id, site_name: site })));
          }
        }
      }
    }
    setSaving(false);
    setShowSuccess(true);
  };

  // ─── Success screen ───────────────────────────────────────────────────────

  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <SuccessRing />
        <h2 className="text-[26px] font-bold text-gray-900">Setup complete</h2>
        <p className="text-[15px] text-gray-500">Returning to overview…</p>
      </div>
    );
  }

  // ─── Overview mode ────────────────────────────────────────────────────────

  if (mode === "overview") {
    if (loading) return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#1a4e8a] border-t-transparent rounded-full animate-spin" />
      </div>
    );

    const isPastYear = selectedYear < CURRENT_YEAR;

    return (
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900">Rating Window Setup</h1>
            <p className="text-[16px] text-gray-500">Plan your year ahead and set rating window timeframes for each school year.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden mb-6">
          <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-b border-[#e8ecf0]">
            <Select value={selectedYear} onValueChange={(v) => v && setSelectedYear(v)}>
              <SelectTrigger className="w-auto gap-2 h-9 px-3 bg-white border border-[#d1d5db] rounded-lg text-[15px] font-semibold text-gray-700 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCHOOL_YEARS.map((y) => (
                  <SelectItem key={y} value={y} className="text-[14px] font-semibold cursor-pointer">
                    {y.replace("-", "–")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {defaultSetup && !isPastYear && (
              <button onClick={() => startEditing(defaultSetup.id)}
                className="flex items-center justify-center w-[130px] h-9 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors cursor-pointer">
                Edit Setup
              </button>
            )}
          </div>

          {!defaultSetup ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <img src="/undraw_date-picker_8qys.svg" alt="" className="w-40 h-40 mb-4" />
              <h3 className="text-[20px] font-semibold text-gray-800 mb-1">No setup for {selectedYear.replace("-", "–")}</h3>
              <p className="text-[16px] text-gray-500 max-w-sm mb-6">Define your rating windows and assessment configuration to get started.</p>
              <button onClick={() => startEditing()}
                className="flex items-center justify-center w-[120px] py-2 rounded-lg bg-[#1a4e8a] text-white text-[14px] font-medium hover:bg-[#15407a] transition-colors cursor-pointer">
                Setup
              </button>
            </div>
          ) : (
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 text-[13px] text-gray-500">
                <span>{defaultSiteCount} {defaultSiteCount === 1 ? "site" : "sites"} on default</span>
                <span>·</span>
                <span>{defaultSetup.window_count} {defaultSetup.window_count === 1 ? "window" : "windows"}</span>
                <span>·</span>
                <span>{defaultSetup.assessment_type === "screener" ? "Screener" : "Full Assessment"}</span>
              </div>
            </div>
          )}
        </div>

        {defaultSetup && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[18px] font-bold text-gray-900">Custom Schedules</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Sites whose rating windows don't align with the default schedule.</p>
              </div>
              <button onClick={() => startEditing(undefined, true)}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[#1a4e8a] text-[13px] font-semibold text-[#1a4e8a] hover:bg-[#eef2f8] transition-colors cursor-pointer">
                <Plus size={13} strokeWidth={2} />
                Add Custom Schedule
              </button>
            </div>
            {overrides.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm flex flex-col items-center justify-center px-6 py-12 text-center">
                <p className="text-[15px] font-semibold text-gray-700 mb-1">No custom schedules</p>
                <p className="text-[13px] text-gray-400 max-w-sm">All sites are following the default setup.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overrides.map((override: any) => (
                  <div key={override.id} className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-bold text-gray-900">{override.group_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[12px] text-gray-400">
                        <span>{override.yearly_setup_sites.length} {override.yearly_setup_sites.length === 1 ? "site" : "sites"}</span>
                        <span>·</span>
                        <span>{override.window_count} {override.window_count === 1 ? "window" : "windows"}</span>
                      </div>
                    </div>
                    <button onClick={() => startEditing(override.id, true)}
                      className="h-8 px-4 rounded-lg border border-[#1a4e8a] text-[12px] font-semibold text-[#1a4e8a] hover:bg-[#eef2f8] transition-colors cursor-pointer">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─── Editing mode ─────────────────────────────────────────────────────────

  const filteredSites = MOCK_SITES.filter((s) => s.toLowerCase().includes(siteSearchQuery.toLowerCase()));
  const allFilteredSelected = filteredSites.length > 0 && filteredSites.every((s) => selectedSiteRows.includes(s));
  const gridClass = windowCount === 1 ? "grid-cols-1" : windowCount === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Header */}
      <header className="h-[60px] shrink-0 flex items-center justify-between px-8 border-b border-[#e8ecf0] bg-white sticky top-0 z-10">
        <button
          onClick={() => setMode("overview")}
          className="flex items-center gap-2 text-[13px] font-medium text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <p className="text-[15px] font-semibold text-gray-700">
          {editingIsOverride ? "Custom schedule" : `Rating window setup · ${selectedYear.replace("-", "–")}`}
        </p>
        <div className="w-20" />
      </header>

      {/* Body */}
      <main ref={mainRef} className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-[1100px] mx-auto px-8 py-10 space-y-12">

          {/* ── Override: group name ── */}
          {editingIsOverride && (
            <div ref={(r) => { sectionRefs.current["group-name"] = r; }}>
              <Section title="Group name" step={sectionNum("group-name")} subtitle="Give this custom schedule a name.">
                <input
                  type="text"
                  value={overrideName}
                  onChange={(e) => setOverrideName(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g. Title I Schools, District North…"
                  className="w-full max-w-md text-[20px] font-semibold text-gray-800 border-0 border-b-2 border-[#e8ecf0] focus:border-[#1a4e8a] focus:outline-none bg-transparent pb-1 placeholder:text-gray-300 placeholder:font-normal placeholder:text-[20px]"
                />
                <ContinueButton onClick={() => handleContinue("group-name")} />
              </Section>
            </div>
          )}

          {/* ── Override: sites ── */}
          <AnimatePresence initial={false}>
            {editingIsOverride && currentStep >= sectionNum("sites") && (
              <motion.div key="sites-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <hr className="border-[#e8ecf0]" />
                <div ref={(r) => { sectionRefs.current["sites"] = r; }}>
                  <Section title="Sites in this group" step={sectionNum("sites")} subtitle="Select all sites that should follow this custom schedule.">
                    <div className="rounded-xl border border-[#e8ecf0] overflow-hidden bg-white">
                      <div className="flex items-center gap-3 px-4 py-3 bg-[#f8fafc] border-b border-[#e8ecf0]">
                        <div className="relative max-w-[300px] w-full">
                          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Search sites…"
                            value={overrideSiteSearch}
                            onChange={(e) => setOverrideSiteSearch(e.target.value)}
                            className="w-full h-8 pl-8 pr-3 text-[13px] border border-[#d1d5db] rounded-lg bg-white focus:outline-none focus:border-[#1a4e8a] placeholder:text-gray-400"
                          />
                        </div>
                        <div className="flex-1" />
                        {selectedSites.length > 0 && (
                          <span className="text-[12px] font-semibold text-[#1a4e8a] bg-[#eef2f8] border border-[#c7d7ee] rounded-full px-3 py-1">
                            {selectedSites.length} selected
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-[44px_1fr] border-b border-[#e8ecf0] bg-[#f8fafc]">
                        <div className="flex items-center justify-center py-2.5">
                          <input type="checkbox"
                            checked={MOCK_SITES.filter((s) => s.toLowerCase().includes(overrideSiteSearch.toLowerCase())).length > 0 &&
                              MOCK_SITES.filter((s) => s.toLowerCase().includes(overrideSiteSearch.toLowerCase())).every((s) => selectedSites.includes(s))}
                            onChange={(e) => {
                              const filtered = MOCK_SITES.filter((s) => s.toLowerCase().includes(overrideSiteSearch.toLowerCase()));
                              setSelectedSites(e.target.checked ? filtered : []);
                            }}
                            className="w-4 h-4 accent-[#1a4e8a] cursor-pointer" />
                        </div>
                        <div className="px-3 py-2.5 flex items-center">
                          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Site</span>
                        </div>
                      </div>
                      <div className="overflow-y-auto" style={{ maxHeight: "50vh" }}>
                        {MOCK_SITES.filter((s) => s.toLowerCase().includes(overrideSiteSearch.toLowerCase())).map((site) => {
                          const isSelected = selectedSites.includes(site);
                          return (
                            <div key={site} onClick={() => setSelectedSites((prev) => prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site])}
                              className={`grid grid-cols-[44px_1fr] border-b border-[#f0f4f8] last:border-0 cursor-pointer transition-colors ${isSelected ? "bg-[#eef2f8]" : "bg-white hover:bg-[#f8fafc]"}`}>
                              <div className="flex items-center justify-center py-3" onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" checked={isSelected}
                                  onChange={() => setSelectedSites((prev) => prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site])}
                                  className="w-4 h-4 accent-[#1a4e8a] cursor-pointer" />
                              </div>
                              <div className="px-3 py-3 flex items-center">
                                <span className="text-[14px] text-gray-800">{site}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <ContinueButton onClick={() => handleContinue("sites")} />
                  </Section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Window count ── */}
          <AnimatePresence initial={false}>
            {currentStep >= sectionNum("window-count") && (
              <motion.div key="window-count-section" initial={editingIsOverride ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                {editingIsOverride && currentStep >= sectionNum("window-count") && <hr className="border-[#e8ecf0]" />}
                <div ref={(r) => { sectionRefs.current["window-count"] = r; }}>
                  <Section title="How many rating windows?" step={sectionNum("window-count")} subtitle="Choose the number of assessment periods for this school year."
                    onHelp={() => openHelp("About Rating Windows", <div className="space-y-4 text-[14px] text-gray-600 leading-relaxed"><p>A rating window is a period during the school year when teachers complete DESSA assessments for their students.</p><p>Most programs use <strong>3 windows</strong> — Pre, Mid, and Post — which lets you track social-emotional growth across the year.</p><p>Choose a number that matches your program's schedule. You can adjust this in future years.</p></div>)}>
                    <div className="grid grid-cols-5 gap-3">
                      {WINDOW_OPTIONS.map(({ count, desc }) => {
                        const isSelected = windowCount === count;
                        return (
                          <button key={count} onClick={() => handleCountChange(count)}
                            className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-[18px] font-bold ${isSelected ? "bg-[#1a4e8a] text-white" : "bg-gray-100 text-gray-500"}`}>
                              {count}
                            </div>
                            <p className={`text-[14px] font-semibold mb-1 ${isSelected ? "text-[#1a4e8a]" : "text-gray-600"}`}>
                              {count === 1 ? "1 Window" : `${count} Windows`}
                            </p>
                            <p className="text-[12px] text-gray-400 leading-snug">{desc}</p>
                          </button>
                        );
                      })}
                    </div>
                    <ContinueButton onClick={() => handleContinue("window-count")} />
                  </Section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Window config ── */}
          <AnimatePresence initial={false}>
            {currentStep >= sectionNum("window-config") && (
              <motion.div key="window-config-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <hr className="border-[#e8ecf0]" />
                <div ref={(r) => { sectionRefs.current["window-config"] = r; }}>
                  <Section title="Configure your windows" step={sectionNum("window-config")} subtitle="Set the opening date and assessment type for each rating window.">
                    <div className="space-y-4">
                      {dates.some(Boolean) && (
                        <div className="bg-white rounded-xl border border-[#e8ecf0] p-5">
                          <p className="text-[13px] font-medium text-gray-400 mb-0.5">Year at a glance</p>
                          <p className="text-[15px] font-semibold text-gray-800 mb-4">{selectedYear.replace("-", "–")}</p>
                          <SimpleTimeline dates={dates} labels={labels} />
                        </div>
                      )}
                      <div className={`grid ${gridClass} gap-4 items-start`}>
                        {Array.from({ length: windowCount }, (_, i) => (
                          <WindowCard
                            key={i}
                            index={i}
                            label={labels[i]}
                            date={dates[i] ?? ""}
                            cfg={windowConfigs[i] ?? DEFAULT_WINDOW_CONFIG}
                            colorBg={BAND_COLORS[i % BAND_COLORS.length].bg}
                            colorText={BAND_COLORS[i % BAND_COLORS.length].text}
                            onDateChange={(v) => updateDate(i, v)}
                            onConfigChange={(patch) => updateWindowConfig(i, patch)}
                            onHelp={openHelp}
                            globalEscalation={globalEscalation}
                            globalTScore={globalTScore}
                          />
                        ))}
                      </div>
                    </div>
                    <ContinueButton onClick={() => handleContinue("window-config")} />
                  </Section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Global escalation (unnumbered, appears when any screener selected after step 2) ── */}
          <AnimatePresence initial={false}>
            {anyScreener && currentStep >= sectionNum("window-config") && (
              <motion.div key="escalation-section" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                <hr className="border-[#e8ecf0]" />
                <section className="space-y-5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-bold text-gray-900">Auto-escalation</h2>
                    <button onClick={() => openHelp("Auto-Escalation", (
                      <div className="space-y-4 text-[14px] text-gray-600 leading-relaxed">
                        <p>When enabled, students who score at or below the T-score threshold on a screener are automatically assigned the full DESSA for every remaining window that year — no manual review needed.</p>
                        <p>A T-score of <strong>40 or below</strong> is the standard cutoff for <strong>Need for Instruction</strong>, indicating the student may benefit from targeted social-emotional support.</p>
                        <p>You can raise or lower the threshold based on your program's criteria.</p>
                      </div>
                    ))} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                      <HelpCircle size={15} />
                    </button>
                  </div>
                  <p className="text-[14px] text-gray-600 leading-relaxed max-w-2xl">
                    If a student scores below the threshold in a screener window, should they automatically be assessed using the full DESSA for the rest of the year?
                  </p>
                  <div className="space-y-2">
                    {([{ value: true, label: "Yes" }, { value: false, label: "No" }] as const).map(({ value, label }) => (
                      <label key={String(value)} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="global-escalation" checked={globalEscalation === value}
                          onChange={() => setGlobalEscalation(value)}
                          className="w-4 h-4 accent-[#1a4e8a] cursor-pointer" />
                        <span className="text-[14px] text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                  <AnimatePresence initial={false}>
                    {globalEscalation === true && (
                      <motion.div key="global-tscore" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                        <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e8ecf0] rounded-lg px-3 py-2 max-w-xs">
                          <span className="text-[12px] text-gray-500 flex-1">T-score threshold</span>
                          <input
                            type="number"
                            value={globalTScore}
                            onChange={(e) => setGlobalTScore(e.target.value)}
                            className="w-12 text-[13px] font-semibold text-center bg-white border border-[#d1d5db] rounded px-1 py-0.5 focus:outline-none focus:border-[#1a4e8a]"
                          />
                          <span className="text-[12px] text-gray-500">or below</span>
                          <button onClick={() => openHelp("T-Score Ranges", (
                            <div className="space-y-4 text-[14px] text-gray-600 leading-relaxed">
                              <p>T-scores indicate how a student's social-emotional skills compare to their peers.</p>
                              <div className="h-5 rounded-md overflow-hidden flex">
                                {TSCORE_RANGES.map(({ label, value, bg, text, flex }) => (
                                  <div key={label} className="flex items-center justify-center" style={{ flex, backgroundColor: bg }}>
                                    <span className="text-[9px] font-bold" style={{ color: text }}>{value}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-2">
                                {TSCORE_RANGES.map(({ label, value, bg, text }) => (
                                  <div key={label} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: bg, border: "1px solid #e5e7eb" }} />
                                    <span className="flex-1 text-gray-700">{label}</span>
                                    <span className="font-semibold" style={{ color: text }}>{value}</span>
                                  </div>
                                ))}
                              </div>
                              <p className="text-gray-500 text-[13px]">A threshold of 40 or below is the standard cutoff for Need for Instruction.</p>
                            </div>
                          ))} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"><HelpCircle size={13} /></button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Site schedules (default path only) ── */}
          <AnimatePresence initial={false}>
            {!editingIsOverride && currentStep >= sectionNum("site-schedules") && (
              <motion.div key="site-schedules-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <hr className="border-[#e8ecf0]" />
                <div ref={(r) => { sectionRefs.current["site-schedules"] = r; }}>
                  <Section title="Site schedules" step={sectionNum("site-schedules")} subtitle="Do all sites follow this setup, or do some need different windows?"
                    onHelp={() => openHelp("Site Custom Setups", <div className="space-y-4 text-[14px] text-gray-600 leading-relaxed"><p>By default, every site in your organization follows the same rating windows and assessment configuration.</p><p>If a site has a different schedule — for example, a school on a trimester calendar — you can give it a custom setup with its own dates and assessment types.</p><p>Custom setups are independent from the default. Changes to the default setup won't affect sites with a custom setup.</p></div>)}>
                    <div className="space-y-3">
                      {([
                        { value: false, label: "Yes, all sites use the same setup", desc: "Every site follows the windows and assessment types you configured." },
                        { value: true, label: "No, some sites need a custom setup", desc: "You can set different windows, dates, and assessment types per site." },
                      ] as const).map(({ value, label, desc }) => (
                        <label key={String(value)} className="flex items-start gap-3 cursor-pointer">
                          <input type="radio" name="site-overrides" checked={hasSiteCustomSetups === value}
                            onChange={() => { setHasSiteCustomSetups(value); if (!value) setSelectedSiteRows([]); }}
                            className="w-5 h-5 accent-[#1a4e8a] cursor-pointer shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[15px] text-gray-800">{label}</p>
                            <p className="text-[13px] text-gray-500 mt-0.5">{desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <AnimatePresence initial={false}>
                      {hasSiteCustomSetups === true && (
                        <motion.div key="site-table" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="rounded-xl border border-[#e8ecf0] overflow-hidden bg-white mt-4">
                            <div className="flex items-center gap-3 px-4 py-3 bg-[#f8fafc] border-b border-[#e8ecf0]">
                              <div className="relative max-w-[300px] w-full">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" placeholder="Search sites…" value={siteSearchQuery}
                                  onChange={(e) => setSiteSearchQuery(e.target.value)}
                                  className="w-full h-8 pl-8 pr-3 text-[13px] border border-[#d1d5db] rounded-lg bg-white focus:outline-none focus:border-[#1a4e8a] placeholder:text-gray-400" />
                              </div>
                              <div className="flex-1" />
                              {(() => {
                                const groupCount = new Set(Object.values(siteCustomSetups).filter(Boolean).map((cfg) => cfg!.groupName?.trim() || "__" + JSON.stringify(cfg))).size;
                                return groupCount > 0 ? (
                                  <span className="text-[12px] font-semibold text-[#1a4e8a] bg-[#eef2f8] border border-[#c7d7ee] rounded-full px-3 py-1">
                                    {groupCount} custom {groupCount === 1 ? "setup" : "setups"}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                            <div className="grid grid-cols-[44px_1fr_130px_44px] border-b border-[#e8ecf0] bg-[#f8fafc]">
                              <div className="flex items-center justify-center py-2.5">
                                <input type="checkbox" checked={allFilteredSelected}
                                  onChange={(e) => setSelectedSiteRows(e.target.checked ? filteredSites : [])}
                                  className="w-4 h-4 accent-[#1a4e8a] cursor-pointer" />
                              </div>
                              <div className="px-3 py-2.5 flex items-center">
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Site</span>
                              </div>
                              <div className="px-3 py-2.5 flex items-center">
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Schedule</span>
                              </div>
                              <div />
                            </div>
                            <div className="overflow-y-auto" style={{ maxHeight: "50vh" }}>
                              {filteredSites.map((site) => {
                                const hasCustom = !!siteCustomSetups[site];
                                const isSelected = selectedSiteRows.includes(site);
                                return (
                                  <div key={site} onClick={() => setSelectedSiteRows((prev) => prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site])}
                                    className={`grid grid-cols-[44px_1fr_130px_44px] border-b border-[#f0f4f8] last:border-0 cursor-pointer transition-colors ${isSelected ? "bg-[#eef2f8]" : "bg-white hover:bg-[#f8fafc]"}`}>
                                    <div className="flex items-center justify-center py-3" onClick={(e) => e.stopPropagation()}>
                                      <input type="checkbox" checked={isSelected}
                                        onChange={() => setSelectedSiteRows((prev) => prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site])}
                                        className="w-4 h-4 accent-[#1a4e8a] cursor-pointer" />
                                    </div>
                                    <div className="px-3 py-3 flex items-center">
                                      <span className="text-[14px] text-gray-800">{site}</span>
                                    </div>
                                    <div className="px-3 py-3 flex items-center">
                                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md max-w-[120px] truncate block ${hasCustom ? "bg-[#eef2f8] text-[#1a4e8a]" : "bg-gray-100 text-gray-400"}`}>
                                        {hasCustom ? (siteCustomSetups[site]?.groupName?.trim() || "Custom") : "Default"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-center py-3" />
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex items-center justify-end px-4 py-3 bg-[#f8fafc] border-t border-[#e8ecf0]">
                              <button
                                disabled={selectedSiteRows.length === 0}
                                className="h-8 px-4 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer bg-[#1a4e8a] text-white hover:bg-[#15407a] disabled:opacity-40 disabled:cursor-not-allowed">
                                {selectedSiteRows.length > 0 ? `Edit ${selectedSiteRows.length} schedule${selectedSiteRows.length > 1 ? "s" : ""}` : "Edit schedules"}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <ContinueButton onClick={() => handleContinue("site-schedules")} />
                  </Section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Student self-assessments ── */}
          <AnimatePresence initial={false}>
            {currentStep >= sectionNum("students") && (
              <motion.div key="students-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <hr className="border-[#e8ecf0]" />
                <div ref={(r) => { sectionRefs.current["students"] = r; }}>
                  <Section title="Student self-assessments" step={sectionNum("students")} subtitle="Who controls when students can access their self-assessment within each window?"
                    onHelp={() => openHelp("Student Self-Assessment Access", <div className="space-y-4 text-[14px] text-gray-600 leading-relaxed"><p>The DESSA student self-report lets students rate themselves on social-emotional skills.</p><p>By default, student assessments open automatically when a rating window opens — no extra step needed.</p><p>If you enable Site Leader management, each Site Leader can choose exactly when students at their site can access their self-assessment within the window, giving them more control over timing.</p></div>)}>
                    <div className="space-y-3">
                      {([
                        { value: false, label: "Automatic", desc: "Student assessments open at the start of each rating window. No extra step needed." },
                        { value: true, label: "Site Leader controlled", desc: "Site Leaders choose when students at their site can access their self-assessment within the window." },
                      ] as const).map(({ value, label, desc }) => (
                        <label key={String(value)} className="flex items-start gap-3 cursor-pointer">
                          <input type="radio" name="students" checked={siteLeaderManage === value}
                            onChange={() => setSiteLeaderManage(value)}
                            className="w-5 h-5 accent-[#1a4e8a] cursor-pointer shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[15px] text-gray-800">{label}</p>
                            <p className="text-[13px] text-gray-500 mt-0.5">{desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </Section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8ecf0] px-8 py-4 flex items-center justify-between z-10">
        <button
          onClick={() => setMode("overview")}
          className="h-10 px-5 rounded-lg border border-[#d1d5db] text-[13.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-7 rounded-lg bg-[#1a4e8a] text-white text-[13.5px] font-semibold hover:bg-[#15407a] transition-colors cursor-pointer disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save setup"}
        </button>
      </div>

      {/* Help slide-out panel */}
      <AnimatePresence>
        {helpOpen && helpContent && (
          <>
            <motion.div className="fixed inset-0 z-20" onClick={() => setHelpOpen(false)} />
            <motion.aside
              initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 w-[380px] bg-white border-l border-[#e8ecf0] z-30 flex flex-col shadow-xl"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-[#e8ecf0]">
                <h2 className="text-[18px] font-bold text-gray-900">{helpContent.title}</h2>
                <button onClick={() => setHelpOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-8 py-6">{helpContent.body}</div>
              <div className="px-8 py-5 border-t border-[#e8ecf0] shrink-0">
                <button onClick={() => setHelpOpen(false)} className="w-full h-9 rounded-lg border border-[#d1d5db] text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                  Close
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Success ring ─────────────────────────────────────────────────────────────

function SuccessRing() {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  return (
    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="relative">
      {[0, 1].map((n) => (
        <motion.div key={n} className="absolute inset-0 rounded-full border-2 border-[#1a4e8a]"
          initial={{ scale: 1, opacity: 0.4 }} animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 1.8, delay: n * 0.7, repeat: Infinity, ease: "easeOut" }} />
      ))}
      <svg width="120" height="120" viewBox="0 0 120 120">
        <motion.circle cx="60" cy="60" r={r} fill="#eef2f8" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.35 }} style={{ transformOrigin: "60px 60px" }} />
        <motion.circle cx="60" cy="60" r={r} fill="none" stroke="#1a4e8a" strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut", delay: 0.1 }} style={{ transformOrigin: "60px 60px", rotate: "-90deg" }} />
        <motion.path d="M38 60 L52 74 L82 44" fill="none" stroke="#1a4e8a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="60" initial={{ strokeDashoffset: 60 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.4, ease: "easeOut", delay: 0.65 }} />
      </svg>
    </motion.div>
  );
}

// ─── Wrapper ──────────────────────────────────────────────────────────────────

export default function SingleSetupPageWrapper() {
  return (
    <Suspense>
      <SingleSetupPage />
    </Suspense>
  );
}
