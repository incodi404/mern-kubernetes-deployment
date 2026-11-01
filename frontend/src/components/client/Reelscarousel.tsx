"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import ReelPreview from "./Reelpreview";
import { getYouTubeEmbedUrl } from "@/app/admin/(protected)/reels/page";

interface Reel {
  _id: string;
  title: string;
  url: string;
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

const REELS_LIMIT = 6;
const GAP = "1rem";

// 60% white  -> section background / arrows
// 30% purple -> phone frames, text, button
// 10% gold   -> headline, active progress dash, accents
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Plays the active reel with sound and no controls.
 *
 * Browsers only allow unmuted autoplay after the visitor has interacted with
 * the page. So the video starts muted (always allowed) and we then ask the
 * YouTube player to unmute. Reaching a reel always takes a tap, swipe or key
 * press, so the unmute normally succeeds; if a browser refuses (e.g. strict
 * iOS Safari), the reel simply keeps playing muted instead of breaking.
 */
// Shared across all reels: once the user has touched the page, later
// reels can start with sound immediately (iOS allows it after activation).
let audioUnlocked = false;

function ActiveReelPlayer({ url, title }: { url: string; title: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Decide once per mount: muted until the user has interacted
  const [startMuted] = useState(() => !audioUnlocked);
  const [muted, setMuted] = useState(startMuted);
  const src = getYouTubeEmbedUrl(url, { mute: startMuted, api: true });

  const send = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*",
    );
  }, []);

  const unlock = useCallback(() => {
    audioUnlocked = true;
    send("unMute");
    send("setVolume", [100]);
    send("playVideo");
    setMuted(false);
  }, [send]);

  // First real touch/click anywhere unmutes (this IS a user gesture)
  useEffect(() => {
    if (!muted) return;
    const events = ["touchend", "pointerup", "click"] as const;
    const handler = () => unlock();
    events.forEach((e) =>
      document.addEventListener(e, handler, { once: true, passive: true }),
    );
    return () =>
      events.forEach((e) => document.removeEventListener(e, handler));
  }, [muted, unlock]);

  const handleLoad = () => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
      "*",
    );
    send("playVideo"); // muted play is allowed on iOS
    if (audioUnlocked) {
      send("unMute");
      send("setVolume", [100]);
    }
  };

  if (!src) return null;

  return (
    <>
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        onLoad={handleLoad}
        className="absolute inset-0 h-full w-full border-0 bg-black"
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      {muted && (
        <button
          type="button"
          onClick={unlock}
          className="absolute bottom-4 right-4 z-10 rounded-full bg-black/60 px-4 py-2 text-sm text-white"
        >
          🔇 Tap for sound
        </button>
      )}
    </>
  );
}

