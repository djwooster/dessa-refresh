"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList,
} from "recharts";
import { ChevronDown, Download, RefreshCw, X } from "lucide-react";
import { ReportSelector } from "../ReportSelector";

// ─── Data ─────────────────────────────────────────────────────────────────────

const OVERALL = { need: 13, typical: 67, strength: 21, total: 9_891 };

const GRADE_DATA = [
  { label: "K",    need: 12, typical: 68, strength: 20 },
  { label: "1st",  need: 13, typical: 66, strength: 21 },
  { label: "2nd",  need: 15, typical: 64, strength: 21 },
  { label: "3rd",  need: 12, typical: 65, strength: 23 },
  { label: "4th",  need: 13, typical: 66, strength: 21 },
  { label: "5th",  need: 13, typical: 67, strength: 20 },
  { label: "6th",  need: 14, typical: 65, strength: 21 },
  { label: "7th",  need: 15, typical: 64, strength: 21 },
  { label: "8th",  need: 12, typical: 67, strength: 21 },
  { label: "9th",  need: 15, typical: 68, strength: 17 },
  { label: "10th", need: 12, typical: 69, strength: 19 },
  { label: "11th", need: 14, typical: 66, strength: 20 },
  { label: "12th", need: 13, typical: 68, strength: 19 },
];

const RACE_DATA = [
  { label: "White",                    need: 10, typical: 68, strength: 22 },
  { label: "Black /\nAfrican\nAmerican", need: 18, typical: 64, strength: 18 },
  { label: "Hispanic /\nLatino",        need: 16, typical: 65, strength: 19 },
  { label: "Asian",                    need: 9,  typical: 69, strength: 22 },
  { label: "Other",                    need: 12, typical: 67, strength: 21 },
  { label: "American\nIndian /\nAlaskan Native", need: 14, typical: 66, strength: 20 },
  { label: "Native\nHawaiian /\nPacific Islander", need: 13, typical: 67, strength: 20 },
];

const SUBGROUP_DATA = [
  { label: "Reduced\nPrice\nLunch",        need: 17, typical: 64, strength: 19 },
  { label: "Economically\nDisadvantaged",  need: 19, typical: 63, strength: 18 },
  { label: "Students\nwith IEPs",          need: 22, typical: 61, strength: 17 },
  { label: "Gifted",                       need: 8,  typical: 67, strength: 25 },
  { label: "English\nLearner",             need: 15, typical: 65, strength: 20 },
  { label: "Migrant",                      need: 16, typical: 64, strength: 20 },
  { label: "McKinney-\nVento",             need: 21, typical: 62, strength: 17 },
  { label: "Students\nwith\n504s",         need: 18, typical: 64, strength: 18 },
];

const SITE_DATA = [
  { site: "Winterfield Elementary",                           rated: 406,  need: 15, typical: 70, strength: 15 },
  { site: "Randle Middle School",                             rated: 636,  need: 15, typical: 67, strength: 18 },
  { site: "Branson Hills Middle School (SSMSE + SSHSE SGR)",  rated: 617,  need: 15, typical: 62, strength: 23 },
  { site: "Fallbridge Elementary",                            rated: 429,  need: 14, typical: 69, strength: 17 },
  { site: "Northwestern High School",                         rated: 799,  need: 14, typical: 65, strength: 21 },
  { site: "Brigham Elementary School (SSESE)",                rated: 429,  need: 14, typical: 63, strength: 23 },
  { site: "Hillstrong High School",                           rated: 856,  need: 13, typical: 67, strength: 19 },
  { site: "Rosehill Elementary",                              rated: 413,  need: 13, typical: 68, strength: 18 },
  { site: "Summertime Elementary",                            rated: 409,  need: 14, typical: 68, strength: 18 },
  { site: "Bridgewater Academy (SSE)",                        rated: 560,  need: 14, typical: 67, strength: 19 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface LabelProps { x?: number; y?: number; width?: number; height?: number; value?: number }
function PctLabel({ x = 0, y = 0, width = 0, height = 0, value = 0 }: LabelProps) {
  if (height < 16 || !value) return null;
  return (
    <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" fill="white" fontSize={10} fontWeight={600}>
      {value}%
    </text>
  );
}

function MultiLineTick({ x = 0, y = 0, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const lines = (payload?.value ?? "").split("\n");
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text key={i} x={0} y={0} dy={14 + i * 12} textAnchor="middle" fill="#9ca3af" fontSize={11}>
          {line}
        </text>
      ))}
    </g>
  );
}

