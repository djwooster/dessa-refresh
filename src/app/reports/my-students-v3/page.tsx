"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronDown, Search, Download, X, Plus, SlidersHorizontal } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

// ─── Types ────────────────────────────────────────────────────────────────────

type Level = "Need" | "Typical" | "Strength";

interface Student {
  id: number;
  name: string;
  username: string | null;
  ssrPoints: number | null;
  range: Level;
  tScore: number;
  form: string;
  window: string;
  date: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const ALL_STUDENTS: Student[] = [
  { id: 1,  name: "Aaron, Ricky",       username: null,       ssrPoints: null, range: "Typical",  tScore: 52, form: "DESSA-SSESE",          window: "25-26 Mid", date: "12/31/2025" },
  { id: 2,  name: "A'Barrow, Leyla",    username: null,       ssrPoints: null, range: "Typical",  tScore: 47, form: "DESSA 2",               window: "25-26 Mid", date: "12/31/2025" },
  { id: 3,  name: "Abberley, Quintin",  username: "QAbbe22",  ssrPoints: null, range: "Typical",  tScore: 51, form: "DESSA 2 mini Form C",   window: "25-26 Mid", date: "12/31/2025" },
  { id: 4,  name: "Abbet, Stanly",      username: "SAbbe22",  ssrPoints: 3000, range: "Typical",  tScore: 46, form: "DESSA-SSMSE",           window: "25-26 Mid", date: "12/31/2025" },
  { id: 5,  name: "Abbott, Aniya",      username: null,       ssrPoints: null, range: "Strength", tScore: 61, form: "DESSA-mini Form 1",     window: "25-26 Mid", date: "12/31/2025" },
  { id: 6,  name: "Abbott, David",      username: null,       ssrPoints: null, range: "Need",     tScore: 31, form: "DESSA",                 window: "25-26 Mid", date: "12/31/2025" },
  { id: 7,  name: "Abbott, Dominic",    username: "DAbbo37",  ssrPoints: null, range: "Typical",  tScore: 46, form: "DESSA-HSE mini Form 1", window: "25-26 Mid", date: "12/31/2025" },
  { id: 8,  name: "Abbott, Gianna",     username: "GAbbo22",  ssrPoints: 2000, range: "Strength", tScore: 63, form: "DESSA-mini Form 1",     window: "25-26 Mid", date: "12/31/2025" },
  { id: 9,  name: "Abbott, Jair",       username: null,       ssrPoints: null, range: "Typical",  tScore: 55, form: "DESSA-mini Form 1",     window: "25-26 Mid", date: "12/31/2025" },
  { id: 10, name: "Abbott, Legacy",     username: "LAbbo22",  ssrPoints: null, range: "Typical",  tScore: 43, form: "DESSA-mini Form 1",     window: "25-26 Mid", date: "12/31/2025" },
  { id: 11, name: "Adams, Kylie",       username: null,       ssrPoints: null, range: "Typical",  tScore: 50, form: "DESSA-mini Form 1",     window: "25-26 Mid", date: "12/31/2025" },
  { id: 12, name: "Adkins, Marcus",     username: "MAdki44",  ssrPoints: 1500, range: "Typical",  tScore: 48, form: "DESSA 2",               window: "25-26 Mid", date: "12/31/2025" },
  { id: 13, name: "Aguilar, Sofia",     username: null,       ssrPoints: null, range: "Need",     tScore: 37, form: "DESSA",                 window: "25-26 Mid", date: "12/31/2025" },
  { id: 14, name: "Ahmed, Tariq",       username: "TAhme29",  ssrPoints: null, range: "Strength", tScore: 64, form: "DESSA-mini Form 1",     window: "25-26 Mid", date: "12/31/2025" },
  { id: 15, name: "Akins, Priscilla",   username: null,       ssrPoints: null, range: "Typical",  tScore: 53, form: "DESSA 2",               window: "25-26 Mid", date: "12/31/2025" },
];

const PIE_DATA = [
  { name: "Need",     value: 1306, color: "#f38b8b" },
  { name: "Typical",  value: 6538, color: "#7ab5de" },
  { name: "Strength", value: 2047, color: "#7dc49a" },
];

const RATING_WINDOWS = ["25-26 Mid", "25-26 End", "24-25 Mid", "24-25 End", "23-24 End"];

const LEVEL_BADGE: Record<Level, string> = {
  Need:     "bg-[#fde8e8] text-[#b91c1c]",
  Typical:  "bg-[#e3f0fa] text-[#1a5a8a]",
  Strength: "bg-[#e4f4eb] text-[#166534]",
};

// ─── Popover sub-components ───────────────────────────────────────────────────

function PopoverSelect({
  placeholder = "All",
  options,
  value,
  onChange,
}: {
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#e0e5eb] text-[12.5px] text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/20 focus:border-[#1a4e8a]"
      >
        <option value="all">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function RatingWindowPopover({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const available = RATING_WINDOWS.filter((w) => !selected.includes(w));
  return (
    <div className="flex flex-wrap items-center gap-1.5 min-h-9 px-3 py-2 rounded-lg border border-[#e0e5eb] bg-white">
      {selected.map((w) => (
        <span key={w} className="inline-flex items-center gap-1 h-5 pl-2 pr-1.5 rounded-md bg-[#1a4e8a] text-white text-[11px] font-medium">
          {w}
          <button onClick={() => onChange(selected.filter((x) => x !== w))} className="hover:opacity-70">
            <X size={10} />
          </button>
        </span>
      ))}
      {available.length > 0 && (
        <div className="relative">
          <div className="w-5 h-5 rounded-md bg-[#1a4e8a] text-white flex items-center justify-center pointer-events-none">
            <Plus size={11} />
          </div>
          <select
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
            value=""
            onChange={(e) => { if (e.target.value) onChange([...selected, e.target.value]); e.currentTarget.value = ""; }}
          >
            <option value="">Add…</option>
            {available.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      )}
      {selected.length === 0 && (
        <span className="text-[12.5px] text-gray-400 pointer-events-none select-none">Select windows…</span>
      )}
    </div>
  );
}

// ─── Visualization sub-components ─────────────────────────────────────────────

function TScoreBadge({ score }: { score: number }) {
  const bg = score < 41 ? "#f38b8b" : score < 60 ? "#7ab5de" : "#7dc49a";
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[12px] font-bold text-white" style={{ backgroundColor: bg }}>
      {score}
    </span>
  );
}

function CompletionRing({ completed, total }: { completed: number; total: number }) {
  const r = 62, cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width={160} height={160}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8ecf0" strokeWidth={11} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#7dc49a" strokeWidth={11}
            strokeLinecap="round" strokeDasharray={circ}
            strokeDashoffset={circ * (1 - completed / total)}
            transform={`rotate(-90 ${cx} ${cy})`} />
        </svg>
        <div className="absolute text-center px-2">
          <div className="text-[15px] font-bold text-gray-900 leading-tight whitespace-nowrap">
            {completed.toLocaleString()} / {total.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Students Complete</div>
        </div>
      </div>
      <p className="text-[12px] font-semibold text-gray-500 mt-1">Current Rating Window</p>
    </div>
  );
}

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; name: string; value: number;
}) {
  if (value < 500) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.52;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      <tspan x={x} dy="-0.6em">{value.toLocaleString()}</tspan>
      <tspan x={x} dy="1.3em" fontWeight={400}>{name}</tspan>
    </text>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PopoverPlacement {
  top?: number;
  bottom?: number;
  right: number;
  maxHeight: number;
}

export default function MyStudentsV3Page() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [placement, setPlacement] = useState<PopoverPlacement | null>(null);
  const popoverRef  = useRef<HTMLDivElement>(null);
  const buttonRef   = useRef<HTMLButtonElement>(null);

  function togglePopover() {
    if (popoverOpen) { setPopoverOpen(false); return; }
    if (!buttonRef.current) return;
    const rect    = buttonRef.current.getBoundingClientRect();
    const GAP     = 8;
    const right   = window.innerWidth - rect.right;
    const below   = window.innerHeight - rect.bottom - GAP;
    const above   = rect.top - GAP;
    if (below >= above) {
      setPlacement({ top: rect.bottom + GAP, right, maxHeight: below - 8 });
    } else {
      setPlacement({ bottom: window.innerHeight - rect.top + GAP, right, maxHeight: above - 8 });
    }
    setPopoverOpen(true);
  }

  // Close on outside click
  useEffect(() => {
    if (!popoverOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current  && !buttonRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  // Draft state — lives in the popover until Apply Now
  const [draftSites, setDraftSites]       = useState("all");
  const [draftGrades, setDraftGrades]     = useState("all");
  const [draftRaters, setDraftRaters]     = useState("all");
  const [draftRace, setDraftRace]         = useState("all");
  const [draftAcademic, setDraftAcademic] = useState("all");
  const [draftGenders, setDraftGenders]   = useState("all");
  const [draftCustom, setDraftCustom]     = useState("all");
  const [draftWindows, setDraftWindows]   = useState<string[]>([]);
  const [draftForms, setDraftForms]       = useState("all");
  const [draftStart, setDraftStart]       = useState("");
  const [draftEnd, setDraftEnd]           = useState("");

  // Applied state
  const [, setAppliedWindows] = useState<string[]>([]);

  const activeFilterCount = [
    draftSites !== "all",
    draftGrades !== "all",
    draftRaters !== "all",
    draftRace !== "all",
    draftAcademic !== "all",
    draftGenders !== "all",
    draftCustom !== "all",
    draftWindows.length > 0,
    draftForms !== "all",
    draftStart !== "",
    draftEnd !== "",
  ].filter(Boolean).length;

  function handleApply() {
    setAppliedWindows(draftWindows);
    setPage(1);
    setPopoverOpen(false);
  }

  function handleReset() {
    setDraftSites("all"); setDraftGrades("all"); setDraftRaters("all");
    setDraftRace("all"); setDraftAcademic("all"); setDraftGenders("all");
    setDraftCustom("all"); setDraftWindows([]); setDraftForms("all");
    setDraftStart(""); setDraftEnd("");
  }

  // Table state
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  function handleSearch(v: string) { setSearch(v); setPage(1); }

  const filteredStudents = useMemo(
    () => ALL_STUDENTS.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );
  const totalPages        = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = useMemo(
    () => filteredStudents.slice((page - 1) * pageSize, page * pageSize),
    [filteredStudents, page, pageSize]
  );

  return (
    <div className="p-6 space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-[22px] font-bold text-gray-900">My Students</h1>
          <span className="text-[12px] text-gray-400 font-medium">Data updated hourly</span>
        </div>
        <p className="text-[13px] text-gray-500 mt-0.5">
          This report shows the distribution of student assessment scores across the descriptive ranges.
        </p>
      </div>

      {/* ── Visualization cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-5 flex flex-col items-center">
          <p className="text-[13px] font-semibold text-gray-700 mb-3 self-start">Rating Window</p>
          <CompletionRing completed={9891} total={9895} />
        </div>
        <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-5">
          <p className="text-[13px] font-semibold text-gray-700 mb-1">Combined Ratings</p>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" outerRadius={95} dataKey="value"
                  labelLine={false} label={PieLabel as never} isAnimationActive={false}>
                  {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-1">
            {PIE_DATA.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                <span className="text-[11.5px] text-gray-500">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Student table ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ecf0] gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={13} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              placeholder="Search by student name, ID, or username…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 pr-3 h-8 w-full rounded-lg border border-[#e8ecf0] text-[12.5px] bg-[#f8fafc] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1a4e8a] focus:border-[#1a4e8a] transition-shadow"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filter trigger */}
            <button
              ref={buttonRef}
              onClick={togglePopover}
              className={`flex items-center gap-2 h-8 px-3.5 rounded-lg border text-[12.5px] font-medium transition-colors ${
                activeFilterCount > 0 || popoverOpen
                  ? "border-[#1a4e8a] bg-[#eef2f8] text-[#1a4e8a]"
                  : "border-[#e8ecf0] bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={13} strokeWidth={1.75} />
              Filter
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#1a4e8a] text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* ── Popover (fixed, smart placement) ────────────────────────── */}
            <AnimatePresence>
              {popoverOpen && placement && (
                  <motion.div
                    ref={popoverRef}
                    initial={{ opacity: 0, y: placement.top !== undefined ? -6 : 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: placement.top !== undefined ? -6 : 6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{
                      position: "fixed",
                      top: placement.top,
                      bottom: placement.bottom,
                      right: placement.right,
                      maxHeight: placement.maxHeight,
                    }}
                    className="w-[680px] bg-white rounded-xl border border-[#e0e5eb] shadow-xl z-50 flex flex-col overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e8ecf0] bg-[#f8fafc] rounded-t-xl shrink-0">
                      <h2 className="text-[14px] font-bold text-gray-900">Filter</h2>
                      <button
                        onClick={() => setPopoverOpen(false)}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Body — 2-column grid, scrollable only if viewport is tiny */}
                    <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">

                      {/* Date row — full width, 2 sub-cols */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Select Date</span>
                          {(draftStart !== "" || draftEnd !== "") && (
                            <button onClick={() => { setDraftStart(""); setDraftEnd(""); }} className="text-[11.5px] text-[#1565c0] hover:underline">Clear</button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[11.5px] font-medium text-gray-600 mb-1.5">From:</p>
                            <input type="date" value={draftStart} onChange={(e) => setDraftStart(e.target.value)}
                              className="w-full h-9 px-3 rounded-lg border border-[#e0e5eb] text-[12.5px] text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/20 focus:border-[#1a4e8a]" />
                          </div>
                          <div>
                            <p className="text-[11.5px] font-medium text-gray-600 mb-1.5">To:</p>
                            <input type="date" value={draftEnd} onChange={(e) => setDraftEnd(e.target.value)}
                              className="w-full h-9 px-3 rounded-lg border border-[#e0e5eb] text-[12.5px] text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/20 focus:border-[#1a4e8a]" />
                          </div>
                        </div>
                      </div>

                      {/* 2-col grid for remaining single-select filters */}
                      <div className="grid grid-cols-2 gap-x-5 gap-y-4">

                        {/* Sites */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Sites</span>
                            {draftSites !== "all" && <button onClick={() => setDraftSites("all")} className="text-[11.5px] text-[#1565c0] hover:underline">Clear</button>}
                          </div>
                          <PopoverSelect value={draftSites} onChange={setDraftSites}
                            options={[{ value: "riverside", label: "Riverside Elementary" }, { value: "hillstrong", label: "Hillstrong High School" }]} />
                        </div>

                        {/* Grades */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Grades</span>
                            {draftGrades !== "all" && <button onClick={() => setDraftGrades("all")} className="text-[11.5px] text-[#1565c0] hover:underline">Clear</button>}
                          </div>
                          <PopoverSelect value={draftGrades} onChange={setDraftGrades}
                            options={[{ value: "3", label: "Grade 3" }, { value: "4", label: "Grade 4" }, { value: "5", label: "Grade 5" }]} />
                        </div>

                        {/* Raters */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Raters</span>
                            {draftRaters !== "all" && <button onClick={() => setDraftRaters("all")} className="text-[11.5px] text-[#1565c0] hover:underline">Clear</button>}
                          </div>
                          <PopoverSelect value={draftRaters} onChange={setDraftRaters}
                            options={[{ value: "educator", label: "Educator" }, { value: "ssr", label: "Student Self-Report" }]} />
                        </div>

                        {/* Race */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Race</span>
                            {draftRace !== "all" && <button onClick={() => setDraftRace("all")} className="text-[11.5px] text-[#1565c0] hover:underline">Clear</button>}
                          </div>
                          <PopoverSelect value={draftRace} onChange={setDraftRace}
                            options={[{ value: "white", label: "White" }, { value: "black", label: "Black / African American" }, { value: "hispanic", label: "Hispanic / Latino" }, { value: "asian", label: "Asian" }]} />
                        </div>

                        {/* Academic */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Academic</span>
                            {draftAcademic !== "all" && <button onClick={() => setDraftAcademic("all")} className="text-[11.5px] text-[#1565c0] hover:underline">Clear</button>}
                          </div>
                          <PopoverSelect value={draftAcademic} onChange={setDraftAcademic}
                            options={[{ value: "gifted", label: "Gifted" }, { value: "iep", label: "Students with IEPs" }, { value: "el", label: "English Learner" }]} />
                        </div>

                        {/* Genders */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Genders</span>
                            {draftGenders !== "all" && <button onClick={() => setDraftGenders("all")} className="text-[11.5px] text-[#1565c0] hover:underline">Clear</button>}
                          </div>
                          <PopoverSelect value={draftGenders} onChange={setDraftGenders}
                            options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "nonbinary", label: "Non-binary" }]} />
                        </div>

                        {/* Custom Group */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Custom Group</span>
                            {draftCustom !== "all" && <button onClick={() => setDraftCustom("all")} className="text-[11.5px] text-[#1565c0] hover:underline">Clear</button>}
                          </div>
                          <PopoverSelect placeholder="Select a custom group" value={draftCustom} onChange={setDraftCustom}
                            options={[{ value: "group1", label: "SEL Intervention Group A" }, { value: "group2", label: "Tier 2 Support" }]} />
                        </div>

                        {/* Forms */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Forms</span>
                            {draftForms !== "all" && <button onClick={() => setDraftForms("all")} className="text-[11.5px] text-[#1565c0] hover:underline">Clear</button>}
                          </div>
                          <PopoverSelect value={draftForms} onChange={setDraftForms}
                            options={[{ value: "dessa", label: "DESSA" }, { value: "dessa2", label: "DESSA 2" }, { value: "mini1", label: "DESSA-mini Form 1" }, { value: "ssese", label: "DESSA-SSESE" }]} />
                        </div>

                      </div>

                      {/* Rating Windows — full width */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Rating Windows</span>
                          {draftWindows.length > 0 && <button onClick={() => setDraftWindows([])} className="text-[11.5px] text-[#1565c0] hover:underline">Clear</button>}
                        </div>
                        <RatingWindowPopover selected={draftWindows} onChange={setDraftWindows} />
                      </div>

                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3.5 border-t border-[#e8ecf0] bg-[#f8fafc] rounded-b-xl flex items-center justify-between shrink-0">
                      <button
                        onClick={handleReset}
                        className="h-9 px-4 rounded-lg border border-[#e8ecf0] bg-white text-[12.5px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleApply}
                        className="h-9 px-5 rounded-lg bg-[#1a4e8a] text-white text-[12.5px] font-semibold hover:bg-[#15407a] transition-colors"
                      >
                        Apply Now
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            <button className="flex items-center gap-2 h-8 px-3.5 rounded-lg border border-[#e8ecf0] bg-white text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={13} strokeWidth={1.75} />
              Export CSV
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0f4f8]">
              {["Name", "Username", "SSR Points", "Descriptive Range", "T-Score", "Rating Form", "Rating Window", "Rating Date"].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((s, i) => {
              const isLast = i === paginatedStudents.length - 1;
              return (
                <tr key={s.id} className={`hover:bg-gray-50/70 transition-colors ${!isLast ? "border-b border-[#f5f7fa]" : ""}`}>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-medium text-[#1565c0] hover:underline cursor-pointer">{s.name}</span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-500">{s.username ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">
                    {s.ssrPoints ? s.ssrPoints.toLocaleString() : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center h-5 px-2 rounded-full text-[11px] font-semibold ${LEVEL_BADGE[s.range]}`}>
                      {s.range}
                    </span>
                  </td>
                  <td className="px-4 py-3"><TScoreBadge score={s.tScore} /></td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{s.form}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{s.window}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-500 whitespace-nowrap">{s.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <Pagination
          page={page} totalPages={totalPages} totalItems={filteredStudents.length}
          pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize}
          itemLabel="students"
        />
      </div>
    </div>
  );
}
