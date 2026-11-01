"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import axios from "axios";
import { SERVER_URL } from "@/constant";

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive?: boolean;
  order?: number;
}

interface BannerResponse {
  data: Banner[];
}

interface Slide {
  key: string;
  banner: Banner;
}

const SLIDE_INTERVAL = 5000; // auto change every 5s
const TRANSITION_MS = 700; // keep in sync with duration-700 below

// Slide width as a % of the container. The rest is split evenly so the
// previous / next banners peek from both sides.
const SLIDE_WIDTH = 100;
const SIDE_OFFSET = (100 - SLIDE_WIDTH) / 2; // 11%
const GAP = "1rem";

// One standard ratio for every screen size: 2:1 (e.g. 1600x800).
// Mobile: 2:1 (short and wide), tablet: 3:1, desktop: 4:1, never taller than 420px
const SLIDE_HEIGHT = "aspect-[8/3] max-h-[700px]";

// 60% white  -> page / buttons / arrows
// 30% purple -> overlay + button text + inactive dots
// 10% gold   -> heading + active dot + accents
const pad = (n: number) => String(n).padStart(2, "0");

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState<boolean>(false);

  // `pos` is the index inside the EXTENDED list: [clone of last, ...real, clone of first]
  // so real slides live at 1..total.
  const [pos, setPos] = useState<number>(1);
  const [animate, setAnimate] = useState<boolean>(true);

  const posRef = useRef<number>(1);
  const lockedRef = useRef<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Only active banners are shown on the public site (sorted by `order` on the server)
  const fetchBanners = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<BannerResponse>(`${SERVER_URL}/banner`, {
        params: { isActive: true },
        signal,
      });
      const bannerData = res.data?.data ?? [];
      posRef.current = 1;
      setPos(1);
      setBanners(bannerData);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      console.error("Failed to load banners:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchBanners(controller.signal);
    return () => controller.abort();
  }, [fetchBanners]);

  const total = banners.length;
  const loopable = total > 1;

  // Build the extended list (clones at both ends make the loop seamless)
  const slides: Slide[] = loopable
    ? [
        {
          key: `clone-last-${banners[total - 1]._id}`,
          banner: banners[total - 1],
        },
        ...banners.map((b) => ({ key: b._id, banner: b })),
        { key: `clone-first-${banners[0]._id}`, banner: banners[0] },
      ]
    : banners.map((b) => ({ key: b._id, banner: b }));

  const activePos = loopable ? pos : 0;
  // Which real banner is showing (used for the dots and counter)
  const realIndex = loopable ? (((pos - 1) % total) + total) % total : 0;

  // Slide to an index of the extended list, then silently jump back
  // from a clone to the matching real slide once the animation ends.
  const moveTo = useCallback(
    (target: number) => {
      if (!loopable || lockedRef.current) return;
      lockedRef.current = true;
      posRef.current = target;
      setPos(target);

      timeoutRef.current = setTimeout(() => {
        const current = posRef.current;
        let jumpTo = current;
        if (current < 1)
          jumpTo = total; // clone of last  -> real last
        else if (current > total) jumpTo = 1; // clone of first -> real first

        if (jumpTo !== current) {
          setAnimate(false);
          posRef.current = jumpTo;
          setPos(jumpTo);
          // re-enable the animation after the browser painted the jump
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              setAnimate(true);
              lockedRef.current = false;
            }),
          );
        } else {
          lockedRef.current = false;
        }
      }, TRANSITION_MS + 50);
    },
    [loopable, total],
  );

  const nextSlide = useCallback(() => moveTo(posRef.current + 1), [moveTo]);
  const prevSlide = useCallback(() => moveTo(posRef.current - 1), [moveTo]);

  // Auto-slide: one banner at a time, forever. Pauses on hover/focus.
  useEffect(() => {
    if (!loopable || paused) return;
    const timer = setInterval(nextSlide, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [loopable, paused, nextSlide, pos]);

  // Clean up the pending timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Swipe support for touch screens
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
      <div
        className="w-full py-4"
        aria-busy="true"
        aria-label="Loading banners"
      >
        <div
          className="flex gap-4 overflow-hidden"
          style={{ paddingInline: `${SIDE_OFFSET}%` }}
        >
          <div
            className={`relative shrink-0 w-full ${SLIDE_HEIGHT} rounded-2xl sm:rounded-3xl bg-purple-100 overflow-hidden`}
          >
            <div className="absolute inset-0 -translate-x-full animate-[bannerShimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <div className="absolute left-6 sm:left-16 top-1/2 -translate-y-1/2 space-y-3 w-1/2">
              <div className="h-8 sm:h-12 w-4/5 rounded-lg bg-purple-200/70" />
              <div className="h-4 sm:h-6 w-3/5 rounded-lg bg-purple-200/70" />
              <div className="h-9 sm:h-12 w-28 sm:w-36 rounded-lg bg-purple-200/70" />
            </div>
          </div>
        </div>
        <style>{`@keyframes bannerShimmer { 100% { transform: translateX(100%); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`w-full ${SLIDE_HEIGHT} bg-purple-50 border border-purple-200 flex flex-col items-center justify-center gap-3 rounded-3xl px-4 text-center`}
      >
        <span className="text-purple-900 text-lg font-bold">
          We couldn&apos;t load the banners
        </span>
        <span className="text-sm text-slate-500">{error}</span>
        <button
          onClick={() => fetchBanners()}
          className="px-5 py-2 rounded-lg bg-purple-900 text-white text-sm font-semibold hover:bg-purple-800 active:scale-95 transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (total === 0) {
    return <div></div>;
  }

  /* ---------- Carousel ---------- */

  const ctaClass = (isActive: boolean) =>
    `group/cta inline-flex items-center gap-2 mt-0.5 sm:mt-3 px-3 py-1.5 sm:px-7 sm:py-3.5 bg-white text-purple-900 font-bold text-xs sm:text-lg shadow-xl shadow-purple-950/30 hover:bg-amber-300 hover:shadow-amber-300/30 active:scale-[0.97] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
      isActive ? "" : "pointer-events-none"
    }`;

  return (
    <section
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
      aria-roledescription="carousel"
      aria-label="Featured banners"
    >
      <div
        className="relative w-full py-5 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Sliding track: centres the active slide, neighbours peek in */}
        <div
          className={`flex w-full ${
            animate
              ? "transition-transform duration-700 ease-in-out motion-reduce:transition-none"
              : ""
          }`}
          style={{
            gap: GAP,
            transform: `translateX(calc(${SIDE_OFFSET}% - ${activePos} * (${SLIDE_WIDTH}% + ${GAP})))`,
          }}
        >
          {slides.map(({ key, banner }, index) => {
            const isActive = index === activePos;
            const isClone =
              loopable && (index === 0 || index === slides.length - 1);
            const isInternal = banner.link?.startsWith("/");

            return (
              <div
                key={key}
                aria-hidden={!isActive || undefined}
                onClick={() => !isActive && moveTo(index)}
                style={{ width: `${SLIDE_WIDTH}%` }}
                className={`group relative shrink-0 ${SLIDE_HEIGHT} overflow-hidden bg-purple-900 ${
                  animate
                    ? "transition-all duration-700 ease-in-out motion-reduce:transition-none"
                    : ""
                } ${
                  isActive
                    ? "opacity-100 ring-1 ring-white/40"
                    : "opacity-50 cursor-pointer hover:opacity-75"
                }`}
              >
                {/* Background image with a slow zoom on the active slide */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${SERVER_URL}/file/get/${banner.image}`}
                  alt={isClone ? "" : banner.title}
                  className={`absolute inset-0 w-full h-full object-cover ${
                    isActive ? "" : ""
                  }`}
                />

                {/* Purple gradient (left) + bottom vignette so text stays readable */}
                {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-950/90 via-purple-900/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-purple-950/50 to-transparent" /> */}

                {/* Slide counter */}
                <div className="absolute top-3 right-3 sm:top-5 sm:right-6 z-10 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1 text-[11px] sm:text-sm font-semibold tracking-widest text-white">
                  {pad(isClone ? (index === 0 ? total : 1) : index)}
                  <span className="text-white/50"> / {pad(total)}</span>
                </div>

                {/* Text content: fades & rises in when the slide becomes active */}
                {/* <div className="absolute inset-0 flex items-center px-6 sm:px-12 md:px-16 lg:px-24">
                  <div
                    className={`max-w-[16rem] sm:max-w-md lg:max-w-xl space-y-1.5 sm:space-y-3 lg:space-y-4 transition-all duration-700 delay-200 motion-reduce:transition-none ${
                      isActive
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    <span className="block h-1 w-10 sm:w-16 rounded-full bg-amber-300" />

                    <h2 className="text-base sm:text-3xl lg:text-5xl font-extrabold tracking-tight leading-[1.05] text-amber-300 drop-shadow-lg line-clamp-2">
                      {banner.title}
                    </h2>

                    {banner.subtitle && (
                      <p className="text-[11px] sm:text-base lg:text-xl font-medium leading-snug text-white/95 line-clamp-1 sm:line-clamp-2">
                        {banner.subtitle}
                      </p>
                    )}

                    {banner.link &&
                      (isInternal ? (
                        <Link
                          href={banner.link}
                          tabIndex={isActive ? 0 : -1}
                          className={ctaClass(isActive)}
                        >
                          Order Now
                          <ArrowRight
                            className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover/cta:translate-x-1"
                            strokeWidth={3}
                          />
                        </Link>
                      ) : (
                        <a
                          href={banner.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={isActive ? 0 : -1}
                          className={ctaClass(isActive)}
                        >
                          Order Now
                          <ArrowRight
                            className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover/cta:translate-x-1"
                            strokeWidth={3}
                          />
                        </a>
                      ))}
                  </div>
                </div> */}
              </div>
            );
          })}
        </div>

        {/* Glass arrows, vertically centred on the edges */}
        {loopable && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 h-9 w-9 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur text-purple-900 shadow-lg shadow-purple-900/20 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 h-9 w-9 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur text-purple-900 shadow-lg shadow-purple-900/20 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}
      </div>

      {/* Dots with a progress fill that shows time until the next slide */}
      {loopable && (
        <div className="flex justify-center items-center gap-2 mt-2">
          {banners.map((banner, index) => {
            const isCurrent = index === realIndex;
            return (
              <button
                key={banner._id}
                onClick={() => moveTo(index + 1)}
                className={`relative h-2.5 overflow-hidden rounded-full cursor-pointer transition-all duration-300 ${
                  isCurrent
                    ? "w-10 bg-purple-200"
                    : "w-2.5 bg-purple-200 hover:bg-purple-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={isCurrent}
              >
                {isCurrent && (
                  <span
                    // key restarts the animation on every slide change / resume after pause
                    key={`${pos}-${paused}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-amber-400"
                    style={
                      paused
                        ? { width: "100%" }
                        : {
                            animation: `bannerProgress ${SLIDE_INTERVAL}ms linear forwards`,
                          }
                    }
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes bannerProgress { from { width: 0%; } to { width: 100%; } }
        @media (prefers-reduced-motion: reduce) {
          @keyframes bannerProgress { from { width: 100%; } to { width: 100%; } }
        }
      `}</style>
    </section>
  );
}
