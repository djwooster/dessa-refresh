"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

export default function ParentGuardianRatingPage() {
  const [studentSearch, setStudentSearch] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [date, setDate] = useState("");
  const [formType, setFormType] = useState("");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 mb-1">
          Parent/Guardian Rating
        </h1>
        <p className="text-[13.5px] text-gray-500">
          Please select a student to submit a Parent/Guardian rating.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6">
        {/* Student search */}
        <div className="mb-6">
          <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Student
          </label>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search for a student"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-[#d1d5db] bg-white text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0]"
            />
          </div>
        </div>

        <div className="border-t border-[#f0f4f8] pt-6">
          {/* Name + date row */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Rater First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] bg-white text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Rater Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] bg-white text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] bg-white text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0]"
              />
            </div>
          </div>

          {/* Form type */}
          <div className="mb-7">
            <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Form Type
            </label>
            <div className="relative w-72">
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full h-10 pl-3 pr-8 border border-[#d1d5db] rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0] appearance-none cursor-pointer text-gray-400"
              >
                <option value="">Select a form type</option>
                <option value="dessa2">DESSA 2</option>
                <option value="dessa-mini">DESSA mini</option>
                <option value="dessa-hse-mini">DESSA HSE-mini</option>
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button className="h-9 px-5 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors">
              Submit Rating
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
