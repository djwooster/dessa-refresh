"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SETTINGS_NAV = [
  { label: "Imports",                  href: "/settings/imports" },
  { label: "Sites",                    href: "/settings/sites" },
  { label: "Students",                 href: "/settings/students" },
  { label: "Staff",                    href: "/settings/staff" },
  { label: "Yearly Setup",             href: "/settings/yearly-setup" },
  { label: "Assignment Review",        href: "/settings/assignment-review" },
  { label: "Student Self-Report",      href: "/settings/student-self-report" },
  { label: "Rating Window Reminders",  href: "/settings/rating-window-reminders" },
  { label: "Parent/Guardian Rating",   href: "/settings/parent-guardian-rating" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5">
      {SETTINGS_NAV.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center w-full px-2.5 py-[6px] rounded-md text-[13.5px] font-medium transition-colors duration-100 ${
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
  );
}
