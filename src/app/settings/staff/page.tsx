"use client";

import { useState } from "react";
import { Search, Plus, Pencil, Trash2, ChevronDown, Users, UserCog } from "lucide-react";

type StaffStatus = "active" | "resend" | "invite";

type StaffMember = {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  role: string;
  sites: string;
  status: StaffStatus;
};

const STAFF: StaffMember[] = [
  { id: 1, lastName: "Absolem",  firstName: "Mildred", email: "qa+mildredabsolem@apertureed.com",  role: "Educator", sites: "Branson Hills Middle School (SSMSE + SSMSE SSR)", status: "active" },
  { id: 2, lastName: "Adamss",   firstName: "Stella",  email: "stellaadams@demo3040be69.k12.us",   role: "Educator", sites: "Fallbridge Elementary, +4 More...",              status: "resend" },
  { id: 3, lastName: "Advani",   firstName: "Frannie", email: "qa+frannieadvani@apertureed.com",   role: "Educator", sites: "Fallbridge Elementary (DESSA 2)",                status: "active" },
  { id: 4, lastName: "Affron",   firstName: "Darsey",  email: "qa+darseyaffron@apertureed.com",    role: "Educator", sites: "Winterfield Elementary (DESSA 2)",               status: "resend" },
  { id: 5, lastName: "Aguilar",  firstName: "Josie",   email: "josieaguilar@demo3040be69.k12.us",  role: "Educator", sites: "Joyluck Middle School, +1 More...",              status: "invite" },
  { id: 6, lastName: "Aidler",   firstName: "Chadd",   email: "qa+chaddaidler@apertureed.com",     role: "Educator", sites: "Brigham Elementary School (SSESE)",              status: "resend" },
];

const ROLE_OPTIONS   = ["All", "Educator", "Site Leader", "Admin", "Training Only"];
const SITE_OPTIONS   = ["All", "Branson Hills Middle School", "Brigham Elementary School", "Fallbridge Elementary", "Joyluck Middle School", "Winterfield Elementary"];
const STATUS_OPTIONS = ["All", "Active", "Pending Invite"];

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

function StatusCell({ status }: { status: StaffStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-100">
        Active
      </span>
    );
  }
  return (
    <button className="text-[13px] font-medium text-[#1565c0] hover:underline">
      {status === "resend" ? "Resend Invite" : "Invite"}
    </button>
  );
}

export default function StaffPage() {
  const [search, setSearch]   = useState("");
  const [role, setRole]       = useState("All");
  const [site, setSite]       = useState("All");
  const [status, setStatus]   = useState("All");

  const filtered = STAFF.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch  = !search || s.lastName.toLowerCase().includes(q) || s.firstName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchRole    = role   === "All" || s.role === role;
    const matchSite    = site   === "All" || s.sites.toLowerCase().includes(site.split(" ").slice(0, 2).join(" ").toLowerCase());
    const matchStatus  = status === "All" || (status === "Active" && s.status === "active") || (status === "Pending Invite" && s.status !== "active");
    return matchSearch && matchRole && matchSite && matchStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-bold text-gray-900">Staff</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search staff"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 pr-4 w-48 rounded-full border border-[#d1d5db] bg-white text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0]"
            />
          </div>
          <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[#d1d5db] text-gray-700 text-[13px] font-medium hover:bg-gray-50 transition-colors">
            <Users size={14} strokeWidth={1.75} />
            Batch Invite
          </button>
          <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors">
            <Plus size={14} strokeWidth={2.25} />
            Add Staff
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-4 mb-4">
        <div className="flex items-end gap-4">
          <div className="w-40">
            <FilterSelect label="Role"   value={role}   onChange={setRole}   options={ROLE_OPTIONS}   />
          </div>
          <div className="w-60">
            <FilterSelect label="Site"   value={site}   onChange={setSite}   options={SITE_OPTIONS}   />
          </div>
          <div className="w-44">
            <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
          </div>
          <button
            onClick={() => { setRole("All"); setSite("All"); setStatus("All"); }}
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
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sites</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr
                key={s.id}
                className={`hover:bg-gray-50/60 transition-colors ${i < filtered.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <td className="px-5 py-3.5 text-[13.5px] font-medium text-gray-800">{s.lastName}</td>
                <td className="px-4 py-3.5 text-[13.5px] text-gray-700">{s.firstName}</td>
                <td className="px-4 py-3.5 text-[12.5px] text-gray-500">{s.email}</td>
                <td className="px-4 py-3.5 text-[13.5px] text-gray-700">{s.role}</td>
                <td className="px-4 py-3.5 text-[13px] text-gray-600 max-w-[180px]">{s.sites}</td>
                <td className="px-4 py-3.5"><StatusCell status={s.status} /></td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-[#1565c0] hover:bg-blue-50 transition-colors cursor-pointer" title="Impersonate">
                      <UserCog size={13} strokeWidth={1.75} />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-[#1565c0] hover:bg-blue-50 transition-colors cursor-pointer">
                      <Pencil size={13} strokeWidth={1.75} />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
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
            No staff members match your filters
          </div>
        )}
      </div>
    </div>
  );
}
