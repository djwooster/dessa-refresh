"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS = [
  {
    label: "RATINGS",
    items: [
      { label: "My Students",                href: "/reports/my-students" },
      { label: "My Students (v2)",           href: "/reports/my-students-v2" },
      { label: "My Students (v3)",           href: "/reports/my-students-v3" },
      { label: "Competencies",               href: "/reports/competencies" },
      { label: "Rating Window Overview",     href: "/reports/rating-window-overview" },
      { label: "Rating Window Breakdown",    href: "/reports/rating-window-breakdown" },
      { label: "Impact Report",              href: "/reports/impact-report" },
      { label: "Summary Comparison",         href: "/reports/summary-comparison" },
      { label: "Grade Level",                href: "/reports/grade-level" },
      { label: "Batch – Individual Rating",  href: "/reports/batch-individual" },
      { label: "Rating Export",              href: "/reports/rating-export" },
      { label: "SEIR Risk Report",           href: "/reports/seir-risk" },
    ],
  },
  {
    label: "COMPLETION REPORTS",
    items: [
      { label: "Rating Completion",   href: "/reports/rating-completion" },
      { label: "EdSERT Completion",   href: "/reports/edsert-completion" },
    ],
  },
  {
    label: "STUDENT PORTAL",
    items: [
      { label: "Student Goals", href: "/reports/student-goals" },
    ],
  },
];

export function ReportsNav() {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-start w-full px-2.5 py-[5px] rounded-md text-[12.5px] font-medium leading-snug transition-colors duration-100 ${
                      isActive
                        ? "bg-[#eef2f8] text-[#1a4e8a]"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
