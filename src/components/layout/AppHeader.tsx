"use client";

import { Search } from "lucide-react";

export function AppHeader() {
  return (
    <header className="bg-white border-b border-[#e8ecf0] h-14 flex items-center px-5 shrink-0">
      <div className="relative w-72">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="search"
          placeholder="Search students"
          className="w-full h-9 pl-9 pr-4 rounded-full border border-[#d1d5db] bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0]"
        />
      </div>
    </header>
  );
}
