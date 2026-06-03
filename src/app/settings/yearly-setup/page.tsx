"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  ClipboardList,
  Plus,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConceptC } from "@/components/dashboard/timeline/ConceptC";
import { createClient } from "@/lib/supabase/client";
import type { YearlySetup, YearlySetupSite } from "@/lib/supabase/types";

type WindowConfig = {
  window_index: number;
  conditional_assignment: boolean;
  t_score: string | null;
  reset_behavior: string;
};
type SetupWithSites = YearlySetup & {
  yearly_setup_sites: YearlySetupSite[];
  yearly_setup_window_configs: WindowConfig[];
};

const SCHOOL_YEARS = ["2024-2025", "2025-2026", "2026-2027"];
const CURRENT_YEAR = "2025-2026";

const formatYear = (y: string) => y.replace("-", "–");

const PAST_YEAR_MOCK = {
  windowCount: 3,
  windows: [
    { label: "Pre-Assessment", date: "Aug 1, 2024", iso: "2024-08-01" },
    { label: "Mid-Assessment", date: "Jan 1, 2025", iso: "2025-01-01" },
    { label: "Post-Assessment", date: "May 28, 2025", iso: "2025-05-28" },
  ],
  assessment_type: "screener" as const,
  conditional_assignment: true,
  t_score: "40",
};

const TOTAL_SITES = 7;

