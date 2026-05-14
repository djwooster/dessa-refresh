"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { WINDOWS } from "./shared";

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  completed: { label: "Complete",  bg: "#dcf0e5", text: "#166534" },
  current:   { label: "Active",    bg: "#dbeafe", text: "#1e40af" },
  upcoming:  { label: "Upcoming",  bg: "#f3f4f6", text: "#6b7280" },
};

export function ConceptB() {
  const completedCount = WINDOWS.filter(
    (w) => w.status === "completed" || w.status === "current"
  ).length;
  const progressPct = ((completedCount - 1) / (WINDOWS.length - 1)) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Timeline line + dots */}
      <div className="relative flex items-center px-6">
        {/* Track */}
        <div className="absolute left-6 right-6 h-[3px] bg-gray-200 rounded-full top-1/2 -translate-y-1/2" />
        <div
          className="absolute left-6 h-[3px] bg-[#22c55e] rounded-full top-1/2 -translate-y-1/2 transition-all"
          style={{ width: `${progressPct}%` }}
        />

        {WINDOWS.map((w, i) => {
          const Icon =
            w.status === "completed"
              ? CheckCircle2
              : w.status === "current"
              ? Circle
              : Clock;
          return (
            <div
              key={w.id}
              className="relative flex-1 flex justify-center"
              style={i === 0 ? { justifyContent: "flex-start" } : i === WINDOWS.length - 1 ? { justifyContent: "flex-end" } : {}}
            >
              <div
                className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center z-10"
                style={{
                  backgroundColor:
                    w.status === "completed"
                      ? "#22c55e"
                      : w.status === "current"
                      ? "#1a4e8a"
                      : "#e5e7eb",
                }}
              >
                {w.status === "completed" && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {w.status === "current" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-3">
        {WINDOWS.map((w) => {
          const badge = STATUS_BADGE[w.status];
          const isCurrent = w.status === "current";
          return (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-lg border p-3.5 flex flex-col gap-2 ${
                isCurrent
                  ? "border-[#1a4e8a] bg-white shadow-md"
                  : "border-[#e5e7eb] bg-white"
              }`}
            >
              {/* Top border accent for current */}
              {isCurrent && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1a4e8a] rounded-t-lg" />
              )}
              <div
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit"
                style={{ backgroundColor: badge.bg, color: badge.text }}
              >
                {badge.label}
              </div>
              <p className="text-[13px] font-bold text-gray-900 leading-tight">{w.label}</p>
              <p className="text-[12px] text-gray-500">
                <span className="text-gray-400">Opens </span>{w.date}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
