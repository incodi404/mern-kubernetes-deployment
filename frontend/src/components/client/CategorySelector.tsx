"use client";

import { JSX, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Gift, LayoutGrid, PenTool, type LucideIcon } from "lucide-react";

type CategoryId = "GIFT" | "STATIONARY";

const CATEGORIES: { id: CategoryId | null; label: string; Icon: LucideIcon }[] =
  [
    { id: null, label: "All", Icon: LayoutGrid },
    { id: "GIFT", label: "Gifts", Icon: Gift },
    { id: "STATIONARY", label: "Stationery", Icon: PenTool },
  ];

interface CategoryFilterProps {
  /** called with "GIFT" / "STATIONARY", or "" for All (or when the active one is clicked again) */
  onSelect?: (value: string) => void;
  /** hide the "All" segment if you don't want it */
  showAll?: boolean;
}

export default function CategoryFilter({
  onSelect,
  showAll = true,
}: CategoryFilterProps): JSX.Element {
  const [active, setActive] = useState<CategoryId | null>(null);
  const reduceMotion = useReducedMotion();

  const choose = (id: CategoryId | null) => {
    // clicking the active one again clears the filter
    const next = id !== null && active === id ? null : id;
    setActive(next);
    onSelect?.(next ?? "");
  };

  const items = showAll ? CATEGORIES : CATEGORIES.filter((c) => c.id !== null);

  return (
    <div className="mt-6 flex w-full flex-col items-center justify-center gap-4 pb-2 pt-4">
      {/* Header */}
      <div className="text-center">
        <span className="block text-xs font-bold uppercase tracking-[0.2em] text-yellow-600">
          Browse
        </span>
        <h2
          id="best-saller-heading"
          className="mt-1 font-serif text-2xl font-extrabold text-purple-950 sm:text-3xl"
        >
          Explore By Category
        </h2>
        <span className="mx-auto mt-2 block h-1 w-12 rounded-full bg-yellow-400" />
      </div>

      {/* Segmented control */}
      <LayoutGroup id="category-filter">
        <div
          role="group"
          aria-label="Filter by category"
          className="
            relative inline-flex items-center gap-1 rounded-full
            border border-purple-100 bg-white p-1.5
            shadow-[0_10px_30px_-12px_rgba(59,7,100,0.35)]
          "
        >
          {items.map(({ id, label, Icon }) => {
            const selected = active === id;

            return (
              <motion.button
                key={label}
                type="button"
                onClick={() => choose(id)}
                aria-pressed={selected}
                whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                className="
                  group relative flex items-center gap-2 rounded-full
                  px-4 py-2.5 text-sm font-bold sm:px-6 sm:text-base
                  outline-none transition-colors
                  focus-visible:ring-2 focus-visible:ring-yellow-400
                  focus-visible:ring-offset-2
                "
              >
                {/* Sliding highlight */}
                {selected && (
                  <motion.span
                    layoutId="category-pill"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-purple-950 shadow-[0_6px_16px_-6px_rgba(59,7,100,0.7)] ring-1 ring-yellow-400/70"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                  />
                )}

                {/* Soft hover wash (only for non-selected) */}
                {!selected && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-purple-50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  />
                )}

                <span
                  className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${
                    selected
                      ? "text-white"
                      : "text-purple-900 group-hover:text-purple-950"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors duration-200 ${
                      selected
                        ? "text-yellow-300"
                        : "text-purple-600 group-hover:text-purple-800"
                    }`}
                  />
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
