'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER_URL } from '@/constant';

interface Category {
  _id: string;
  name: string;
}

interface Subcategory {
  _id: string;
  name: string;
  catagoryId: string; // (sic) matches your backend field name
}

const BLOCK_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Gifts', value: 'GIFT' },
  { label: 'Stationery', value: 'STATIONARY' },
];

/*
 * Price slider settings.
 * PRICE_MAX is the right end of the slider. If the right handle is left at
 * PRICE_MAX, no maxPrice is sent (= no upper limit), same as an empty Max box.
 * Change these two numbers to match your catalogue.
 */
const PRICE_MAX = 2000;
const PRICE_STEP = 50;

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

interface ProductFiltersProps {
  /** current values, read from the URL */
  values: {
    categoryName: string;
    subcategoryName: string;
    minPrice: string;
    maxPrice: string;
    block: string;
  };
  /** update one or more URL params (undefined/"" removes the param) */
  onChange: (updates: Record<string, string | undefined>) => void;
  onClear: () => void;
  /** hide the built-in "Filters / Clear all" header (the mobile drawer has its own) */
  hideHeader?: boolean;
}

const extractList = <T,>(json: any): T[] =>
  Array.isArray(json?.data) ? json.data : (json?.data?.data ?? []);

/* URL string -> slider number (clamped to the slider range) */
const toLow = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(n, PRICE_MAX - PRICE_STEP) : 0;
};
const toHigh = (v: string) => {
  const n = Number(v);
  return v && Number.isFinite(n) && n > 0 ? Math.min(n, PRICE_MAX) : PRICE_MAX;
};

