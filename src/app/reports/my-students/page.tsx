"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp, Search, Download, X, Plus } from "lucide-react";
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
  { id: 1,  name: "Aaron, Ricky",       username: null,       ssrPoints: null,  range: "Typical",  tScore: 52, form: "DESSA-SSESE",          window: "25-26 Mid", date: "12/31/2025" },
  { id: 2,  name: "A'Barrow, Leyla",    username: null,       ssrPoints: null,  range: "Typical",  tScore: 47, form: "DESSA 2",               window: "25-26 Mid", date: "12/31/2025" },
  { id: 3,  name: "Abberley, Quintin",  username: "QAbbe22",  ssrPoints: null,  range: "Typical",  tScore: 51, form: "DESSA 2 mini Form C",   window: "25-26 Mid", date: "12/31/2025" },
  { id: 4,  name: "Abbet, Stanly",      username: "SAbbe22",  ssrPoints: 3000,  range: "Typical",  tScore: 46, form: "DESSA-SSMSE",           window: "25-26 Mid", date: "12/31/2025" },
  { id: 5,  name: "Abbott, Aniya",      username: null,       ssrPoints: null,  range: "Strength", tScore: 61, form: "DESSA-mini Form 1",     window: "25-26 Mid", date: "12/31/2025" },
  { id: 6,  name: "Abbott, David",      username: null,       ssrPoints: null,  range: "Need",     tScore: 31, form: "DESSA",                 window: "25-26 Mid", date: "12/31/2025" },
  { id: 7,  name: "Abbott, Dominic",    username: "DAbbo37",  ssrPoints: null,  range: "Typical",  tScore: 46, form: "DESSA-HSE mini Form 1", window: "25-26 Mid", date: "12/31/2025" },
  { id: 8,  name: "Abbott, Gianna",     username: "GAbbo22",  ssrPoints: 2000,  range: "Strength", tScore: 63, form: "DESSA-mini Form 1",     window: "25-26 Mid", date: "12/31/2025" },
  { id: 9,  name: "Abbott, Jair",       username: null,       ssrPoints: null,  range: "Typical",  tScore: 55, form: "DESSA-mini Form 1",     window: "25-26 Mid", date: "12/31/2025" },
  { id: 10, name: "Abbott, Legacy",     username: "LAbbo22",  ssrPoints: null,  range: "Typical",  tScore: 43, form: "DESSA-mini Form 1",     window: "25-26 Mid", date: "12/31/2025" },
  { id: 11, name: "Adams, Kylie",       username: null,       ssrPoints: null,  range: "Typical",  tScore: 50, form: "DESSA-mini Form 1",     window: "25-26 Mid", date: "12/31/2025" },
  { id: 12, name: "Adkins, Marcus",     username: "MAdki44",  ssrPoints: 1500,  range: "Typical",  tScore: 48, form: "DESSA 2",               window: "25-26 Mid", date: "12/31/2025" },
  { id: 13, name: "Aguilar, Sofia",     username: null,       ssrPoints: null,  range: "Need",     tScore: 37, form: "DESSA",                 window: "25-26 Mid", date: "12/31/2025" },
  { id: 14, name: "Ahmed, Tariq",       username: "TAhme29",  ssrPoints: null,  range: "Strength", tScore: 64, form: "DESSA-mini Form 1",     window: "25-26 Mid", date: "12/31/2025" },
  { id: 15, name: "Akins, Priscilla",   username: null,       ssrPoints: null,  range: "Typical",  tScore: 53, form: "DESSA 2",               window: "25-26 Mid", date: "12/31/2025" },
];

const PIE_DATA = [
  { name: "Need",     value: 1306, color: "#f38b8b" },
  { name: "Typical",  value: 6538, color: "#7ab5de" },
  { name: "Strength", value: 2047, color: "#7dc49a" },
];

const RATING_WINDOWS   = ["25-26 Mid", "25-26 End", "24-25 Mid", "24-25 End", "23-24 End"];
const LEVEL_BADGE: Record<Level, string> = {
  Need:     "bg-[#fde8e8] text-[#b91c1c]",
  Typical:  "bg-[#e3f0fa] text-[#1a5a8a]",
  Strength: "bg-[#e4f4eb] text-[#166534]",
};

// ─── Filter sub-components ────────────────────────────────────────────────────

