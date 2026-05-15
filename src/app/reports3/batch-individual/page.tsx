"use client";

import { useState } from "react";
import { ChevronDown, X, RefreshCw } from "lucide-react";
import { ReportSelector } from "../ReportSelector";

const SITES      = ["All", "Riverside Elementary", "Hillstrong High School", "Washington Middle School", "Lincoln Elementary", "Adams Elementary"];
const GRADES     = ["All", "K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const DESC_RANGES = ["All", "Need for Instruction", "Typical", "Strength"];
const RATER_TYPES = ["Educator", "Student Self-Report"];
const RATERS     = ["Select an option", "Rater A", "Rater B", "Rater C"];
const WINDOWS    = ["25-26 Mid", "25-26 Pre", "24-25 End", "24-25 Mid"];
const FORMS      = ["All", "DESSA", "DESSA 2", "DESSA-mini Form 1", "DESSA-SSESE"];

function FilterSelect({ label, value, onChange, options, clearable = false }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; clearable?: boolean;
}) {
  return (
    <div>
      <p className="text-[11.5px] font-medium text-gray-600 mb-1.5">{label}</p>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#e0e5eb] text-[12.5px] text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/20 focus:border-[#1a4e8a]">
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {clearable && value !== options[0] ? (
          <button onClick={() => onChange(options[0])} className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
            <X size={9} strokeWidth={2.5} />
          </button>
        ) : (
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        )}
      </div>
    </div>
  );
}

export default function BatchIndividualPage() {
  const [site, setSite]           = useState("All");
  const [grade, setGrade]         = useState("All");
  const [descRange, setDescRange] = useState("All");
  const [raterType, setRaterType] = useState("Educator");
  const [rater, setRater]         = useState("Select an option");
  const [window, setWindow]       = useState("25-26 Mid");
  const [forms, setForms]         = useState("All");
  const [includeItems, setIncludeItems] = useState(false);

  function handleReset() {
    setSite("All"); setGrade("All"); setDescRange("All");
    setRaterType("Educator"); setRater("Select an option");
    setWindow("25-26 Mid"); setForms("All"); setIncludeItems(false);
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center gap-3">
          <ReportSelector currentHref="/reports3/batch-individual" />
          <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <RefreshCw size={12} strokeWidth={2} />
            Data updated hourly
          </span>
        </div>
        <p className="text-[13px] text-gray-500 mt-1">
          This report allows a user to generate a combined PDF of all Individual Rating Reports for a given rater.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <FilterSelect label="Sites"             value={site}      onChange={setSite}      options={SITES}       />
          <FilterSelect label="Grades"            value={grade}     onChange={setGrade}     options={GRADES}      />
          <FilterSelect label="Descriptive Ranges" value={descRange} onChange={setDescRange} options={DESC_RANGES} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FilterSelect label="Rater Type" value={raterType} onChange={setRaterType} options={RATER_TYPES} clearable />
          <FilterSelect label="Rater"      value={rater}     onChange={setRater}     options={RATERS}      />
          <div />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FilterSelect label="Rating Window" value={window} onChange={setWindow} options={WINDOWS} clearable />
          <FilterSelect label="Forms"         value={forms}  onChange={setForms}  options={FORMS}   />
          <div />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            checked={includeItems}
            onChange={(e) => setIncludeItems(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#1a4e8a] focus:ring-[#1a4e8a] cursor-pointer"
          />
          <span className="text-[13px] text-gray-700">Include individual item analysis</span>
        </label>

        <div className="flex items-center gap-2 pt-1">
          <button className="h-9 px-5 rounded-lg bg-[#1a4e8a] text-white text-[12.5px] font-semibold hover:bg-[#15407a] transition-colors">Generate Report</button>
          <button className="h-9 px-4 rounded-lg border border-[#e8ecf0] bg-white text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleReset} className="h-9 px-4 rounded-lg border border-[#e8ecf0] bg-white text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">Reset Filters</button>
        </div>
      </div>
    </div>
  );
}
