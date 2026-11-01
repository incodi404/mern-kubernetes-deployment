'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gift,
  BookOpen,
  PenTool,
  Palette,
  Sparkles,
  Briefcase,
  PartyPopper,
  HeartHandshake,
  PackageOpen,
  Mail,
  Layers,
  Tag,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import { VisualCategoryItem } from '@/types/navigation';
import { VISUAL_CATEGORY_STRIP } from '@/data/navigationData';

const ICON_MAP: Record<string, LucideIcon> = {
  Gift,
  BookOpen,
  PenTool,
  Palette,
  Sparkles,
  Briefcase,
  PartyPopper,
  HeartHandshake,
  PackageOpen,
  MailOpen: Mail,
  Layers,
  Tag,
};

interface VisualCategoryStripProps {
  items?: VisualCategoryItem[];
  className?: string;
  onItemClick?: (item: VisualCategoryItem) => void;
}

export default function VisualCategoryStrip({
  items = VISUAL_CATEGORY_STRIP,
  className = '',
  onItemClick,
}: VisualCategoryStripProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -320 : 320;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Category Highlights"
      className={`relative w-full bg-white border-b border-purple-100/60 shadow-[0_2px_8px_-4px_rgba(88,28,135,0.04)] ${className}`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-16 relative">
        {/* Left Scroll Arrow */}
        <button
          type="button"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white text-purple-900 shadow-md border border-purple-100 transition-all duration-200 cursor-pointer ${
            canScrollLeft
              ? 'opacity-100 hover:bg-purple-50 hover:scale-105 active:scale-95'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-5 h-5 text-purple-900" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center justify-between gap-3 sm:gap-6 py-3.5 overflow-x-auto scroll-smooth scrollbar-none no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => {
            const IconComponent = ICON_MAP[item.iconName] || Gift;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onItemClick?.(item)}
                className="group relative flex flex-col items-center gap-2 shrink-0 py-1 px-1.5 focus:outline-none rounded-xl transition-all duration-200"
              >
                {/* Visual Icon Circle */}
                <div className="relative">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-200 border ${
                      item.highlight
                        ? 'bg-gradient-to-br from-purple-50 to-amber-50/50 border-amber-300/80 shadow-xs group-hover:border-amber-400 group-hover:shadow-md'
                        : 'bg-slate-50/90 border-purple-100/70 group-hover:border-purple-300 group-hover:bg-purple-50/50 group-hover:shadow-sm'
                    } group-hover:-translate-y-1`}
                  >
                    <IconComponent
                      className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-200 ${
                        item.highlight
                          ? 'text-purple-900 group-hover:text-amber-600'
                          : 'text-purple-800 group-hover:text-purple-950'
                      }`}
                      strokeWidth={1.8}
                    />
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <span
                      className={`absolute -top-1.5 -right-2 text-[10px] font-bold tracking-tight px-1.5 py-0.2 rounded-full uppercase shadow-xs ${
                        item.badge.toLowerCase() === 'hot'
                          ? 'bg-amber-400 text-amber-950 border border-amber-300'
                          : 'bg-purple-800 text-white border border-purple-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className="text-xs font-medium text-slate-700 group-hover:text-purple-900 transition-colors duration-200 text-center max-w-[80px] sm:max-w-[92px] leading-tight line-clamp-1">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          type="button"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white text-purple-900 shadow-md border border-purple-100 transition-all duration-200 cursor-pointer ${
            canScrollRight
              ? 'opacity-100 hover:bg-purple-50 hover:scale-105 active:scale-95'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronRight className="w-5 h-5 text-purple-900" />
        </button>
      </div>
    </nav>
  );
}