function FilterSelect({
  label,
  placeholder = "All",
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[12.5px] font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 pl-3 pr-8 rounded-lg border border-[#e0e5eb] text-[13px] text-gray-700 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#1a4e8a] focus:border-[#1a4e8a]"
        >
          <option value="all">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function RatingWindowInput({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const available = RATING_WINDOWS.filter((w) => !selected.includes(w));

  return (
    <div>
      <label className="block text-[12.5px] font-medium text-gray-600 mb-1.5">Rating Windows</label>
      <div className="flex flex-wrap items-center gap-2 min-h-10 px-3 py-2 rounded-lg border border-[#e0e5eb] bg-white">
        {selected.map((w) => (
          <span key={w} className="inline-flex items-center gap-1 h-6 pl-2.5 pr-1.5 rounded-md bg-[#1a4e8a] text-white text-[12px] font-medium">
            {w}
            <button
              onClick={() => onChange(selected.filter((x) => x !== w))}
              className="hover:opacity-70 transition-opacity"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        {available.length > 0 && (
          <div className="relative">
            <div className="w-6 h-6 rounded-md bg-[#1a4e8a] text-white flex items-center justify-center pointer-events-none">
              <Plus size={13} />
            </div>
            <select
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
              value=""
              onChange={(e) => {
                if (e.target.value) onChange([...selected, e.target.value]);
                e.currentTarget.value = "";
              }}
            >
              <option value="">Add window…</option>
              {available.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[12.5px] font-medium text-gray-600 mb-1.5">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg border border-[#e0e5eb] text-[13px] text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#1a4e8a] focus:border-[#1a4e8a]"
      />
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
          <circle
            cx={cx} cy={cy} r={r}
            fill="none" stroke="#7dc49a" strokeWidth={11}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - completed / total)}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
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

export default function MyStudentsPage() {
  // Filter panel
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter fields (Students)
  const [sites, setSites]               = useState("all");
  const [grades, setGrades]             = useState("all");
  const [raters, setRaters]             = useState("all");
  const [race, setRace]                 = useState("all");
  const [academic, setAcademic]         = useState("all");
  const [genders, setGenders]           = useState("all");
  const [customGroup, setCustomGroup]   = useState("all");

  // Filter fields (Ratings)
  const [windows, setWindows]           = useState(["25-26 Mid"]);
  const [forms, setForms]               = useState("all");
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");

  // Table
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);

  function handleSearch(v: string) { setSearch(v); setPage(1); }

  function handleReset() {
    setSites("all"); setGrades("all"); setRaters("all");
    setRace("all"); setAcademic("all"); setGenders("all");
    setCustomGroup("all"); setWindows([]); setForms("all");
    setStartDate(""); setEndDate("");
  }

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

      {/* ── Filter panel ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">

        {/* Toggle */}
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="flex items-center gap-2 px-6 py-4 w-full text-left hover:bg-gray-50/50 transition-colors"
        >
          <span className="text-[15px] font-bold text-gray-900">Filters</span>
          {filtersOpen
            ? <ChevronUp size={16} className="text-gray-500" />
            : <ChevronDown size={16} className="text-gray-500" />
          }
        </button>

        {filtersOpen && (
          <div className="border-t border-[#e8ecf0] px-6 pb-6">

            {/* Students section */}
            <p className="text-[14px] font-semibold text-gray-800 mt-5 mb-3">Students</p>
            <div className="grid grid-cols-3 gap-4">
              <FilterSelect label="Sites"    value={sites}    onChange={setSites}
                options={[{ value: "riverside", label: "Riverside Elementary" }]} />
              <FilterSelect label="Grades"   value={grades}   onChange={setGrades}
                options={[{ value: "3", label: "Grade 3" }, { value: "4", label: "Grade 4" }, { value: "5", label: "Grade 5" }]} />
              <FilterSelect label="Raters"   value={raters}   onChange={setRaters}
                options={[{ value: "educator", label: "Educator" }, { value: "ssr", label: "Student Self-Report" }]} />
              <FilterSelect label="Race"     value={race}     onChange={setRace}
                options={[{ value: "white", label: "White" }, { value: "black", label: "Black / African American" }, { value: "hispanic", label: "Hispanic / Latino" }, { value: "asian", label: "Asian" }]} />
              <FilterSelect label="Academic" value={academic} onChange={setAcademic}
                options={[{ value: "gifted", label: "Gifted" }, { value: "iep", label: "Students with IEPs" }, { value: "el", label: "English Learner" }]} />
              <FilterSelect label="Genders"  value={genders}  onChange={setGenders}
                options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "nonbinary", label: "Non-binary" }]} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <FilterSelect
                label="Custom Group"
                placeholder="Select a custom group"
                value={customGroup}
                onChange={setCustomGroup}
                options={[{ value: "group1", label: "SEL Intervention Group A" }, { value: "group2", label: "Tier 2 Support" }]}
              />
            </div>

            {/* Ratings section */}
            <p className="text-[14px] font-semibold text-gray-800 mt-6 mb-3">Ratings</p>
            <div className="grid grid-cols-2 gap-4">
              <RatingWindowInput selected={windows} onChange={setWindows} />
              <FilterSelect label="Forms" value={forms} onChange={setForms}
                options={[{ value: "dessa", label: "DESSA" }, { value: "dessa2", label: "DESSA 2" }, { value: "mini1", label: "DESSA-mini Form 1" }, { value: "ssese", label: "DESSA-SSESE" }]} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <DateInput label="Start Date" value={startDate} onChange={setStartDate} />
              <DateInput label="End Date"   value={endDate}   onChange={setEndDate} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-6">
              <button className="h-10 px-6 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors">
                Apply
              </button>
              <button onClick={handleReset} className="text-[13px] text-gray-500 hover:text-gray-700 transition-colors">
                Reset Filters
              </button>
            </div>
          </div>
        )}
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
                <Pie
                  data={PIE_DATA}
                  cx="50%" cy="50%"
                  outerRadius={95}
                  dataKey="value"
                  labelLine={false}
                  label={PieLabel as never}
                  isAnimationActive={false}
                >
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ecf0]">
          <div className="relative">
            <Search size={13} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              placeholder="Search by student name, ID, or username…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 pr-3 h-8 rounded-lg border border-[#e8ecf0] text-[12.5px] bg-[#f8fafc] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1a4e8a] focus:border-[#1a4e8a] w-72 transition-shadow"
            />
          </div>
          <button className="flex items-center gap-2 h-8 px-3.5 rounded-lg border border-[#e8ecf0] bg-white text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={13} strokeWidth={1.75} />
            Export CSV
          </button>
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
                  <td className="px-4 py-3">
                    <TScoreBadge score={s.tScore} />
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{s.form}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{s.window}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-500 whitespace-nowrap">{s.date}</td>
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
  );
}
