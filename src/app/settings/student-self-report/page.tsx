"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Download } from "lucide-react";

type AccountStatus = "Registered" | "Unregistered";

type SelfReportStudent = {
  id: string;
  lastName: string;
  firstName: string;
  username: string;
  ssrPoints: number;
  raters: string;
  lastLogin: string;
  accountStatus: AccountStatus;
  grade: string;
  seirOptOut: boolean;
};

const INITIAL_STUDENTS: SelfReportStudent[] = [
  { id: "307084438", lastName: "Abberley", firstName: "Quintin", username: "QAbbe22",  ssrPoints: 0, raters: "Heall Townrow, +1 More", lastLogin: "",           accountStatus: "Registered",   grade: "6th Grade", seirOptOut: false },
  { id: "230242322", lastName: "A'Barrow", firstName: "Leyla",   username: "LABar22",  ssrPoints: 0, raters: "Davis, Kim",             lastLogin: "",           accountStatus: "Unregistered", grade: "5th Grade", seirOptOut: false },
  { id: "307362755", lastName: "Aaron",    firstName: "Ricky",   username: "RAar22",   ssrPoints: 0, raters: "Smith, John",            lastLogin: "2025-09-15", accountStatus: "Registered",   grade: "3rd Grade", seirOptOut: true  },
  { id: "844430864", lastName: "Abbet",    firstName: "Stanly",  username: "SAbb22",   ssrPoints: 5, raters: "Absolem, Mildred",       lastLogin: "2025-10-02", accountStatus: "Registered",   grade: "6th Grade", seirOptOut: false },
  { id: "3464254",   lastName: "Abbott",   firstName: "Malayah", username: "MAbb22",   ssrPoints: 0, raters: "Jones, Mary",            lastLogin: "",           accountStatus: "Unregistered", grade: "7th Grade", seirOptOut: false },
  { id: "13459644",  lastName: "Abbott",   firstName: "Rylan",   username: "RAbb22b",  ssrPoints: 0, raters: "Clark, Tim",             lastLogin: "",           accountStatus: "Unregistered", grade: "2nd Grade", seirOptOut: false },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/30 cursor-pointer ${
        checked ? "bg-[#1a4e8a]" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[19px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 pl-3 pr-8 border border-[#d1d5db] rounded-lg text-[13px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0] appearance-none cursor-pointer"
        >
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

export default function StudentSelfReportPage() {
  const [students,         setStudents]         = useState(INITIAL_STUDENTS);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [search,           setSearch]           = useState("");
  const [sites,            setSites]            = useState("All");
  const [raters,           setRaters]           = useState("All");
  const [gradeLevel,       setGradeLevel]       = useState("All");
  const [statusFilter,     setStatusFilter]     = useState("All");
  const [seirOptOut,       setSeirOptOut]       = useState("All");
  const [customGroup,      setCustomGroup]      = useState("");
  const [classFilter,      setClassFilter]      = useState("");

  const unregisteredCount = students.filter((s) => s.accountStatus === "Unregistered").length;

  function toggleSeirOptOut(id: string) {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, seirOptOut: !s.seirOptOut } : s))
    );
  }

  function resetFilters() {
    setSites("All"); setRaters("All"); setGradeLevel("All");
    setStatusFilter("All"); setSeirOptOut("All"); setCustomGroup(""); setClassFilter("");
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Student Self-Report</h1>
          <p className="text-[13.5px] text-gray-500 max-w-[600px]">
            Capture student voice by allowing students in Grades 6–12 to assess their own social and emotional competencies.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-6 mt-1">
          <a href="#" className="text-[13px] font-medium text-[#1565c0] hover:underline">SEIR Administration</a>
          <span className="text-gray-200">|</span>
          <a href="#" className="text-[13px] font-medium text-[#1565c0] hover:underline">Reset Passwords</a>
        </div>
      </div>

      {/* Registration Instructions */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm mt-4 mb-4 overflow-hidden">
        <button
          onClick={() => setInstructionsOpen((o) => !o)}
          className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-gray-50/50 transition-colors"
        >
          <span className="text-[13.5px] font-semibold text-gray-800">Registration Instructions</span>
          {instructionsOpen
            ? <ChevronUp  size={15} className="text-gray-400 shrink-0" strokeWidth={1.75} />
            : <ChevronDown size={15} className="text-gray-400 shrink-0" strokeWidth={1.75} />}
        </button>
        {instructionsOpen && (
          <div className="px-5 pb-4 border-t border-[#f0f4f8]">
            <p className="text-[13.5px] text-gray-600 mt-3 leading-relaxed">
              Students in grades 6–12 can log in to complete their own self-report assessments.
              Share the registration link and student credentials to get started. Students will need
              a username and a temporary password to register their account.
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-5 mb-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <FilterSelect label="Sites"       value={sites}       onChange={setSites}       options={["All", "Branson Hills Middle School", "Fallbridge Elementary", "Joyluck Middle School"]} />
          <FilterSelect label="Raters"      value={raters}      onChange={setRaters}      options={["All", "Absolem, Mildred", "Heall Townrow", "Davis, Kim", "Smith, John"]} />
          <FilterSelect label="Grade Level" value={gradeLevel}  onChange={setGradeLevel}  options={["All", "2nd Grade", "3rd Grade", "5th Grade", "6th Grade", "7th Grade"]} />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <FilterSelect label="Status"       value={statusFilter} onChange={setStatusFilter} options={["All", "Registered", "Unregistered"]} />
          <FilterSelect label="SEIR Opt Out" value={seirOptOut}   onChange={setSeirOptOut}   options={["All", "Opted Out", "Not Opted Out"]} />
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Custom Group</label>
            <div className="relative">
              <select
                value={customGroup}
                onChange={(e) => setCustomGroup(e.target.value)}
                className="w-full h-9 pl-3 pr-8 border border-[#d1d5db] rounded-lg text-[13px] bg-white focus:outline-none appearance-none cursor-pointer text-gray-400"
              >
                <option value="">Select a custom group</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="flex items-end gap-4">
          <div className="w-64">
            <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Class Filter Type</label>
            <div className="relative">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full h-9 pl-3 pr-8 border border-[#d1d5db] rounded-lg text-[13px] bg-white focus:outline-none appearance-none cursor-pointer text-gray-400"
              >
                <option value="">Select a Class Filter</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <button
            onClick={resetFilters}
            className="h-9 px-3 text-[13px] text-gray-500 hover:text-gray-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search by student name, ID, or Username"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 pr-4 w-96 rounded-full border border-[#d1d5db] bg-white text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0]"
        />
      </div>

      {/* Count + exports */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <p className="text-[13.5px] text-gray-700">
            <span className="font-semibold">{unregisteredCount} of {students.length} students</span> are unregistered.
          </p>
          <a href="#" className="text-[13px] text-[#1565c0] hover:underline">View Registration Details</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="flex items-center gap-1.5 text-[13px] text-[#1565c0] hover:underline">
            <Download size={13} strokeWidth={1.75} />
            Export CSV
          </a>
          <a href="#" className="flex items-center gap-1.5 text-[13px] text-[#1565c0] hover:underline">
            <Download size={13} strokeWidth={1.75} />
            Export Zip
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="border-b border-[#e8ecf0] bg-gray-50/70">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">SSR Points</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Raters</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Account Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">SEIR Opt Out</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr
                  key={s.id}
                  className={`hover:bg-gray-50/60 transition-colors ${i < students.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <td className="px-4 py-3.5">
                    <a href="#" className="text-[13px] font-medium text-[#1565c0] hover:underline font-mono">
                      {s.id}
                    </a>
                  </td>
                  <td className="px-4 py-3.5 text-[13.5px] text-gray-700">{s.lastName}</td>
                  <td className="px-4 py-3.5 text-[13.5px] text-gray-700">{s.firstName}</td>
                  <td className="px-4 py-3.5 text-[13px] text-gray-500 font-mono">{s.username}</td>
                  <td className="px-4 py-3.5 text-[13.5px] text-gray-700 text-center">{s.ssrPoints}</td>
                  <td className="px-4 py-3.5 text-[13px] text-gray-600">{s.raters}</td>
                  <td className="px-4 py-3.5 text-[13px] text-gray-500">{s.lastLogin || "—"}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        s.accountStatus === "Registered"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}
                    >
                      {s.accountStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13.5px] text-gray-700">{s.grade}</td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex justify-center">
                      <Toggle checked={s.seirOptOut} onChange={() => toggleSeirOptOut(s.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
