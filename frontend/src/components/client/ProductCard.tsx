"use client";

import { PRODUCT_HREF, SERVER_URL } from "@/constant";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import RequestBooking from "./RequestBooking";
import { FiSend } from "react-icons/fi";

interface Variant {
  value: string;
  variantId: string;
  mrp: number;
  discount: number;
  sellingPrice: number;
}

interface Product {
  _id: string;
  slug: string;
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
    undefined,
  );

function ProductCard({
  product,
  onAdd,
  SECTION,
}: {
  product: Product;
  onAdd: (p: Product) => void;
  SECTION?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const variant = cheapestVariant(product);
  const category = product.subcategories?.[0]?.name;
  const image = product.images?.[0];

  const getImageUrl = (image?: string) => {
    if (!image) return "";
    return `${SERVER_URL}/file/get/${image}`;
  };

  const percentOff =
    variant && variant.mrp > variant.sellingPrice
      ? Math.round(((variant.mrp - variant.sellingPrice) / variant.mrp) * 100)
      : 0;

  return (
    <article className="w-full h-full group bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-purple-200 hover:shadow-xl transition-all duration-300 p-2 sm:p-4 flex flex-col justify-between">
      <div>
        {/* desktop only: section badge row */}
        <div className="hidden sm:flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
            {product.sections?.[0] ?? SECTION}
          </span>
          {/* wishlist button (commented out) */}
        </div>

        <Link href={PRODUCT_HREF(product.slug)} className="block">
          {/* image */}
          <div className="relative w-full h-36 sm:h-44 rounded-lg sm:rounded-xl overflow-hidden bg-linear-to-tr from-purple-50/70 to-slate-50 flex items-center justify-center border border-purple-50 mb-2.5 sm:mb-4">
            {image && !imgFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getImageUrl(image)}
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

            {/* mobile only: section badge on image (top-left) */}
            <span className="sm:hidden absolute top-1.5 left-1.5 max-w-[75%] truncate text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur text-purple-800 shadow-sm">
              {product.sections?.[0] ?? SECTION}
            </span>

            {/* mobile only: discount badge on image (bottom-left) */}
            {variant && percentOff > 0 && (
              <span className="sm:hidden absolute bottom-1.5 left-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-sm">
                {percentOff}% OFF
              </span>
            )}
          </div>

          {category && (
            <p className="text-[10px] sm:text-[11px] font-bold text-purple-700 uppercase tracking-wide truncate">
              {category}
            </p>
          )}
          <h3 className="text-[13px] sm:text-sm font-bold text-slate-900 group-hover:text-purple-950 transition-colors line-clamp-1 mt-0.5">
            {product.title}
          </h3>
          {product.subTitle && (
            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5 sm:mt-1">
              {product.subTitle}
            </p>
          )}
        </Link>
      </div>

      {/* price + add */}
      <div className="pt-2.5 sm:pt-4 mt-2.5 sm:mt-3 border-t border-slate-100 flex items-center justify-between gap-2 sm:gap-3">
        <div className="min-w-0 sm:w-auto flex flex-col items-start">
          {variant ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1.5">
                <span className="text-[15px] sm:text-base leading-tight font-extrabold text-purple-950">
                  {rupee(variant.sellingPrice)}
                </span>
                {percentOff > 0 && (
                  <span className="text-[11px] sm:text-xs leading-tight text-slate-400 line-through">
                    {rupee(variant.mrp)}
                  </span>
                )}
              </div>
              {/* desktop only: % off under the price */}
              {percentOff > 0 && (
                <span className="hidden sm:block text-[10px] font-bold text-amber-700">
                  {percentOff}% OFF
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-400">Price unavailable</span>
          )}
        </div>

        <RequestBooking
          quantity={1}
          travel={product}
          variantId={variant?.variantId || ""}
        >
          <button
            type="button"
            aria-label="Add to cart"
            className="flex shrink-0 justify-center items-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-full sm:rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs transition-all cursor-pointer"
          >
            <FiSend className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Interested</span>
          </button>
        </RequestBooking>
      </div>
    </article>
  );
}

export default ProductCard;
