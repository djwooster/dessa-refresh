"use client";

import { useState } from "react";
import { Pencil, ChevronDown } from "lucide-react";

const WINDOWS = [
  { label: "Pre-Assessment",  date: "August 1, 2025" },
  { label: "Mid-Assessment",  date: "January 1, 2026" },
  { label: "Post-Assessment", date: "May 28, 2026" },
];

const CONFIGS = [
  { label: "Screening",         value: "Screener (e.g., DESSA 2 mini, DESSA HSE-mini)" },
  { label: "Conditional Score", value: "40" },
  { label: "Exceptions",        value: "None" },
];

export default function YearlySetupPage() {
  const [year, setYear] = useState("2025-2026");

  return (
    <div className="p-6 max-w-[820px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 mb-1">Yearly Setup</h1>
        <p className="text-[13.5px] text-gray-500">
          This process will allow you to plan for your year ahead and set rating window timeframes.
        </p>
      </div>

      {/* Plan year selector */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-5 mb-4">
        <div className="flex items-center gap-3">
          <label className="text-[13px] font-semibold text-gray-600 uppercase tracking-wide">
            Plan Year
          </label>
          <div className="relative">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-9 pl-3 pr-8 border border-[#d1d5db] rounded-lg text-[13px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 appearance-none cursor-pointer"
            >
              <option>2025-2026</option>
              <option>2024-2025</option>
              <option>2023-2024</option>
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors">
            <Pencil size={13} strokeWidth={1.75} />
            Edit Setup
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#f0f4f8]">
          <span className="text-[13.5px] font-semibold text-gray-800">Number of rating windows</span>
          <span className="text-gray-300 mx-1">·</span>
          <span className="text-[13.5px] text-gray-600">
            3 (Pre-Assessment, Mid-Assessment, Post-Assessment)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Rating Window Start Dates */}
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Rating Window Start Dates
            </h3>
            <div className="space-y-0">
              {WINDOWS.map((w, i) => (
                <div
                  key={w.label}
                  className={`flex justify-between items-center py-3 ${
                    i < WINDOWS.length - 1 ? "border-b border-gray-50" : ""
                  }`}
                >
                  <span className="text-[13.5px] font-medium text-gray-700">{w.label}</span>
                  <span className="text-[13.5px] text-gray-500">{w.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Configurations */}
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Assessment Configurations
            </h3>
            <div className="space-y-0">
              {CONFIGS.map((c, i) => (
                <div
                  key={c.label}
                  className={`py-3 ${i < CONFIGS.length - 1 ? "border-b border-gray-50" : ""}`}
                >
                  <p className="text-[13px] font-semibold text-gray-700 mb-0.5">{c.label}</p>
                  <p className="text-[13px] text-gray-500">{c.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
