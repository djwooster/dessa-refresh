"use client";

import { TODAY } from "./shared";

const YEAR_START = new Date("2025-08-01");
const YEAR_END   = new Date("2026-06-30");
const YEAR_MS    = YEAR_END.getTime() - YEAR_START.getTime();

const MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

interface Band {
  label: string;
  start: Date;
  color: string;
  textColor: string;
}

const BANDS: Band[] = [
  { label: "Pre",  start: new Date("2025-08-01"), color: "#dcf0e5", textColor: "#166534" },
  { label: "Mid",  start: new Date("2026-01-01"), color: "#dbeafe", textColor: "#1e40af" },
  { label: "Post", start: new Date("2026-05-28"), color: "#ede9fe", textColor: "#5b21b6" },
];

function pct(date: Date) {
  return Math.max(0, Math.min(100,
    ((date.getTime() - YEAR_START.getTime()) / YEAR_MS) * 100
  ));
}

export function ConceptC({ showYearLabel = true }: { showYearLabel?: boolean }) {
  const todayPct = pct(TODAY);

  return (
    <div className="flex flex-col gap-3">
      {showYearLabel && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            School Year 2025 – 2026
          </span>
          <span className="text-[11px] text-gray-400">Aug – Jun</span>
        </div>
      )}

      {/* Month ticks */}
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

      {/* Strip — 3 windows fill the full width equally */}
      <div className="relative h-9 rounded-lg overflow-visible flex">
        {BANDS.map((band) => (
          <div
            key={band.label}
            className="flex-1 flex items-center justify-center"
            style={{ backgroundColor: band.color }}
          >
            <span className="text-[10px] font-bold" style={{ color: band.textColor }}>
              {band.label}
            </span>
          </div>
        ))}

        {/* Today marker */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-[#e9000f] z-10"
          style={{ left: `${todayPct}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#e9000f]" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-1">
        {BANDS.map((band) => (
          <div key={band.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: band.color, border: "1px solid #e5e7eb" }} />
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-gray-600 leading-tight">{band.label}-Assessment</span>
              <span className="text-[10.5px] text-gray-400 leading-tight">
                opens {band.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
