"use client";

import { Calendar, Plus } from "lucide-react";

const WINDOWS = [
  { id: "pre",  label: "2025–2026 Pre",  opensLabel: "August 1, 2025",   hasReminders: true  },
  { id: "mid",  label: "2025–2026 Mid",  opensLabel: "January 1, 2026",  hasReminders: false },
  { id: "post", label: "2025–2026 Post", opensLabel: "May 28, 2026",     hasReminders: false },
];

export default function RatingWindowRemindersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 mb-1">
          Rating Window Email Reminders
        </h1>
        <p className="text-[13.5px] text-gray-500">
          Choose the dates you'd like email reminders sent out to staff as well as a deadline for ratings.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">
        {WINDOWS.map((w, i) => (
          <div
            key={w.id}
            className={`flex items-center justify-between px-6 py-5 ${
              i < WINDOWS.length - 1 ? "border-b border-[#f0f4f8]" : ""
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#eef2f8] flex items-center justify-center shrink-0">
                <Calendar size={16} className="text-[#1a4e8a]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-800">{w.label}</p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Window opens {w.opensLabel}
                </p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[#1a4e8a] text-white text-[12.5px] font-semibold hover:bg-[#15407a] transition-colors">
              <Plus size={13} strokeWidth={2.25} />
              New Reminder
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
