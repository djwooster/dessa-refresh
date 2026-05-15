"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";
import { ChevronDown, Download, RefreshCw } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { ReportSelector } from "../ReportSelector";

// ─── Types ────────────────────────────────────────────────────────────────────

type CompKey = "sec" | "sa" | "sm" | "so" | "rs" | "rdm" | "ot";

interface StudentRow {
  id: number; name: string;
  sec: number; sa: number; sm: number; so: number; rs: number; rdm: number; ot: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const CHART_DATA = [
  { key: "SEC", label: "Composite\nScore (SEC)", need: 261, typical: 149 },
  { key: "SA",  label: "Self-\nAwareness",       need: 194, typical: 216 },
  { key: "SM",  label: "Self-\nManagement",      need: 185, typical: 225 },
  { key: "SO",  label: "Social\nAwareness",      need: 169, typical: 241 },
  { key: "RS",  label: "Relationship\nSkills",   need: 185, typical: 225 },
  { key: "RDM", label: "Responsible\nDecision\nMaking", need: 227, typical: 183 },
  { key: "OT",  label: "Optimistic\nThinking",  need: 169, typical: 241 },
];

const STUDENTS: StudentRow[] = [
  { id: 1,  name: "Benkhe, Giselle",   sec: 28, sa: 28, sm: 28, so: 28, rs: 28, rdm: 28, ot: 28 },
  { id: 2,  name: "Bennedick, Zane",   sec: 28, sa: 28, sm: 28, so: 28, rs: 28, rdm: 28, ot: 28 },
  { id: 3,  name: "Judkins, Dinah",    sec: 28, sa: 28, sm: 28, so: 28, rs: 28, rdm: 28, ot: 28 },
  { id: 4,  name: "Hares, Judye",      sec: 28, sa: 32, sm: 31, so: 31, rs: 30, rdm: 32, ot: 30 },
  { id: 5,  name: "Hales, Flossie",    sec: 28, sa: 34, sm: 28, so: 31, rs: 28, rdm: 28, ot: 28 },
  { id: 6,  name: "Adelsberg, Quinta", sec: 28, sa: 28, sm: 31, so: 31, rs: 37, rdm: 28, ot: 28 },
  { id: 7,  name: "Giraldon, Nevil",   sec: 28, sa: 28, sm: 28, so: 28, rs: 28, rdm: 28, ot: 28 },
  { id: 8,  name: "Haughan, Keith",    sec: 28, sa: 28, sm: 31, so: 31, rs: 37, rdm: 28, ot: 28 },
  { id: 9,  name: "Gonnel, Tessa",     sec: 28, sa: 34, sm: 32, so: 28, rs: 28, rdm: 30, ot: 32 },
  { id: 10, name: "Tomaskov, Libbie",  sec: 28, sa: 28, sm: 32, so: 28, rs: 28, rdm: 28, ot: 28 },
  { id: 11, name: "Farris, Obadiah",   sec: 31, sa: 33, sm: 29, so: 30, rs: 28, rdm: 31, ot: 29 },
  { id: 12, name: "Greenwald, Petra",  sec: 35, sa: 37, sm: 34, so: 36, rs: 32, rdm: 35, ot: 33 },
];

const COMP_COLS: Array<{ key: CompKey; label: string }> = [
  { key: "sec", label: "SEC" }, { key: "sa",  label: "SA"  }, { key: "sm",  label: "SM"  },
  { key: "so",  label: "SO"  }, { key: "rs",  label: "RS"  }, { key: "rdm", label: "RDM" },
  { key: "ot",  label: "OT"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cellStyle(score: number) {
  if (score < 41) return "bg-[#fde8e8] text-[#b91c1c]";
  if (score < 60) return "bg-[#e3f0fa] text-[#1a5a8a]";
  return "bg-[#e4f4eb] text-[#166534]";
}

// ─── Custom x-axis tick with line-wrapped labels ───────────────────────────────

function CompTick({ x = 0, y = 0, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const lines = (payload?.value ?? "").split("\n");
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text key={i} x={0} dy={14 + i * 11} textAnchor="middle" fill="#9ca3af" fontSize={10}>
          {line}
        </text>
      ))}
    </g>
  );
}

