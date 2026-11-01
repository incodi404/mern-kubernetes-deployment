"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { SERVER_URL } from "@/constant";
/* ------------------------------------------------------------------ */
/*  CONFIG  (for New Arrivals / Top Products, change only this block)  */
/* ------------------------------------------------------------------ */

// Must match an entry in SECTIONS exactly: "Bestseller" | "New Arrivals" | "Top Products"
const SECTION = "New Arrivals";
const TITLE = "New Arrivals";
const SUBTITLE = "The pieces our customers keep coming back for.";

const LIMIT = 10; // number of products shown before the "Show all" card
const SHOW_ALL_HREF = `/products?sections=${encodeURIComponent(SECTION)}`; // all-products page (you will add the filter there)
const PRODUCT_HREF = (id: string) => `/products/${id}`; // product details page

// ---- API / image settings: change these to match your backend ----
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:7000/api/v1";
// getAllProducts reads :page and :limit from req.params, so the route must look like /products/:page/:limit
const API_URL = `${SERVER_URL}/product/1/${LIMIT}?sections=${encodeURIComponent(
  SECTION
)}&isActive=true`;
// product.images holds file names only, so build the full URL here
const imageUrl = (file: string) => `${SERVER_URL}/file/get/${file}`;

/* ------------------------------------------------------------------ */

interface Variant {
  value: string;
  variantId: string;
  mrp: number;
  discount: number;
  sellingPrice: number;
}

interface Product {
  _id: string;
  title: string;
  subTitle?: string;
  images?: string[];
  variant?: Variant[];
  sections?: string[];
  subcategories?: { name: string }[]; // added by the $lookup in getAllProducts
}

const rupee = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

// show the cheapest variant on the card
const cheapestVariant = (p: Product): Variant | undefined =>
  p.variant?.reduce<Variant | undefined>(
    (best, v) => (!best || v.sellingPrice < best.sellingPrice ? v : best),
    undefined
  );

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  /* ---------- fetch ---------- */
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();

        // backend returns [] when empty, otherwise { data: [...], totalPages, currentPage }
        const list: Product[] = Array.isArray(json?.data)
          ? json.data
          : json?.data?.data ?? [];

        setProducts(list.slice(0, LIMIT));
      } catch (err) {
        if ((err as Error).name !== "AbortError") setFailed(true);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  /* ---------- arrow state ---------- */
  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [products, loading, updateArrows]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const handleAdd = (product: Product) => {
    // TODO: connect to your cart logic
    console.log("add to cart", product._id);
  };

  // nothing to show: hide the whole section
  if (!loading && (failed || products.length === 0)) return null;

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      aria-labelledby="best-saller-heading"
    >
      {/* heading + arrows */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h2
            id="best-saller-heading"
            className="text-2xl sm:text-3xl font-extrabold text-purple-950"
          >
            {TITLE}
          </h2>
          <span className="block w-14 h-1 mt-3 rounded-full bg-amber-400" />
          <p className="mt-3 text-sm text-slate-600">{SUBTITLE}</p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={!canLeft}
            aria-label="Scroll left"
            className="w-10 h-10 grid place-items-center rounded-full border border-purple-200 text-purple-900 hover:bg-purple-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-default"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={!canRight}
            aria-label="Scroll right"
            className="w-10 h-10 grid place-items-center rounded-full border border-purple-200 text-purple-900 hover:bg-purple-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-default"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* scrolling row */}
      <div
        ref={trackRef}
        onScroll={updateArrows}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAdd={handleAdd}
              />
            ))}

        {/* "Show all" card, after the last product */}
        {!loading && (
          <div className="snap-start shrink-0 w-64 sm:w-72 flex">
            <Link
              href={SHOW_ALL_HREF}
              className="group w-full rounded-2xl bg-purple-950 text-white p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-purple-900 transition-colors"
            >
              <span className="text-xl font-extrabold leading-snug">
                Love these picks?
              </span>
              <span className="text-sm text-purple-200">
                See every {TITLE.toLowerCase()} item in one place.
              </span>
              <span className="mt-2 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm group-hover:bg-amber-300 transition-colors">
                Show all
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------- card ---------------------------- */

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const variant = cheapestVariant(product);
  const category = product.subcategories?.[0]?.name;
  const image = product.images?.[0];

  const percentOff =
    variant && variant.mrp > variant.sellingPrice
      ? Math.round(((variant.mrp - variant.sellingPrice) / variant.mrp) * 100)
      : 0;

  return (
    <article className="snap-start shrink-0 w-64 sm:w-72 group bg-white rounded-2xl border border-slate-200/80 hover:border-purple-200 hover:shadow-xl transition-all duration-300 p-4 flex flex-col justify-between">
      <div>
        {/* top row: section badge + wishlist */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
            {product.sections?.[0] ?? SECTION}
          </span>
          <button
            type="button"
            aria-label="Save to wishlist"
            className="p-1.5 rounded-full text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <Link href={PRODUCT_HREF(product._id)} className="block">
          {/* image */}
          <div className="w-full h-44 rounded-xl overflow-hidden bg-linear-to-tr from-purple-50/70 to-slate-50 flex items-center justify-center border border-purple-50 mb-4">
            {image && !imgFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl(image)}
                alt={product.title}
                loading="lazy"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <span className="px-3 text-center text-xs font-semibold text-purple-900/60 uppercase tracking-widest">
                {category ?? "No image"}
              </span>
            )}
          </div>

          {category && (
            <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">
              {category}
            </p>
          )}
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-950 transition-colors line-clamp-1 mt-0.5">
            {product.title}
          </h3>
          {product.subTitle && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-1">
              {product.subTitle}
            </p>
          )}
        </Link>
      </div>

      {/* price + add */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          {variant ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-purple-950">
                  {rupee(variant.sellingPrice)}
                </span>
                {percentOff > 0 && (
                  <span className="text-xs text-slate-400 line-through">
                    {rupee(variant.mrp)}
                  </span>
                )}
              </div>
              {percentOff > 0 && (
                <span className="text-[10px] font-bold text-amber-700">
                  {percentOff}% OFF
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-400">Price unavailable</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAdd(product)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs transition-all cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>
    </article>
  );
}

/* -------------------------- skeleton -------------------------- */

function CardSkeleton() {
  return (
    <div className="snap-start shrink-0 w-64 sm:w-72 bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse">
      <div className="h-5 w-20 rounded-full bg-purple-100 mb-3" />
      <div className="h-44 rounded-xl bg-purple-50 mb-4" />
      <div className="h-3 w-16 rounded bg-purple-100 mb-2" />
      <div className="h-4 w-40 rounded bg-slate-100 mb-6" />
      <div className="h-8 w-full rounded bg-slate-100" />
    </div>
  );
}