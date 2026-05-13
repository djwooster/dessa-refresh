"use client";

import { motion } from "framer-motion";
import { WINDOWS, DAYS_UNTIL_POST } from "./shared";

export function ConceptD() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stepper */}
      <div className="relative flex items-start">
        {WINDOWS.map((w, i) => {
          const isLast = i === WINDOWS.length - 1;
          return (
            <div key={w.id} className="flex-1 flex flex-col items-center relative">
              {/* Connecting line */}
              {!isLast && (
                <div className="absolute left-1/2 top-[14px] w-full h-[2px] bg-gray-200">
                  {w.status === "completed" && (
                    <div className="absolute inset-0 bg-[#22c55e]" />
                  )}
                </div>
              )}

              {/* Node */}
              <div className="relative z-10 mb-3">
                {w.status === "completed" && (
                  <div className="w-7 h-7 rounded-full bg-[#22c55e] border-2 border-white shadow flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                {w.status === "current" && (
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#1a4e8a]/20"
                      animate={{ scale: [1, 1.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="w-7 h-7 rounded-full bg-[#1a4e8a] border-2 border-white shadow-md relative z-10 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                  </div>
                )}
                {w.status === "upcoming" && (
                  <div className="w-7 h-7 rounded-full bg-white border-2 border-gray-300 shadow-sm" />
                )}
              </div>

              {/* Label */}
              <p className={`text-[12px] font-semibold text-center leading-tight mb-0.5 ${
                w.status === "current" ? "text-gray-900" : w.status === "completed" ? "text-gray-600" : "text-gray-400"
              }`}>
                {w.label}
              </p>
              <p className={`text-[11px] text-center ${
                w.status === "current" ? "text-gray-500" : "text-gray-400"
              }`}>
                {w.date}
              </p>
            </div>
          );
        })}
      </div>

      {/* Contextual callout */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="bg-[#f0f4f9] rounded-lg px-4 py-3 flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-[#1a4e8a]/10 flex items-center justify-center shrink-0">
          <span className="text-[14px] font-bold text-[#1a4e8a]">{DAYS_UNTIL_POST}</span>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-800">
            {DAYS_UNTIL_POST} days until Post-Assessment
          </p>
          <p className="text-[11px] text-gray-500">Window opens May 28, 2026</p>
        </div>
      </motion.div>
    </div>
  );
}
