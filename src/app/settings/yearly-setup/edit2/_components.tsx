"use client";

import { useState, useRef } from "react";
import { Info, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BAND_COLORS, MONTH_NAMES, TSCORE_RANGES, LAST_YEAR } from "./_data";

export function WizardTimeline({
  dates,
  labels,
  configuredCount,
}: {
  dates: string[];
  labels: string[];
  configuredCount?: number;
}) {
  const parsed = dates.map((d) => (d ? new Date(d + "T00:00:00") : null));
  const valid = parsed.filter(Boolean) as Date[];
  if (valid.length === 0) return null;

  const rangeStart = valid[0];
  const rangeEnd = new Date(rangeStart.getFullYear() + 1, 7, 1);

  const rangeMs = rangeEnd.getTime() - rangeStart.getTime();
  const pct = (d: Date) =>
    Math.max(
      0,
      Math.min(100, ((d.getTime() - rangeStart.getTime()) / rangeMs) * 100),
    );

  const ticks: Date[] = [];
  const cur = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const endM = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);
  while (cur <= endM) {
    ticks.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-4">
        {ticks.map((m, i) => {
          const isFirst = i === 0;
          const isLast = i === ticks.length - 1;
          return (
            <span
              key={i}
              className="absolute text-[12px] text-gray-400"
              style={
                isFirst
                  ? { left: 0 }
                  : isLast
                    ? { right: 0 }
                    : {
                        left: `${(i / (ticks.length - 1)) * 100}%`,
                        transform: "translateX(-50%)",
                      }
              }
            >
              {MONTH_NAMES[m.getMonth()]}
            </span>
          );
        })}
      </div>
      <div className="relative h-9 rounded-lg overflow-hidden flex">
        {parsed.map((date, i) => {
          if (!date) return null;
          const next = parsed[i + 1];
          const width = pct(next ?? rangeEnd) - pct(date);
          const isGhost = configuredCount !== undefined && i >= configuredCount;
          const color = isGhost
            ? { bg: "#f1f5f9", text: "#94a3b8" }
            : BAND_COLORS[i % BAND_COLORS.length];
          const shortLabel =
            labels[i]?.replace(/\s*-?\s*Assessment/i, "").trim() || `W${i + 1}`;
          return (
            <div
              key={i}
              className="flex items-center justify-center overflow-hidden shrink-0"
              style={{
                width: `${width}%`,
                backgroundColor: color.bg,
                borderRight: parsed[i + 1] ? "2px solid white" : undefined,
              }}
            >
              <span
                className="text-[10px] font-bold truncate px-1"
                style={{ color: color.text }}
              >
                {shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TScoreInfoTooltip() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ bottom: 0, right: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPos({
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(true);
  };

  return (
    <div
      ref={iconRef}
      className="inline-flex items-center cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setOpen(false)}
    >
      <Info size={13} className="text-gray-400" strokeWidth={1.75} />
      {open && (
        <div
          className="fixed w-[260px] bg-white border border-[#e8ecf0] rounded-xl shadow-lg p-4 z-[100]"
          style={{ bottom: pos.bottom, right: pos.right }}
        >
          <p className="text-[12px] font-semibold text-gray-700 mb-3">
            T-Score ranges
          </p>
          <div className="h-5 rounded-md overflow-hidden flex mb-3">
            {TSCORE_RANGES.map(({ label, value, bg, text, flex }) => (
              <div
                key={label}
                className="flex items-center justify-center"
                style={{ flex, backgroundColor: bg }}
              >
                <span className="text-[9px] font-bold" style={{ color: text }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {TSCORE_RANGES.map(({ label, value, bg, text }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: bg, border: "1px solid #e5e7eb" }}
                />
                <span className="text-[12px] text-gray-600 flex-1">
                  {label}
                </span>
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: text }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ConfirmModal({
  onDiscard,
  onKeep,
}: {
  onDiscard: () => void;
  onKeep: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onKeep} />
      <div className="relative bg-white rounded-xl border border-[#e8ecf0] shadow-xl p-6 w-[400px]">
        <h2 className="text-[16px] font-bold text-gray-900 mb-2">
          Discard changes?
        </h2>
        <p className="text-[14px] text-gray-500 mb-6">
          You have unsaved changes. If you leave now they will be lost.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onKeep}
            className="h-9 px-4 rounded-lg border border-[#d1d5db] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Keep Editing
          </button>
          <button
            onClick={onDiscard}
            className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export function LastYearModal({
  onClose,
  onUse,
}: {
  onClose: () => void;
  onUse: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[680px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e8ecf0]">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900">
              Last Year's Setup
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {LAST_YEAR.year} School Year
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Rating Windows
            </p>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {LAST_YEAR.windowCount} windows — {LAST_YEAR.windowDesc}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {LAST_YEAR.windows.map((w) => (
                <div
                  key={w.label}
                  className="bg-[#f8fafc] rounded-lg px-3 py-2.5 border border-[#edf0f4]"
                >
                  <p className="text-sm font-semibold text-gray-400 mb-0.5">
                    {w.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {w.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-[#f0f4f8] pt-5">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Teacher Completed Assessments
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[14px] font-semibold text-gray-700">
                  Type
                </span>
                <span className="text-[14px] text-gray-500">
                  {LAST_YEAR.assessment} ({LAST_YEAR.assessmentDesc})
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[14px] font-semibold text-gray-700">
                  Conditional T-Score
                </span>
                <span className="text-[14px] text-gray-500">
                  {LAST_YEAR.tScore} or below
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-[#f0f4f8] pt-5">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Student Completed Assessments
            </p>
            <div className="flex justify-between items-baseline">
              <span className="text-[14px] font-semibold text-gray-700">
                Site Leader management
              </span>
              <span className="text-[14px] text-gray-500">
                {LAST_YEAR.siteLeaderManage ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-t border-[#e8ecf0]">
          <p className="text-sm text-gray-400">
            Applying this will replace your current selections.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-[#d1d5db] text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={onUse}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1a4e8a] text-white text-sm font-semibold hover:bg-[#15407a] transition-colors cursor-pointer"
            >
              <CheckCircle2 size={14} strokeWidth={2} />
              Use Last Year's Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RadioGroupField({
  hasError,
  children,
}: {
  hasError: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        hasError ? "border-red-400 bg-red-50/40" : "border-[#e8ecf0]"
      }`}
      style={
        hasError ? { boxShadow: "0 0 0 1px rgba(239,68,68,0.25)" } : undefined
      }
    >
      {children}
    </div>
  );
}

export function FieldErrorText({ message, show }: { message: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <p className="text-[12px] text-red-500 font-medium mb-4">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SuccessAnimation() {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative"
    >
      {/* Ripple rings */}
      {[0, 1].map((n) => (
        <motion.div
          key={n}
          className="absolute inset-0 rounded-full border-2 border-[#1a4e8a]"
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{
            duration: 1.8,
            delay: n * 0.7,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Background circle fill */}
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="#eef2f8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ transformOrigin: "60px 60px" }}
        />
        {/* Animated stroke circle */}
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#1a4e8a"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference, rotate: -90 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut", delay: 0.1 }}
          style={{ transformOrigin: "60px 60px" }}
        />
        {/* Checkmark */}
        <motion.path
          d="M38 60 L52 74 L82 44"
          fill="none"
          stroke="#1a4e8a"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="60"
          initial={{ strokeDashoffset: 60 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.65 }}
        />
      </svg>
    </motion.div>
  );
}
