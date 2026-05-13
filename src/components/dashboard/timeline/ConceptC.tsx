"use client";

import { TODAY } from "./shared";

// School year: Aug 2025 – Jun 2026
const YEAR_START = new Date("2025-08-01");
const YEAR_END   = new Date("2026-06-30");
const YEAR_MS    = YEAR_END.getTime() - YEAR_START.getTime();

const MONTHS = [
  "Aug", "Sep", "Oct", "Nov", "Dec",
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
];

interface Band {
  label: string;
  start: Date;
  end: Date;
  color: string;
  textColor: string;
  status: "completed" | "current" | "upcoming";
}

const BANDS: Band[] = [
  {
    label: "Pre",
    start: new Date("2025-08-01"),
    end:   new Date("2025-10-15"),
    color: "#dcf0e5",
    textColor: "#166534",
    status: "completed",
  },
  {
    label: "Mid",
    start: new Date("2026-01-01"),
    end:   new Date("2026-03-15"),
    color: "#dbeafe",
    textColor: "#1e40af",
    status: "current",
  },
  {
    label: "Post",
    start: new Date("2026-05-28"),
    end:   new Date("2026-06-30"),
    color: "#f3f4f6",
    textColor: "#6b7280",
    status: "upcoming",
  },
];

function pct(date: Date) {
  return Math.max(0, Math.min(100,
    ((date.getTime() - YEAR_START.getTime()) / YEAR_MS) * 100
  ));
}

export function ConceptC() {
  const todayPct = pct(TODAY);

  return (
    <div className="flex flex-col gap-3">
      {/* Year label */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          School Year 2025 – 2026
        </span>
        <span className="text-[11px] text-gray-400">Aug – Jun</span>
      </div>

      {/* Strip */}
      <div className="relative h-9 rounded-lg bg-gray-100 overflow-hidden">
        {/* Assessment window bands */}
        {BANDS.map((band) => (
          <div
            key={band.label}
            className="absolute top-0 bottom-0 flex items-center justify-center"
            style={{
              left: `${pct(band.start)}%`,
              width: `${pct(band.end) - pct(band.start)}%`,
              backgroundColor: band.color,
            }}
          >
            <span className="text-[10px] font-bold" style={{ color: band.textColor }}>
              {band.label}
            </span>
          </div>
        ))}

        {/* Today marker */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-[#1a4e8a] z-10"
          style={{ left: `${todayPct}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#1a4e8a]" />
        </div>
      </div>

      {/* Month ticks */}
      <div className="relative h-4">
        {MONTHS.map((m, i) => {
          const monthStart = new Date(i < 5 ? `2025-${8 + i}-01` : `2026-${i - 4}-01`);
          const left = pct(monthStart);
          return (
            <span
              key={m}
              className="absolute text-[10px] text-gray-400 -translate-x-1/2"
              style={{ left: `${left}%` }}
            >
              {m}
            </span>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-1">
        {BANDS.map((band) => (
          <div key={band.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: band.color, border: "1px solid #e5e7eb" }} />
            <span className="text-[11px] text-gray-500">{band.label}-Assessment</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-[2px] h-3 bg-[#1a4e8a] rounded" />
          <span className="text-[11px] text-gray-500">Today</span>
        </div>
      </div>
    </div>
  );
}
