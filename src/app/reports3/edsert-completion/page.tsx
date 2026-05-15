"use client";

import { RefreshCw } from "lucide-react";
import { ReportSelector } from "../ReportSelector";

export default function EdSERTCompletionPage() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <ReportSelector currentHref="/reports3/edsert-completion" />
          <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <RefreshCw size={12} strokeWidth={2} />
            Data updated hourly
          </span>
        </div>
        <p className="text-[13px] text-gray-500 mt-1">
          Track EdSERT module completion across your organization.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-12 flex flex-col items-center justify-center text-center gap-3">
        <p className="text-[15px] font-semibold text-gray-700">Coming Soon</p>
        <p className="text-[13px] text-gray-400 max-w-sm">This report is currently under development and will be available in an upcoming release.</p>
      </div>
    </div>
  );
}
