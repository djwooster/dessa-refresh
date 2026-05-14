"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemLabel = "items",
}: PaginationProps) {
  if (totalPages === 0) return null;

  const start = Math.min((page - 1) * pageSize + 1, totalItems);
  const end   = Math.min(page * pageSize, totalItems);
  const range = getPageRange(page, totalPages);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#e8ecf0] bg-[#edf1f6]/40">

      {/* Left: item count + page size selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">
          {start}–{end} of {totalItems.toLocaleString()} {itemLabel}
        </span>
        <select
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          className="text-xs border border-[#e8ecf0] rounded-md bg-white px-2 py-1 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1a4e8a]/25 focus:border-[#1a4e8a]"
        >
          {pageSizeOptions.map((n) => (
            <option key={n} value={n}>{n} per page</option>
          ))}
        </select>
      </div>

      {/* Right: Previous / page numbers / Next */}
      <nav role="navigation" aria-label="pagination">
        <ul className="flex flex-row items-center gap-1">

          <li>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-3 h-8 rounded-md text-xs text-gray-500 hover:bg-[#e8ecf0]/60 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-default"
            >
              <ChevronLeft size={13} aria-hidden />
              Previous
            </button>
          </li>

          {range.map((p, i) => (
            <li key={i}>
              {p === "…" ? (
                <span className="flex items-center justify-center h-8 w-8 text-sm text-gray-400">…</span>
              ) : (
                <button
                  onClick={() => onPageChange(p as number)}
                  aria-current={p === page ? "page" : undefined}
                  className={`flex items-center justify-center rounded-md text-sm h-8 w-8 transition-colors ${
                    p === page
                      ? "bg-[#1a4e8a] text-white font-semibold"
                      : "text-gray-500 hover:bg-[#e8ecf0]/60 hover:text-gray-900"
                  }`}
                >
                  {p}
                </button>
              )}
            </li>
          ))}

          <li>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-3 h-8 rounded-md text-xs text-gray-500 hover:bg-[#e8ecf0]/60 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-default"
            >
              Next
              <ChevronRight size={13} aria-hidden />
            </button>
          </li>

        </ul>
      </nav>
    </div>
  );
}
