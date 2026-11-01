'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';
import { NavCategory } from '@/types/navigation';

interface MegaMenuProps {
  category: NavCategory;
  onClose?: () => void;
}

export default function MegaMenu({ category, onClose }: MegaMenuProps) {
  if (!category.columns || category.columns.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label={`${category.name} Menu`}
      className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-md border-b border-purple-100/80 shadow-[0_20px_40px_-15px_rgba(88,28,135,0.12)] z-40 transition-all duration-200 animate-in fade-in slide-in-from-top-1"
    >
      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-16 py-8">
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Subcategory Columns */}
          <div
            className={`grid gap-8 ${category.promoCard
                ? 'col-span-8 lg:col-span-9 grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                : 'col-span-12 grid-cols-2 md:grid-cols-4 xl:grid-cols-5'
              }`}
          >
            {category.columns.map((col, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-purple-100/70">
                  <h4 className="text-sm font-bold tracking-tight text-purple-950 uppercase">
                    {col.title}
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {col.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="group flex items-center justify-between text-sm text-slate-600 hover:text-purple-800 transition-all duration-150 py-0.5"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-150 inline-flex items-center gap-1.5">
                          {item.name}
                        </span>

                        {item.isHot && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            <Flame className="w-2.5 h-2.5 text-amber-600" />
                            HOT
                          </span>
                        )}

                        {item.isNew && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                            NEW
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Promotional Card on the Right (if available) */}
          {category.promoCard && (
            <div className="col-span-4 lg:col-span-3">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 p-6 text-white shadow-lg border border-purple-800/40">
                {/* Decorative background glow */}
                <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -left-6 -top-6 w-32 h-32 bg-purple-500/15 rounded-full blur-xl pointer-events-none" />

                <div className="relative z-10 space-y-3">
                  {category.promoCard.badge && (
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                      {category.promoCard.badge}
                    </span>
                  )}

                  <h3 className="text-lg font-bold tracking-tight text-white leading-snug">
                    {category.promoCard.title}
                  </h3>

                  <p className="text-xs text-purple-200/90 leading-relaxed">
                    {category.promoCard.subtitle}
                  </p>

                  {category.promoCard.tagline && (
                    <p className="text-[11px] font-medium text-amber-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      {category.promoCard.tagline}
                    </p>
                  )}

                  <div className="pt-2">
                    <Link
                      href={category.promoCard.ctaHref}
                      onClick={onClose}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 group"
                    >
                      <span>{category.promoCard.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mega Menu Footer Link */}
        <div className="mt-6 pt-4 border-t border-purple-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Explore all in{' '}
            <strong className="text-purple-950 font-semibold">{category.name}</strong>
          </span>
          <Link
            href={category.href}
            onClick={onClose}
            className="text-purple-800 hover:text-purple-950 font-semibold inline-flex items-center gap-1 hover:underline"
          >
            View Entire Collection <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
