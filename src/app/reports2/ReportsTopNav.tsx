"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Ratings",
    items: [
      { label: "My Students",        href: "/reports2/my-students" },
      { label: "Competencies",       href: "/reports2/competencies" },
      { label: "Window Overview",    href: "/reports2/rating-window-overview" },
      { label: "Window Breakdown",   href: "/reports2/rating-window-breakdown" },
      { label: "Impact Report",      href: "/reports2/impact-report" },
      { label: "Summary Comparison", href: "/reports2/summary-comparison" },
      { label: "Grade Level",        href: "/reports2/grade-level" },
      { label: "Batch Rating",       href: "/reports2/batch-individual" },
      { label: "Rating Export",      href: "/reports2/rating-export" },
      { label: "SEIR Risk",          href: "/reports2/seir-risk" },
    ],
  },
  {
    label: "Completion",
    items: [
      { label: "Rating Completion",  href: "/reports2/rating-completion" },
      { label: "EdSERT Completion",  href: "/reports2/edsert-completion" },
    ],
  },
  {
    label: "Student Portal",
    items: [
      { label: "Student Goals",      href: "/reports2/student-goals" },
    ],
  },
];

export function ReportsTopNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-[#e8ecf0] px-6 overflow-x-auto">
      <div className="flex items-end gap-0 min-w-max">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className="flex items-end">
            {/* Group separator */}
            {gi > 0 && (
              <div className="self-stretch flex items-end pb-0 mx-1">
                <div className="w-px h-4 bg-[#e8ecf0] mb-[11px]" />
              </div>
            )}

            {/* Group label + tabs stacked */}
            <div className="flex flex-col">
              <span className="px-3 pt-3 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">
                {group.label}
              </span>
              <div className="flex items-end">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-3 py-2.5 text-[12.5px] font-medium whitespace-nowrap transition-colors duration-100 ${
                        isActive
                          ? "text-[#1a4e8a]"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#1a4e8a] rounded-t-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
