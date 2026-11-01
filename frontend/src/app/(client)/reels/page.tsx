"use client";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import ReelPreview from "@/components/client/Reelpreview";
import { getYouTubeEmbedUrl } from "@/app/admin/(protected)/reels/page";
import ReelPlayer from "@/components/client/ReelPlayer";

interface Reel {
  _id: string;
  title: string;
  url: string;
  embedUrl?: string;
  slug?: string;
  active?: boolean;
}

interface ReelsPayload {
  totalPages: number;
  data: Reel[];
  currentPage: number;
}

// The API returns `data: []` when empty and `data: { data: [...] }` otherwise
interface ReelsResponse {
  data: Reel[] | ReelsPayload;
}

const LIMIT = 10;

// 60% white  -> page background / pagination buttons
// 30% purple -> cards, text, modal
// 10% gold   -> headline accent, active page, play hover
const pad = (n: number) => String(n).padStart(2, "0");

const getEmbedUrl = (reel: Reel) => {
  if (reel.embedUrl) return reel.embedUrl;
  return `${reel.url.split("?")[0].replace(/\/$/, "")}/embed`;
};

// Builds [1, "...", 4, 5, 6, "...", 12] style page lists
const getPageNumbers = (current: number, total: number) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | string)[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("...start");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...end");
  pages.push(total);

  return pages;
};

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [retryKey, setRetryKey] = useState<number>(0);

  // Index (inside the current page) of the reel open in the viewer
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReels = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get<ReelsResponse>(
          `${SERVER_URL}/reels/${page}/${LIMIT}`,
          {
            params: { active: true },
            signal: controller.signal,
          },
        );
        const payload = res.data?.data;

        if (Array.isArray(payload)) {
          setReels(payload);
          setTotalPages(1);
        } else {
          setReels(payload?.data ?? []);
          setTotalPages(Math.max(1, payload?.totalPages ?? 1));
        }
      } catch (err: unknown) {
        if (axios.isCancel(err)) return;
        console.error("Failed to load reels:", err);
        setError(err instanceof Error ? err.message : "Something went wrong");
        setReels([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchReels();
    return () => controller.abort();
  }, [page, retryKey]);

  const goToPage = (target: number) => {
    if (target < 1 || target > totalPages || target === page) return;
    setOpenIndex(null);
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------- Viewer (modal) ---------- */

  const closeViewer = useCallback(() => setOpenIndex(null), []);
  const prevReel = useCallback(
    () => setOpenIndex((i) => (i !== null && i > 0 ? i - 1 : i)),
    [],
  );
  const nextReel = useCallback(
    () => setOpenIndex((i) => (i !== null && i < reels.length - 1 ? i + 1 : i)),
    [reels.length],
  );

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") prevReel();
      if (e.key === "ArrowRight") nextReel();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, closeViewer, prevReel, nextReel]);

  const openReel = openIndex !== null ? reels[openIndex] : null;

  const viewerArrow =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-purple-900 shadow-lg backdrop-blur transition-all hover:scale-110 hover:bg-white active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 sm:h-12 sm:w-12";

  const pageBtn =
    "flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full border border-purple-200 bg-white px-3 text-sm font-semibold text-purple-900 transition-all duration-200 hover:border-purple-900 hover:bg-purple-50 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-purple-200 disabled:hover:bg-white";

  return (
    <main className="min-h-screen w-full bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Header */}
        <header className="mb-8 space-y-3 text-center sm:mb-12">
          <span className="mx-auto block h-1 w-14 rounded-full bg-amber-400" />
          <h1 className="text-3xl font-extrabold tracking-tight text-purple-900 sm:text-5xl">
            Our <span className="text-amber-500">Reels</span>
          </h1>
          <p className="mx-auto max-w-xl text-sm text-slate-500 sm:text-base">
            Quick clips, big moments. Tap any reel to watch it.
          </p>
        </header>

        {/* Loading skeleton */}
        {loading && (
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5"
            aria-busy="true"
            aria-label="Loading reels"
          >
            {Array.from({ length: LIMIT }).map((_, i) => (
              <div
                key={i}
                className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-purple-100 sm:rounded-3xl"
              >
                <div className="absolute inset-0 -translate-x-full animate-[reelsShimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                <div className="absolute inset-x-4 bottom-5 space-y-2">
                  <div className="h-4 w-4/5 rounded-lg bg-purple-200/70" />
                  <div className="h-3 w-3/5 rounded-lg bg-purple-200/70" />
                </div>
              </div>
            ))}
            <style>{`@keyframes reelsShimmer { 100% { transform: translateX(100%); } }`}</style>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-3 rounded-3xl border border-purple-200 bg-purple-50 px-4 py-12 text-center">
            <span className="text-lg font-bold text-purple-900">
              We couldn&apos;t load the reels
            </span>
            <span className="text-sm text-slate-500">{error}</span>
            <button
              onClick={() => setRetryKey((k) => k + 1)}
              className="cursor-pointer rounded-lg bg-purple-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-800 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && reels.length === 0 && (
          <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-2 rounded-3xl border border-purple-200 bg-purple-50 px-4 py-12 text-center">
            <span className="text-lg font-bold text-purple-900">
              No reels yet
            </span>
            <span className="text-sm text-slate-500">
              Check back soon for new content.
            </span>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && reels.length > 0 && (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
              {reels.map((reel, i) => (
                <li key={reel._id}>
                  <button
                    onClick={() => setOpenIndex(i)}
                    className="group relative block aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-2xl bg-purple-900 text-left shadow-[0_20px_40px_-24px_rgba(88,28,135,0.7)] ring-1 ring-purple-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-20px_rgba(88,28,135,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 sm:rounded-3xl"
                    aria-label={`Play reel: ${reel.title}`}
                  >
                    {/* Poster */}
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-800 via-purple-900 to-purple-950" />
                    <div className="absolute -left-10 top-1/4 h-40 w-40 rounded-full bg-amber-300/15 blur-3xl" />
                    <ReelPreview url={getEmbedUrl(reel)} title={reel.title} />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-950/90 via-purple-950/40 to-transparent" />

                    {/* Number tag */}
                    <span className="absolute right-3 top-3 z-10 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-widest text-white backdrop-blur-md sm:text-xs">
                      {pad((page - 1) * LIMIT + i + 1)}
                    </span>

                    {/* Play button */}
                    <span className="absolute inset-0 z-10 flex items-center justify-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/15 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-300 sm:h-16 sm:w-16">
                        <Play
                          className="ml-0.5 h-6 w-6 fill-white text-white transition-colors group-hover:fill-purple-900 group-hover:text-purple-900 sm:h-7 sm:w-7"
                          strokeWidth={1.5}
                        />
                      </span>
                    </span>

                    {/* Title */}
                    <span className="absolute inset-x-0 bottom-0 z-10 block space-y-2 px-4 pb-4 sm:px-5 sm:pb-5">
                      <span className="block h-1 w-8 rounded-full bg-amber-300" />
                      <span className="line-clamp-2 block text-sm font-extrabold leading-tight tracking-tight text-amber-300 drop-shadow-lg sm:text-base">
                        {reel.title}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-14"
                aria-label="Reels pagination"
              >
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className={pageBtn}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {getPageNumbers(page, totalPages).map((p) =>
                  typeof p === "string" ? (
                    <span
                      key={p}
                      className="flex h-10 min-w-8 items-end justify-center pb-2 text-purple-900/60"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      aria-current={p === page ? "page" : undefined}
                      aria-label={`Page ${p}`}
                      className={
                        p === page
                          ? "flex h-10 min-w-10 cursor-default items-center justify-center rounded-full bg-amber-400 px-3 text-sm font-bold text-purple-900 shadow-lg shadow-amber-400/30"
                          : pageBtn
                      }
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className={pageBtn}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      {/* Viewer modal */}
      {openReel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/85 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={openReel.title}
          onClick={closeViewer}
        >
          <div
            className="relative flex w-full max-w-sm flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[9/16] h-[75vh] max-h-[760px] overflow-hidden rounded-3xl bg-white ring-1 ring-white/40 shadow-[0_28px_60px_-24px_rgba(0,0,0,0.8)]">
              <ReelPlayer
                key={openReel._id}
                url={openReel.url}
                title={openReel.title}
              />
            </div>

            <div className="flex w-full items-center justify-between gap-3 px-1">
              <p className="line-clamp-1 text-sm font-bold text-amber-300 sm:text-base">
                {openReel.title}
              </p>
              <span className="shrink-0 text-xs font-semibold tracking-widest text-white/70">
                {pad((openIndex ?? 0) + 1)} / {pad(reels.length)}
              </span>
            </div>

            <button
              onClick={closeViewer}
              className="absolute -top-3 right-0 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-purple-900 shadow-lg transition-all hover:scale-110 hover:bg-amber-300 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 sm:-right-14 sm:top-0"
              aria-label="Close reel"
            >
              <X className="h-5 w-5" />
            </button>

            {openIndex !== null && openIndex > 0 && (
              <button
                onClick={prevReel}
                className={`${viewerArrow} -left-2 sm:-left-16`}
                aria-label="Previous reel"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}
            {openIndex !== null && openIndex < reels.length - 1 && (
              <button
                onClick={nextReel}
                className={`${viewerArrow} -right-2 sm:-right-16`}
                aria-label="Next reel"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