interface LabelProps { x?: number; y?: number; width?: number; height?: number; value?: number }
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
  const [filtersOpen, setFiltersOpen]   = useState(false);
  const [windowDraft, setWindowDraft]   = useState("all");
  const [raterDraft, setRaterDraft]     = useState("all");
  const [windowFilter, setWindowFilter] = useState("all");
  const [raterFilter, setRaterFilter]   = useState("all");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);

  function handleApply() {
    setWindowFilter(windowDraft);
    setRaterFilter(raterDraft);
    setPage(1);
    setFiltersOpen(false);
  }

  function handleReset() {
    setWindowDraft("all"); setRaterDraft("all");
    setWindowFilter("all"); setRaterFilter("all");
    setPage(1);
  }

  const activeCount = [windowFilter !== "all", raterFilter !== "all"].filter(Boolean).length;

  const filteredStudents = useMemo(
    () => STUDENTS.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );
  const totalPages      = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const visibleStudents = useMemo(
    () => filteredStudents.slice((page - 1) * pageSize, page * pageSize),
    [filteredStudents, page, pageSize]
  );

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <ReportSelector currentHref="/reports3/competencies" />
          <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <RefreshCw size={12} strokeWidth={2} />
            Data updated hourly
          </span>
        </div>
        <p className="text-[13px] text-gray-500 mt-1">
          Students who have completed a full DESSA assessment — breakdown of rating scores by competency.
        </p>
      </div>

      {/* Collapsible filters */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="w-full flex items-center gap-1.5 px-5 py-3 text-[13.5px] font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#1a4e8a] text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
          <ChevronDown size={13} strokeWidth={2.5} className={`ml-auto text-[#1a4e8a] transition-transform duration-150 ${filtersOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-[#e8ecf0] px-5 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 max-w-lg">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Rating Window</p>
                    <div className="relative">
                      <select value={windowDraft} onChange={(e) => setWindowDraft(e.target.value)}
                        className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#e0e5eb] text-[12.5px] text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/20 focus:border-[#1a4e8a]">
                        <option value="all">All Windows</option>
                        <option value="25-26mid">25-26 Mid</option>
                        <option value="24-25end">24-25 End</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Rater Type</p>
                    <div className="relative">
                      <select value={raterDraft} onChange={(e) => setRaterDraft(e.target.value)}
                        className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#e0e5eb] text-[12.5px] text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/20 focus:border-[#1a4e8a]">
                        <option value="all">All</option>
                        <option value="educator">Educator</option>
                        <option value="ssr">Student Self-Report</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleApply} className="h-8 px-4 rounded-lg bg-[#1a4e8a] text-white text-[12.5px] font-semibold hover:bg-[#15407a] transition-colors">Apply</button>
                  <button onClick={handleReset} className="h-8 px-4 rounded-lg border border-[#e8ecf0] bg-white text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">Reset Filters</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
        <p className="text-[12px] text-gray-400 mb-5">
          Ratings reflect the most recent assessment in the selected window.
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={CHART_DATA} barCategoryGap="30%" margin={{ top: 4, right: 8, left: -16, bottom: 44 }}>
            <CartesianGrid vertical={false} stroke="#f0f4f8" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={CompTick as never} interval={0} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} label={{ value: "# of Students", angle: -90, position: "insideLeft", offset: 14, style: { fill: "#9ca3af", fontSize: 11 } }} />
            <Bar dataKey="need" stackId="a" fill="#f38b8b" isAnimationActive={false}>
              <LabelList content={<BarValueLabel />} />
            </Bar>
            <Bar dataKey="typical" stackId="a" fill="#7ab5de" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              <LabelList content={<BarValueLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Student table */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ecf0] gap-3">
          <div className="space-y-0.5">
            <h2 className="text-[14px] font-semibold text-gray-900">Student Competency Breakdown</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                placeholder="Search students…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-3 pr-3 h-8 w-48 rounded-lg border border-[#e8ecf0] text-[12.5px] bg-[#f8fafc] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1a4e8a] focus:border-[#1a4e8a]"
              />
            </div>
            <button className="flex items-center gap-2 h-8 px-3.5 rounded-lg border border-[#e8ecf0] bg-white text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={13} strokeWidth={1.75} />
              Export CSV
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0f4f8]">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 w-44">Name</th>
              {COMP_COLS.map((c) => (
                <th key={c.key} className="px-2 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-gray-600">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleStudents.map((s, i) => {
              const isLast = i === visibleStudents.length - 1;
              return (
                <tr key={s.id} className={`hover:bg-gray-50/50 transition-colors ${!isLast ? "border-b border-[#f5f7fa]" : ""}`}>
                  <td className="px-5 py-2.5">
                    <span className="text-[13px] font-medium text-[#1565c0] hover:underline cursor-pointer">{s.name}</span>
                  </td>
                  {COMP_COLS.map((c) => {
                    const score = s[c.key];
                    return (
                      <td key={c.key} className="px-1 py-1.5 text-center">
                        <span className={`inline-flex items-center justify-center w-10 py-1 rounded text-[12px] font-semibold ${cellStyle(score)}`}>
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

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 px-5 py-3 border-t border-[#f0f4f8] bg-[#fafbfc]">
          {[
            { color: "#fde8e8", text: "#b91c1c", label: "Need for Instruction" },
            { color: "#e3f0fa", text: "#1a5a8a", label: "Typical"              },
            { color: "#e4f4eb", text: "#166534", label: "Strength"             },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color, border: `1px solid ${l.text}33` }} />
              <span className="text-[11.5px] font-medium" style={{ color: l.text }}>{l.label}</span>
            </div>
          ))}
        </div>

        <Pagination
          page={page} totalPages={totalPages} totalItems={filteredStudents.length}
          pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize}
          itemLabel="students"
        />
      </div>
    </div>
  );
}
