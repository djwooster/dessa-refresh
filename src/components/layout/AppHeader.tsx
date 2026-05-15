"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, HelpCircle, User, LogOut } from "lucide-react";

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full bg-[#1a4e8a] flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#1565c0]/40 cursor-pointer"
        aria-label="User menu"
      >
        <span className="text-white text-[11px] font-semibold leading-none">TW</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-[#e8ecf0] rounded-lg shadow-lg py-1 z-50">
          <div className="px-3 py-2 border-b border-[#e8ecf0]">
            <p className="text-[13px] font-semibold text-gray-800 truncate">Tara Westbrook</p>
            <p className="text-[11px] text-gray-400 truncate">Admin</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <User size={13} strokeWidth={1.75} className="text-gray-400" />
            Profile
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut size={13} strokeWidth={1.75} className="text-gray-400" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function AppHeader() {
  return (
    <header className="bg-white border-b border-[#e8ecf0] h-14 flex items-center px-5 shrink-0">
      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative w-64">
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

        {/* Help */}
        <Link
          href="/help"
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Help & Support"
        >
          <HelpCircle size={18} strokeWidth={1.75} />
        </Link>

        {/* User avatar + dropdown */}
        <UserMenu />
      </div>
    </header>
  );
}
