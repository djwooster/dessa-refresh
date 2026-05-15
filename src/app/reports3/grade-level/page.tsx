"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";
import { ChevronDown, RefreshCw } from "lucide-react";
import { ReportSelector } from "../ReportSelector";

const GRADE_DATA = [
  { grade: "1st",  need: 12, typical: 68, strength: 20 },
  { grade: "2nd",  need: 15, typical: 64, strength: 21 },
  { grade: "3rd",  need: 12, typical: 65, strength: 23 },
  { grade: "4th",  need: 13, typical: 66, strength: 21 },
  { grade: "5th",  need: 13, typical: 67, strength: 20 },
  { grade: "6th",  need: 14, typical: 65, strength: 21 },
  { grade: "7th",  need: 15, typical: 64, strength: 21 },
  { grade: "8th",  need: 12, typical: 67, strength: 21 },
  { grade: "9th",  need: 15, typical: 68, strength: 17 },
  { grade: "10th", need: 12, typical: 69, strength: 19 },
  { grade: "11th", need: 14, typical: 66, strength: 20 },
  { grade: "12th", need: 13, typical: 68, strength: 19 },
];

interface LabelProps { x?: number; y?: number; width?: number; height?: number; value?: number }
function PctLabel({ x = 0, y = 0, width = 0, height = 0, value = 0 }: LabelProps) {
  if (height < 16 || !value) return null;
  return (
    <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" fill="white" fontSize={10} fontWeight={600}>
      {value}%
    </text>
  );
}

export default function GradeLevelPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [windowFilter, setWindowFilter] = useState("25-26mid");
  const [raterFilter, setRaterFilter]   = useState("all");
  const [siteFilter, setSiteFilter]     = useState("all");

  const activeCount = [windowFilter !== "25-26mid", raterFilter !== "all", siteFilter !== "all"].filter(Boolean).length;

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <ReportSelector currentHref="/reports3/grade-level" />
          <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <RefreshCw size={12} strokeWidth={2} />
            Data updated hourly
          </span>
        </div>
        <p className="text-[13px] text-gray-500 mt-1">
          This report allows school leaders to identify differences in social and emotional competence across grades.
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
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#1a4e8a] text-white text-[10px] font-bold">{activeCount}</span>
          )}
          <ChevronDown size={13} strokeWidth={2.5} className={`ml-auto text-[#1a4e8a] transition-transform duration-150 ${filtersOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.15, ease: "easeInOut" }} className="overflow-hidden">
              <div className="border-t border-[#e8ecf0] px-5 py-4 space-y-4">
                <div className="grid grid-cols-3 gap-4 max-w-2xl">
                  {[
                    { label: "Rating Window", value: windowFilter, onChange: setWindowFilter, options: [{ value: "25-26mid", label: "25-26 Mid" }, { value: "24-25end", label: "24-25 End" }] },
                    { label: "Rater Type",    value: raterFilter,  onChange: setRaterFilter,  options: [{ value: "all", label: "All" }, { value: "educator", label: "Educator" }, { value: "ssr", label: "Student Self-Report" }] },
                    { label: "Site",          value: siteFilter,   onChange: setSiteFilter,   options: [{ value: "all", label: "All Sites" }, { value: "riverside", label: "Riverside Elementary" }] },
                  ].map(({ label, value, onChange, options }) => (
                    <div key={label}>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</p>
                      <div className="relative">
                        <select value={value} onChange={(e) => onChange(e.target.value)}
                          className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#e0e5eb] text-[12.5px] text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/20 focus:border-[#1a4e8a]">
                          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setFiltersOpen(false)} className="h-8 px-4 rounded-lg bg-[#1a4e8a] text-white text-[12.5px] font-semibold hover:bg-[#15407a] transition-colors">Apply</button>
                  <button onClick={() => { setWindowFilter("25-26mid"); setRaterFilter("all"); setSiteFilter("all"); }} className="h-8 px-4 rounded-lg border border-[#e8ecf0] bg-white text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">Reset Filters</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={GRADE_DATA} barCategoryGap="25%" margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f0f4f8" />
            <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }}
              label={{ value: "Student Grade Level", position: "insideBottom", offset: -2, style: { fill: "#9ca3af", fontSize: 12 } }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`}
              label={{ value: "% of Students", angle: -90, position: "insideLeft", offset: 14, style: { fill: "#9ca3af", fontSize: 11 } }} />
            <Bar dataKey="need"     stackId="a" fill="#f38b8b" isAnimationActive={false}><LabelList content={<PctLabel />} /></Bar>
            <Bar dataKey="typical"  stackId="a" fill="#7ab5de" isAnimationActive={false}><LabelList content={<PctLabel />} /></Bar>
            <Bar dataKey="strength" stackId="a" fill="#7dc49a" radius={[2, 2, 0, 0]} isAnimationActive={false}><LabelList content={<PctLabel />} /></Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#f0f4f8]">
          {[{ color: "#f38b8b", label: "Need for Instruction" }, { color: "#7ab5de", label: "Typical" }, { color: "#7dc49a", label: "Strength" }].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
              <span className="text-[12px] text-gray-600">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
