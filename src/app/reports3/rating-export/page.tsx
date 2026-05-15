"use client";

import { useState } from "react";
import { ChevronDown, X, RefreshCw } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { ReportSelector } from "../ReportSelector";

const SITE_OPTIONS = [
  "Riverside Elementary", "Hillstrong High School", "Washington Middle School",
  "Lincoln Elementary", "Adams Elementary", "Branson Hills Middle School",
  "Winterfield Elementary", "Fallbridge Elementary", "Northwestern High School",
  "Rosehill Elementary", "Summertime Elementary", "Bridgewater Academy",
  "Randle Middle School", "Sunview Elementary", "JuJo/Lex Middle School",
];

const FORMS = ["DESSA", "DESSA 2", "DESSA-mini Form 1", "DESSA-mini Form 2", "DESSA-mini Form 3", "DESSA-SSESE", "DESSA-SSMSE", "DESSA-HSE"];

function DatePicker({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  const parsed   = value ? parseISO(value) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;
  return (
    <div>
      <p className="text-[11.5px] font-medium text-gray-600 mb-1.5">{label}</p>
      <Popover>
        <PopoverTrigger className="flex h-9 w-full items-center justify-between rounded-lg border border-[#e0e5eb] px-3 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/20 focus:border-[#1a4e8a] transition-colors">
          <span className={`text-[12.5px] ${selected ? "text-gray-800" : "text-gray-400"}`}>
            {selected ? format(selected, "MM / dd / yyyy") : placeholder}
          </span>
          <CalendarIcon size={13} className="text-gray-400 shrink-0" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="bottom">
          <Calendar mode="single" selected={selected} onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function RatingExportPage() {
  const [selectedSites, setSelectedSites] = useState<string[]>(["Branson Hills Middle School"]);
  const [sitePickerOpen, setSitePickerOpen] = useState(false);
  const [form, setForm]         = useState("DESSA");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");

  function removeSite(s: string) {
    setSelectedSites((prev) => prev.filter((x) => x !== s));
  }

  function toggleSite(s: string) {
    setSelectedSites((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  const unselectedSites = SITE_OPTIONS.filter((s) => !selectedSites.includes(s));

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center gap-3">
          <ReportSelector currentHref="/reports3/rating-export" />
          <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <RefreshCw size={12} strokeWidth={2} />
            Data updated hourly
          </span>
        </div>
        <p className="text-[13px] text-gray-500 mt-1">
          This report is a comprehensive spreadsheet export that includes all completed ratings.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">

          {/* Sites multi-tag */}
          <div>
            <p className="text-[11.5px] font-medium text-gray-600 mb-1.5">Site(s)</p>
            <div className="relative">
              <div
                onClick={() => setSitePickerOpen((o) => !o)}
                className="min-h-9 w-full px-2 py-1.5 rounded-lg border border-[#e0e5eb] bg-white cursor-pointer flex flex-wrap gap-1.5 items-center focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/20 focus:border-[#1a4e8a]"
              >
                {selectedSites.slice(0, 1).map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-md bg-[#eef2f8] text-[11.5px] font-medium text-[#1a4e8a] shrink-0 max-w-[120px]">
                    <span className="truncate">{s}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeSite(s); }} className="shrink-0 hover:text-[#0d3060]">
                      <X size={9} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
                {selectedSites.length > 1 && (
                  <span className="inline-flex items-center h-6 px-2 rounded-md bg-[#e0e5eb] text-[11.5px] font-semibold text-gray-600">
                    +{selectedSites.length - 1}
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setSitePickerOpen((o) => !o); }}
                  className="ml-auto shrink-0 w-6 h-6 rounded-md bg-[#1a4e8a] text-white flex items-center justify-center hover:bg-[#15407a]"
                >
                  <span className="text-[16px] leading-none font-light">+</span>
                </button>
              </div>

              {sitePickerOpen && (
                <div className="absolute left-0 top-full mt-1 w-full max-h-48 overflow-y-auto bg-white border border-[#e0e5eb] rounded-lg shadow-lg z-20">
                  {unselectedSites.map((s) => (
                    <button key={s} onClick={() => toggleSite(s)}
                      className="w-full text-left px-3 py-2 text-[12.5px] text-gray-700 hover:bg-gray-50 transition-colors">
                      {s}
                    </button>
                  ))}
                  {unselectedSites.length === 0 && (
                    <p className="px-3 py-2 text-[12px] text-gray-400">All sites selected</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Rating Form */}
          <div>
            <p className="text-[11.5px] font-medium text-gray-600 mb-1.5">Rating Form</p>
            <div className="relative">
              <select value={form} onChange={(e) => setForm(e.target.value)}
                className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#e0e5eb] text-[12.5px] text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/20 focus:border-[#1a4e8a]">
                {FORMS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <DatePicker label="Start Date" value={startDate} onChange={setStartDate} placeholder="mm / dd / yyyy" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <DatePicker label="End Date" value={endDate} onChange={setEndDate} placeholder="mm / dd / yyyy" />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button className="h-9 px-5 rounded-lg bg-[#1a4e8a] text-white text-[12.5px] font-semibold hover:bg-[#15407a] transition-colors">Export</button>
          <button className="h-9 px-4 rounded-lg border border-[#e8ecf0] bg-white text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}
