"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search as SearchIcon, X, ChevronDown, History } from "lucide-react";
import { SEARCH_CATEGORY_OPTIONS, search_options } from "@/data/navigationData";

const RECENT_KEY = "recent_searches";
const RECENT_MAX = 5;

export interface SearchProps {
  placeholder?: string;
  buttonText?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onSearch?: (query: string, category: string) => void;
  showCategorySelector?: boolean;
  showSuggestions?: boolean;
  /**
   * Optional: control the category by slug ('all' or '' = all).
   * Prefer `selectedCategoryName` — names are what the URL uses.
   */
  selectedCategory?: string;
  /**
   * Controls the category by its NAME instead of its slug ('' = all).
   * Use this on pages that keep the category name in the URL (e.g. /products).
   */
  selectedCategoryName?: string;
  /**
   * Called when a category is picked. If you don't pass it, the component
   * redirects to /products?categoryName=<name> by itself.
   */
  onCategoryChange?: (category: string, categoryName: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export default function Search({
  placeholder = "What are you looking for?",
  buttonText = "Search",
  value: controlledValue,
  onChange,
  onClick,
  onSearch,
  showCategorySelector = true,
  showSuggestions = true,
  selectedCategory: controlledCategory,
  selectedCategoryName,
  onCategoryChange,
  className = "",
  size = "md",
  fullWidth = true,
}: SearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // category currently in the URL ('' = none)
  const urlCategoryName = searchParams.get("categoryName") ?? "";

  // Internal state fallback for uncontrolled usage
  const [internalQuery, setInternalQuery] = useState("");
  // NOTE: the category is tracked by NAME ('' = all), never by slug.
  // The category API items may not have a slug, which caused every pick
  // to fall back to the first category (Games).
  const [internalCategoryName, setInternalCategoryName] =
    useState(urlCategoryName);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentLoaded, setRecentLoaded] = useState(false);
  const [catName, setCatName] = useState<any[]>([]);

  // keep the dropdown in sync with the URL (navigation, back button, refresh)
  useEffect(() => {
    setInternalCategoryName(urlCategoryName);
  }, [urlCategoryName]);

  // load categories from the API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await search_options();
        setCatName(res?.data?.data ?? []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    load();
  }, []);

