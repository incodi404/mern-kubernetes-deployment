"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/*
  Blocks.tsx
  ----------
  Two photo category blocks: Stationery and Gifts.
  Clicking a block opens its "all products" page.

  Requires: Next.js App Router (next/navigation)
  Colour ratio: white 60% / purple 30% / gold 10%

  Images: each block cycles through its `images` with a smooth crossfade.
  The two blocks change at different moments (alternately), not together.
  Swap the URLs for your own photos any time. A photo that fails to load
  is skipped visually and the purple gradient shows instead.
*/

export interface BlockItem {
  id: string;
  title: string;
  tag: string;
  text: string;
  to: string;
  cta: string;
  images: string[];
}

interface BlocksProps {
  blocks?: BlockItem[];
  intervalMs?: number; // time each photo stays on screen
}

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

const BLOCKS: BlockItem[] = [
  {
    id: "stationery",
    title: "Stationery",
    tag: "Everyday essentials",
    text: "Notebooks, pens, planners and desk favourites.",
    to: "/all-stationeries", // all stationery page
    cta: "Shop all stationery",
    images: [
      u("1583485088034-697b5bc54ccd"),
      u("1531346878377-a5be20888e57"),
      u("1456735190827-d1262f71b8a3"),
    ],
  },
  {
    id: "gifts",
    title: "Gifts",
    tag: "For every occasion",
    text: "Thoughtful picks for birthdays, weddings and festivals.",
    to: "/all-gifts", // all gifts page
    cta: "Shop all gifts",
    images: [
      u("1513885535751-8b9238bd345a"),
      u("1549465220-1a8b9238cd48"),
      u("1607344645866-009c320b63e0"),
    ],
  },
];