export default function ProductFilters({
  values,
  onChange,
  onClear,
  hideHeader = false,
}: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // local slider values (applied on button click, like the old Min/Max boxes)
  const [low, setLow] = useState(toLow(values.minPrice));
  const [high, setHigh] = useState(toHigh(values.maxPrice));

  // keep the slider in sync when the URL changes (Clear all, back button...)
  useEffect(() => setLow(toLow(values.minPrice)), [values.minPrice]);
  useEffect(() => setHigh(toHigh(values.maxPrice)), [values.maxPrice]);

  /* ---------- load categories + subcategories once ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [cat, sub] = await Promise.all([
          axios.get(`${SERVER_URL}/category/1/20`, {
            params: { isActive: true },
          }),
          axios.get(`${SERVER_URL}/subcategory/1/50`, {
            params: { isActive: true },
          }),
        ]);
        setCategories(extractList<Category>(cat.data));
        setSubcategories(extractList<Subcategory>(sub.data));
      } catch (err) {
        console.error('Failed to load filters', err);
      }
    };
    load();
  }, []);

  const selectedCategory = categories.find(
    (c) => c.name === values.categoryName,
  );
  const visibleSubcategories = selectedCategory
    ? subcategories.filter(
        (s) => String(s.catagoryId) === String(selectedCategory._id),
      )
    : [];

  const applyPrice = () => {
    onChange({
      // left handle at 0 = no minimum, right handle at the end = no maximum
      minPrice: low > 0 ? String(low) : undefined,
      maxPrice: high < PRICE_MAX ? String(high) : undefined,
    });
  };

  const hasFilters =
    values.categoryName ||
    values.subcategoryName ||
    values.minPrice ||
    values.maxPrice ||
    values.block;

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
      active
        ? 'bg-purple-950 border-purple-950 text-white'
        : 'bg-white border-purple-200 text-purple-950 hover:bg-purple-50'
    }`;

  // slider geometry
  const lowPct = (low / PRICE_MAX) * 100;
  const highPct = (high / PRICE_MAX) * 100;
  // when both handles are near the right end, put the left one on top
  // so it can still be grabbed
  const lowOnTop = low > PRICE_MAX - PRICE_STEP * 4;

  return (
    <aside className="space-y-7">
      {/* styles for the two overlapping range inputs */}
      <style>{`
        .price-range {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          background: transparent;
          pointer-events: none;
          -webkit-appearance: none;
          appearance: none;
        }
        .price-range::-webkit-slider-runnable-track {
          -webkit-appearance: none;
          background: transparent;
          height: 100%;
        }
        .price-range::-moz-range-track {
          background: transparent;
          height: 100%;
        }
        .price-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: #fff;
          border: 3px solid #3b0764;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
          cursor: grab;
        }
        .price-range::-moz-range-thumb {
          pointer-events: auto;
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: #fff;
          border: 3px solid #3b0764;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
          cursor: grab;
        }
        .price-range:active::-webkit-slider-thumb { cursor: grabbing; }
        .price-range:focus-visible::-webkit-slider-thumb {
          outline: 3px solid rgba(251, 191, 36, 0.6);
          outline-offset: 2px;
        }
        .price-range:focus-visible::-moz-range-thumb {
          outline: 3px solid rgba(251, 191, 36, 0.6);
          outline-offset: 2px;
        }
      `}</style>

      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-purple-950">Filters</h2>
          {hasFilters ? (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
            >
              Clear all
            </button>
          ) : null}
        </div>
      )}

      {/* Block */}
      <section>
        <h3 className="mb-3 text-sm font-bold text-slate-700">Type</h3>
        <div className="flex flex-wrap gap-2">
          {BLOCK_OPTIONS.map((b) => (
            <button
              key={b.value || 'all'}
              type="button"
              className={chip(values.block === b.value)}
              onClick={() => onChange({ block: b.value || undefined })}
            >
              {b.label}
            </button>
          ))}
        </div>
      </section>

      {/* Category */}
      <section>
        <h3 className="mb-3 text-sm font-bold text-slate-700">Category</h3>
        <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          <li>
            <button
              type="button"
              onClick={() =>
                onChange({ categoryName: undefined, subcategoryName: undefined })
              }
              className={`text-sm cursor-pointer ${
                !values.categoryName
                  ? 'font-bold text-purple-950'
                  : 'text-slate-600 hover:text-purple-900'
              }`}
            >
              All categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c._id}>
              <button
                type="button"
                onClick={() =>
                  onChange({ categoryName: c.name, subcategoryName: undefined })
                }
                className={`text-sm text-left cursor-pointer ${
                  values.categoryName === c.name
                    ? 'font-bold text-purple-950'
                    : 'text-slate-600 hover:text-purple-900'
                }`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Subcategory (only after a category is chosen) */}
      {visibleSubcategories.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-bold text-slate-700">
            Subcategory
          </h3>
          <div className="flex flex-wrap gap-2">
            {visibleSubcategories.map((s) => (
              <button
                key={s._id}
                type="button"
                className={chip(values.subcategoryName === s.name)}
                onClick={() =>
                  onChange({
                    subcategoryName:
                      values.subcategoryName === s.name ? undefined : s.name,
                  })
                }
              >
                {s.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Price slider */}
      <section>
        <h3 className="mb-3 text-sm font-bold text-slate-700">Price (₹)</h3>

        {/* current range */}
        <div className="mb-4 flex items-center justify-between text-sm font-semibold text-purple-950">
          <span>{formatINR(low)}</span>
          <span>
            {high >= PRICE_MAX ? `${formatINR(PRICE_MAX)}+` : formatINR(high)}
          </span>
        </div>

        {/* track + two overlapping range inputs */}
        <div className="relative mx-2.5 h-5">
          {/* grey track */}
          <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-purple-100" />
          {/* selected part */}
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-purple-950"
            style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
          />

          <input
            type="range"
            className="price-range"
            min={0}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={low}
            aria-label="Minimum price"
            style={{ zIndex: lowOnTop ? 4 : 3 }}
            onChange={(e) =>
              setLow(Math.min(Number(e.target.value), high - PRICE_STEP))
            }
          />
          <input
            type="range"
            className="price-range"
            min={0}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={high}
            aria-label="Maximum price"
            style={{ zIndex: 3 }}
            onChange={(e) =>
              setHigh(Math.max(Number(e.target.value), low + PRICE_STEP))
            }
          />
        </div>

        <button
          type="button"
          onClick={applyPrice}
          className="mt-4 w-full py-2 rounded-lg bg-purple-950 text-white text-xs font-bold hover:bg-purple-900 transition-colors cursor-pointer"
        >
          Apply
        </button>
      </section>
    </aside>
  );
}