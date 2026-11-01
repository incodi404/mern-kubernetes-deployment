import { FiInbox, FiRefreshCw } from "react-icons/fi";

// Swap for your `brand-green` Tailwind token once wired into your config —
// kept literal here so it renders correctly in isolation.
const BRAND_GREEN = "#1F6F50";
const BRAND_GREEN_SOFT = "#EAF2EC";

interface NoDataFoundProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function NoDataFound({
  title = "No data found",
  description = "We couldn't find anything matching your search. Try adjusting your filters or check back later.",
  onRetry,
  retryLabel = "Refresh",
}: NoDataFoundProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center px-6 py-16 sm:py-20">
      <div
        style={{ backgroundColor: BRAND_GREEN_SOFT }}
        className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full"
      >
        <FiInbox
          size={32}
          style={{ color: BRAND_GREEN }}
          className="sm:w-9 sm:h-9"
        />
      </div>

      <h3 className="mt-6 text-lg sm:text-xl font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm text-slate-500 leading-relaxed">
        {description}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{ backgroundColor: BRAND_GREEN }}
          className={[
            "mt-6 inline-flex items-center gap-2 rounded-full",
            "text-white font-semibold text-sm px-6 py-3",
            "transition-transform duration-200 cursor-pointer",
            "hover:brightness-110 active:scale-[0.97]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          ].join(" ")}
        >
          <FiRefreshCw size={16} />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