export default function Blocks({
  blocks = BLOCKS,
  intervalMs = 4500,
}: BlocksProps) {
  return (
    <section className="blk-section" aria-labelledby="blk-heading">
      <style>{css}</style>

      <div className="blk-wrap">
        <div className="blk-head">
          <h2 id="blk-heading" className="blk-heading">
            Shop by category
          </h2>
          <span className="blk-bar" aria-hidden="true" />
        </div>

        <div className="blk-grid">
          {blocks.map((b, i) => (
            <BlockCard
              key={b.id}
              block={b}
              intervalMs={intervalMs}
              // each card starts later, so the photos change alternately
              startDelayMs={i * (intervalMs / blocks.length)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockCard({
  block: b,
  intervalMs,
  startDelayMs,
}: {
  block: BlockItem;
  intervalMs: number;
  startDelayMs: number;
}) {
  const router = useRouter();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (b.images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    const kickoff = setTimeout(() => {
      setActive((n) => (n + 1) % b.images.length);
      timer = setInterval(
        () => setActive((n) => (n + 1) % b.images.length),
        intervalMs,
      );
    }, intervalMs + startDelayMs);

    return () => {
      clearTimeout(kickoff);
      if (timer) clearInterval(timer);
    };
  }, [b.images.length, intervalMs, startDelayMs]);

  return (
    <button
      type="button"
      className="blk-card"
      aria-label={b.cta}
      onClick={() => router.push(b.to)}
      onMouseEnter={() => router.prefetch(b.to)}
    >
      <span className="blk-media" aria-hidden="true">
        {b.images.map((src, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            className={`blk-img${idx === active ? " is-active" : ""}`}
            src={src}
            alt=""
            loading={idx === 0 ? "eager" : "lazy"}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ))}
      </span>
      <span className="blk-shade" aria-hidden="true" />

      <span className="blk-tag">{b.tag}</span>

      {b.images.length > 1 && (
        <span className="blk-dots" aria-hidden="true">
          {b.images.map((src, idx) => (
            <span
              key={src}
              className={`blk-dot${idx === active ? " is-active" : ""}`}
            />
          ))}
        </span>
      )}

      <span className="blk-info">
        <span className="blk-title">{b.title}</span>
        <span className="blk-text">{b.text}</span>
        <span className="blk-cta">
          <span className="blk-cta-label">{b.cta}</span>
          <span className="blk-arrow" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </span>
        </span>
      </span>
    </button>
  );
}

const css = `
.blk-section {
  --white: #ffffff;
  --purple: #4b2a7b;
  --purple-deep: #2f1759;
  --gold: #d4a62a;

  background: var(--white);
  padding: clamp(40px, 7vw, 96px) clamp(16px, 4vw, 48px);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
.blk-wrap { max-width: 1080px; margin: 0 auto; }

.blk-head { margin-bottom: clamp(24px, 4vw, 44px); }
.blk-heading {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  color: var(--purple);
}
.blk-bar {
  display: block;
  width: 64px;
  height: 5px;
  margin-top: 12px;
  border-radius: 3px;
  background: var(--gold);
}

.blk-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(16px, 3vw, 36px);
  align-items: start;
}
/* second card sits lower on desktop for a staggered look */
.blk-grid > .blk-card:nth-child(even) { margin-top: 56px; }

.blk-card {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  padding: 0;
  border: 0;
  border-radius: 28px;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: #fff;
  background: linear-gradient(160deg, var(--purple) 0%, var(--purple-deep) 100%);
  box-shadow: 0 18px 40px -18px rgba(47, 23, 89, .55);
  transition: transform .35s ease, box-shadow .35s ease;
}
.blk-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 26px 48px -18px rgba(47, 23, 89, .65);
}
.blk-card:focus-visible { outline: 3px solid var(--gold); outline-offset: 4px; }

.blk-media {
  position: absolute;
  inset: 0;
  display: block;
  transition: transform .8s ease;
}
.blk-card:hover .blk-media { transform: scale(1.06); }

/* crossfade: the active photo fades in and settles, the old one fades out */
.blk-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.1);
  transition: opacity 1.4s ease-in-out, transform 6s ease-out;
}
.blk-img.is-active { opacity: 1; transform: scale(1); }

/* purple wash: clear at the top, solid purple behind the text */
.blk-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(47, 23, 89, .96) 0%,
    rgba(75, 42, 123, .85) 32%,
    rgba(75, 42, 123, .15) 62%,
    rgba(75, 42, 123, 0) 100%
  );
}

.blk-tag {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--white);
  color: var(--purple);
  font-size: .85rem;
  font-weight: 600;
}

.blk-dots {
  position: absolute;
  top: 28px;
  right: 22px;
  display: flex;
  gap: 6px;
}
.blk-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .55);
  transition: width .4s ease, background .4s ease;
}
.blk-dot.is-active { width: 24px; border-radius: 4px; background: var(--gold); }

.blk-info {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: block;
  padding: clamp(20px, 3vw, 32px);
}
.blk-title {
  display: block;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  line-height: 1;
  font-weight: 700;
  color: #fff;
}
.blk-text {
  display: block;
  max-width: 30ch;
  margin-top: 10px;
  line-height: 1.5;
  color: rgba(255, 255, 255, .85);
}

.blk-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, .25);
}
.blk-cta-label { font-weight: 600; color: #fff; }
.blk-arrow {
  display: grid;
  place-items: center;
  flex: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--purple-deep);
  transition: transform .3s ease, background .3s ease;
}
.blk-card:hover .blk-arrow { transform: rotate(45deg); background: #fff; }

@media (max-width: 720px) {
  .blk-grid { grid-template-columns: 1fr; }
  .blk-grid > .blk-card:nth-child(even) { margin-top: 0; }
  .blk-card { aspect-ratio: 4 / 4.4; }
}

@media (prefers-reduced-motion: reduce) {
  .blk-card, .blk-media, .blk-img, .blk-arrow, .blk-dot { transition: none; }
  .blk-card:hover, .blk-card:hover .blk-media, .blk-card:hover .blk-arrow { transform: none; }
}
`;