const WINDOW_LABELS: Record<number, string[]> = {
  1: ["Annual Assessment"],
  2: ["Pre-Assessment", "Post-Assessment"],
  3: ["Pre-Assessment", "Mid-Assessment", "Post-Assessment"],
  4: ["Pre-Assessment", "Mid 1 Assessment", "Mid 2 Assessment", "Post-Assessment"],
  5: ["Pre-Assessment", "Mid 1 Assessment", "Mid 2 Assessment", "Mid 3 Assessment", "Post-Assessment"],
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

function ScheduleTimeline({
  dates,
  labels,
  showToday = false,
}: {
  dates: string[];
  labels: string[];
  showToday?: boolean;
}) {
  const parsed = dates.map((d) => (d ? new Date(d + "T00:00:00") : null));
  const valid = parsed.filter(Boolean) as Date[];
  if (valid.length === 0) return null;

  const rangeStart = valid[0];
  const rangeEnd = new Date(rangeStart.getFullYear() + 1, 7, 1);
  const rangeMs = rangeEnd.getTime() - rangeStart.getTime();
  const pct = (d: Date) =>
    Math.max(0, Math.min(100, ((d.getTime() - rangeStart.getTime()) / rangeMs) * 100));

  const today = new Date();
  const todayPct = pct(today);
  const todayInRange = today >= rangeStart && today <= rangeEnd;

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
                    : { left: `${(i / (ticks.length - 1)) * 100}%`, transform: "translateX(-50%)" }
              }
            >
              {MONTH_NAMES[m.getMonth()]}
            </span>
          );
        })}
      </div>
      <div className="relative h-9 rounded-lg overflow-visible flex">
        {parsed.map((date, i) => {
          if (!date) return null;
          const next = parsed[i + 1];
          const width = pct(next ?? rangeEnd) - pct(date);
          const color = BAND_COLORS[i % BAND_COLORS.length];
          const shortLabel = labels[i]?.replace(/\s*-?\s*Assessment/i, "").trim() || `W${i + 1}`;
          return (
            <div
              key={i}
              className="flex items-center justify-center overflow-hidden shrink-0"
              style={{ width: `${width}%`, backgroundColor: color.bg }}
            >
              <span className="text-[10px] font-bold truncate px-1" style={{ color: color.text }}>
                {shortLabel}
              </span>
            </div>
          );
        })}
        {showToday && todayInRange && (
          <div className="absolute top-0 bottom-0 w-[2px] bg-[#e9000f] z-10" style={{ left: `${todayPct}%` }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#e9000f]" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-1">
        {parsed.map((date, i) => {
          if (!date) return null;
          const color = BAND_COLORS[i % BAND_COLORS.length];
          const shortLabel = labels[i]?.replace(/\s*-?\s*Assessment/i, "").trim() || `W${i + 1}`;
          return (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color.bg, border: "1px solid #e5e7eb" }} />
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-gray-600 leading-tight">{shortLabel}-Assessment</span>
                <span className="text-[10.5px] text-gray-400 leading-tight">
                  opens {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function crossesAugReset(dates: string[]): boolean {
  const months = dates.map((d) => new Date(d + "T00:00:00").getMonth());
  return months.some((m) => m <= 6) && months.some((m) => m >= 7);
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function AssessmentConfigRows({
  windowCount,
  dates,
  assessmentType,
  windowConfigs,
}: {
  windowCount: number;
  dates: string[];
  assessmentType: "screener" | "full";
  windowConfigs: WindowConfig[];
}) {
  const labels = WINDOW_LABELS[windowCount] ?? Array.from({ length: windowCount }, (_, i) => `Window ${i + 1}`);
  return (
    <div>
      <h3 className="text-[20px] font-semibold text-gray-800 mb-4">Assessment configuration</h3>
      <div className="rounded-xl border border-[#e8ecf0] overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_160px_1fr] gap-4 px-5 py-2.5 bg-[#f8fafc] border-b border-[#e8ecf0]">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Window</span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Assessment type</span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Auto-assign DESSA</span>
        </div>
        {Array.from({ length: windowCount }, (_, i) => {
          const wc = windowConfigs.find((c) => c.window_index === i);
          const isScreener = assessmentType === "screener";
          return (
            <div key={i} className="grid grid-cols-[1fr_160px_1fr] gap-4 px-5 py-3.5 border-b border-[#f0f4f8] last:border-0 bg-white">
              <div>
                <p className="text-[13px] font-semibold text-gray-800">{labels[i]}</p>
                {dates[i] && <p className="text-[12px] text-gray-400 mt-0.5">Opens {formatDate(dates[i])}</p>}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-[#1a4e8a] flex items-center justify-center shrink-0">
                  {isScreener
                    ? <Zap size={10} className="text-white" strokeWidth={2} />
                    : <ClipboardList size={10} className="text-white" strokeWidth={2} />}
                </div>
                <span className="text-[13px] text-gray-700">{isScreener ? "Screener" : "Full Assessment"}</span>
              </div>
              <div>
                {wc?.conditional_assignment
                  ? <p className="text-[13px] text-gray-700">T-score ≤ {wc.t_score}</p>
                  : <p className="text-[13px] text-gray-400">Disabled</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function YearlySetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [allSetups, setAllSetups] = useState<SetupWithSites[]>([]);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("yearly_setups")
        .select("*, yearly_setup_sites(*), yearly_setup_window_configs(*)")
        .order("created_at", { ascending: true });
      if (data) setAllSetups(data as SetupWithSites[]);
      setLoading(false);
    }
    load();
  }, []);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    await supabase.from("yearly_setups").delete().eq("id", confirmDeleteId);
    setAllSetups((prev) => prev.filter((s) => s.id !== confirmDeleteId));
    setConfirmDeleteId(null);
    setDeleting(false);
  };

  // Derived
  const defaultSetup =
    allSetups.find((s) => s.is_default && s.year === selectedYear) ?? null;
  const overrides = allSetups.filter(
    (s) => !s.is_default && s.year === selectedYear,
  );
  const isPastYear = selectedYear < CURRENT_YEAR;
  const currentYearHasSetup = allSetups.some(
    (s) => s.is_default && s.year === CURRENT_YEAR,
  );
  const sitesInOverrides = overrides.reduce((acc, o) => acc + o.yearly_setup_sites.length, 0);
  const defaultSiteCount = Math.max(0, TOTAL_SITES - sitesInOverrides);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#1a4e8a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Rating Window Setup</h1>
          <p className="text-[16px] text-gray-500">
            Plan your year ahead and set rating window timeframes for each
            school year.
          </p>
        </div>
        {defaultSetup && (
          <button
            onClick={() => setConfirmDeleteId(defaultSetup.id)}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 hover:text-red-500 transition-colors cursor-pointer mt-1"
          >
            <Trash2 size={12} strokeWidth={1.75} />
            Delete Setup
          </button>
        )}
      </div>

      {/* Default config */}
      {isPastYear ? (
        <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden mb-4">
          <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-b border-[#e8ecf0]">
            <YearSelect
              selectedYear={selectedYear}
              onSelect={setSelectedYear}
            />
            {!currentYearHasSetup && (
              <button
                onClick={() =>
                  router.push("/settings/yearly-setup/edit2?fromPastYear=true")
                }
                className="flex items-center justify-center px-4 py-2 rounded-lg bg-[#1a4e8a] text-white text-[14px] font-semibold hover:bg-[#15407a] transition-colors cursor-pointer tracking-tight whitespace-nowrap"
              >
                Use for 2025–26
              </button>
            )}
          </div>

          <div className="px-6 py-5 border-b border-[#f0f4f8]">
            <h3 className="text-[20px] font-semibold text-gray-800 mb-4">
              Rating windows
            </h3>
            <div className="mb-6">
              <ScheduleTimeline
                dates={PAST_YEAR_MOCK.windows.map((w) => w.iso)}
                labels={PAST_YEAR_MOCK.windows.map((w) => w.label)}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PAST_YEAR_MOCK.windows.map((w) => (
                <div
                  key={w.label}
                  className="bg-[#f8fafc] rounded-lg px-4 py-3 border border-[#edf0f4]"
                >
                  <p className="text-[14px] font-medium text-gray-400 mb-1">
                    {w.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {w.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-5">
            <AssessmentConfigRows
              windowCount={PAST_YEAR_MOCK.windowCount}
              dates={PAST_YEAR_MOCK.windows.map((w) => w.iso)}
              assessmentType={PAST_YEAR_MOCK.assessment_type}
              windowConfigs={PAST_YEAR_MOCK.windows.map((_, i) => ({
                window_index: i,
                conditional_assignment: PAST_YEAR_MOCK.conditional_assignment,
                t_score: PAST_YEAR_MOCK.t_score,
                reset_behavior: "rescreen",
              }))}
            />
          </div>
        </div>
      ) : !defaultSetup ? (
        <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">
          {/* Year switcher in empty state header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-b border-[#e8ecf0]">
            <YearSelect
              selectedYear={selectedYear}
              onSelect={setSelectedYear}
            />
          </div>
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <img src="/undraw_date-picker_8qys.svg" alt="" className="w-40 h-40 mb-4" />
            <h3 className="text-[20px] font-semibold text-gray-800 mb-1">
              No setup for {formatYear(selectedYear)}
            </h3>
            <p className="text-[16px] text-gray-500 max-w-sm mb-6">
              Define your rating windows and assessment configuration to get
              started.
            </p>
            <button
              onClick={() =>
                router.push(`/settings/yearly-setup/edit2?year=${selectedYear}`)
              }
              className="flex items-center justify-center w-[120px] py-2 rounded-lg bg-[#1a4e8a] text-white text-[14px] font-medium hover:bg-[#15407a] transition-colors cursor-pointer"
            >
              Setup
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden mb-4">
            <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-b border-[#e8ecf0]">
              <YearSelect
                selectedYear={selectedYear}
                onSelect={setSelectedYear}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    router.push(
                      `/settings/yearly-setup/edit2?id=${defaultSetup.id}&year=${selectedYear}`,
                    )
                  }
                  className="flex items-center justify-center w-[130px] h-9 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors cursor-pointer"
                >
                  Edit Setup
                </button>
              </div>
            </div>

            <div className="px-6 py-5 border-b border-[#f0f4f8]">
              <h3 className="text-[20px] font-semibold text-gray-800 mb-0.5">
                Default rating windows
              </h3>
              <p className="text-sm text-gray-500 mb-4">Applies to {defaultSiteCount} {defaultSiteCount === 1 ? "site" : "sites"}</p>
              <ConceptC showYearLabel={false} />
            </div>

            <div className="px-6 py-5">
              <AssessmentConfigRows
                windowCount={defaultSetup.window_count}
                dates={(defaultSetup.dates as string[]) ?? []}
                assessmentType={defaultSetup.assessment_type as "screener" | "full"}
                windowConfigs={defaultSetup.yearly_setup_window_configs ?? []}
              />
            </div>
          </div>

          {/* Aug 1 reset callout */}
          {/* {crossesAugReset(defaultSetup.dates) && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
              <AlertTriangle
                size={16}
                className="text-amber-500 mt-0.5 shrink-0"
                strokeWidth={1.75}
              />
              <div>
                <p className="text-[13.5px] font-semibold text-amber-800">
                  Some sites may have a window that crosses the DESSA system
                  reset on Aug 1
                </p>
                <p className="text-[13px] text-amber-700 mt-0.5">
                  Ratings submitted after August 1st are classified as
                  pre-assessments by DESSA, even if they fall within your
                  post-window. Set up a custom schedule for affected sites to
                  keep their reporting accurate.
                </p>
                <button
                  onClick={() =>
                    router.push("/settings/yearly-setup/edit2?override=true")
                  }
                  className="mt-3 text-[12.5px] font-semibold text-amber-800 underline underline-offset-2 cursor-pointer hover:text-amber-900 transition-colors"
                >
                  Set up a custom schedule →
                </button>
              </div>
            </div>
          )} */}

          {/* Custom Schedules */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900">
                  Custom Schedules
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Sites whose rating windows don't align with the default
                  schedule.
                </p>
              </div>
              {overrides.length > 0 && (
                <button
                  onClick={() =>
                    router.push("/settings/yearly-setup/edit2?override=true")
                  }
                  className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[#1a4e8a] text-[13px] font-semibold text-[#1a4e8a] hover:bg-[#eef2f8] transition-colors cursor-pointer"
                >
                  <Plus size={13} strokeWidth={2} />
                  Add Custom Schedule
                </button>
              )}
            </div>

            <div className={overrides.length === 0 ? "bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden" : ""}>
              {overrides.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <img src="/undraw_date-picker_8qys.svg" alt="" className="w-32 h-32 mb-1" />
                  <h6 className="text-[15px] font-semibold text-gray-700 mb-1">
                    No custom schedules
                  </h6>
                  <p className="text-sm text-gray-400 mb-5 max-w-sm">
                    All sites are following the default setup. Add a custom
                    schedule for sites that need different window dates.
                  </p>
                  <button
                    onClick={() =>
                      router.push("/settings/yearly-setup/edit2?override=true")
                    }
                    className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[#1a4e8a] text-[13px] font-semibold text-[#1a4e8a] hover:bg-[#eef2f8] transition-colors cursor-pointer"
                  >
                    <Plus size={13} strokeWidth={2} />
                    Add Custom Schedule
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {overrides.map((override) => (
                    <div key={override.id} className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-b border-[#e8ecf0]">
                        <div>
                          <p className="text-[14px] font-bold text-gray-900">
                            {override.group_name}
                          </p>
                          <p className="text-[12px] text-gray-400 mt-0.5">
                            {override.yearly_setup_sites
                              .map((s) => s.site_name)
                              .join(", ")}
                          </p>
                        </div>
                        <div className="relative" ref={openMenuId === override.id ? menuRef : null}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === override.id ? null : override.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <MoreHorizontal size={16} strokeWidth={1.75} />
                          </button>
                          {openMenuId === override.id && (
                            <div className="absolute right-0 top-9 z-20 w-36 bg-white rounded-xl border border-[#e8ecf0] shadow-lg py-1 overflow-hidden">
                              <button
                                onClick={() => { setOpenMenuId(null); router.push(`/settings/yearly-setup/edit2?id=${override.id}&override=true`); }}
                                className="w-full text-left px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-[#f8fafc] cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => { setOpenMenuId(null); setConfirmDeleteId(override.id); }}
                                className="w-full text-left px-4 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="px-6 py-5 border-b border-[#f0f4f8]">
                        <h3 className="text-[20px] font-semibold text-gray-800 mb-0.5">Rating windows</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Applies to {override.yearly_setup_sites.length} {override.yearly_setup_sites.length === 1 ? "site" : "sites"}
                        </p>
                        <ScheduleTimeline
                          dates={(override.dates as string[]) ?? []}
                          labels={WINDOW_LABELS[override.window_count] ?? []}
                          showToday
                        />
                      </div>
                      <div className="px-6 py-5">
                        <AssessmentConfigRows
                          windowCount={override.window_count}
                          dates={(override.dates as string[]) ?? []}
                          assessmentType={override.assessment_type as "screener" | "full"}
                          windowConfigs={override.yearly_setup_window_configs ?? []}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative bg-white rounded-xl border border-[#e8ecf0] shadow-xl p-6 w-[400px]">
            <h2 className="text-[16px] font-bold text-gray-900 mb-2">
              {confirmDeleteId === defaultSetup?.id
                ? "Delete this setup?"
                : "Delete custom schedule?"}
            </h2>
            <p className="text-[14px] text-gray-500 mb-6">
              {confirmDeleteId === defaultSetup?.id
                ? "All data for this setup will be permanently deleted. This cannot be undone."
                : "Sites in this group will revert to the default yearly setup. This cannot be undone."}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="h-9 px-4 rounded-lg border border-[#d1d5db] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60"
              >
                {deleting
                  ? "Deleting…"
                  : confirmDeleteId === defaultSetup?.id
                    ? "Delete Setup"
                    : "Delete Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Year select ──────────────────────────────────────────────────────────────

function YearSelect({
  selectedYear,
  onSelect,
}: {
  selectedYear: string;
  onSelect: (y: string) => void;
}) {
  return (
    <Select value={selectedYear} onValueChange={(v) => v && onSelect(v)}>
      <SelectTrigger className="w-auto gap-2 h-9 px-3 bg-white border border-[#d1d5db] rounded-lg text-[15px] font-semibold text-gray-700 cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SCHOOL_YEARS.map((y) => (
          <SelectItem
            key={y}
            value={y}
            className="text-[14px] font-semibold cursor-pointer"
          >
            {formatYear(y)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
