"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, ChevronDown } from "lucide-react";
import { ConceptC } from "@/components/dashboard/timeline/ConceptC";

export default function YearlySetupPage() {
  const router = useRouter();
  const [year, setYear] = useState("2025-2026");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 mb-1">Yearly Setup</h1>
        <p className="text-[13.5px] text-gray-500">
          This process will allow you to plan for your year ahead and set rating window timeframes.
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-b border-[#e8ecf0]">
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
          <button
            onClick={() => router.push("/settings/yearly-setup/edit")}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors cursor-pointer"
          >
            <Pencil size={13} strokeWidth={1.75} />
            Edit Setup
          </button>
        </div>

        {/* Rating windows visualization */}
        <div className="px-6 py-5 border-b border-[#f0f4f8]">
          <h3 className="text-[13.5px] font-semibold text-gray-800 mb-4">
            Rating windows
          </h3>
          <ConceptC showYearLabel={false} />
        </div>

        {/* Assessment configurations */}
        {/* <div className="px-6 py-5">
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Assessment Configurations
          </h3>
          <div className="space-y-3">
            {CONFIGS.map((c) => (
              <div key={c.label} className="flex justify-between items-baseline gap-6">
                <span className="text-[13.5px] font-semibold text-gray-800 shrink-0">{c.label}</span>
                <span className="text-[13.5px] text-gray-500 text-right">{c.value}</span>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}
