"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { SlidersHorizontal, X } from "lucide-react";
import { SERVER_URL } from "@/constant";
import CardSkeleton from "./CardSkeleton";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import Search from "./Search"; // adjust the path if your Search component lives elsewhere
import type { Product } from "./Productsections";

const LIMIT = 12;

/*
 * The backend builds `new RegExp(value, "i")` for search / categoryName /
 * subcategoryName. So on the frontend we:
 *  - escape the text, so characters like ( + ? can't break the regex
 *  - anchor names with ^...$ so "Pen" doesn't also match "Pen Stand"
 */
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const exact = (s: string) => (s ? `^${escapeRegex(s)}$` : undefined);

/*
 * The product row cards were built for a horizontal scroller (fixed width).
 * This wrapper forces whatever card is inside to fill its grid cell instead,
 * so exactly 2 cards fit per row on mobile.
 */
const CELL = "min-w-0 [&>*]:!w-full [&>*]:!min-w-0 [&>*]:!max-w-none";
const GRID = "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5";

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const page = Math.max(1, Number(sp.get("page")) || 1);
  const get = (k: string) => sp.get(k) ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile filter drawer

  // text inside the search box (kept in sync with ?search= in the URL)
  const [searchText, setSearchText] = useState(get("search"));
  useEffect(() => setSearchText(get("search")), [sp]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- drawer: lock body scroll + close on Escape ---------- */
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  /* ---------- URL helpers ---------- */
  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    // any filter change goes back to page 1 (unless the page itself is set)
    if (!("page" in updates)) next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, {
      scroll: "page" in updates,
    });
  };

  const clearAll = () => router.push(pathname);

  /* ---------- fetch whenever the URL changes ---------- */
  const queryKey = sp.toString();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setFailed(false);
      try {
        const search = get("search").trim();
        const params: Record<string, string | boolean | undefined> = {
          isActive: true,
          search: search ? escapeRegex(search) : undefined,
          categoryName: exact(get("categoryName")),
          subcategoryName: exact(get("subcategoryName")),
          minPrice: get("minPrice") || undefined,
          maxPrice: get("maxPrice") || undefined,
          block: get("block") || undefined,
          sections: get("sections") || undefined,
        };

        const { data: json } = await axios.get(
          `${SERVER_URL}/product/${page}/${LIMIT}`,
          { params },
        );

        // backend returns [] when empty, otherwise { data: [...], totalPages, currentPage }
        const list: Product[] = Array.isArray(json?.data)
          ? json.data
          : (json?.data?.data ?? []);

        setProducts(list);
        setTotalPages(
          Array.isArray(json?.data) ? 1 : (json?.data?.totalPages ?? 1),
        );
      } catch (err) {
        console.error("Failed to load products", err);
        setFailed(true);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [queryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- search component callbacks ---------- */
  // Enter / button / recent / trending → put the text in the URL ('' removes it)
  const onSearch = (q: string) =>
    updateParams({ search: q.trim() || undefined });

  // category dropdown → filter by that category ('' = all categories).
  // The subcategory belongs to the old category, so it is cleared too.
  const onCategoryChange = (_slug: string, name: string) =>
    updateParams({
      categoryName: name || undefined,
      subcategoryName: undefined,
    });

  const filterValues = {
    categoryName: get("categoryName"),
    subcategoryName: get("subcategoryName"),
    minPrice: get("minPrice"),
    maxPrice: get("maxPrice"),
    block: get("block"),
  };

  // number shown on the mobile "Filters" button
  const activeCount =
    (filterValues.categoryName ? 1 : 0) +
    (filterValues.subcategoryName ? 1 : 0) +
    (filterValues.minPrice || filterValues.maxPrice ? 1 : 0) +
    (filterValues.block ? 1 : 0);

  const filtersEl = (hideHeader: boolean) => (
    <ProductFilters
      values={filterValues}
      onChange={updateParams}
      onClear={clearAll}
      hideHeader={hideHeader}
    />
  );

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* top bar: title, then search (+ Filters button on mobile) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-extrabold text-purple-950 sm:mr-auto">
          {get("sections") || "All Products"}
        </h1>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* <div className="flex-1 min-w-0 sm:flex-none sm:w-[26rem]">
            <Search
              size="sm"
              placeholder="Search products..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={onSearch}
              selectedCategoryName={filterValues.categoryName}
              onCategoryChange={onCategoryChange}
            />
          </div> */}

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden relative shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-purple-200 bg-white text-sm font-bold text-purple-950 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 grid place-items-center min-w-5 h-5 px-1 rounded-full bg-amber-400 text-purple-950 text-[11px] font-bold">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* desktop sidebar */}
        <div className="hidden lg:block w-64 shrink-0 self-start sticky top-6">
          {filtersEl(false)}
        </div>

        {/* results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className={GRID}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={CELL}>
                  <CardSkeleton />
                </div>
              ))}
            </div>
          ) : failed ? (
            <p className="py-20 text-center text-slate-500">
              Something went wrong. Please try again.
            </p>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-600">No products match your filters.</p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-4 px-4 py-2 rounded-full bg-purple-950 text-white text-xs font-bold cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className={GRID}>
                {products.map((product) => (
                  <div key={product._id} className={CELL}>
                    <ProductCard
                      product={product}
                      SECTION="All"
                      onAdd={(p: Product) =>
                        router.push(`/products/${p.slug ?? p._id}`)
                      }
                    />
                  </div>
                ))}
              </div>

              {/* pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8 sm:mt-10">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                    className="px-3.5 sm:px-4 py-2 rounded-full border border-purple-200 text-xs sm:text-sm font-bold text-purple-950 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                  >
                    Previous
                  </button>
                  <span className="text-xs sm:text-sm text-slate-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => updateParams({ page: String(page + 1) })}
                    className="px-3.5 sm:px-4 py-2 rounded-full border border-purple-200 text-xs sm:text-sm font-bold text-purple-950 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* mobile filter drawer (slides in from the right) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          drawerOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!drawerOpen}
      >
        {/* backdrop */}
        <div
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* panel */}
        <div
          role="dialog"
          aria-label="Filters"
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl flex flex-col transition-transform duration-300 ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100">
            <h2 className="text-lg font-extrabold text-purple-950">Filters</h2>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close filters"
              className="p-1 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {filtersEl(true)}
          </div>

          <div className="flex items-center gap-3 px-5 py-4 border-t border-purple-100 bg-white">
            <button
              type="button"
              onClick={clearAll}
              disabled={activeCount === 0}
              className="flex-1 py-2.5 rounded-full border border-purple-200 text-sm font-bold text-purple-950 disabled:opacity-40 cursor-pointer disabled:cursor-default"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="flex-1 py-2.5 rounded-full bg-purple-950 text-white text-sm font-bold cursor-pointer"
            >
              Show results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* useSearchParams needs a Suspense boundary in the Next.js app router */
export default function ProductsPage() {
  return <ProductsContent />;
}
