"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronDown, Search, UserCheck, Settings, KeyRound, RefreshCw, X } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { ReportSelector } from "../ReportSelector";

// ─── Mock data ────────────────────────────────────────────────────────────────

const EDUCATOR_PIE = [
  { name: "Need",     value: 1255, color: "#f38b8b" },
  { name: "Typical",  value: 6595, color: "#7ab5de" },
  { name: "Strength", value: 2041, color: "#7dc49a" },
];

const SSR_PIE = [
  { name: "Need",     value: 315,  color: "#f38b8b" },
  { name: "Typical",  value: 1467, color: "#7ab5de" },
  { name: "Strength", value: 490,  color: "#7dc49a" },
  { name: "Unrated",  value: 7623, color: "#e5e7eb" },
];

interface Student {
  id: number;
  name: string;
  educatorScore: number | null;
  educatorForm: string | null;
  educatorDate: string | null;
  ssrScore: number | null;
  ssrForm: string | null;
}

const STUDENTS: Student[] = [
  { id: 1,  name: "Aaron, Ricky",      educatorScore: 52, educatorForm: "DESSA-SSESE",          educatorDate: "12/31/2025", ssrScore: null, ssrForm: null },
  { id: 2,  name: "A'Barrow, Leyla",   educatorScore: 47, educatorForm: "DESSA 2",               educatorDate: "12/31/2025", ssrScore: null, ssrForm: null },
  { id: 3,  name: "Abberley, Quintin", educatorScore: 51, educatorForm: "DESSA 2 mini Form C",   educatorDate: "12/31/2025", ssrScore: null, ssrForm: null },
  { id: 4,  name: "Abbet, Stanly",     educatorScore: 46, educatorForm: "DESSA-SSMSE",           educatorDate: "12/31/2025", ssrScore: 62,   ssrForm: "DESSA-SSMSE SSR" },
  { id: 5,  name: "Abbott, Aniya",     educatorScore: 61, educatorForm: "DESSA-mini Form 1",     educatorDate: "12/31/2025", ssrScore: null, ssrForm: null },
  { id: 6,  name: "Abbott, David",     educatorScore: 31, educatorForm: "DESSA",                 educatorDate: "12/31/2025", ssrScore: null, ssrForm: null },
  { id: 7,  name: "Abbott, Dominic",   educatorScore: 46, educatorForm: "DESSA-HSE mini Form 1", educatorDate: "12/31/2025", ssrScore: 51,   ssrForm: "DESSA-HSE SSR" },
  { id: 8,  name: "Abbott, Gianna",    educatorScore: 63, educatorForm: "DESSA-mini Form 1",     educatorDate: "12/31/2025", ssrScore: null, ssrForm: null },
  { id: 9,  name: "Abbott, Jair",      educatorScore: 55, educatorForm: "DESSA-mini Form 1",     educatorDate: "12/31/2025", ssrScore: null, ssrForm: null },
  { id: 10, name: "Abbott, Legacy",    educatorScore: 43, educatorForm: "DESSA-mini Form 1",     educatorDate: "12/31/2025", ssrScore: null, ssrForm: null },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterSelect({ label, value, onChange, options, clearable = false }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; clearable?: boolean;
}) {
  return (
    <div>
      <p className="text-[11.5px] font-medium text-gray-600 mb-1.5">{label}</p>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#e0e5eb] text-[12.5px] text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/20 focus:border-[#1a4e8a]">
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {clearable && value !== options[0] ? (
          <button onClick={() => onChange(options[0])} className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
            <X size={9} strokeWidth={2.5} />
          </button>
        ) : (
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        )}
      </div>
    </div>
  );
}

function TScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100"><span className="text-gray-300 text-[16px] leading-none">—</span></span>;
  }
  const bg = score < 41 ? "#f38b8b" : score < 60 ? "#7ab5de" : "#7dc49a";
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[12px] font-bold text-white" style={{ backgroundColor: bg }}>
      {score}
    </span>
  );
}

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; name: string; value: number;
}) {
  if (value < 400 || name === "Unrated") return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
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

export default function RatingWindowOverviewPage() {
  const [filtersOpen, setFiltersOpen]   = useState(false);
  const [ratingWindow, setRatingWindow] = useState("25-26 Mid");
  const [siteFilter, setSiteFilter]     = useState("All");
  const [raterFilter, setRaterFilter]   = useState("All");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);

  function handleSearch(v: string) { setSearch(v); setPage(1); }

  const filteredStudents = STUDENTS.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages       = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const visible          = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  function handleReset() {
    setRatingWindow("25-26 Mid"); setSiteFilter("All"); setRaterFilter("All");
  }

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <ReportSelector currentHref="/reports3/rating-window-overview" />
          <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <RefreshCw size={12} strokeWidth={2} />
            Data updated hourly
          </span>
        </div>
        <p className="text-[13px] text-gray-500 mt-1">
          Current results from the 25-26 Mid (Jan 1, 2026 – May 27, 2026) rating window.
        </p>
      </div>

      {/* Collapsible filters */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">
        <button onClick={() => setFiltersOpen((o) => !o)}
          className="w-full flex items-center gap-1.5 px-5 py-3 text-[13.5px] font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          Filters
          <ChevronDown size={13} strokeWidth={2.5} className={`ml-auto text-[#1a4e8a] transition-transform duration-150 ${filtersOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.15, ease: "easeInOut" }} className="overflow-hidden">
              <div className="border-t border-[#e8ecf0] px-5 py-5 space-y-5">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Students</p>
                  <div className="grid grid-cols-3 gap-4 max-w-sm">
                    <FilterSelect label="Sites" value={siteFilter} onChange={setSiteFilter}
                      options={["All", "Riverside Elementary", "Hillstrong High School", "Washington Middle School", "Lincoln Elementary"]} />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Ratings</p>
                  <div className="grid grid-cols-3 gap-4 max-w-xl">
                    <FilterSelect label="Rating Window" value={ratingWindow} onChange={setRatingWindow}
                      options={["25-26 Mid", "25-26 Pre", "24-25 End", "24-25 Mid"]} clearable />
                    <FilterSelect label="Rater Type" value={raterFilter} onChange={setRaterFilter}
                      options={["All", "Educator", "Student Self-Report"]} />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => setFiltersOpen(false)} className="h-9 px-5 rounded-lg bg-[#1a4e8a] text-white text-[12.5px] font-semibold hover:bg-[#15407a] transition-colors">Apply</button>
                  <button onClick={handleReset} className="h-9 px-4 rounded-lg border border-[#e8ecf0] bg-white text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">Reset Filters</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Assessment scoring */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
        <h2 className="text-[14px] font-semibold text-gray-900 mb-5">Assessment Scoring</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={EDUCATOR_PIE} cx="50%" cy="50%" outerRadius={95} dataKey="value" labelLine={false} label={PieLabel as never} isAnimationActive={false}>
                  {EDUCATOR_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <p className="text-[13px] font-semibold text-gray-700 mt-2">My Students DESSA Ratings</p>
          </div>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={SSR_PIE} cx="50%" cy="50%" outerRadius={95} dataKey="value" labelLine={false} label={PieLabel as never} isAnimationActive={false}>
                  {SSR_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <p className="text-[13px] font-semibold text-gray-700 mt-2">Student Self-Report Scores</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-5 border-t border-[#f0f4f8] mt-5">
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors">
            <UserCheck size={14} strokeWidth={1.75} />
            Rate Students
          </button>
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-[#e8ecf0] bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Settings size={14} strokeWidth={1.75} />
            View Registration Details
          </button>
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-[#e8ecf0] bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <KeyRound size={14} strokeWidth={1.75} />
            Reset Students&apos; Passwords
          </button>
        </div>
      </div>

      {/* Student table */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ecf0]">
          <div className="relative">
            <Search size={13} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              placeholder="Search by student name…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 pr-3 h-8 rounded-lg border border-[#e8ecf0] text-[12.5px] bg-[#f8fafc] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1a4e8a] focus:border-[#1a4e8a] w-56 transition-shadow"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[12px] font-medium text-gray-500">T-Score ranges:</span>
            {[
              { color: "#f38b8b", label: "Need: 40 & Below" },
              { color: "#7ab5de", label: "Typical: 41–59" },
              { color: "#7dc49a", label: "Strength: 60+" },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[11.5px] text-gray-600">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0f4f8]">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400" rowSpan={2}>Name</th>
              <th colSpan={3} className="px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-[#1a4e8a] bg-[#f4f7fb] border-b border-[#e8ecf0]">Educator Report</th>
              <th colSpan={2} className="px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-gray-600 bg-[#f8fafc] border-b border-[#e8ecf0]">Student Self-Report</th>
            </tr>
            <tr className="border-b border-[#f0f4f8]">
              {["T-Score", "Rating Form", "Rating Date"].map((c) => (
                <th key={c} className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-[#f4f7fb] whitespace-nowrap">{c}</th>
              ))}
              {["T-Score", "Rating Form"].map((c) => (
                <th key={c} className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-[#f8fafc] whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((s, i) => (
              <tr key={s.id} className={`hover:bg-gray-50/70 transition-colors ${i < visible.length - 1 ? "border-b border-[#f5f7fa]" : ""}`}>
                <td className="px-5 py-3">
                  <span className="text-[13px] font-medium text-[#1565c0] hover:underline cursor-pointer">{s.name}</span>
                </td>
                <td className="px-3 py-3"><TScoreBadge score={s.educatorScore} /></td>
                <td className="px-3 py-3 text-[12.5px] text-gray-600 whitespace-nowrap">{s.educatorForm ?? <span className="text-gray-300">—</span>}</td>
                <td className="px-3 py-3 text-[12.5px] text-gray-500 whitespace-nowrap">{s.educatorDate ?? <span className="text-gray-300">—</span>}</td>
                <td className="px-3 py-3"><TScoreBadge score={s.ssrScore} /></td>
                <td className="px-3 py-3 text-[12.5px] text-gray-600 whitespace-nowrap">{s.ssrForm ?? <span className="text-gray-300">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filteredStudents.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="students"
        />
      </div>
    </div>
  );
}
