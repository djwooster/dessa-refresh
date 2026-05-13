"use client";

import Link from "next/link";

interface TimelinePoint {
  date: string;
  label: string;
  status: "completed" | "current" | "upcoming";
}

const POINTS: TimelinePoint[] = [
  { date: "Aug 01", label: "Pre-Assessment", status: "completed" },
  { date: "Jan 01", label: "Mid-Assessment", status: "current" },
  { date: "May 28", label: "Post-Assessment", status: "upcoming" },
];

export function TimelineCard() {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[15px] text-gray-900">Timeline</span>
          <span className="text-[15px] text-gray-500">2025 – 2026</span>
        </div>
        <Link href="#" className="text-sm font-medium text-[#1565c0] hover:underline">
          View Details
        </Link>
      </div>

      {/* Timeline */}
      <div className="relative mt-16 mb-4 px-4">
        {/* Rotated labels above each dot */}
        {POINTS.map((point, i) => {
          const leftPct = i === 0 ? "0%" : i === 1 ? "50%" : "100%";
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: leftPct,
                bottom: "calc(100% + 8px)",
                transformOrigin: "bottom left",
              }}
            >
              <div
                className="text-[11px] text-gray-600 leading-tight whitespace-nowrap"
                style={{ transform: "rotate(-45deg)", transformOrigin: "bottom left" }}
              >
                <span className="font-semibold text-gray-800">{point.date}</span>
                <br />
                {point.label}
              </div>
            </div>
          );
        })}

        {/* Track */}
        <div className="relative h-4 flex items-center">
          {/* Gray background */}
          <div className="absolute inset-x-0 h-[6px] top-1/2 -translate-y-1/2 rounded-full bg-gray-200" />

          {/* Green completed segment (Aug → Jan = 50%) */}
          <div
            className="absolute h-[6px] top-1/2 -translate-y-1/2 rounded-full bg-[#22c55e]"
            style={{ left: 0, width: "50%" }}
          />

          {/* Dots */}
          {POINTS.map((point, i) => {
            const leftPct = i === 0 ? "0%" : i === 1 ? "50%" : "100%";
            const isCompleted = point.status === "completed";
            const isCurrent = point.status === "current";
            const size = isCurrent ? 20 : 14;
            return (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 rounded-full border-[3px] border-white"
                style={{
                  left: leftPct,
                  transform: `translateX(-50%) translateY(-50%)`,
                  width: size,
                  height: size,
                  backgroundColor: isCompleted
                    ? "#22c55e"
                    : isCurrent
                    ? "#0891b2"
                    : "#cbd5e1",
                  boxShadow: isCurrent ? "0 0 0 2px #0891b2" : "none",
                  zIndex: 1,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
