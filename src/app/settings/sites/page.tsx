"use client";

import { useState } from "react";
import { Search, Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";

type Site = {
  id: number;
  name: string;
  studentAssessment: boolean;
  dessaSeir: boolean;
  secondStep: boolean;
};

const INITIAL_SITES: Site[] = [
  { id: 1,  name: "Branson Hills Middle School (SSMSE + SSMSE SSR)", studentAssessment: true,  dessaSeir: true,  secondStep: true  },
  { id: 2,  name: "Bridgewater Academy (SSE)",                        studentAssessment: true,  dessaSeir: true,  secondStep: true  },
  { id: 3,  name: "Brigham Elementary School (SSESE)",                studentAssessment: true,  dessaSeir: true,  secondStep: true  },
  { id: 4,  name: "Fallbridge Elementary",                            studentAssessment: true,  dessaSeir: true,  secondStep: false },
  { id: 5,  name: "Fallbridge Elementary (DESSA 2)",                  studentAssessment: true,  dessaSeir: true,  secondStep: false },
  { id: 6,  name: "Hillstrong High School",                           studentAssessment: true,  dessaSeir: true,  secondStep: false },
  { id: 7,  name: "Joyluck Middle School",                            studentAssessment: true,  dessaSeir: true,  secondStep: false },
  { id: 8,  name: "Joyluck Middle School (DESSA 2)",                  studentAssessment: true,  dessaSeir: true,  secondStep: false },
  { id: 9,  name: "Northwestern High School",                         studentAssessment: true,  dessaSeir: true,  secondStep: false },
  { id: 10, name: "Randle Middle School",                             studentAssessment: true,  dessaSeir: false, secondStep: false },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/30 ${
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

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>(INITIAL_SITES);
  const [search, setSearch] = useState("");

  const filtered = search
    ? sites.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      )
    : sites;

  function toggle(
    id: number,
    field: keyof Pick<Site, "studentAssessment" | "dessaSeir" | "secondStep">
  ) {
    setSites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: !s[field] } : s))
    );
  }

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-bold text-gray-900">Sites</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search sites"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 pr-4 w-52 rounded-full border border-[#d1d5db] bg-white text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0]"
            />
          </div>
          <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors">
            <Plus size={14} strokeWidth={2.25} />
            Add Site
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e8ecf0] bg-gray-50/70">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Site Name
              </th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[200px]">
                Student Completed<br />Assessment Activation
              </th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[180px]">
                DESSA SEIR<br />Assessment Site
              </th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[180px]">
                DESSA Second Step®<br />Assessment Site
              </th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((site, i) => (
              <tr
                key={site.id}
                className={`group transition-colors hover:bg-gray-50/70 ${
                  i < filtered.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <td className="px-5 py-3.5 text-[13.5px] font-medium text-gray-800">
                  {site.name}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <div className="flex justify-center">
                    <Toggle
                      checked={site.studentAssessment}
                      onChange={() => toggle(site.id, "studentAssessment")}
                    />
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <div className="flex justify-center">
                    <Toggle
                      checked={site.dessaSeir}
                      onChange={() => toggle(site.id, "dessaSeir")}
                    />
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <div className="flex justify-center">
                    {site.secondStep ? (
                      <CheckCircle2
                        size={18}
                        className="text-[#7dc49a]"
                        strokeWidth={1.75}
                      />
                    ) : (
                      <span className="inline-block w-[18px]" />
                    )}
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            No sites match &ldquo;{search}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
