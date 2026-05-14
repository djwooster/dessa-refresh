"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WINDOWS, type AssessmentWindow } from "./shared";

export function ConceptA() {
  const [active, setActive] = useState<string>("mid");
  const activeWindow = WINDOWS.find((w) => w.id === active)!;

  return (
    <div className="flex flex-col gap-5">
      {/* Tab strip — inspired by the day-picker */}
      <div className="bg-[#f3f4f6] rounded-2xl p-1.5 flex gap-1">
        {WINDOWS.map((w) => (
          <button
            key={w.id}
            onClick={() => setActive(w.id)}
            className="relative flex-1 rounded-xl py-3 px-2 flex flex-col items-center gap-0.5 transition-colors"
          >
            {active === w.id && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-white rounded-xl shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 text-[11px] font-medium tracking-wide uppercase ${
                active === w.id ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {w.shortLabel}
            </span>
            <span
              className={`relative z-10 text-[17px] font-bold leading-tight ${
                active === w.id ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {w.dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span
              className={`relative z-10 text-[10px] ${
                active === w.id ? "text-gray-400" : "text-gray-300"
              }`}
            >
              opens {w.dateObj.getFullYear()}
            </span>
          </button>
        ))}
      </div>

      {/* Status line beneath */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2.5 px-1"
      >
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            backgroundColor:
              activeWindow.status === "completed"
                ? "#22c55e"
                : activeWindow.status === "current"
                ? "#1a4e8a"
                : "#cbd5e1",
          }}
        />
        <span className="text-[13px] text-gray-500">
          {activeWindow.status === "completed" && `${activeWindow.label} complete`}
          {activeWindow.status === "current" && `Currently in ${activeWindow.label} window`}
          {activeWindow.status === "upcoming" && `${activeWindow.label} begins ${activeWindow.date}`}
        </span>
      </motion.div>
    </div>
  );
}
