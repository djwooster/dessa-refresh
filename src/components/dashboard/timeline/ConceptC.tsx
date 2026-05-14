"use client";

import { TODAY } from "./shared";

// School year: Aug 2025 – Jun 2026
const YEAR_START = new Date("2025-08-01");
const YEAR_END   = new Date("2026-06-30");
const YEAR_MS    = YEAR_END.getTime() - YEAR_START.getTime();

const MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

interface Band {
  label: string;
  start: Date;
  end: Date;
  color: string;
  textColor: string;
  status: "completed" | "current" | "upcoming";
}

// Assessment windows — the gaps between them are instruction periods
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
    color: "#ede9fe",
    textColor: "#5b21b6",
    status: "upcoming",
  },
];

// Instruction periods — the gaps between assessment windows
const GAPS = [
  { start: new Date("2025-10-15"), end: new Date("2026-01-01") },
  { start: new Date("2026-03-15"), end: new Date("2026-05-28") },
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
      <div className="relative h-9 rounded-lg bg-[#f1f3f5] overflow-hidden">

        {/* Instruction period gaps — subtle striped fill */}
        {GAPS.map((gap, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 flex items-center justify-center"
            style={{
              left: `${pct(gap.start)}%`,
              width: `${pct(gap.end) - pct(gap.start)}%`,
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(0,0,0,0.03) 5px, rgba(0,0,0,0.03) 6px)",
            }}
          >
            <span className="text-[9px] font-medium text-gray-400 tracking-wide uppercase select-none">
              Instruction
            </span>
          </div>
        ))}

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

      {/* Month ticks — evenly spaced regardless of day count */}
      <div className="relative h-4">
        {MONTHS.map((m, i) => (
          <span
            key={m}
            className="absolute text-[10px] text-gray-400 -translate-x-1/2"
            style={{ left: `${(i / (MONTHS.length - 1)) * 100}%` }}
          >
            {m}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-1 flex-wrap">
        {BANDS.map((band) => (
          <div key={band.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: band.color, border: "1px solid #e5e7eb" }} />
            <span className="text-[11px] text-gray-500">
              {band.label}-Assessment
              <span className="text-gray-400 font-normal"> · opens {band.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </span>
          </div>
        ))}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#f1f3f5] border border-[#e5e7eb]" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 3px)" }} />
            <span className="text-[11px] text-gray-400">Instruction</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-[2px] h-3 bg-[#1a4e8a] rounded" />
            <span className="text-[11px] text-gray-500">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
