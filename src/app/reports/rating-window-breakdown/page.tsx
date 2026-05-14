"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { GradeLevelComparison } from "@/components/dashboard/GradeLevelComparison";

// ─── Mock data ────────────────────────────────────────────────────────────────

const OVERALL = { need: 13, typical: 67, strength: 21, total: 9891 };

const SITE_DATA = [
  { site: "Winterfield Elementary",                    rated: 406, need: 15, typical: 70, strength: 15 },
  { site: "Randle Middle School",                      rated: 636, need: 15, typical: 67, strength: 18 },
  { site: "Branson Hills Middle School (SSMSE + SSHSE SGR)", rated: 617, need: 15, typical: 62, strength: 23 },
  { site: "Fallbridge Elementary",                     rated: 429, need: 14, typical: 69, strength: 17 },
  { site: "Northwestern High School",                  rated: 799, need: 14, typical: 65, strength: 21 },
  { site: "Brigham Elementary School (SSESE)",         rated: 429, need: 14, typical: 63, strength: 23 },
  { site: "Hillstrong High School",                    rated: 856, need: 13, typical: 67, strength: 19 },
  { site: "Rosehill Elementary",                       rated: 413, need: 13, typical: 68, strength: 18 },
  { site: "Summertime Elementary",                     rated: 409, need: 14, typical: 68, strength: 18 },
  { site: "Bridgewater Academy (SSE)",                 rated: 560, need: 14, typical: 67, strength: 19 },
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RatingWindowBreakdownPage() {
  const [windowFilter, setWindowFilter] = useState("25-26mid");
  const [raterFilter, setRaterFilter]   = useState("educator");
  const [siteFilter, setSiteFilter]     = useState("all");

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
          options={[{ value: "all", label: "All Sites" }, { value: "riverside", label: "Riverside Elementary" }]}
          selected={siteFilter}
          onChange={setSiteFilter}
        />
        <FilterPill
          label="Rater Type"
          options={[{ value: "all", label: "All" }, { value: "educator", label: "Educator" }, { value: "ssr", label: "Student Self-Report" }]}
          selected={raterFilter}
          onChange={setRaterFilter}
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
            <h1 className="text-[22px] font-bold text-gray-900">Rating Window Breakdown</h1>
            <span className="text-[12px] text-gray-400 font-medium">Data updated hourly</span>
          </div>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Distribution of student assessment scores across descriptive ranges.
          </p>
        </div>

        {/* Overall distribution */}
        <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
          <h2 className="text-[14px] font-semibold text-gray-900 mb-1">Students' Overall Social and Emotional Competence</h2>
          <p className="text-[12.5px] text-gray-400 mb-5">Across all students, here is the distribution of ratings.</p>

          {/* Proportional bar */}
          <div className="flex rounded-xl overflow-hidden h-14 mb-3 text-white text-[13px] font-bold">
            <div style={{ width: `${OVERALL.need}%` }} className="flex items-center justify-center bg-[#f38b8b] shrink-0">
              {OVERALL.need}%
            </div>
            <div style={{ width: `${OVERALL.typical}%` }} className="flex items-center justify-center bg-[#7ab5de] shrink-0">
              {OVERALL.typical}%
            </div>
            <div style={{ width: `${OVERALL.strength}%` }} className="flex items-center justify-center bg-[#7dc49a] shrink-0">
              {OVERALL.strength}%
            </div>
          </div>
          <div className="flex text-[11.5px] font-medium">
            <div style={{ width: `${OVERALL.need}%` }} className="text-center text-[#b91c1c]">Need</div>
            <div style={{ width: `${OVERALL.typical}%` }} className="text-center text-[#1a5a8a]">Typical</div>
            <div style={{ width: `${OVERALL.strength}%` }} className="text-center text-[#166534]">Strength</div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-[#f0f4f8]">
            {[
              { label: "Need for Instruction", count: Math.round(OVERALL.total * OVERALL.need / 100), pct: OVERALL.need, color: "#f38b8b" },
              { label: "Typical",              count: Math.round(OVERALL.total * OVERALL.typical / 100), pct: OVERALL.typical, color: "#7ab5de" },
              { label: "Strength",             count: Math.round(OVERALL.total * OVERALL.strength / 100), pct: OVERALL.strength, color: "#7dc49a" },
            ].map((kpi) => (
              <div key={kpi.label} className="text-center">
                <div className="text-[26px] font-bold text-gray-900">{kpi.count.toLocaleString()}</div>
                <div className="text-[12px] font-medium mt-0.5" style={{ color: kpi.color }}>
                  {kpi.label} · {kpi.pct}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade level breakout — reuse existing component */}
        <GradeLevelComparison />

        {/* Site breakout table */}
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
              {SITE_DATA.map((row, i) => {
                const isLast = i === SITE_DATA.length - 1;
                return (
                  <tr key={row.site} className={`hover:bg-gray-50/70 transition-colors ${!isLast ? "border-b border-[#f5f7fa]" : ""}`}>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#1565c0] hover:underline cursor-pointer">{row.site}</td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-gray-700 tabular-nums">{row.rated.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[13px] font-semibold text-[#b91c1c] tabular-nums">{row.need}%</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[13px] font-semibold text-[#1a5a8a] tabular-nums">{row.typical}%</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[13px] font-semibold text-[#166534] tabular-nums">{row.strength}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
