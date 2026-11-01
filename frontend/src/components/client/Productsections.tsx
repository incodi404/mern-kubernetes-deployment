"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SERVER_URL } from "@/constant";
import CardSkeleton from "./CardSkeleton";
import ProductCard from "./ProductCard";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export interface Variant {
  value: string;
  variantId: string;
  mrp: number;
  discount: number;
  sellingPrice: number;
}

export interface Product {
  _id: string;
  slug: string;
  title: string;
  subTitle?: string;
  images?: string[];
  variant?: Variant[];
  sections?: string[];
  subcategories?: { name: string }[];
}

/* ------------------------------------------------------------------ */
/*  REUSABLE ROW                                                       */
/* ------------------------------------------------------------------ */

export interface ProductRowProps {
  title?: string;
  subtitle?: string;
  /**
   * Backend section name (must match exactly).
   * Leave it out (undefined) to fetch ALL products, with no section filter.
   */
  section?: string;
  /** max products shown in the row */
  limit?: number;
  /** only fetch active products */
  isActive?: boolean;
  /** override the "Show all" link; defaults to /products or /products?sections=... */
  showAllHref?: string;
  /** hide the "Show all" button */
  hideShowAll?: boolean;
  /** extra filter value from the Gifts/Stationery block, e.g. "gifts". Empty = no filter */
  filter?: string;
}

/**
 * Query param the backend uses for the Gifts/Stationery filter.
 * Products have a `block` field (enum BLOCKS), so we filter on that.
 */
export const FILTER_PARAM = "block";

// TODO: replace with real slug redirect, e.g. `/products/${product.slug}`
const addRedirectHref = (_product: Product) => `/dummy-redirect`;

export function ProductRow({
  title = "All Products",
  subtitle,
  section,
  limit = 10,
  isActive = true,
  showAllHref,
  hideShowAll = false,
  filter,
}: ProductRowProps) {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  /* ---------- fetch (axios) ---------- */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setFailed(false);
      try {
        // `sections` is only sent when a section is given.
        // axios drops params whose value is undefined, so no filter = all products.
        const { data: json } = await axios.get(
          `${SERVER_URL}/product/1/${limit}`,
          {
            params: {
              sections: section,
              isActive,
              [FILTER_PARAM]: filter || undefined,
            },
          },
        );

        // backend returns [] when empty, otherwise { data: [...], totalPages, currentPage }
        const list: Product[] = Array.isArray(json?.data)
          ? json.data
          : (json?.data?.data ?? []);

        setProducts(list.slice(0, limit));
      } catch (err) {
        console.error("Failed to load products", err);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [section, limit, isActive, filter]);

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
    router.push(addRedirectHref(product));
  };

  // nothing to show: hide this section
  if (!loading && (failed || products.length === 0)) return null;

  const headingId = `heading-${title.replace(/\s+/g, "-").toLowerCase()}`;
  const query = new URLSearchParams();
  if (section) query.set("sections", section);
  if (filter) query.set(FILTER_PARAM, filter);
  const qs = query.toString();
  const href = showAllHref ?? (qs ? `/products?${qs}` : "/products");

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-2" aria-labelledby={headingId}>
      {/* heading + show all + arrows */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h2
            id={headingId}
            className="text-2xl sm:text-3xl font-extrabold text-purple-950"
          >
            {title}
          </h2>
          <span className="block w-14 h-1 mt-3 rounded-full bg-amber-400" />
          {subtitle && (
            <p className="mt-3 text-sm text-slate-600">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!hideShowAll && (
            <Link
              href={href}
              className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-950 text-white text-xs font-bold hover:bg-purple-900 transition-colors"
            >
              Show all
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

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
              <section
                key={product._id}
                className="min-w-[12rem] sm:min-w-[15rem]"
              >
                <ProductCard
                  product={product}
                  SECTION={section ?? "All"}
                  onAdd={handleAdd}
                />
              </section>
            ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  USAGE: section-wise page (order here = order on the page)          */
/* ------------------------------------------------------------------ */

const SECTIONS: ProductRowProps[] = [
  {
    section: "New Arrivals",
    title: "New Arrivals",
    subtitle: "Fresh pieces, just landed.",
  },
  {
    section: "Bestseller",
    title: "Best Sellers",
    subtitle: "The pieces our customers keep coming back for.",
  },
  {
    section: "Top Products",
    title: "Top Products",
    subtitle: "Our most loved picks, handpicked for you.",
  },
  {
    // no `section` = all products. "Show all" goes to /products
    title: "All Products",
    subtitle: "Browse everything we have.",
  },
];

export default function ProductSections() {
  return (
    <>
      {SECTIONS.map((s) => (
        <ProductRow key={s.title} limit={10} {...s} />
      ))}
    </>
  );
}
