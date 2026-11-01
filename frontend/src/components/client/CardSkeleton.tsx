import React from "react";

function CardSkeleton() {
  return (
    <div className="snap-start shrink-0 w-64 sm:w-72 bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse">
      <div className="h-5 w-20 rounded-full bg-purple-100 mb-3" />
      <div className="h-44 rounded-xl bg-purple-50 mb-4" />
      <div className="h-3 w-16 rounded bg-purple-100 mb-2" />
      <div className="h-4 w-40 rounded bg-slate-100 mb-6" />
      <div className="h-8 w-full rounded bg-slate-100" />
    </div>
  );
}

export default CardSkeleton;
