"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { ChevronDown, Download } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

// ─── Types ────────────────────────────────────────────────────────────────────

type CompKey = "sec" | "sa" | "sm" | "so" | "rs" | "rdm" | "ot";

interface StudentRow {
  id: number;
  name: string;
  sec: number;
  sa: number;
  sm: number;
  so: number;
  rs: number;
  rdm: number;
  ot: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const CHART_DATA = [
  { label: "SEC",  need: 261, typical: 149, strength: 0  },
  { label: "SA",   need: 194, typical: 216, strength: 0  },
  { label: "SM",   need: 185, typical: 225, strength: 0  },
  { label: "SO",   need: 169, typical: 241, strength: 0  },
  { label: "RS",   need: 185, typical: 225, strength: 0  },
  { label: "RDM",  need: 227, typical: 183, strength: 0  },
  { label: "OT",   need: 169, typical: 241, strength: 0  },
];

const STUDENTS: StudentRow[] = [
  { id: 1,  name: "Benkhe, Giselle",    sec: 28, sa: 28, sm: 28, so: 28, rs: 28, rdm: 28, ot: 28 },
  { id: 2,  name: "Bennedick, Zane",    sec: 28, sa: 28, sm: 28, so: 28, rs: 28, rdm: 28, ot: 28 },
  { id: 3,  name: "Judkins, Dinah",     sec: 28, sa: 28, sm: 28, so: 28, rs: 28, rdm: 28, ot: 28 },
  { id: 4,  name: "Hares, Judye",       sec: 28, sa: 32, sm: 31, so: 31, rs: 30, rdm: 32, ot: 30 },
  { id: 5,  name: "Hales, Flossie",     sec: 28, sa: 34, sm: 28, so: 31, rs: 28, rdm: 28, ot: 28 },
  { id: 6,  name: "Adelsberg, Quinta",  sec: 28, sa: 28, sm: 31, so: 31, rs: 37, rdm: 28, ot: 28 },
  { id: 7,  name: "Giraldon, Nevil",    sec: 28, sa: 28, sm: 28, so: 28, rs: 28, rdm: 28, ot: 28 },
  { id: 8,  name: "Haughan, Keith",     sec: 28, sa: 28, sm: 31, so: 31, rs: 37, rdm: 28, ot: 28 },
  { id: 9,  name: "Gonnel, Tessa",      sec: 28, sa: 34, sm: 32, so: 28, rs: 28, rdm: 30, ot: 32 },
  { id: 10, name: "Tomaskov, Libbie",   sec: 28, sa: 28, sm: 32, so: 28, rs: 28, rdm: 28, ot: 28 },
  { id: 11, name: "Farris, Obadiah",    sec: 31, sa: 33, sm: 29, so: 30, rs: 28, rdm: 31, ot: 29 },
  { id: 12, name: "Greenwald, Petra",   sec: 35, sa: 37, sm: 34, so: 36, rs: 32, rdm: 35, ot: 33 },
];

const COMP_COLS: Array<{ key: CompKey; label: string }> = [
  { key: "sec", label: "SEC" },
  { key: "sa",  label: "SA"  },
  { key: "sm",  label: "SM"  },
  { key: "so",  label: "SO"  },
  { key: "rs",  label: "RS"  },
  { key: "rdm", label: "RDM" },
  { key: "ot",  label: "OT"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cellStyle(score: number): string {
  if (score < 41) return "bg-[#fde8e8] text-[#b91c1c]";
  if (score < 60) return "bg-[#e3f0fa] text-[#1a5a8a]";
  return "bg-[#e4f4eb] text-[#166534]";
}

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

interface LabelProps { x?: number; y?: number; width?: number; height?: number; value?: number; }

function BarValueLabel({ x = 0, y = 0, width = 0, height = 0, value = 0 }: LabelProps) {
  if (height < 18 || !value) return null;
  return (
    <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={600}>
      {value}
    </text>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompetenciesPage() {
  const [windowFilter, setWindowFilter] = useState("all");
  const [raterFilter, setRaterFilter]   = useState("all");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);

  function handleWindowFilter(v: string) { setWindowFilter(v); setPage(1); }
  function handleRaterFilter(v: string)  { setRaterFilter(v);  setPage(1); }

  const filteredStudents = useMemo(
    () => STUDENTS.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const totalPages        = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const visibleStudents   = useMemo(
    () => filteredStudents.slice((page - 1) * pageSize, page * pageSize),
    [filteredStudents, page, pageSize]
  );

  const hasActiveFilters = windowFilter !== "all" || raterFilter !== "all";

  return (
    <div className="flex flex-col min-h-full">

      {/* Filter bar */}
      <div className="border-b border-[#e8ecf0] bg-white px-6 py-3 flex items-center gap-2.5 flex-wrap">
        <span className="text-[11.5px] font-medium text-gray-400 mr-0.5">Filter by</span>
        <FilterPill
          label="Rating Window"
          options={[{ value: "all", label: "All Windows" }, { value: "25-26mid", label: "25-26 Mid" }]}
          selected={windowFilter}
          onChange={handleWindowFilter}
        />
        <FilterPill
          label="Rater Type"
          options={[{ value: "all", label: "All" }, { value: "educator", label: "Educator" }, { value: "ssr", label: "Student Self-Report" }]}
          selected={raterFilter}
          onChange={handleRaterFilter}
        />
        {hasActiveFilters && (
          <button onClick={() => { setWindowFilter("all"); setRaterFilter("all"); }} className="text-[11.5px] text-gray-400 hover:text-gray-600 ml-0.5 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">

        {/* Header */}
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-[22px] font-bold text-gray-900">Competencies</h1>
            <span className="text-[12px] text-gray-400 font-medium">Data updated hourly</span>
          </div>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Students who have completed a full DESSA assessment — breakdown of rating scores by competency.
          </p>
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[14px] font-semibold text-gray-900">Distribution by Competency</h2>
            <div className="flex items-center gap-4">
              {[{ color: "#f38b8b", label: "Need" }, { color: "#7ab5de", label: "Typical" }].map((d) => (
                <div key={d.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                  <span className="text-[11.5px] text-gray-500">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[12px] text-gray-400 mb-4">SEC = Composite · SA = Self-Awareness · SM = Self-Management · SO = Social Awareness · RS = Relationship Skills · RDM = Responsible Decision Making · OT = Optimistic Thinking</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CHART_DATA} barCategoryGap="30%" margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f0f4f8" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
              <Bar dataKey="need" stackId="a" fill="#f38b8b" isAnimationActive={false}>
                <LabelList content={<BarValueLabel />} />
              </Bar>
              <Bar dataKey="typical" stackId="a" fill="#7ab5de" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                <LabelList content={<BarValueLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Student competency table */}
        <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ecf0]">
            <h2 className="text-[14px] font-semibold text-gray-900">Student Competency Breakdown</h2>
            <button className="flex items-center gap-2 h-8 px-3.5 rounded-lg border border-[#e8ecf0] bg-white text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={13} strokeWidth={1.75} />
              Export CSV
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f4f8]">
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400 w-48" />
                {COMP_COLS.map((c) => (
                  <th key={c.key} className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-gray-600 w-16">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((s, i) => {
                const isLast = i === visibleStudents.length - 1;
                return (
                  <tr key={s.id} className={`hover:bg-gray-50/50 transition-colors ${!isLast ? "border-b border-[#f5f7fa]" : ""}`}>
                    <td className="px-5 py-2.5 text-right">
                      <span className="text-[13px] font-medium text-[#1565c0] hover:underline cursor-pointer">{s.name}</span>
                    </td>
                    {COMP_COLS.map((c) => {
                      const score = s[c.key];
                      return (
                        <td key={c.key} className="px-1 py-1 text-center">
                          <span className={`inline-flex items-center justify-center w-full py-1.5 rounded text-[12px] font-semibold ${cellStyle(score)}`}>
                            {score}
                          </span>
                        </td>
                      );
                    })}
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
