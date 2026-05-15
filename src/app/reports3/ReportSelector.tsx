"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

// ─── Nav definition ───────────────────────────────────────────────────────────

interface NavItem  { label: string; href: string }
interface NavGroup { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Ratings",
    items: [
      { label: "My Students",        href: "/reports3/my-students" },
      { label: "Competencies",       href: "/reports3/competencies" },
      { label: "Window Overview",    href: "/reports3/rating-window-overview" },
      { label: "Window Breakdown",   href: "/reports3/rating-window-breakdown" },
      { label: "Impact Report",      href: "/reports3/impact-report" },
      { label: "Summary Comparison", href: "/reports3/summary-comparison" },
      { label: "Grade Level",        href: "/reports3/grade-level" },
      { label: "Batch Rating",       href: "/reports3/batch-individual" },
      { label: "Rating Export",      href: "/reports3/rating-export" },
      { label: "SEIR Risk",          href: "/reports3/seir-risk" },
    ],
  },
  {
    label: "Completion",
    items: [
      { label: "Rating Completion",  href: "/reports3/rating-completion" },
      { label: "EdSERT Completion",  href: "/reports3/edsert-completion" },
    ],
  },
  {
    label: "Student Portal",
    items: [
      { label: "Student Goals",      href: "/reports3/student-goals" },
    ],
  },
];

export const ALL_REPORT_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

// ─── Component ────────────────────────────────────────────────────────────────

export function ReportSelector({ currentHref }: { currentHref: string }) {
  const router     = useRouter();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLabel =
    ALL_REPORT_ITEMS.find((i) => i.href === currentHref)?.label ?? "Select Report";

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current  && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div className="relative">
      {/* Trigger — looks like a page title */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-1 text-[22px] font-bold text-gray-900 hover:text-gray-700 transition-colors leading-tight"
      >
        <span>{currentLabel}</span>
        <ChevronDown
          size={18}
          strokeWidth={2.5}
          className={`mt-0.5 text-[#1a4e8a] transition-all duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.13, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-[248px] bg-white rounded-xl border border-[#e0e5eb] shadow-xl z-50 py-2 overflow-hidden"
          >
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.label}>
                {gi > 0 && <div className="my-1.5 mx-3 border-t border-[#f0f4f8]" />}
                <p className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const isActive = item.href === currentHref;
                  return (
                    <button
                      key={item.href}
                      onClick={() => { router.push(item.href); setOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-[6px] mx-0 text-[13px] transition-colors ${
                        isActive
                          ? "text-[#1a4e8a] font-semibold bg-[#eef2f8]"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                      {isActive && <Check size={13} className="text-[#1a4e8a] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
