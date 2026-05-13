"use client";

import { Menu, Search } from "lucide-react";
import { DessaLogo } from "./DessaLogo";

export function AppHeader() {
  return (
    <header className="bg-white border-b border-[#e2e8f0] h-14 flex items-center px-4 gap-4 sticky top-0 z-30">
      <button
        className="text-gray-500 hover:text-gray-700 p-1 rounded"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <DessaLogo />

      <div className="flex-1" />

      {/* Search */}
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
