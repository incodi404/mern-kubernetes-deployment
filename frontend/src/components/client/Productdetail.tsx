"use client";

import { SERVER_URL, WHATSAPP_NUMBER } from "@/constant";
import { ChevronRight, MessageCircle, Minus, Plus, Star } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import RelatedProducts from "./Relatedproducts";
import RequestBooking from "./RequestBooking";

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
  description?: string;
  images?: string[];
  variant?: Variant[];
  sections?: string[];
  block?: string;
  rating?: number;
  subcategories?: { name: string }[];
  categories?: { name: string }[];
}

const rupee = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const getImageUrl = (image?: string) =>
  image ? `${SERVER_URL}/file/get/${image}` : "";

export default function ProductDetail({ product }: { product: Product }) {
  const variants = product.variant ?? [];
  const images = product.images ?? [];

  // default to the cheapest variant, same as the card
  const defaultVariantId = useMemo(() => {
    if (variants.length === 0) return "";
    return variants.reduce((best, v) =>
      v.sellingPrice < best.sellingPrice ? v : best,
    ).variantId;
  }, [variants]);

  const [variantId, setVariantId] = useState(defaultVariantId);
  const [activeImg, setActiveImg] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [qty, setQty] = useState(1);

  const variant = variants.find((v) => v.variantId === variantId);
  const category = product.categories?.[0]?.name;
  const subcategory = product.subcategories?.[0]?.name;
  const subcategoryNames = (product.subcategories ?? []).map((s) => s.name);

  const percentOff =
    variant && variant.mrp > variant.sellingPrice
      ? Math.round(((variant.mrp - variant.sellingPrice) / variant.mrp) * 100)
      : 0;

  const total = variant ? variant.sellingPrice * qty : 0;

  const rating = Math.max(0, Math.min(5, product.rating ?? 0));

  return (
    <>
      <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-6xl mx-auto">
        {/* breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center flex-wrap gap-1 text-xs sm:text-sm text-slate-500 mb-5 sm:mb-8"
        >
          <Link href="/products" className="hover:text-purple-800">
            Products
          </Link>
          {subcategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                href={`/products?subcategoryName=${encodeURIComponent(subcategory)}`}
                className="hover:text-purple-800"
              >
                {subcategory}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold line-clamp-1">
            {product.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* ---------- gallery ---------- */}
          <div>
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-linear-to-tr from-purple-50/70 to-slate-50 border border-purple-50 flex items-center justify-center">
              {images[activeImg] && !failed[activeImg] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getImageUrl(images[activeImg])}
                  alt={product.title}
                  onError={() =>
                    setFailed((f) => ({ ...f, [activeImg]: true }))
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="px-3 text-center text-sm font-semibold text-purple-900/60 uppercase tracking-widest">
                  {subcategory ?? "No image"}
                </span>
              )}

              {percentOff > 0 && (
                <span className="absolute top-3 left-3 text-xs font-extrabold px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 shadow-sm">
                  {percentOff}% OFF
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${
                      i === activeImg
                        ? "border-purple-700"
                        : "border-slate-200 hover:border-purple-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageUrl(img)}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---------- info ---------- */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {(product.sections ?? []).map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800"
                >
                  {s}
                </span>
              ))}
              {category && (
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">
                  {category}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
              {product.title}
            </h1>
            {product.subTitle && (
              <p className="mt-1 text-sm sm:text-base text-slate-500">
                {product.subTitle}
              </p>
            )}

            {rating > 0 && (
              <div
                className="flex items-center gap-1 mt-3"
                aria-label={`Rated ${rating} out of 5`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
                <span className="ml-1 text-xs font-semibold text-slate-600">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* price */}
            <div className="mt-5 flex items-baseline flex-wrap gap-x-3 gap-y-1">
              {variant ? (
                <>
                  <span className="text-3xl font-extrabold text-purple-950">
                    {rupee(variant.sellingPrice)}
                  </span>
                  {percentOff > 0 && (
                    <>
                      <span className="text-base text-slate-400 line-through">
                        {rupee(variant.mrp)}
                      </span>
                      <span className="text-sm font-bold text-amber-700">
                        {percentOff}% OFF
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-sm text-slate-400">
                  Price unavailable
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Inclusive of all taxes
            </p>

            {/* variants */}
            {variants.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-bold text-slate-900 mb-2">
                  Select option
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const selected = v.variantId === variantId;
                    return (
                      <button
                        key={v.variantId}
                        type="button"
                        onClick={() => setVariantId(v.variantId)}
                        aria-pressed={selected}
                        className={`px-4 py-2 rounded-xl border text-sm font-bold cursor-pointer transition-all ${
                          selected
                            ? "border-purple-700 bg-purple-950 text-white"
                            : "border-purple-200 bg-white text-purple-950 hover:border-purple-400"
                        }`}
                      >
                        {v.value}
                        <span
                          className={`ml-2 text-xs font-semibold ${
                            selected ? "text-amber-300" : "text-slate-500"
                          }`}
                        >
                          {rupee(v.sellingPrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* quantity + order */}
            <div className="mt-6 flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-purple-200 bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={qty <= 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 grid place-items-center text-purple-950 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-purple-950">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="w-10 h-10 grid place-items-center text-purple-950 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {variant && qty > 1 && (
                <span className="text-sm font-bold text-slate-700">
                  Total {rupee(total)}
                </span>
              )}
            </div>

            <div className="mt-4">
              <RequestBooking
                quantity={qty}
                travel={product}
                variantId={variant?.variantId || ""}
              >
                <button
                  type="button"
                  className="flex w-full sm:w-auto sm:inline-flex justify-center items-center gap-2 px-6 py-3 rounded-full bg-amber-400 text-black font-bold text-sm hover:bg-amber-300 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  {variant ? "Request Order" : "Out of stock"}
                </button>
              </RequestBooking>
            </div>

            {/* description */}
            {product.description && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h2 className="text-base font-extrabold text-purple-950 mb-2">
                  Description
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* full-width: other products from the same subcategory(ies), loads more on scroll */}
      {subcategoryNames.length > 0 && (
        <div className="px-3 sm:px-6 lg:px-8 pb-10 sm:pb-14">
          <RelatedProducts
            key={product._id}
            currentId={product._id}
            subcategoryNames={subcategoryNames}
          />
        </div>
      )}
    </>
  );
}