export default function ReelsCarousel() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 0 = hook slide, 1..reels.length = content slides
  const [index, setIndex] = useState<number>(0);

  const touchStartX = useRef<number | null>(null);

  const fetchReels = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<ReelsResponse>(
        `${SERVER_URL}/reels/1/${REELS_LIMIT}`,
        {
          params: { active: true },
          signal,
        },
      );
      const payload = res.data?.data;
      const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
      setIndex(0);
      setReels(list);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      console.error("Failed to load reels:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setReels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchReels(controller.signal);
    return () => controller.abort();
  }, [fetchReels]);

  const total = reels.length;
  const slideCount = total + 1; // hook slide + reels
  const lastIndex = slideCount - 1;

  const goTo = useCallback(
    (target: number) => {
      setIndex(Math.min(Math.max(target, 0), lastIndex));
    },
    [lastIndex],
  );

  const nextSlide = useCallback(() => goTo(index + 1), [goTo, index]);
  const prevSlide = useCallback(() => goTo(index - 1), [goTo, index]);

  // Swipe support for touch screens (horizontal swipe inside the vertical frame)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) (diff > 0 ? prevSlide : nextSlide)();
    touchStartX.current = null;
  };

  // Keyboard support (arrow keys while focus is inside the carousel)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  };

  /* ---------- States ---------- */

  if (loading) {
    return (
      <div className="w-full py-6" aria-busy="true" aria-label="Loading reels">
        <div className="flex justify-center">
          <div className="relative aspect-[9/16] w-[240px] sm:w-[280px] lg:w-[320px] overflow-hidden rounded-3xl bg-purple-100">
            <div className="absolute inset-0 -translate-x-full animate-[reelsShimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <div className="absolute inset-x-5 top-4 flex gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className="h-1 flex-1 rounded-full bg-purple-200/80"
                />
              ))}
            </div>
            <div className="absolute inset-x-6 bottom-10 space-y-3">
              <div className="h-8 w-4/5 rounded-lg bg-purple-200/70" />
              <div className="h-4 w-3/5 rounded-lg bg-purple-200/70" />
            </div>
          </div>
        </div>
        <style>{`@keyframes reelsShimmer { 100% { transform: translateX(100%); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto my-6 flex w-full max-w-md flex-col items-center justify-center gap-3 rounded-3xl border border-purple-200 bg-purple-50 px-4 py-10 text-center">
        <span className="text-lg font-bold text-purple-900">
          We couldn&apos;t load the reels
        </span>
        <span className="text-sm text-slate-500">{error}</span>
        <button
          onClick={() => fetchReels()}
          className="cursor-pointer rounded-lg bg-purple-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-800 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (total === 0) {
    return null;
  }

  /* ---------- Carousel ---------- */

  // Top-bar dashes: viewed = white, current = gold, upcoming = faded
  const ProgressBar = () => (
    <div
      className="pointer-events-none absolute inset-x-4 top-3 z-20 flex gap-1.5"
      aria-hidden="true"
    >
      {Array.from({ length: slideCount }).map((_, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
            i === index
              ? "bg-amber-300"
              : i < index
                ? "bg-white/90"
                : "bg-white/30"
          }`}
        />
      ))}
    </div>
  );

  const canPrev = index > 0;
  const canNext = index < lastIndex;

  const arrowClass =
    "absolute top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-purple-900 shadow-lg shadow-purple-900/20 backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 sm:h-12 sm:w-12";

  return (
    <section
      className="w-full"
      onKeyDown={onKeyDown}
      aria-roledescription="carousel"
      aria-label="Our reels"
    >
      <div
        className="relative w-full overflow-hidden py-4 [--sw:240px] sm:[--sw:280px] lg:[--sw:320px]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Sliding track: centres the active phone frame, neighbours peek in */}
        <div
          className="flex w-full transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{
            gap: GAP,
            transform: `translateX(calc(50% - var(--sw) / 2 - ${index} * (var(--sw) + ${GAP})))`,
          }}
        >
          {/* ---------- Slide 1: the hook ---------- */}
          <div
            onClick={() => index !== 0 && goTo(0)}
            aria-hidden={index !== 0 || undefined}
            className={`relative aspect-[9/16] w-[var(--sw)] shrink-0 overflow-hidden rounded-3xl bg-purple-950 transition-all duration-700 ease-in-out motion-reduce:transition-none ${
              index === 0
                ? "scale-100 opacity-100 ring-1 ring-white/40"
                : "scale-[0.92] cursor-pointer opacity-50 hover:opacity-75"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-purple-950 to-purple-950" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-purple-500/30 blur-3xl" />

            <ProgressBar />

            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
              <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-widest text-white backdrop-blur-md sm:text-xs">
                {pad(total)} REELS
              </span>

              <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md sm:h-24 sm:w-24">
                <Play
                  className="ml-1 h-9 w-9 fill-amber-300 text-amber-300 sm:h-11 sm:w-11"
                  strokeWidth={1.5}
                />
              </span>

              <div className="space-y-2">
                <span className="mx-auto block h-1 w-12 rounded-full bg-amber-300" />
                <h2 className="text-3xl font-extrabold leading-[1.05] tracking-tight text-amber-300 drop-shadow-lg sm:text-4xl">
                  Watch our latest reels
                </h2>
                <p className="text-sm font-medium leading-snug text-white/90 sm:text-base">
                  Quick clips, big moments.
                </p>
              </div>

              <button
                onClick={(e) => {
                  if (index === 0) {
                    e.stopPropagation();
                    nextSlide();
                  }
                }}
                tabIndex={index === 0 ? 0 : -1}
                className="group/start inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-purple-900 shadow-xl shadow-purple-950/30 transition-all duration-300 hover:bg-amber-300 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              >
                Tap to start
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover/start:translate-x-1"
                  strokeWidth={3}
                />
              </button>
            </div>

            {/* Animated swipe hint */}
            <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-1 text-[11px] font-semibold tracking-widest text-white/80 sm:text-xs">
              SWIPE
              <span className="flex animate-[reelsNudge_1.4s_ease-in-out_infinite] motion-reduce:animate-none">
                <ChevronRight className="h-4 w-4 text-amber-300" />
                <ChevronRight className="-ml-2.5 h-4 w-4 text-amber-300/60" />
              </span>
            </div>
          </div>

          {/* ---------- Slide 2+: the reels ---------- */}
          {reels.map((reel, i) => {
            const slideIndex = i + 1;
            const isActive = slideIndex === index;

            return (
              <div
                key={reel._id}
                onClick={() => !isActive && goTo(slideIndex)}
                aria-hidden={!isActive || undefined}
                className={`relative aspect-[9/16] w-[var(--sw)] shrink-0 overflow-hidden rounded-3xl bg-purple-900 transition-all duration-700 ease-in-out motion-reduce:transition-none ${
                  isActive
                    ? "scale-100 opacity-100 ring-1 ring-white/40"
                    : "scale-[0.92] cursor-pointer opacity-50 hover:opacity-75"
                }`}
              >
                {isActive ? (
                  <>
                    {/* Focused slide: autoplays with sound, no controls */}
                    <ActiveReelPlayer url={reel.url} title={reel.title} />

                    {/* Transparent layer so swipes over the video still reach
                        the carousel (touches inside an iframe never would) */}
                    <div className="absolute inset-0 z-10" />

                    <ProgressBar />

                    <div className="pointer-events-none absolute right-3 top-8 z-20 rounded-full border border-white/25 bg-black/30 px-3 py-1 text-[11px] font-semibold tracking-widest text-white backdrop-blur-md sm:text-xs">
                      {pad(slideIndex)}
                      <span className="text-white/60"> / {pad(total)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Neighbouring slides: muted, silent preview */}
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-800 via-purple-900 to-purple-950" />
                    <div className="absolute -left-12 top-1/4 h-48 w-48 rounded-full bg-amber-300/15 blur-3xl" />
                    <ReelPreview
                      url={reel.url}
                      title={reel.title}
                      load={Math.abs(slideIndex - index) === 1}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-950/90 via-purple-950/40 to-transparent" />

                    <ProgressBar />

                    <div className="absolute inset-x-0 bottom-0 z-10 space-y-2 px-5 pb-6">
                      <span className="block h-1 w-10 rounded-full bg-amber-300" />
                      <h3 className="line-clamp-3 text-lg font-extrabold leading-tight tracking-tight text-amber-300 drop-shadow-lg sm:text-xl">
                        {reel.title}
                      </h3>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Side chevrons that hint at horizontal motion */}
        {canPrev && (
          <button
            onClick={prevSlide}
            className={`${arrowClass} left-3 sm:left-6`}
            aria-label="Previous reel"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}
        {canNext && (
          <button
            onClick={nextSlide}
            className={`${arrowClass} right-3 sm:right-6`}
            aria-label="Next reel"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}
      </div>

      {/* See all */}
      <div className="mt-2 flex justify-center pb-4">
        <Link
          href="/reels"
          className="group/all inline-flex items-center gap-2 rounded-full bg-purple-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-900/25 transition-all duration-300 hover:bg-amber-300 hover:text-purple-900 hover:shadow-amber-300/30 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 sm:px-8 sm:py-3.5 sm:text-base"
        >
          See all of our reels
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover/all:translate-x-1 sm:h-5 sm:w-5"
            strokeWidth={3}
          />
        </Link>
      </div>

      <style>{`
        @keyframes reelsNudge {
          0%, 100% { transform: translateX(0); opacity: 0.6; }
          50% { transform: translateX(6px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
