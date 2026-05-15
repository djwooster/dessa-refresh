"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, RefreshCw } from "lucide-react";
import { ReportSelector } from "../ReportSelector";

const SITES    = ["All", "Riverside Elementary", "Hillstrong High School", "Washington Middle School", "Lincoln Elementary", "Adams Elementary"];
const GRADES   = ["All", "K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const RATERS   = ["All", "Educator", "Student Self-Report"];
const RACES    = ["All", "White", "Black / African American", "Hispanic / Latino", "Asian", "Other"];
const ACADEMIC = ["All", "Gifted", "Students with IEPs", "English Learner", "Economically Disadvantaged"];
const GENDERS  = ["All", "Male", "Female", "Non-binary"];
const GROUPS   = ["Select a custom group", "SEL Intervention Group A", "Tier 2 Support"];
const WINDOWS  = ["25-26 Pre", "25-26 Mid", "24-25 Pre", "24-25 Mid", "24-25 End"];
const FORMS    = ["All", "DESSA", "DESSA 2", "DESSA-mini Form 1", "DESSA-SSESE"];

function FilterSelect({ label, value, onChange, options, clearable = false }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; clearable?: boolean;
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

export default function ImpactReportPage() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [site, setSite]       = useState("All");
  const [grade, setGrade]     = useState("All");
  const [rater, setRater]     = useState("All");
  const [race, setRace]       = useState("All");
  const [academic, setAcademic] = useState("All");
  const [gender, setGender]   = useState("All");
  const [group, setGroup]     = useState("Select a custom group");
  const [window1, setWindow1] = useState("25-26 Pre");
  const [window2, setWindow2] = useState("25-26 Mid");
  const [forms, setForms]     = useState("All");
  const [raterType, setRaterType] = useState("Educator");

  function handleReset() {
    setSite("All"); setGrade("All"); setRater("All"); setRace("All");
    setAcademic("All"); setGender("All"); setGroup("Select a custom group");
    setWindow1("25-26 Pre"); setWindow2("25-26 Mid"); setForms("All"); setRaterType("Educator");
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <ReportSelector currentHref="/reports3/impact-report" />
          <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <RefreshCw size={12} strokeWidth={2} />
            Data updated hourly
          </span>
        </div>
        <p className="text-[13px] text-gray-500 mt-1">
          This report only shows students with ratings in both rating windows.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">
        <button onClick={() => setFiltersOpen((o) => !o)}
          className="w-full flex items-center gap-1.5 px-5 py-3 text-[13.5px] font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          Filters
          <ChevronDown size={13} strokeWidth={2.5} className={`ml-auto text-[#1a4e8a] transition-transform duration-150 ${filtersOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.15, ease: "easeInOut" }} className="overflow-hidden">
              <div className="border-t border-[#e8ecf0] px-5 py-5 space-y-5">

                {/* Students */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Students</p>
                  <div className="grid grid-cols-3 gap-4">
                    <FilterSelect label="Sites"        value={site}     onChange={setSite}     options={SITES}    />
                    <FilterSelect label="Grades"       value={grade}    onChange={setGrade}    options={GRADES}   />
                    <FilterSelect label="Raters"       value={rater}    onChange={setRater}    options={RATERS}   />
                    <FilterSelect label="Race"         value={race}     onChange={setRace}     options={RACES}    />
                    <FilterSelect label="Academic"     value={academic} onChange={setAcademic} options={ACADEMIC} />
                    <FilterSelect label="Genders"      value={gender}   onChange={setGender}   options={GENDERS}  />
                    <FilterSelect label="Custom Group" value={group}    onChange={setGroup}    options={GROUPS}   />
                  </div>
                </div>

                {/* Ratings */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Ratings</p>
                  <div className="grid grid-cols-3 gap-4">
                    <FilterSelect label="Rating Window 1" value={window1}   onChange={setWindow1}   options={WINDOWS} clearable />
                    <FilterSelect label="Rating Window 2" value={window2}   onChange={setWindow2}   options={WINDOWS} clearable />
                    <FilterSelect label="Forms"           value={forms}     onChange={setForms}     options={FORMS}   />
                    <FilterSelect label="Rater Type"      value={raterType} onChange={setRaterType} options={["Educator", "Student Self-Report"]} clearable />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button className="h-9 px-5 rounded-lg bg-[#1a4e8a] text-white text-[12.5px] font-semibold hover:bg-[#15407a] transition-colors">Run Report</button>
                  <button onClick={handleReset} className="h-9 px-4 rounded-lg border border-[#e8ecf0] bg-white text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">Reset Filters</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
