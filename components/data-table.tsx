"use client";

import { useState, useMemo } from "react";
import { Column } from "@/lib/types";

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  searchable?: boolean;
  searchKey?: string;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  rowClassName,
  searchable = false,
  searchKey,
  pageSize = 0,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) => {
      if (searchKey) return String(row[searchKey] ?? "").toLowerCase().includes(q);
      return columns.some((col) =>
        String(row[col.key] ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, search, searchKey, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = pageSize > 0 ? Math.ceil(sorted.length / pageSize) : 1;
  const paginated = pageSize > 0 ? sorted.slice(page * pageSize, (page + 1) * pageSize) : sorted;

  // Reset page when search changes
  useMemo(() => setPage(0), [search]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {searchable && (
        <div className="px-6 pt-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400"
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 ${
                    col.sortable !== false
                      ? "cursor-pointer hover:text-gray-700 select-none"
                      : ""
                  }`}
                  onClick={() =>
                    col.sortable !== false && handleSort(col.key)
                  }
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    {col.sortable !== false && (
                      <span className={`text-[10px] flex flex-col leading-none ${sortKey === col.key ? "" : "opacity-0 group-hover:opacity-30"}`}>
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <span className="text-blue-500">{"\u25B2"}</span>
                          ) : (
                            <span className="text-blue-500">{"\u25BC"}</span>
                          )
                        ) : (
                          <span className="text-gray-300">{"\u25B2\u25BC"}</span>
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => (
              <tr
                key={i}
                className={`even:bg-gray-50/40 hover:bg-blue-50/40 transition ${
                  onRowClick ? "cursor-pointer" : ""
                } ${rowClassName ? rowClassName(row) : ""}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400 text-sm">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pageSize > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {sorted.length} total &middot; Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