function ChartLegend() {
  return (
    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#f0f4f8]">
      {[
        { color: "#f38b8b", label: "Need for Instruction" },
        { color: "#7ab5de", label: "Typical" },
        { color: "#7dc49a", label: "Strength" },
      ].map((l) => (
        <div key={l.label} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
          <span className="text-[12px] text-gray-600">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RatingWindowBreakdownPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [site, setSite]         = useState("All");
  const [ratingWindow, setRatingWindow] = useState("25-26 Mid");
  const [raterType, setRaterType]       = useState("All");

  function handleReset() {
    setSite("All"); setRatingWindow("25-26 Mid"); setRaterType("All");
  }

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <ReportSelector currentHref="/reports3/rating-window-breakdown" />
          <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <RefreshCw size={12} strokeWidth={2} />
            Data updated hourly
          </span>
        </div>
        <p className="text-[13px] text-gray-500 mt-1">
          Distribution of student assessment scores across descriptive ranges.
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
                    <FilterSelect label="Sites" value={site} onChange={setSite}
                      options={["All", "Riverside Elementary", "Hillstrong High School", "Washington Middle School", "Lincoln Elementary"]} />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Ratings</p>
                  <div className="grid grid-cols-3 gap-4 max-w-xl">
                    <FilterSelect label="Rating Window" value={ratingWindow} onChange={setRatingWindow}
                      options={["25-26 Mid", "25-26 Pre", "24-25 End", "24-25 Mid"]} clearable />
                    <FilterSelect label="Rater Type" value={raterType} onChange={setRaterType}
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

      {/* Overall distribution */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
        <h2 className="text-[14px] font-semibold text-gray-900 mb-1">Students&#39; Overall Social and Emotional Competence</h2>
        <p className="text-[12.5px] text-gray-400 mb-5">Across all students, here is the distribution of ratings.</p>

        <div className="flex rounded-xl overflow-hidden h-14 mb-3 text-white text-[13px] font-bold">
          <div style={{ width: `${OVERALL.need}%` }} className="flex items-center justify-center bg-[#f38b8b] shrink-0">{OVERALL.need}%</div>
          <div style={{ width: `${OVERALL.typical}%` }} className="flex items-center justify-center bg-[#7ab5de] shrink-0">{OVERALL.typical}%</div>
          <div style={{ width: `${OVERALL.strength}%` }} className="flex items-center justify-center bg-[#7dc49a] shrink-0">{OVERALL.strength}%</div>
        </div>
        <div className="flex text-[11.5px] font-medium">
          <div style={{ width: `${OVERALL.need}%` }} className="text-center text-[#b91c1c]">Need</div>
          <div style={{ width: `${OVERALL.typical}%` }} className="text-center text-[#1a5a8a]">Typical</div>
          <div style={{ width: `${OVERALL.strength}%` }} className="text-center text-[#166534]">Strength</div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-[#f0f4f8]">
          {[
            { label: "Need for Instruction", count: Math.round(OVERALL.total * OVERALL.need / 100),     pct: OVERALL.need,     color: "#f38b8b" },
            { label: "Typical",              count: Math.round(OVERALL.total * OVERALL.typical / 100),  pct: OVERALL.typical,  color: "#7ab5de" },
            { label: "Strength",             count: Math.round(OVERALL.total * OVERALL.strength / 100), pct: OVERALL.strength, color: "#7dc49a" },
          ].map((kpi) => (
            <div key={kpi.label} className="text-center">
              <div className="text-[26px] font-bold text-gray-900">{kpi.count.toLocaleString()}</div>
              <div className="text-[12px] font-medium mt-0.5" style={{ color: kpi.color }}>{kpi.label} · {kpi.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Level Breakout */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
        <h2 className="text-[14px] font-semibold text-gray-900 mb-1">Grade Level Breakout</h2>
        <p className="text-[12.5px] text-gray-400 mb-4">Across all grades, here is the distribution of ratings.</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={GRADE_DATA} barCategoryGap="25%" margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f0f4f8" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }}
              label={{ value: "Descriptive Range", position: "insideBottom", offset: -2, style: { fill: "#9ca3af", fontSize: 12 } }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`}
              label={{ value: "% of Students", angle: -90, position: "insideLeft", offset: 14, style: { fill: "#9ca3af", fontSize: 11 } }} />
            <Bar dataKey="need"     stackId="a" fill="#f38b8b" isAnimationActive={false}><LabelList content={<PctLabel />} /></Bar>
            <Bar dataKey="typical"  stackId="a" fill="#7ab5de" isAnimationActive={false}><LabelList content={<PctLabel />} /></Bar>
            <Bar dataKey="strength" stackId="a" fill="#7dc49a" radius={[2, 2, 0, 0]} isAnimationActive={false}><LabelList content={<PctLabel />} /></Bar>
          </BarChart>
        </ResponsiveContainer>
        <ChartLegend />
      </div>

      {/* Race/Ethnicity Breakout */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
        <h2 className="text-[14px] font-semibold text-gray-900 mb-1">Race/Ethnicity Breakout</h2>
        <p className="text-[12.5px] text-gray-400 mb-4">Across race/ethnicity categories, here is the distribution of ratings.</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={RACE_DATA} barCategoryGap="28%" margin={{ top: 4, right: 8, left: -8, bottom: 44 }}>
            <CartesianGrid vertical={false} stroke="#f0f4f8" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={MultiLineTick as never} interval={0}
              label={{ value: "Descriptive Range", position: "insideBottom", offset: -38, style: { fill: "#9ca3af", fontSize: 12 } }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`}
              label={{ value: "% of Students", angle: -90, position: "insideLeft", offset: 14, style: { fill: "#9ca3af", fontSize: 11 } }} />
            <Bar dataKey="need"     stackId="a" fill="#f38b8b" isAnimationActive={false}><LabelList content={<PctLabel />} /></Bar>
            <Bar dataKey="typical"  stackId="a" fill="#7ab5de" isAnimationActive={false}><LabelList content={<PctLabel />} /></Bar>
            <Bar dataKey="strength" stackId="a" fill="#7dc49a" radius={[2, 2, 0, 0]} isAnimationActive={false}><LabelList content={<PctLabel />} /></Bar>
          </BarChart>
        </ResponsiveContainer>
        <ChartLegend />
      </div>

      {/* Student Subgroup Breakout */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
        <h2 className="text-[14px] font-semibold text-gray-900 mb-1">Student Subgroup Breakout</h2>
        <p className="text-[12.5px] text-gray-400 mb-4">Across other comparison groups, here is the distribution of ratings.</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={SUBGROUP_DATA} barCategoryGap="28%" margin={{ top: 4, right: 8, left: -8, bottom: 44 }}>
            <CartesianGrid vertical={false} stroke="#f0f4f8" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={MultiLineTick as never} interval={0}
              label={{ value: "Descriptive Range", position: "insideBottom", offset: -38, style: { fill: "#9ca3af", fontSize: 12 } }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`}
              label={{ value: "% of Students", angle: -90, position: "insideLeft", offset: 14, style: { fill: "#9ca3af", fontSize: 11 } }} />
            <Bar dataKey="need"     stackId="a" fill="#f38b8b" isAnimationActive={false}><LabelList content={<PctLabel />} /></Bar>
            <Bar dataKey="typical"  stackId="a" fill="#7ab5de" isAnimationActive={false}><LabelList content={<PctLabel />} /></Bar>
            <Bar dataKey="strength" stackId="a" fill="#7dc49a" radius={[2, 2, 0, 0]} isAnimationActive={false}><LabelList content={<PctLabel />} /></Bar>
          </BarChart>
        </ResponsiveContainer>
        <ChartLegend />
      </div>

      {/* Site Breakout table */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ecf0]">
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900">Site Breakout</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Distribution by site. Filter to a single site to see educator-level data.</p>
          </div>
          <button className="flex items-center gap-2 h-8 px-3.5 rounded-lg border border-[#e8ecf0] bg-white text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={13} strokeWidth={1.75} />
            Export CSV
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0f4f8]">
              {["Site", "Students Rated", "Need for Instruction", "Typical", "Strength"].map((col, i) => (
                <th key={col} className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400 ${i === 0 ? "text-left" : "text-right"}`}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SITE_DATA.map((row, i) => (
              <tr key={row.site} className={`hover:bg-gray-50/70 transition-colors ${i < SITE_DATA.length - 1 ? "border-b border-[#f5f7fa]" : ""}`}>
                <td className="px-5 py-3.5 text-[13px] font-medium text-[#1565c0] hover:underline cursor-pointer">{row.site}</td>
                <td className="px-5 py-3.5 text-right text-[13px] text-gray-700 tabular-nums">{row.rated.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-right"><span className="text-[13px] font-semibold text-[#b91c1c] tabular-nums">{row.need}%</span></td>
                <td className="px-5 py-3.5 text-right"><span className="text-[13px] font-semibold text-[#1a5a8a] tabular-nums">{row.typical}%</span></td>
                <td className="px-5 py-3.5 text-right"><span className="text-[13px] font-semibold text-[#166534] tabular-nums">{row.strength}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
