"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Student {
  id: number;
  name: string;
  grade: string;
  teacher: string;
  tpf: number;
  sa: number;
  sm: number;
  soa: number;
  dm: number;
  rs: number;
  trend: "up" | "down" | "flat";
}

type SortKey = "name" | "grade" | "teacher" | "tpf";
type SortDir = "asc" | "desc";

// ─── Mock data ────────────────────────────────────────────────────────────────

const ALL_STUDENTS: Student[] = [
  { id: 1,  name: "Aiden Carter",    grade: "3", teacher: "Ms. Rivera",  tpf: 38, sa: 36, sm: 40, soa: 37, dm: 39, rs: 35, trend: "down" },
  { id: 2,  name: "Bella Thompson",  grade: "3", teacher: "Ms. Rivera",  tpf: 55, sa: 57, sm: 52, soa: 54, dm: 56, rs: 58, trend: "up"   },
  { id: 3,  name: "Carlos Mendez",   grade: "3", teacher: "Ms. Rivera",  tpf: 44, sa: 43, sm: 46, soa: 42, dm: 45, rs: 44, trend: "flat" },
  { id: 4,  name: "Diana Patel",     grade: "3", teacher: "Ms. Rivera",  tpf: 62, sa: 64, sm: 61, soa: 63, dm: 60, rs: 65, trend: "up"   },
  { id: 5,  name: "Ethan Williams",  grade: "3", teacher: "Ms. Rivera",  tpf: 48, sa: 49, sm: 47, soa: 50, dm: 48, rs: 46, trend: "flat" },
  { id: 6,  name: "Fatima Hassan",   grade: "3", teacher: "Ms. Rivera",  tpf: 35, sa: 33, sm: 37, soa: 34, dm: 36, rs: 32, trend: "down" },
  { id: 7,  name: "George Liu",      grade: "3", teacher: "Ms. Rivera",  tpf: 51, sa: 53, sm: 50, soa: 52, dm: 49, rs: 54, trend: "up"   },
  { id: 8,  name: "Hannah Brown",    grade: "3", teacher: "Ms. Rivera",  tpf: 58, sa: 60, sm: 56, soa: 59, dm: 57, rs: 61, trend: "up"   },
  { id: 9,  name: "Ivan Torres",     grade: "4", teacher: "Mr. Chen",    tpf: 42, sa: 41, sm: 44, soa: 43, dm: 40, rs: 45, trend: "up"   },
  { id: 10, name: "Jasmine Wright",  grade: "4", teacher: "Mr. Chen",    tpf: 66, sa: 68, sm: 65, soa: 67, dm: 64, rs: 69, trend: "up"   },
  { id: 11, name: "Kevin Park",      grade: "4", teacher: "Mr. Chen",    tpf: 39, sa: 37, sm: 41, soa: 38, dm: 40, rs: 36, trend: "flat" },
  { id: 12, name: "Luna Martinez",   grade: "4", teacher: "Mr. Chen",    tpf: 53, sa: 55, sm: 51, soa: 54, dm: 52, rs: 56, trend: "flat" },
  { id: 13, name: "Marcus Johnson",  grade: "4", teacher: "Mr. Chen",    tpf: 47, sa: 48, sm: 46, soa: 49, dm: 45, rs: 50, trend: "up"   },
  { id: 14, name: "Nadia Okonkwo",   grade: "4", teacher: "Mr. Chen",    tpf: 60, sa: 62, sm: 59, soa: 61, dm: 58, rs: 63, trend: "up"   },
  { id: 15, name: "Oliver Reed",     grade: "4", teacher: "Mr. Chen",    tpf: 45, sa: 44, sm: 47, soa: 43, dm: 46, rs: 42, trend: "down" },
  { id: 16, name: "Priya Sharma",    grade: "5", teacher: "Ms. Johnson", tpf: 57, sa: 59, sm: 55, soa: 58, dm: 56, rs: 60, trend: "up"   },
  { id: 17, name: "Quinn Davis",     grade: "5", teacher: "Ms. Johnson", tpf: 36, sa: 34, sm: 38, soa: 35, dm: 37, rs: 33, trend: "down" },
  { id: 18, name: "Ruby Kim",        grade: "5", teacher: "Ms. Johnson", tpf: 63, sa: 65, sm: 61, soa: 64, dm: 62, rs: 67, trend: "up"   },
  { id: 19, name: "Samuel Ortiz",    grade: "5", teacher: "Ms. Johnson", tpf: 50, sa: 51, sm: 49, soa: 52, dm: 48, rs: 53, trend: "flat" },
  { id: 20, name: "Tanya Bell",      grade: "5", teacher: "Ms. Johnson", tpf: 43, sa: 42, sm: 45, soa: 41, dm: 44, rs: 40, trend: "flat" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLevel(score: number): "need" | "typical" | "strength" {
  if (score < 41) return "need";
  if (score < 60) return "typical";
  return "strength";
}

const LEVEL_CONFIG = {
  need:     { label: "Need",     bg: "bg-[#fde8e8]", text: "text-[#b91c1c]", dotColor: "#f38b8b", barColor: "#f38b8b" },
  typical:  { label: "Typical",  bg: "bg-[#e3f0fa]", text: "text-[#1a5a8a]", dotColor: "#7ab5de", barColor: "#7ab5de" },
  strength: { label: "Strength", bg: "bg-[#e4f4eb]", text: "text-[#166534]", dotColor: "#7dc49a", barColor: "#7dc49a" },
};

const COMPETENCY_KEYS = [
  { key: "sa" as const,  label: "Self-Awareness" },
  { key: "sm" as const,  label: "Self-Mgmt" },
  { key: "soa" as const, label: "Social Awareness" },
  { key: "dm" as const,  label: "Decision-Making" },
  { key: "rs" as const,  label: "Relationships" },
];

const SORTABLE_COLUMNS: Array<{ key: SortKey; label: string }> = [
  { key: "name",    label: "Student" },
  { key: "grade",   label: "Grade" },
  { key: "teacher", label: "Teacher" },
  { key: "tpf",     label: "T-Score" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterPill({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  selected: string;
  onChange: (v: string) => void;
}) {
  const selectedLabel = options.find((o) => o.value === selected)?.label ?? selected;
  const isFiltered = selected !== "all";
  return (
    <div
      className={`relative inline-flex items-center h-7 pl-2.5 pr-2 rounded-full border cursor-pointer transition-colors ${
        isFiltered
          ? "border-[#1a4e8a] bg-[#eef2f8]"
          : "border-[#e8ecf0] bg-white hover:border-gray-300"
      }`}
    >
      <span className={`text-[11.5px] mr-1 ${isFiltered ? "text-[#1a4e8a]" : "text-gray-400"}`}>
        {label}:
      </span>
      <span className={`text-[11.5px] font-medium ${isFiltered ? "text-[#1a4e8a]" : "text-gray-700"}`}>
        {selectedLabel}
      </span>
      <ChevronDown size={11} className={`ml-1 ${isFiltered ? "text-[#1a4e8a]" : "text-gray-400"}`} />
      <select
        className="absolute inset-0 opacity-0 cursor-pointer w-full"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (sortKey !== col) return <ChevronsUpDown size={12} className="text-gray-300 shrink-0" />;
  return sortDir === "asc" ? (
    <ChevronUp size={12} className="text-[#1a4e8a] shrink-0" />
  ) : (
    <ChevronDown size={12} className="text-[#1a4e8a] shrink-0" />
  );
}

function ChartLegend({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>;
}) {
  const labels: Record<string, string> = {
    need: "Need",
    typical: "Typical",
    strength: "Strength",
  };
  return (
    <div className="flex items-center justify-center gap-5 mt-1">
      {(payload ?? []).map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-[11.5px] text-gray-500">{labels[entry.value] ?? entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClassSummaryPage() {
  const [gradeFilter, setGradeFilter]     = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [searchQuery, setSearchQuery]     = useState("");
  const [sortKey, setSortKey]             = useState<SortKey>("name");
  const [sortDir, setSortDir]             = useState<SortDir>("asc");

  const filteredStudents = useMemo(() => {
    const filtered = ALL_STUDENTS.filter((s) => {
      if (gradeFilter !== "all" && s.grade !== gradeFilter) return false;
      if (teacherFilter !== "all" && s.teacher !== teacherFilter) return false;
      if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name")    cmp = a.name.localeCompare(b.name);
      if (sortKey === "grade")   cmp = Number(a.grade) - Number(b.grade);
      if (sortKey === "teacher") cmp = a.teacher.localeCompare(b.teacher);
      if (sortKey === "tpf")     cmp = a.tpf - b.tpf;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [gradeFilter, teacherFilter, searchQuery, sortKey, sortDir]);

  const stats = useMemo(() => {
    const total    = filteredStudents.length;
    const need     = filteredStudents.filter((s) => s.tpf < 41).length;
    const strength = filteredStudents.filter((s) => s.tpf >= 60).length;
    const typical  = total - need - strength;
    return { total, need, typical, strength };
  }, [filteredStudents]);

  const chartData = useMemo(() =>
    COMPETENCY_KEYS.map(({ key, label }) => {
      let need = 0, typical = 0, strength = 0;
      filteredStudents.forEach((s) => {
        const score = s[key];
        if (score < 41) need++;
        else if (score < 60) typical++;
        else strength++;
      });
      return { label, need, typical, strength };
    }),
  [filteredStudents]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const hasActiveFilters = gradeFilter !== "all" || teacherFilter !== "all";

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className="border-b border-[#e8ecf0] bg-white px-6 py-3 flex items-center gap-2.5 flex-wrap">
        <span className="text-[11.5px] font-medium text-gray-400 mr-0.5">Filter by</span>

        {/* Static context pills */}
        <div className="inline-flex items-center h-7 px-2.5 rounded-full bg-[#f4f6f9] text-[11.5px] text-gray-500 font-medium">
          Fall 2024
        </div>
        <div className="inline-flex items-center h-7 px-2.5 rounded-full bg-[#f4f6f9] text-[11.5px] text-gray-500 font-medium">
          Riverside Elementary
        </div>

        {/* Interactive filters */}
        <FilterPill
          label="Grade"
          options={[
            { value: "all", label: "All Grades" },
            { value: "3",   label: "Grade 3" },
            { value: "4",   label: "Grade 4" },
            { value: "5",   label: "Grade 5" },
          ]}
          selected={gradeFilter}
          onChange={setGradeFilter}
        />
        <FilterPill
          label="Teacher"
          options={[
            { value: "all",          label: "All Teachers" },
            { value: "Ms. Rivera",   label: "Ms. Rivera" },
            { value: "Mr. Chen",     label: "Mr. Chen" },
            { value: "Ms. Johnson",  label: "Ms. Johnson" },
          ]}
          selected={teacherFilter}
          onChange={setTeacherFilter}
        />

        {hasActiveFilters && (
          <button
            onClick={() => { setGradeFilter("all"); setTeacherFilter("all"); }}
            className="text-[11.5px] text-gray-400 hover:text-gray-600 ml-0.5 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="p-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900">Class Summary</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Fall 2024 · {stats.total} student{stats.total !== 1 ? "s" : ""} · Riverside Elementary
            </p>
          </div>
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-[#e8ecf0] bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={14} strokeWidth={1.75} />
            Export PDF
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-4">
          {(["need", "typical", "strength"] as const).map((level) => {
            const cfg   = LEVEL_CONFIG[level];
            const count = stats[level];
            const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            const label = { need: "Need for Instruction", typical: "Typical", strength: "Strength" }[level];
            return (
              <div key={level} className="bg-white rounded-xl border border-[#e8ecf0] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.dotColor }} />
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none mb-1">{count}</div>
                <div className="text-[12.5px] text-gray-400">{pct}% of students</div>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: cfg.barColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Competency distribution chart */}
        {stats.total > 0 && (
          <div className="bg-white rounded-xl border border-[#e8ecf0] p-6 shadow-sm">
            <h2 className="text-[14px] font-semibold text-gray-900 mb-4">
              Distribution by Competency
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                barCategoryGap="28%"
                barGap={2}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#f0f4f8" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Legend
                  content={<ChartLegend />}
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: 8 }}
                />
                <Bar dataKey="need"     fill="#f38b8b" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="typical"  fill="#7ab5de" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="strength" fill="#7dc49a" radius={[2, 2, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Student table */}
        <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm">

          {/* Table toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ecf0]">
            <h2 className="text-[14px] font-semibold text-gray-900">
              Students
              <span className="ml-1.5 text-[13px] font-normal text-gray-400">
                ({filteredStudents.length})
              </span>
            </h2>
            <div className="relative">
              <Search
                size={13}
                strokeWidth={1.75}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                placeholder="Search students…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 h-8 rounded-lg border border-[#e8ecf0] text-[12.5px] bg-[#f8fafc] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1a4e8a] focus:border-[#1a4e8a] w-48 transition-shadow"
              />
            </div>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f4f8]">
                {SORTABLE_COLUMNS.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className="px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-gray-400 cursor-pointer select-none hover:text-gray-600 transition-colors"
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
                    </span>
                  </th>
                ))}
                <th className="px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">
                  Level
                </th>
                <th className="px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[13px] text-gray-400">
                    No students match the current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, i) => {
                  const level   = getLevel(student.tpf);
                  const cfg     = LEVEL_CONFIG[level];
                  const isLast  = i === filteredStudents.length - 1;
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-gray-50/70 transition-colors ${!isLast ? "border-b border-[#f5f7fa]" : ""}`}
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-[13.5px] font-medium text-gray-900">{student.name}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[13px] text-gray-600">Grade {student.grade}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[13px] text-gray-600">{student.teacher}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[13px] font-semibold text-gray-800 tabular-nums">{student.tpf}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center h-5 px-2 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {student.trend === "up"   && <TrendingUp   size={15} strokeWidth={1.75} className="text-[#16a34a]" />}
                        {student.trend === "down" && <TrendingDown size={15} strokeWidth={1.75} className="text-[#dc2626]" />}
                        {student.trend === "flat" && <Minus        size={15} strokeWidth={1.75} className="text-gray-300"  />}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
