import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Swap for your `brand-green` Tailwind token once wired into your config —
// kept literal here so it renders correctly in isolation.
const BRAND_GREEN = "#1F6F50";

interface PaginationProps {
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

function getPageList(current: number, total: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  const siblings = 1;

  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);

  pages.push(1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  if (total > 1) pages.push(total);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPage,
  onPageChange,
}: PaginationProps) {
  if (totalPage <= 1) return null;

  const pages = getPageList(currentPage, totalPage);
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPage;

  const baseBtn =
    "flex items-center justify-center h-9 min-w-9 px-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 sm:gap-2"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="Previous page"
        className={[
          baseBtn,
          "text-slate-500 hover:bg-slate-100 disabled:hover:bg-transparent",
        ].join(" ")}
      >
        <FiChevronLeft size={16} />
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex items-center justify-center h-9 min-w-9 text-sm text-slate-400 select-none"
          >
            &#8230;
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={[
              baseBtn,
              page === currentPage
                ? "text-white shadow-[0_4px_14px_-4px_rgba(31,111,80,0.5)] bg-brand-green"
                : "text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="Next page"
        className={[
          baseBtn,
          "text-slate-500 hover:bg-slate-100 disabled:hover:bg-transparent",
        ].join(" ")}
      >
        <FiChevronRight size={16} />
      </button>
    </nav>
  );
}
