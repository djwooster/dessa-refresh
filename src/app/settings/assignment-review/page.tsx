"use client";

import { useState } from "react";
import { Search, ChevronDown, MoreHorizontal, UserPlus, Pencil, X, Plus } from "lucide-react";

type Assignment = {
  id: number;
  site: string;
  raterName: string;
  studentName: string;
  grade: string;
  manuallyAssigned: boolean;
};

const ASSIGNMENTS: Assignment[] = [
  { id: 1, site: "Branson Hills Middle School (SSMSE + SSMSE SSR)", raterName: "Absolem, Mildred", studentName: "Ashfold, Grenville",  grade: "7th Grade", manuallyAssigned: false },
  { id: 2, site: "Branson Hills Middle School (SSMSE + SSMSE SSR)", raterName: "Absolem, Mildred", studentName: "Bazely, Terza",       grade: "6th Grade", manuallyAssigned: true  },
  { id: 3, site: "Branson Hills Middle School (SSMSE + SSMSE SSR)", raterName: "Absolem, Mildred", studentName: "Bowdler, Any",        grade: "7th Grade", manuallyAssigned: true  },
  { id: 4, site: "Branson Hills Middle School (SSMSE + SSMSE SSR)", raterName: "Absolem, Mildred", studentName: "Brussell, Winnie",    grade: "6th Grade", manuallyAssigned: false },
  { id: 5, site: "Branson Hills Middle School (SSMSE + SSMSE SSR)", raterName: "Absolem, Mildred", studentName: "Bundock, Sanderson",  grade: "6th Grade", manuallyAssigned: true  },
  { id: 6, site: "Branson Hills Middle School (SSMSE + SSMSE SSR)", raterName: "Absolem, Mildred", studentName: "Chester, Paulie",     grade: "8th Grade", manuallyAssigned: false },
];

const GRADE_OPTIONS = ["All", "6th Grade", "7th Grade", "8th Grade"];

export default function AssignmentReviewPage() {
  const [nameSearch,      setNameSearch]      = useState("");
  const [raterType,       setRaterType]       = useState("Rater");
  const [grades,          setGrades]          = useState("All");
  const [showUnassigned,  setShowUnassigned]  = useState(false);
  const [siteChips,       setSiteChips]       = useState(["Branson Hills ..."]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-bold text-gray-900">Assignment Review</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
            Data updated hourly
          </span>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
          <MoreHorizontal size={16} strokeWidth={1.75} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-5 mb-4">
        <div className="flex items-end gap-3 mb-4">
          {/* Name/email + type toggle */}
          <div className="w-[280px]">
            <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Search
            </label>
            <div className="flex rounded-lg border border-[#d1d5db] overflow-hidden">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Name or email"
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 text-[13px] text-gray-700 bg-white focus:outline-none"
                />
              </div>
              <div className="relative border-l border-[#d1d5db]">
                <select
                  value={raterType}
                  onChange={(e) => setRaterType(e.target.value)}
                  className="h-9 pl-3 pr-7 text-[13px] text-gray-700 bg-white focus:outline-none appearance-none cursor-pointer"
                >
                  <option>Rater</option>
                  <option>Student</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Sites chips */}
          <div className="w-[280px]">
            <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Sites
            </label>
            <div className="flex items-center gap-1.5 min-h-9 px-2 py-1 border border-[#d1d5db] rounded-lg bg-white flex-wrap">
              {siteChips.map((chip) => (
                <span
                  key={chip}
                  className="flex items-center gap-1 pl-2 pr-1 py-0.5 bg-[#eef2f8] text-[#1a4e8a] text-[12px] font-medium rounded-md"
                >
                  {chip}
                  <button
                    onClick={() => setSiteChips((c) => c.filter((s) => s !== chip))}
                    className="w-4 h-4 flex items-center justify-center text-[#1a4e8a]/50 hover:text-[#1a4e8a]"
                  >
                    <X size={10} strokeWidth={2.5} />
                  </button>
                </span>
              ))}
              <button
                onClick={() => setSiteChips((c) => [...c, "Site..."])}
                className="w-5 h-5 flex items-center justify-center rounded border border-[#1a4e8a] text-[#1a4e8a] hover:bg-[#eef2f8] transition-colors ml-auto shrink-0"
              >
                <Plus size={11} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Grades */}
          <div className="w-44">
            <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Grades
            </label>
            <div className="relative">
              <select
                value={grades}
                onChange={(e) => setGrades(e.target.value)}
                className="w-full h-9 pl-3 pr-8 border border-[#d1d5db] rounded-lg text-[13px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 appearance-none cursor-pointer"
              >
                {GRADE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-9 px-5 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors">
            Apply
          </button>
          <button className="h-9 px-3 text-[13px] text-gray-500 hover:text-gray-700 transition-colors">
            Reset Filters
          </button>
        </div>
      </div>

      {/* Show Unassigned toggle */}
      <label className="flex items-center gap-2.5 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={showUnassigned}
          onChange={(e) => setShowUnassigned(e.target.checked)}
          className="w-4 h-4 rounded border-[#d1d5db] accent-[#1a4e8a] cursor-pointer"
        />
        <span className="text-[13.5px] font-medium text-gray-700">
          Show Only Unassigned Students
        </span>
      </label>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e8ecf0] bg-gray-50/70">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Site</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Rater Name</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Manual Changes</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Edit Assignment</th>
            </tr>
          </thead>
          <tbody>
            {ASSIGNMENTS.map((a, i) => (
              <tr
                key={a.id}
                className={`hover:bg-gray-50/60 transition-colors ${i < ASSIGNMENTS.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <td className="px-5 py-3.5 text-[13px] text-gray-600 max-w-[200px]">{a.site}</td>
                <td className="px-4 py-3.5 text-[13.5px] text-gray-700">{a.raterName}</td>
                <td className="px-4 py-3.5">
                  <a href="#" className="text-[13.5px] font-medium text-[#1565c0] hover:underline">
                    {a.studentName}
                  </a>
                </td>
                <td className="px-4 py-3.5 text-[13.5px] text-gray-700">{a.grade}</td>
                <td className="px-4 py-3.5">
                  {a.manuallyAssigned && (
                    <div className="flex items-center gap-1.5">
                      <UserPlus size={13} className="text-gray-400 shrink-0" strokeWidth={1.75} />
                      <span className="text-[12.5px] text-gray-500">Manually Assigned</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-[#1565c0] hover:bg-blue-50 transition-colors cursor-pointer">
                    <Pencil size={13} strokeWidth={1.75} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
