"use client";

import { useState } from "react";
import { Search, Plus, Pencil, Trash2, ChevronDown } from "lucide-react";

type Student = {
  id: number;
  lastName: string;
  firstName: string;
  studentId: string;
  grade: string;
  site: string;
};

const STUDENTS: Student[] = [
  { id: 1, lastName: "Aaron",    firstName: "Ricky",   studentId: "307362755", grade: "3rd Grade",  site: "Brigham Elementary School (SSESE)" },
  { id: 2, lastName: "A'Barrow", firstName: "Leyla",   studentId: "230242322", grade: "5th Grade",  site: "Fallbridge Elementary (DESSA 2)" },
  { id: 3, lastName: "Abberley", firstName: "Quintin", studentId: "307084438", grade: "6th Grade",  site: "Joyluck Middle School (DESSA 2)" },
  { id: 4, lastName: "Abbet",    firstName: "Stanly",  studentId: "844430864", grade: "6th Grade",  site: "Branson Hills Middle School (SSMSE + SSMSE SSR)" },
  { id: 5, lastName: "Abbott",   firstName: "Malayah", studentId: "3464254",   grade: "7th Grade",  site: "Randle Middle School" },
  { id: 6, lastName: "Abbott",   firstName: "Rylan",   studentId: "13459644",  grade: "2nd Grade",  site: "Bridgewater Academy (SSE)" },
  { id: 7, lastName: "Abbott",   firstName: "Legacy",  studentId: "3462921",   grade: "6th Grade",  site: "Joyluck Middle School" },
  { id: 8, lastName: "Abbott",   firstName: "David",   studentId: "3463871",   grade: "2nd Grade",  site: "Summertime Elementary" },
  { id: 9, lastName: "Abbott",   firstName: "Dominic", studentId: "3464072",   grade: "10th Grade", site: "Hillstrong High School" },
];

const SITE_OPTIONS  = ["All", "Branson Hills Middle School", "Brigham Elementary School", "Bridgewater Academy", "Fallbridge Elementary", "Hillstrong High School", "Joyluck Middle School", "Randle Middle School", "Summertime Elementary"];
const GRADE_OPTIONS = ["All", "2nd Grade", "3rd Grade", "5th Grade", "6th Grade", "7th Grade", "10th Grade"];

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

export default function StudentsPage() {
  const [search, setSearch]   = useState("");
  const [site, setSite]       = useState("All");
  const [grade, setGrade]     = useState("All");

  const filtered = STUDENTS.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.lastName.toLowerCase().includes(q) || s.firstName.toLowerCase().includes(q) || s.studentId.includes(q);
    const matchSite   = site  === "All" || s.site.toLowerCase().includes(site.toLowerCase().split(" ").slice(0, 2).join(" ").toLowerCase());
    const matchGrade  = grade === "All" || s.grade === grade;
    return matchSearch && matchSite && matchGrade;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-bold text-gray-900">Students</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search students"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 pr-4 w-52 rounded-full border border-[#d1d5db] bg-white text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0]"
            />
          </div>
          <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors">
            <Plus size={14} strokeWidth={2.25} />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-4 mb-4">
        <div className="flex items-end gap-4">
          <div className="w-64">
            <FilterSelect label="Site" value={site} onChange={setSite} options={SITE_OPTIONS} />
          </div>
          <div className="w-44">
            <FilterSelect label="Grade Level" value={grade} onChange={setGrade} options={GRADE_OPTIONS} />
          </div>
          <button
            onClick={() => { setSite("All"); setGrade("All"); }}
            className="h-9 px-3 text-[13px] text-gray-500 hover:text-gray-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e8ecf0] bg-gray-50/70">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Last Name</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">First Name</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Student ID</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Grade Level</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Site(s)</th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr
                key={s.id}
                className={`hover:bg-gray-50/60 transition-colors ${i < filtered.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <td className="px-5 py-3.5">
                  <a href="#" className="text-[13.5px] font-medium text-[#1565c0] hover:underline">{s.lastName}</a>
                </td>
                <td className="px-4 py-3.5 text-[13.5px] text-gray-700">{s.firstName}</td>
                <td className="px-4 py-3.5 text-[13px] text-gray-500 font-mono">{s.studentId}</td>
                <td className="px-4 py-3.5 text-[13.5px] text-gray-700">{s.grade}</td>
                <td className="px-4 py-3.5 text-[13px] text-gray-600">{s.site}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-[#1565c0] hover:bg-blue-50 transition-colors">
                      <Pencil size={13} strokeWidth={1.75} />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13.5px] text-gray-400">
            No students match your filters
          </div>
        )}
      </div>
    </div>
  );
}