  // load saved recent searches once (localStorage only exists in the browser)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          setRecentSearches(
            arr.filter((x) => typeof x === "string").slice(0, RECENT_MAX),
          );
        }
      }
    } catch {
      /* ignore broken / blocked storage */
    }
    setRecentLoaded(true);
  }, []);

  // save them every time they change (after the first load)
  useEffect(() => {
    if (!recentLoaded) return;
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(recentSearches));
    } catch {
      /* ignore */
    }
  }, [recentSearches, recentLoaded]);

  const query = controlledValue !== undefined ? controlledValue : internalQuery;

  const allLabel = SEARCH_CATEGORY_OPTIONS[0]?.name ?? "All Categories";

  // The ONE source of truth for the selected category ('' = all categories)
  let currentCategoryName = internalCategoryName;
  if (selectedCategoryName !== undefined) {
    currentCategoryName = selectedCategoryName;
  } else if (controlledCategory !== undefined) {
    currentCategoryName =
      controlledCategory === "" || controlledCategory === "all"
        ? ""
        : (catName.find((c: any) => c.slug === controlledCategory)?.name ?? "");
  }

  // text shown on the dropdown button
  const categoryLabel = currentCategoryName || allLabel;

  // value passed to the onSearch callback ('all' when nothing is selected)
  const currentCategory = currentCategoryName || "all";

  // "All" first, then the categories from the API
  const categoryOptions: any[] = [
    { _id: "all", name: allLabel, isAll: true },
    ...catName,
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (controlledValue === undefined) {
      setInternalQuery(e.target.value);
    }
    onChange?.(e);
  };

  const handleCategorySelect = (category: { slug?: string; name: string }) => {
    setInternalCategoryName(category.name);
    setIsCategoryOpen(false);

    // the page owns the category (e.g. /products): let it update its URL
    if (onCategoryChange) {
      onCategoryChange(category.slug ?? "", category.name);
      inputRef.current?.focus();
      return;
    }

    // default: go to the products page with the category filter
    const params = new URLSearchParams();
    if (category.name) params.set("categoryName", category.name);
    if (query.trim()) params.set("search", query.trim());
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  const triggerSearch = (searchQuery: string, categoryValue: string) => {
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      // lets a page that owns the search (like /products) clear it
      if (onSearch) {
        setIsFocused(false);
        onSearch("", categoryValue);
      }
      return;
    }

    // Save to recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== trimmed.toLowerCase(),
      );
      return [trimmed, ...filtered].slice(0, RECENT_MAX);
    });

    setIsFocused(false);

    if (onSearch) {
      onSearch(trimmed, categoryValue);
    } else {
      // default: go to the products page, same URL format ProductsContent reads
      // e.g. /products?search=pen&categoryName=Stationery
      const params = new URLSearchParams();
      params.set("search", trimmed);
      if (currentCategoryName) {
        params.set("categoryName", currentCategoryName);
      }
      router.push(`/products?${params.toString()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSearch(query, currentCategory);
    } else if (e.key === "Escape") {
      setIsFocused(false);
      setIsCategoryOpen(false);
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    } else {
      triggerSearch(query, currentCategory);
    }
  };

  const handleClear = () => {
    if (controlledValue === undefined) {
      setInternalQuery("");
    } else {
      const synthEvent = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(synthEvent);
    }
    inputRef.current?.focus();
  };

  const selectSuggestion = (suggestion: string) => {
    if (controlledValue === undefined) {
      setInternalQuery(suggestion);
    } else {
      const synthEvent = {
        target: { value: suggestion },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(synthEvent);
    }
    triggerSearch(suggestion, currentCategory);
  };

  const sizeClasses = {
    sm: "h-10 text-xs",
    md: "h-12 text-sm",
    lg: "h-14 text-base",
  }[size];

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? "w-full" : "w-auto"} ${className}`}
    >
      {/* Search Input Container */}
      <div
        className={`relative flex items-center bg-white rounded-full border transition-all duration-200 ${sizeClasses} ${
          isFocused
            ? "border-purple-600 ring-4 ring-purple-600/10 shadow-[0_8px_24px_-6px_rgba(88,28,135,0.15)]"
            : "border-slate-200/90 hover:border-slate-300 shadow-xs"
        }`}
      >
        {/* Category Dropdown Selector */}
        {showCategorySelector && (
          <div className="relative shrink-0 hidden sm:block">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-1.5 pl-4 pr-3 py-2 text-xs font-semibold text-purple-950 hover:text-purple-700 transition-colors focus:outline-none cursor-pointer select-none"
              aria-expanded={isCategoryOpen}
              aria-haspopup="listbox"
            >
              <span className="max-w-[110px] truncate">{categoryLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-purple-900/70 transition-transform duration-200 ${
                  isCategoryOpen ? "rotate-180 text-purple-900" : ""
                }`}
              />
            </button>

            {/* Category Dropdown Menu */}
            {isCategoryOpen && (
              <div className="absolute left-2 top-full mt-2 w-48 max-h-72 overflow-y-auto bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Filter by Category
                </div>
                <ul role="listbox">
                  {categoryOptions.map((cat: any) => {
                    const isAll = cat.isAll === true;
                    const isSelected = isAll
                      ? currentCategoryName === ""
                      : cat.name === currentCategoryName;
                    return (
                      <li key={cat._id ?? cat.name}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() =>
                            handleCategorySelect({
                              slug: cat.slug,
                              name: isAll ? "" : cat.name,
                            })
                          }
                          className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-purple-50 text-purple-900 font-bold"
                              : "text-slate-700 hover:bg-slate-50 hover:text-purple-800"
                          }`}
                        >
                          <span>{cat.name}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-700" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Divider if Category selector is shown */}
        {showCategorySelector && (
          <div className="hidden sm:block h-5 w-[1px] bg-slate-200 shrink-0" />
        )}

        {/* Search Icon */}
        <div className="pl-4 pr-2 text-slate-400 shrink-0 flex items-center pointer-events-none">
          <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-900/60" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          aria-label="Search items"
          className="w-full h-full bg-transparent text-slate-900 placeholder:text-slate-400 placeholder:font-normal text-xs sm:text-sm font-medium focus:outline-none pr-2"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search input"
            className="p-1 mr-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Action Button */}
        <div className="pr-1.5 shrink-0">
          <button
            type="button"
            onClick={handleButtonClick}
            className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm transition-all duration-150 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            <span className="hidden md:inline">{buttonText}</span>
            <SearchIcon className="w-3.5 h-3.5 md:hidden" />
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown Overlay */}
      {showSuggestions && isFocused && recentSearches.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-purple-100 p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Recent Searches */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-purple-700" />
                Recent Searches
              </span>
              <button
                type="button"
                onClick={() => setRecentSearches([])}
                className="text-[11px] text-slate-400 hover:text-purple-800 transition-colors cursor-pointer lowercase"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSuggestion(item)}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-900 border border-slate-200/80 transition-colors cursor-pointer"
                >
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
