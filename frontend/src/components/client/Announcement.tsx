import React from "react";
import { Gift } from "lucide-react";

// Edit these lines to change what scrolls across the bar
const MESSAGES = [
  "Gifts for every occasion",
  "Fine stationery, handpicked for you",
  "Your one-stop gift & stationery website",
  "Thoughtful gifting starts here",
  "Notebooks, pens & desk favourites",
  "Make every moment memorable",
];

const SPEED_SECONDS = 40; // lower = faster

export default function AnnouncementBar() {
  // each group holds the messages twice so it is always wider than the screen
  const items = [...MESSAGES, ...MESSAGES];

  const Group = ({ hidden }: { hidden?: boolean }) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((message, i) => (
        <span
          key={i}
          className="flex items-center gap-3 px-6 whitespace-nowrap"
        >
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-slate-950 shrink-0">
            <Gift className="w-3 h-3" />
          </span>
          <span className="font-medium text-xs text-purple-100">{message}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="w-full bg-purple-950 text-purple-200 text-xs border-b border-purple-900/60 transition-colors">
      <style>{`
        @keyframes ab-marquee-ltr {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .ab-track { animation: ab-marquee-ltr ${SPEED_SECONDS}s linear infinite; }
        .ab-wrap:hover .ab-track { animation-play-state: paused; }
        .ab-wrap {
          -webkit-mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
        }
        @media (prefers-reduced-motion: reduce) {
          .ab-track { animation: none; }
        }
      `}</style>

      <div className="ab-wrap w-full h-9 flex items-center overflow-hidden">
        <div className="ab-track flex w-max">
          <Group />
          <Group hidden />
        </div>
      </div>
    </div>
  );
}