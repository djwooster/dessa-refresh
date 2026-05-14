"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  LayoutGrid,
  BarChart2,
  GitFork,
  GraduationCap,
  HelpCircle,
  Flag,
  UserCog,
  ChevronDown,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { DessaLogo } from "./DessaLogo";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
}

// ─── Nav definition ───────────────────────────────────────────────────────────

const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard",        href: "/",                    icon: LayoutDashboard },
  { label: "Ratings",          href: "/ratings",             icon: LayoutGrid },
  { label: "Reports",          href: "/reports",             icon: BarChart2 },
  { label: "Strategies",       href: "/strategies",          icon: GitFork },
  {
    label: "Training",
    href: "/training",
    icon: GraduationCap,
    children: [
      { label: "Implementation Training", href: "/training/implementation", icon: GraduationCap },
      { label: "EdSERT Manager",          href: "/training/edsert-manager", icon: GraduationCap },
      { label: "EdSERT",                  href: "/training/edsert",         icon: GraduationCap },
    ],
  },
];

const UTILITY_NAV: NavItem[] = [
  { label: "Help & Support",      href: "/help",    icon: HelpCircle },
  { label: "Feature Flag Override", href: "/flags", icon: Flag },
];

const ACCOUNT_NAV: NavItem[] = [
  { label: "Admin", href: "/account/admin", icon: UserCog },
];

// ─── Shared item styles ───────────────────────────────────────────────────────

const itemBase =
  "group flex items-center gap-2.5 w-full px-2.5 py-[6px] rounded-md text-[13.5px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-100 cursor-pointer select-none";

const itemActive = "bg-gray-100 text-gray-900";

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link href={item.href} className={`${itemBase} ${isActive ? itemActive : ""}`}>
      <Icon
        size={15}
        className={`shrink-0 ${isActive ? "text-gray-700" : "text-gray-400 group-hover:text-gray-600"}`}
        strokeWidth={1.75}
      />
      <span>{item.label}</span>
    </Link>
  );
}

// ─── TrainingAccordion ────────────────────────────────────────────────────────

function TrainingAccordion({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isChildActive = item.children?.some((c) => pathname === c.href) ?? false;
  const [open, setOpen] = useState<boolean>(isChildActive || true);
  const Icon = item.icon;
  const isActive = pathname === item.href;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`${itemBase} ${isActive ? itemActive : ""}`}
      >
        <Icon
          size={15}
          className={`shrink-0 ${isActive ? "text-gray-700" : "text-gray-400 group-hover:text-gray-600"}`}
          strokeWidth={1.75}
        />
        <span className="flex-1 text-left">{item.label}</span>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.18 }}
          className="shrink-0"
        >
          <ChevronDown size={14} className="text-gray-400" strokeWidth={1.75} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-0.5 ml-1 pl-4 border-l border-gray-200 space-y-0.5">
              {item.children?.map((child) => {
                const isChildItemActive = pathname === child.href;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`${itemBase} ${isChildItemActive ? itemActive : ""}`}
                  >
                    <span>{child.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="my-2 border-t border-gray-100" />;
}

// ─── AppSidebar ───────────────────────────────────────────────────────────────

export function AppSidebar() {
  return (
    <aside className="w-[240px] shrink-0 h-screen flex flex-col bg-white border-r border-[#e8ecf0]">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[#e8ecf0]">
        <DessaLogo />
      </div>

      {/* Nav — scrollable middle section */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {/* Primary nav */}
        {PRIMARY_NAV.map((item) =>
          item.children ? (
            <TrainingAccordion key={item.href} item={item} />
          ) : (
            <NavLink key={item.href} item={item} />
          )
        )}

        <Divider />

        {/* Utility */}
        {UTILITY_NAV.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        <Divider />

        {/* Account */}
        {ACCOUNT_NAV.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        <Divider />

        {/* Concepts — bottom of nav */}
        <NavLink item={{ label: "Concepts", href: "/concepts", icon: Lightbulb }} />
      </nav>

      {/* User avatar — bottom */}
      <div className="px-3 py-3 border-t border-[#e8ecf0]">
        <button className={`${itemBase} gap-3`}>
          {/* Initials avatar */}
          <div className="w-7 h-7 rounded-full bg-[#1a4e8a] flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-semibold leading-none">TW</span>
          </div>
          <span className="flex-1 text-left truncate">Tara Westbrook</span>
          <ChevronRight size={14} className="shrink-0 text-gray-400" strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  );
}
