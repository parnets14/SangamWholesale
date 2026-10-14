import React from "react";

const BRAND = "#702834";

export const DEFAULT_PAGE_SIZE = 10;

/**
 * Build a compact page list, e.g. 1 … 4 5 6 … 20
 * Returns every page when there are 7 or fewer, otherwise a window around the
 * current page with "…" gaps.
 */
export const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  wanted.forEach((p) => {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  });
  return out;
};

/**
 * Shared admin pagination bar.
 *
 * <Pagination
 *   page={safePage}
 *   totalPages={totalPages}
 *   onChange={setPage}
 *   total={rows.length}
 *   pageSize={PAGE_SIZE}
 *   label="category"
 * />
 *
 * Renders nothing when there are no rows. The Prev/Next + page buttons only
 * appear when there is more than one page.
 */
const Pagination = ({
  page,
  totalPages,
  onChange,
  total,
  pageSize = DEFAULT_PAGE_SIZE,
  label = "item",
  className = "",
}) => {
  if (!total) return null;

  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  const navBtn =
    "px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  return (
    <div
      className={`flex items-center justify-between gap-4 flex-wrap mt-5 px-1 ${className}`}
    >
      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-700">{startIndex + 1}</span>
        –<span className="font-semibold text-gray-700">{endIndex}</span> of{" "}
        <span className="font-semibold text-gray-700">{total}</span> {label}
        {total !== 1 ? "s" : ""}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className={navBtn}
          >
            Prev
          </button>

          {getPageNumbers(page, totalPages).map((n, i) =>
            n === "…" ? (
              <span key={`gap-${i}`} className="px-1.5 text-sm text-gray-400">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className="min-w-[36px] px-2.5 py-1.5 rounded-lg border text-sm font-semibold transition-colors"
                style={
                  n === page
                    ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" }
                    : { borderColor: "#e5e7eb", color: "#4b5563", backgroundColor: "#fff" }
                }
                onMouseEnter={(e) => {
                  if (n !== page) e.currentTarget.style.backgroundColor = "#fdf6f7";
                }}
                onMouseLeave={(e) => {
                  if (n !== page) e.currentTarget.style.backgroundColor = "#fff";
                }}
              >
                {n}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className={navBtn}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
