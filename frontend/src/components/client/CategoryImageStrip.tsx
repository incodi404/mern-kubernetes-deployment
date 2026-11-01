"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SERVER_URL } from "@/constant";

interface Category {
  _id: string;
  name: string;
  image?: string;
  block?: string;
  isActive?: boolean;
}

interface CategoryImageStripProps {
  className?: string;
  /** optional: only show categories of one block, e.g. "GIFT" or "STATIONARY" */
  block?: string;
  /** max categories to load (default 100 = effectively all) */
  limit?: number;
  /** where a card links to; default filters the products page by category name */
  getHref?: (category: Category) => string;
}

const getImageUrl = (image?: string) => {
  if (!image) return "";
  if (/^(https?:|data:|blob:)/.test(image)) return image;
  return `${SERVER_URL}/file/get/${image}`;
};

const defaultHref = (c: Category) =>
  `/products?categoryName=${encodeURIComponent(c.name)}`;

export default function CategoryImageStrip({
  className = "",
  block,
  limit = 100,
  getHref = defaultHref,
}: CategoryImageStripProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  /* ---------- fetch ---------- */
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data: json } = await axios.get(
          `${SERVER_URL}/category/1/${limit}`,
          { params: { isActive: true, block: block || undefined } },
        );

        // backend returns [] when empty, otherwise { data: [...], totalPages, currentPage }
        const list: Category[] = Array.isArray(json?.data)
          ? json.data
          : (json?.data?.data ?? []);

        setCategories(list);
      } catch (err) {
        console.error("Failed to load categories", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [block, limit]);

  /* ---------- arrows ---------- */
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories, loading, checkScroll]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  // nothing to show
  if (!loading && categories.length === 0) return null;

  return (
    <nav
      aria-label="Categories"
      className={`relative w-full bg-white border-b border-purple-100/60 shadow-[0_2px_8px_-4px_rgba(88,28,135,0.04)] ${className} mt-5`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-16 relative">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => scroll("left")}
          disabled={!canLeft}
          aria-label="Scroll left"
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white text-purple-900 shadow-md border border-purple-100 transition-all duration-200 cursor-pointer ${
            canLeft
              ? "opacity-100 hover:bg-purple-50 hover:scale-105 active:scale-95"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 sm:gap-6 py-3.5 overflow-x-auto scroll-smooth scrollbar-none no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 shrink-0 py-1 px-1.5"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="h-3 w-12 rounded bg-slate-100 animate-pulse" />
                </div>
              ))
            : categories.map((c) => (
                <Link
                  key={c._id}
                  href={getHref(c)}
                  className="group relative flex flex-col items-center gap-2 shrink-0 py-1 px-1.5 focus:outline-none rounded-xl transition-all duration-200"
                >
                  {/* Category photo (same card size as before) */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-purple-100/70 bg-slate-50 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-purple-300 group-hover:shadow-sm">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getImageUrl(c.image)}
                        alt={c.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-purple-800 font-bold">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span className="text-xs font-medium text-slate-700 group-hover:text-purple-900 transition-colors duration-200 text-center max-w-[80px] sm:max-w-[92px] leading-tight line-clamp-1">
                    {c.name}
                  </span>
                </Link>
              ))}
        </div>

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => scroll("right")}
          disabled={!canRight}
          aria-label="Scroll right"
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white text-purple-900 shadow-md border border-purple-100 transition-all duration-200 cursor-pointer ${
            canRight
              ? "opacity-100 hover:bg-purple-50 hover:scale-105 active:scale-95"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
