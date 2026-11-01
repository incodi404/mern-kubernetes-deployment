"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import CardSkeleton from "./CardSkeleton";
import ProductCard from "./ProductCard";
import type { Product } from "./Productsections";

const LIMIT = 8;

/* same helpers / layout as the products list page */
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const CELL = "min-w-0 [&>*]:!w-full [&>*]:!min-w-0 [&>*]:!max-w-none";
/*
 * mobile / tablet: 2 and 3 columns that fill the row (as before).
 * desktop (lg+): fixed 16rem columns, as many as fit the full width,
 * spread edge to edge, so the cards keep the same size on wide screens.
 */
const GRID =
  "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,16rem)] lg:justify-between gap-3 sm:gap-5";

export default function RelatedProducts({
  currentId,
  subcategoryNames,
}: {
  currentId: string;
  subcategoryNames: string[];
}) {
  const router = useRouter();

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [failed, setFailed] = useState(false);

  // refs so the loader always sees the latest page and never double-fires
  const pageRef = useRef(1); // next page to fetch
  const busyRef = useRef(false);
  const hasMoreRef = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // exact match on any of this product's subcategories: ^(A|B)$
  const pattern = subcategoryNames.length
    ? `^(${subcategoryNames.map(escapeRegex).join("|")})$`
    : undefined;

  const loadMore = useCallback(async () => {
    if (busyRef.current || !hasMoreRef.current || !pattern) return;

    busyRef.current = true;
    setLoading(true);
    setFailed(false);

    try {
      const { data: json } = await axios.get(
        `${SERVER_URL}/product/${pageRef.current}/${LIMIT}`,
        { params: { isActive: true, subcategoryName: pattern } },
      );

      // backend returns [] when empty, otherwise { data: [...], totalPages }
      const list: Product[] = Array.isArray(json?.data)
        ? json.data
        : (json?.data?.data ?? []);
      const totalPages: number = Array.isArray(json?.data)
        ? 1
        : (json?.data?.totalPages ?? 1);

      // skip the product we are already looking at, and any duplicates
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p._id));
        return [
          ...prev,
          ...list.filter((p) => p._id !== currentId && !seen.has(p._id)),
        ];
      });

      const more = list.length > 0 && pageRef.current < totalPages;
      hasMoreRef.current = more;
      setHasMore(more);
      pageRef.current += 1;
    } catch (err) {
      console.error("Failed to load related products", err);
      setFailed(true);
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }, [pattern, currentId]);

  /*
   * When the bottom sentinel comes into view, load the next page.
   * The observer is re-created after every load, so if the new cards
   * still don't fill the screen it fires again and loads another page.
   */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || failed || loading) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, hasMore, failed, loading]);

  // nothing in the same subcategory
  if (!pattern || (!hasMore && items.length === 0 && !failed)) return null;

  return (
    <section className="mt-12 sm:mt-16 pt-8 border-t border-slate-100">
      <h2 className="text-lg sm:text-2xl font-extrabold text-purple-950 mb-4 sm:mb-6">
        Suggestions
      </h2>

      {items.length > 0 && (
        <div className={GRID}>
          {items.map((product) => (
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
      )}

      {loading && (
        <div className={`${GRID} ${items.length > 0 ? "mt-3 sm:mt-5" : ""}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={CELL}>
              <CardSkeleton />
            </div>
          ))}
        </div>
      )}

      {failed && (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-500">
            Couldn&apos;t load more products.
          </p>
          <button
            type="button"
            onClick={loadMore}
            className="mt-3 px-4 py-2 rounded-full bg-purple-950 text-white text-xs font-bold cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {/* when this scrolls into view, the next page loads */}
      {hasMore && <div ref={sentinelRef} className="h-1" aria-hidden />}
    </section>
  );
}