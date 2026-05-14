"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronDown, Search, UserCheck, Settings, KeyRound } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

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

function FilterPill({
  label, options, selected, onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  selected: string;
  onChange: (v: string) => void;
}) {
  const isFiltered = selected !== "all";
  const selectedLabel = options.find((o) => o.value === selected)?.label ?? selected;
  return (
    <div className={`relative inline-flex items-center h-7 pl-2.5 pr-2 rounded-full border cursor-pointer transition-colors ${isFiltered ? "border-[#1a4e8a] bg-[#eef2f8]" : "border-[#e8ecf0] bg-white hover:border-gray-300"}`}>
      <span className={`text-[11.5px] mr-1 ${isFiltered ? "text-[#1a4e8a]" : "text-gray-400"}`}>{label}:</span>
      <span className={`text-[11.5px] font-medium ${isFiltered ? "text-[#1a4e8a]" : "text-gray-700"}`}>{selectedLabel}</span>
      <ChevronDown size={11} className={`ml-1 ${isFiltered ? "text-[#1a4e8a]" : "text-gray-400"}`} />
      <select className="absolute inset-0 opacity-0 cursor-pointer w-full" value={selected} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
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
  const [windowFilter, setWindowFilter] = useState("25-26mid");
  const [raterFilter, setRaterFilter]   = useState("all");
  const [siteFilter, setSiteFilter]     = useState("all");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);

  function handleSearch(v: string)      { setSearch(v);       setPage(1); }
  function handleRaterFilter(v: string) { setRaterFilter(v);  setPage(1); }
  function handleSiteFilter(v: string)  { setSiteFilter(v);   setPage(1); }

  const filteredStudents = STUDENTS.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages       = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const visible          = filteredStudents.slice((page - 1) * pageSize, page * pageSize);
  const hasActiveFilters = raterFilter !== "all" || siteFilter !== "all";

  return (
    <div className="flex flex-col min-h-full">

      {/* Filter bar */}
      <div className="border-b border-[#e8ecf0] bg-white px-6 py-3 flex items-center gap-2.5 flex-wrap">
        <span className="text-[11.5px] font-medium text-gray-400 mr-0.5">Filter by</span>
        <FilterPill
          label="Rating Window"
          options={[{ value: "25-26mid", label: "25-26 Mid" }, { value: "24-25end", label: "24-25 End" }]}
          selected={windowFilter}
          onChange={setWindowFilter}
        />
        <FilterPill
          label="Site"
          options={[{ value: "all", label: "All Sites" }, { value: "riverside-elem", label: "Riverside Elementary" }]}
          selected={siteFilter}
          onChange={handleSiteFilter}
        />
        <FilterPill
          label="Rater Type"
          options={[{ value: "all", label: "All" }, { value: "educator", label: "Educator" }, { value: "ssr", label: "Student Self-Report" }]}
          selected={raterFilter}
          onChange={handleRaterFilter}
        />
        {hasActiveFilters && (
          <button onClick={() => { setRaterFilter("all"); setSiteFilter("all"); }} className="text-[11.5px] text-gray-400 hover:text-gray-600 ml-0.5 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">

        {/* Header */}
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-[22px] font-bold text-gray-900">Rating Window Overview</h1>
            <span className="text-[12px] text-gray-400 font-medium">Data updated hourly</span>
          </div>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Current results from the 25-26 Mid (Jan 1, 2026 – May 27, 2026) rating window.
          </p>
        </div>

        {/* Assessment scoring */}
        <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
          <h2 className="text-[14px] font-semibold text-gray-900 mb-5">Assessment Scoring</h2>
          <div className="grid grid-cols-2 gap-8">

            {/* Educator pie */}
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

            {/* SSR pie */}
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

          {/* Action buttons */}
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
              Reset Students' Passwords
            </button>
          </div>
        </div>

        {/* T-Score legend + table */}
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
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400" rowSpan={2}>
                  Name
                </th>
                <th colSpan={3} className="px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-[#1a4e8a] bg-[#f4f7fb] border-b border-[#e8ecf0]">
                  Educator Report
                </th>
                <th colSpan={2} className="px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-gray-600 bg-[#f8fafc] border-b border-[#e8ecf0]">
                  Student Self-Report
                </th>
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
              {visible.map((s, i) => {
                const isLast = i === visible.length - 1;
                return (
                  <tr key={s.id} className={`hover:bg-gray-50/70 transition-colors ${!isLast ? "border-b border-[#f5f7fa]" : ""}`}>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-[#1565c0] hover:underline cursor-pointer">{s.name}</span>
                    </td>
                    <td className="px-3 py-3"><TScoreBadge score={s.educatorScore} /></td>
                    <td className="px-3 py-3 text-[12.5px] text-gray-600 whitespace-nowrap">{s.educatorForm ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-3 py-3 text-[12.5px] text-gray-500 whitespace-nowrap">{s.educatorDate ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-3 py-3"><TScoreBadge score={s.ssrScore} /></td>
                    <td className="px-3 py-3 text-[12.5px] text-gray-600 whitespace-nowrap">{s.ssrForm ?? <span className="text-gray-300">—</span>}</td>
                  </tr>
                );
              })}
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
    </div>
  );
}
