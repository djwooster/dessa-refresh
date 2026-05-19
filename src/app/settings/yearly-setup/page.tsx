"use client";

import { useRouter } from "next/navigation";
import { Pencil, CalendarClock } from "lucide-react";

export default function YearlySetupPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 mb-1">Yearly Setup</h1>
        <p className="text-[13.5px] text-gray-500">
          Plan your year ahead and set rating window timeframes for each school year.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#eef2f8] flex items-center justify-center mb-4">
            <CalendarClock size={22} className="text-[#1a4e8a]" strokeWidth={1.5} />
          </div>
          <h3 className="text-[15px] font-semibold text-gray-800 mb-1">
            No yearly setup yet
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mb-6">
            Define your rating windows and assessment configuration to get started.
          </p>
          <button
            onClick={() => router.push("/settings/yearly-setup/edit")}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors cursor-pointer"
          >
            <Pencil size={13} strokeWidth={1.75} />
            Start Setup
          </button>
        </div>
      </div>
    </div>
  );
}
