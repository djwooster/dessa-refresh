"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, HelpCircle, X, Info, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";

// ─── Types ────────────────────────────────────────────────────────────────────

type WindowConfig = {
  assessment: "screener" | "full" | null;
  conditionalAssignment: boolean | null;
  tScore: string;
  resetBehavior: "rescreen" | "skip" | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const WINDOW_OPTIONS = [
  { count: 1, labels: ["Annual Assessment"] },
  { count: 2, labels: ["Pre-Assessment", "Post-Assessment"] },
  { count: 3, labels: ["Pre-Assessment", "Mid-Assessment", "Post-Assessment"] },
  { count: 4, labels: ["Pre-Assessment", "Mid 1 Assessment", "Mid 2 Assessment", "Post-Assessment"] },
  { count: 5, labels: ["Pre-Assessment", "Mid 1 Assessment", "Mid 2 Assessment", "Mid 3 Assessment", "Post-Assessment"] },
];

const DEFAULT_DATES: Record<number, string[]> = {
  1: ["2025-08-01"],
  2: ["2025-08-01", "2026-05-28"],
  3: ["2025-08-01", "2026-01-01", "2026-05-28"],
  4: ["2025-08-01", "2025-11-01", "2026-02-01", "2026-05-28"],
  5: ["2025-08-01", "2025-10-01", "2026-01-01", "2026-03-01", "2026-05-28"],
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
  { label: "Need for Instruction", value: "≤ 40", bg: "#fecaca", text: "#b91c1c", flex: 2 },
  { label: "Typical",              value: "41–59", bg: "#dbeafe", text: "#1e40af", flex: 3 },
  { label: "Strength",             value: "≥ 60",  bg: "#dcfce7", text: "#166534", flex: 2 },
];

// ─── Mini timeline ─────────────────────────────────────────────────────────────

function MiniTimeline({ dates, labels }: { dates: string[]; labels: string[] }) {
  const parsed = dates.map((d) => d ? new Date(d + "T00:00:00") : null);
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

// ─── Window section ────────────────────────────────────────────────────────────

function WindowSection({
  index, label, windowCount, date, cfg, allConfigs, colorBg, colorText,
  onDateChange, onConfigChange, onHelp,
}: {
  index: number; label: string; windowCount: number; date: string;
  cfg: WindowConfig; allConfigs: WindowConfig[];
  colorBg: string; colorText: string;
  onDateChange: (v: string) => void;
  onConfigChange: (patch: Partial<WindowConfig>) => void;
  onHelp: (title: string, body: React.ReactNode) => void;
}) {
  const isLastWindow = index === windowCount - 1;

  // Alert: previous windows where skip=yes
  const joinLabels = (names: string[]) =>
    names.length === 1 ? names[0] : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
  const parentLabels = WINDOW_OPTIONS.find(o => o.count === windowCount)?.labels ?? [];
  const skipWindows = Array.from({ length: index }, (_, j) => j)
    .filter(j => allConfigs[j]?.assessment === "screener" && allConfigs[j]?.conditionalAssignment === true && allConfigs[j]?.resetBehavior === "skip")
    .map(j => parentLabels[j]);

  return (
    <div className="rounded-xl border border-[#e8ecf0] bg-white overflow-hidden">
      {/* Colored header */}
      <div className="px-5 py-3 flex items-center gap-2" style={{ backgroundColor: colorBg }}>
        <span className="text-[14px] font-bold" style={{ color: colorText }}>{label}</span>
      </div>

      <div className="px-5 py-5 space-y-8">
        {/* Skip alert */}
        {skipWindows.length > 0 && (
          <div className="rounded-xl bg-[#eef2f8] border border-[#c7d7ee] px-4 py-3 text-[13.5px] text-[#1a4e8a] leading-relaxed flex items-start gap-2.5">
            <Info size={15} className="shrink-0 mt-0.5" />
            <span>Students who scored below the threshold in{" "}
              {skipWindows.map((name, i) => (
                <span key={name}>{i > 0 && (i === skipWindows.length - 1 ? " and " : ", ")}<span className="font-semibold text-[#15407a]">{name}</span></span>
              ))}{" "}
              are automatically assessed using the full DESSA for the rest of the year. Your selection below applies to all other students.
            </span>
          </div>
        )}

        {/* Opening date */}
        <div>
          <p className="text-[15px] font-semibold text-gray-700 mb-2">Opening date</p>
          <div className="w-[220px]">
            <DatePicker value={date} onChange={onDateChange} />
          </div>
        </div>

        {/* Q1: Assessment type */}
        <div className="rounded-xl border border-[#e8ecf0] p-4">
          <div className="flex items-start gap-2 mb-0">
            <p className="text-[15px] font-semibold text-gray-800">Should educators start with the DESSA screener or the full DESSA?</p>
            <button onClick={() => onHelp("Screener vs. Full Assessment", (
              <div className="space-y-6 text-[14px] text-gray-600 leading-relaxed">
                <div><p className="text-[18px] font-semibold text-gray-800 mb-1">Screener</p><p>A short, 8-item form that quickly identifies students who may need additional support. Includes the DESSA 2 mini and DESSA HSE-mini.</p></div>
                <div><p className="text-[18px] font-semibold text-gray-800 mb-1">Full Assessment</p><p>A comprehensive form measuring eight social-emotional competencies in depth. Includes the DESSA 2 and DESSA HSE.</p></div>
                <div><p className="text-[18px] font-semibold text-gray-800 mb-1">In Summary</p><p>The DESSA screener gives a quick overall score and works well when educators need to assess many students efficiently. The full DESSA takes longer but provides a score for each social-emotional competency.</p></div>
              </div>
            ))} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0">
              <HelpCircle size={15} />
            </button>
          </div>
          <div className={`space-y-3 mt-4`}>
            {[{ value: "screener" as const, label: "Screener" }, { value: "full" as const, label: "Full DESSA" }].map(({ value, label: lbl }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name={`assess-${index}`} checked={cfg.assessment === value}
                  onChange={() => onConfigChange({ assessment: value })}
                  className="w-5 h-5 accent-[#1a4e8a] cursor-pointer" />
                <span className="text-[15px] text-gray-800">{lbl}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Q2 + Q3: Escalation (screener only) */}
        <AnimatePresence initial={false}>
          {cfg.assessment === "screener" && (
            <motion.div key="esc" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="rounded-xl border border-[#e8ecf0] p-4 space-y-6">
                {/* Q2 */}
                <div>
                  <div className="flex items-start gap-2 mb-0">
                    <p className="text-[15px] font-semibold text-gray-800">Should students who score below a threshold on the screener automatically require a full DESSA?</p>
                    <button onClick={() => onHelp("Auto-Escalation", (
                      <div className="space-y-4 text-[14px] text-gray-600 leading-relaxed">
                        <p>When enabled, students who score at or below a T-Score threshold are automatically assigned the full DESSA — no manual review needed by teachers.</p>
                        <p>A T-Score of <strong>40 or below</strong> is the standard cutoff for <strong>Need for Instruction</strong>, indicating the student may benefit from targeted social-emotional support.</p>
                        <p>You can set the threshold higher or lower based on your program's criteria.</p>
                      </div>
                    ))} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0">
                      <HelpCircle size={15} />
                    </button>
                  </div>
                  <div className="space-y-3 mt-4">
                    {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(({ value, label: lbl }) => (
                      <label key={String(value)} className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name={`esc-${index}`} checked={cfg.conditionalAssignment === value}
                          onChange={() => onConfigChange({ conditionalAssignment: value })}
                          className="w-5 h-5 accent-[#1a4e8a] cursor-pointer" />
                        <span className="text-[15px] text-gray-800">{lbl}</span>
                      </label>
                    ))}
                  </div>

                  {/* T-score */}
                  <AnimatePresence initial={false}>
                    {cfg.conditionalAssignment && (
                      <motion.div key="tscore" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                        <div className="flex items-center gap-3 mt-4 bg-[#f8fafc] border border-[#e8ecf0] rounded-xl px-4 py-3">
                          <span className="text-[14px] text-gray-600 flex-1">Assign the full DESSA to students who score</span>
                          <input type="number" value={cfg.tScore}
                            onChange={(e) => onConfigChange({ tScore: e.target.value })}
                            className="w-16 h-8 px-2 text-sm text-center border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:border-[#1a4e8a]" />
                          <span className="text-[14px] text-gray-600">or below</span>
                          <button onClick={() => onHelp("T-Score Ranges", (
                            <div className="space-y-4 text-[14px] text-gray-600 leading-relaxed">
                              <p>T-Scores indicate how a student's social-emotional skills compare to their peers.</p>
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
                            </div>
                          ))} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0">
                            <HelpCircle size={15} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Q3: Year-long policy */}
                <AnimatePresence initial={false}>
                  {cfg.conditionalAssignment && !isLastWindow && (
                    <motion.div key="q3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="border-t border-[#e8ecf0] pt-5">
                        <div className="flex items-start gap-2 mb-4">
                          <p className="text-[15px] font-semibold text-gray-800">
                            If a student scores below the threshold in this rating window, should they automatically be assessed using the full DESSA for the rest of the year?
                          </p>
                          <button onClick={() => onHelp("Full DESSA for the Rest of the Year", (
                            <div className="space-y-8 text-[14px] text-gray-600 leading-relaxed">
                              <div><p className="text-[18px] font-semibold text-gray-800 mb-1">Yes — full DESSA for the rest of the year</p><p>Once a student scores below the threshold, they are automatically assigned the full DESSA for every remaining window this year.</p></div>
                              <div><p className="text-[18px] font-semibold text-gray-800 mb-1">No — start fresh each window</p><p>Students begin each new window alongside everyone else, regardless of previous results.</p></div>
                              <div><p className="text-[18px] font-semibold text-gray-800 mb-1">Which should I choose?</p><p>Choose <strong>Yes</strong> if students who need additional support should consistently receive a deeper assessment. Choose <strong>No</strong> if you want to re-evaluate each window to track growth over time, regardless of previous results.</p></div>
                            </div>
                          ))} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0">
                            <HelpCircle size={15} />
                          </button>
                        </div>
                        <div className="space-y-3">
                          {([
                            { value: "skip" as const, label: "Yes", desc: <>Students with an identified <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="font-semibold text-[#1a4e8a] underline underline-offset-2 cursor-pointer">Need for Instruction</button> will be assessed using the full DESSA for all remaining rating windows.</> },
                            { value: "rescreen" as const, label: "No", desc: <>They start each new window fresh, assessed alongside all other students.</> },
                          ] as { value: "skip" | "rescreen"; label: string; desc: React.ReactNode }[]).map(({ value, label: lbl, desc }) => (
                            <label key={value} className="flex items-start gap-3 cursor-pointer">
                              <input type="radio" name={`reset-${index}`} value={value} checked={cfg.resetBehavior === value}
                                onChange={() => onConfigChange({ resetBehavior: value })}
                                className="w-5 h-5 accent-[#1a4e8a] cursor-pointer shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[15px] text-gray-800">{lbl}</p>
                                <p className="text-[13px] text-gray-500 mt-0.5">{desc}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

function SiteConfigPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sitesParam = searchParams.get("sites") ?? "";
  const year = searchParams.get("year") ?? "2025-2026";
  const parentWindowCount = parseInt(searchParams.get("windowCount") ?? "3");
  const parentDatesParam = searchParams.get("dates") ?? "";
  const returnTo = searchParams.get("returnTo") ?? "/settings/yearly-setup/edit2";

  const parentDates = parentDatesParam ? parentDatesParam.split(",") : DEFAULT_DATES[parentWindowCount];
  const initialSites = sitesParam ? sitesParam.split(",").filter(Boolean) : [];

  // ─── State ─────────────────────────────────────────────────────────────────

  const [sites, setSites] = useState<string[]>(initialSites);
  const [groupName, setGroupName] = useState("");
  const [windowCount, setWindowCount] = useState(parentWindowCount);
  const [dates, setDates] = useState<string[]>(parentDates);
  const [windowConfigs, setWindowConfigs] = useState<WindowConfig[]>(
    Array(parentWindowCount).fill(null).map(() => ({ assessment: null, conditionalAssignment: null, tScore: "40", resetBehavior: null }))
  );
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpContent, setHelpContent] = useState<{ title: string; body: React.ReactNode } | null>(null);

  const handleBack = () => { if (isDirty) { setShowLeaveConfirm(true); } else { router.push(returnTo); } };

  const labels = WINDOW_OPTIONS.find(o => o.count === windowCount)?.labels ?? [];

  // ─── Load existing config from sessionStorage ─────────────────────────────

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("site-config-context");
      if (stored) {
        const ctx = JSON.parse(stored);
        const key = sites.slice().sort().join(",");
        if (ctx.configs?.[key]) {
          const cfg = ctx.configs[key];
          setGroupName(cfg.groupName ?? "");
          setWindowCount(cfg.windowCount ?? parentWindowCount);
          setDates(cfg.dates ?? parentDates);
          setWindowConfigs(cfg.windowConfigs ?? Array(cfg.windowCount ?? parentWindowCount).fill(null).map(() => ({ assessment: null, conditionalAssignment: null, tScore: "40", resetBehavior: null })));
        }
      }
    } catch { /* ignore */ }
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCountChange = (count: number) => {
    setIsDirty(true);
    setWindowCount(count);
    setDates(count <= parentDates.length ? parentDates.slice(0, count) : [...parentDates, ...DEFAULT_DATES[count].slice(parentDates.length)]);
    setWindowConfigs(count > windowConfigs.length
      ? [...windowConfigs, ...Array(count - windowConfigs.length).fill(null).map(() => ({ assessment: null, conditionalAssignment: null, tScore: "40", resetBehavior: null }))]
      : windowConfigs.slice(0, count)
    );
  };

  const updateDate = (i: number, v: string) => { setIsDirty(true); setDates(prev => prev.map((d, idx) => idx === i ? v : d)); };
  const updateConfig = (i: number, patch: Partial<WindowConfig>) => {
    setIsDirty(true);
    setWindowConfigs(prev => prev.map((wc, idx) => idx === i ? { ...wc, ...patch } : wc));
  };

  const openHelp = (title: string, body: React.ReactNode) => { setHelpContent({ title, body }); setHelpOpen(true); };

  const handleSave = () => {
    setSaving(true);
    const key = sites.slice().sort().join(",");
    const result = { groupName: groupName.trim() || undefined, windowCount, dates, windowConfigs };
    try {
      const stored = sessionStorage.getItem("site-config-context");
      const ctx = stored ? JSON.parse(stored) : { configs: {} };
      ctx.configs = ctx.configs ?? {};
      ctx.configs[key] = result;
      // Also map each individual site
      sites.forEach(site => { ctx.configs[site] = result; });
      sessionStorage.setItem("site-config-context", JSON.stringify(ctx));
    } catch { /* ignore */ }
    setSaving(false);
    router.push(returnTo + "&siteConfigSaved=1");
  };

  const yearDisplay = year.replace("-", "–");

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Sticky header */}
      <header className="h-[60px] shrink-0 flex items-center gap-4 px-8 border-b border-[#e8ecf0] bg-white sticky top-0 z-10">
        <button onClick={handleBack}
          className="flex items-center gap-2 text-[13px] font-medium text-gray-400 hover:text-gray-700 transition-colors cursor-pointer shrink-0">
          <ArrowLeft size={14} />
          Back to setup
        </button>
        <div className="h-4 w-px bg-[#e8ecf0]" />
        <p className="text-[15px] font-semibold text-gray-700 truncate">
          {sites.length === 1 ? sites[0] : `Configure ${sites.length} sites`}
        </p>
        <div className="flex-1" />
        <span className="text-[13px] text-gray-400 shrink-0">{yearDisplay}</span>
      </header>

      {/* Breadcrumb */}
      <div className="px-8 py-3 border-b border-[#f0f4f8] bg-white sticky top-[60px] z-10">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <span>Yearly Setup</span>
          <span>›</span>
          <span>Custom Schedule Setup</span>
          <span>›</span>
          <span className="text-gray-700 font-medium">
            {sites.length === 1 ? sites[0] : `${sites.length} sites`}
          </span>
        </nav>
      </div>

      {/* Body */}
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-[900px] mx-auto px-8 py-8 space-y-10">

          {/* Group name */}
          {sites.length > 1 && (
            <div>
              <p className="text-[15px] font-semibold text-gray-700 mb-2">Group name</p>
              <input
                type="text"
                value={groupName}
                onChange={(e) => { setGroupName(e.target.value); setIsDirty(true); }}
                onFocus={(e) => e.target.select()}
                placeholder="e.g. Title I Schools, District North…"
                className="w-full max-w-lg text-[22px] font-semibold text-gray-800 border-0 border-b-2 border-[#e8ecf0] focus:border-[#1a4e8a] focus:outline-none bg-transparent pb-1 placeholder:text-gray-300 placeholder:font-normal placeholder:text-[22px]"
              />
            </div>
          )}

          {/* Sites list */}
          <div>
            <p className="text-[13px] font-semibold text-gray-500 mb-2">
              {sites.length === 1 ? "Site" : `Sites (${sites.length})`}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sites.map((site) => (
                <span key={site} className="flex items-center gap-1 bg-white border border-[#d1d5db] text-[13px] text-gray-600 rounded-full px-3 py-1">
                  {site}
                  {sites.length > 1 && (
                    <button onClick={() => setSites(prev => prev.filter(s => s !== site))}
                      className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer ml-0.5">
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          <hr className="border-[#e8ecf0]" />

          {/* Window count */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[18px] font-bold text-gray-900">Rating windows</p>
                <p className="text-[14px] text-gray-500 mt-0.5">
                  {windowCount === parentWindowCount
                    ? `Inheriting ${parentWindowCount} windows from the default setup.`
                    : `Custom — different from the default setup (${parentWindowCount} windows).`}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {WINDOW_OPTIONS.map(({ count }) => {
                const isSelected = windowCount === count;
                const isParent = count === parentWindowCount;
                return (
                  <button key={count} onClick={() => handleCountChange(count)}
                    className={`text-left rounded-xl border p-4 transition-all cursor-pointer relative ${isSelected ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}>
                    {isParent && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 rounded px-1">Default</span>
                    )}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-[18px] font-bold ${isSelected ? "bg-[#1a4e8a] text-white" : "bg-gray-100 text-gray-500"}`}>
                      {count}
                    </div>
                    <p className={`text-[14px] font-semibold ${isSelected ? "text-[#1a4e8a]" : "text-gray-600"}`}>
                      {count === 1 ? "1 Window" : `${count} Windows`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          {dates.some(Boolean) && (
            <div className="bg-white rounded-xl border border-[#e8ecf0] p-5">
              <p className="text-[13px] font-medium text-gray-400 mb-0.5">Year at a glance</p>
              <p className="text-[15px] font-semibold text-gray-800 mb-4">{yearDisplay}</p>
              <MiniTimeline dates={dates} labels={labels} />
              <div className={`flex mt-4 pt-4 border-t border-[#f0f4f8] ${windowCount > 1 ? "justify-between" : ""}`}>
                {labels.slice(0, windowCount).map((label, j) => dates[j] ? (
                  <div key={j}>
                    <p className="text-[13px] font-medium text-gray-400">{label}</p>
                    <p className="text-[14px] font-semibold text-gray-800 mt-0.5">
                      {new Date(dates[j] + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          <hr className="border-[#e8ecf0]" />

          {/* Per-window sections */}
          <div>
            <p className="text-[18px] font-bold text-gray-900 mb-5">Configure each window</p>
            <div className="space-y-6">
              {Array.from({ length: windowCount }, (_, i) => (
                <WindowSection
                  key={i}
                  index={i}
                  label={labels[i]}
                  windowCount={windowCount}
                  date={dates[i] ?? ""}
                  cfg={windowConfigs[i] ?? { assessment: null, conditionalAssignment: null, tScore: "40", resetBehavior: null }}
                  allConfigs={windowConfigs}
                  colorBg={BAND_COLORS[i % BAND_COLORS.length].bg}
                  colorText={BAND_COLORS[i % BAND_COLORS.length].text}
                  onDateChange={(v) => updateDate(i, v)}
                  onConfigChange={(patch) => updateConfig(i, patch)}
                  onHelp={openHelp}
                />
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8ecf0] px-8 py-4 flex items-center justify-between z-10">
        <button onClick={handleBack}
          className="h-10 px-5 rounded-lg border border-[#d1d5db] text-[13.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="h-10 px-7 rounded-lg bg-[#1a4e8a] text-white text-[13.5px] font-semibold hover:bg-[#15407a] transition-colors cursor-pointer disabled:opacity-60">
          {saving ? "Saving…" : "Save configuration"}
        </button>
      </div>

      {/* Leave confirmation */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowLeaveConfirm(false)} />
          <div className="relative bg-white rounded-xl border border-[#e8ecf0] shadow-xl p-6 w-[400px]">
            <h2 className="text-[16px] font-bold text-gray-900 mb-2">Discard changes?</h2>
            <p className="text-[14px] text-gray-500 mb-6">You have unsaved changes to this site configuration. Going back will discard them.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLeaveConfirm(false)}
                className="h-9 px-4 rounded-lg border border-[#d1d5db] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                Keep editing
              </button>
              <button onClick={() => router.push(returnTo)}
                className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer">
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help panel */}
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

export default function SiteConfigPageWrapper() {
  return <Suspense><SiteConfigPage /></Suspense>;
}
