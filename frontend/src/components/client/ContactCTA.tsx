"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/* ---------- Scroll animation ---------- */

const EASE = [0.22, 1, 0.36, 1] as const;

// Replay every time the element scrolls into view (set `once: true` to play a single time).
const VIEWPORT = {
  once: false,
  amount: 0.2,
  margin: "0px 0px -60px 0px",
} as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay },
  }),
};

const popIn: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.92 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE, delay },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.9, ease: "easeOut", delay },
  }),
};

/* ---------- Marquee ---------- */

const MARQUEE_ITEMS = [
  "Curated gift hampers",
  "Premium stationery",
  "Festive & birthday balloons",
  "Personalised notes & cards",
  "Gift wrapping & same-day delivery",
];

// One "half" of the track. Two identical halves sit side by side and the track
// slides by exactly 50%, which makes the loop seamless.
function MarqueeHalf() {
  return (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {[0, 1].map((round) =>
        MARQUEE_ITEMS.map((item) => (
          <span
            key={`${round}-${item}`}
            className="flex items-center whitespace-nowrap pr-8 text-sm text-white/60 sm:pr-12"
          >
            {item}
            <span className="ml-8 h-1 w-1 rounded-full bg-yellow-300/70 sm:ml-12" />
          </span>
        )),
      )}
    </div>
  );
}

/* ---------- Floating item icons ---------- */

function GiftIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* Box */}
      <rect x="10" y="26" width="44" height="30" rx="3" fill="#facc15" />
      <rect x="6" y="18" width="52" height="12" rx="3" fill="#fde047" />
      {/* Ribbon */}
      <rect x="28" y="18" width="8" height="38" fill="#7c3aed" />
      {/* Bow */}
      <path
        d="M32 18c-6-10-18-6-14 2 3 6 12 4 14-2Z"
        fill="#a78bfa"
      />
      <path
        d="M32 18c6-10 18-6 14 2-3 6-12 4-14-2Z"
        fill="#a78bfa"
      />
    </svg>
  );
}

function BalloonIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* Balloons */}
      <ellipse cx="22" cy="24" rx="12" ry="15" fill="#a78bfa" />
      <ellipse cx="42" cy="20" rx="11" ry="14" fill="#facc15" />
      <ellipse cx="32" cy="34" rx="10" ry="13" fill="#f472b6" />
      {/* Strings */}
      <path d="M22 39v16" stroke="#e9d5ff" strokeWidth="1.5" />
      <path d="M42 34v20" stroke="#fef3c7" strokeWidth="1.5" />
      <path d="M32 47v14" stroke="#fbcfe8" strokeWidth="1.5" />
    </svg>
  );
}

function PencilIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* Pencil body */}
      <path d="M14 50l6-2 26-26-4-4-26 26-2 6Z" fill="#fde047" />
      {/* Tip */}
      <path d="M12 52l2-6 4 4-6 2Z" fill="#7c3aed" />
      {/* Eraser */}
      <path d="M42 18l4 4 6-6-4-4-6 6Z" fill="#f472b6" />
    </svg>
  );
}

function NotebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="14" y="10" width="36" height="44" rx="4" fill="#a78bfa" />
      <rect x="18" y="14" width="28" height="36" rx="2" fill="#fef9c3" />
      <line x1="24" y1="22" x2="40" y2="22" stroke="#c4b5fd" strokeWidth="2" />
      <line x1="24" y1="30" x2="40" y2="30" stroke="#c4b5fd" strokeWidth="2" />
      <line x1="24" y1="38" x2="34" y2="38" stroke="#c4b5fd" strokeWidth="2" />
      <rect x="26" y="8" width="12" height="6" rx="2" fill="#facc15" />
    </svg>
  );
}

/* ---------- Floating items animation ---------- */

type FloatingItem = {
  id: string;
  Icon: (props: { className?: string }) => JSX.Element;
  left: string;
  size: string;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
};

const FLOAT_ITEMS: FloatingItem[] = [
  {
    id: "gift-1",
    Icon: GiftIcon,
    left: "6%",
    size: "w-14 sm:w-16",
    delay: 0,
    duration: 11,
    drift: 18,
    rotate: 10,
  },
  {
    id: "balloon-1",
    Icon: BalloonIcon,
    left: "20%",
    size: "w-12 sm:w-14",
    delay: 1.4,
    duration: 13,
    drift: -14,
    rotate: -8,
  },
  {
    id: "pencil-1",
    Icon: PencilIcon,
    left: "36%",
    size: "w-12 sm:w-16",
    delay: 0.8,
    duration: 12,
    drift: 16,
    rotate: 12,
  },
  {
    id: "notebook-1",
    Icon: NotebookIcon,
    left: "52%",
    size: "w-12 sm:w-14",
    delay: 2.1,
    duration: 14,
    drift: -18,
    rotate: -10,
  },
  {
    id: "gift-2",
    Icon: GiftIcon,
    left: "68%",
    size: "w-12 sm:w-16",
    delay: 1.1,
    duration: 12.5,
    drift: 14,
    rotate: 8,
  },
  {
    id: "balloon-2",
    Icon: BalloonIcon,
    left: "83%",
    size: "w-14 sm:w-16",
    delay: 0.4,
    duration: 13.5,
    drift: -16,
    rotate: -12,
  },
];

function FloatingItems() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {FLOAT_ITEMS.map(({ id, Icon, left, size, delay, duration, drift, rotate }) => (
        <motion.div
          key={id}
          className={`absolute bottom-0 ${size} opacity-70 drop-shadow-[0_6px_18px_rgba(124,58,237,0.35)]`}
          style={{ left }}
          initial={{ y: "110%", opacity: 0, rotate: 0 }}
          animate={{
            y: ["110%", "-20%"],
            x: [0, drift, 0],
            rotate: [0, rotate, 0],
            opacity: [0, 0.75, 0.75, 0],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.15, 0.85, 1],
          }}
        >
          <Icon className="h-auto w-full" />
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- Component ---------- */

export default function ContactCTA({
  isContact = false,
}: {
  isContact?: Boolean;
}) {
  const reduceMotion = useReducedMotion();

  const reveal = (variants: Variants, custom = 0) =>
    reduceMotion
      ? {}
      : {
          variants,
          custom,
          initial: "hidden" as const,
          whileInView: "show" as const,
          viewport: VIEWPORT,
        };

  return (
    <section className="relative overflow-hidden bg-purple-950 py-20 md:py-24 mb-20">
      {/* Purple / gold / yellow radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(168,85,247,0.28),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(250,204,21,0.22),transparent_35%),radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.18),transparent_45%)]" />

      {/* Top gold hairline */}
      <div className="absolute left-1/2 top-0 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />

      {/* Floating gifts, balloons & stationery */}
      {!reduceMotion && <FloatingItems />}

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Eyebrow */}
        <motion.p
          {...reveal(fadeUp, 0)}
          className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-yellow-300"
        >
          Gifts &amp; Stationery, Delivered
        </motion.p>

        {/* Heading */}
        <motion.h2
          {...reveal(fadeUp, 0.1)}
          className="mx-auto max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl"
        >
          Find the perfect gift.
          <br />
          <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
            Wrap it in joy.
          </span>
        </motion.h2>

        {/* Description */}
        <motion.p
          {...reveal(fadeUp, 0.2)}
          className="mx-auto mt-6 max-w-2xl text-base leading-7 text-purple-100/80 md:text-lg"
        >
          From thoughtful gift hampers and festive balloons to premium
          stationery and personalised notes — explore a curated collection
          that makes every occasion feel special. Need something custom?
          We&apos;re just a message away.
        </motion.p>

        {/* CTA */}
        {!isContact && (
          <motion.div {...reveal(popIn, 0.32)} className="mt-9">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 px-7 py-3.5 text-sm font-semibold text-purple-950 shadow-lg shadow-purple-900/40 transition-all duration-300 hover:-translate-y-0.5 hover:from-yellow-200 hover:to-amber-300 hover:shadow-xl"
            >
              Contact Us
              <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Bottom marquee */}
      <motion.div
        {...reveal(fadeIn, 0.45)}
        className="relative mt-14 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <p className="sr-only">{MARQUEE_ITEMS.join(", ")}</p>

        <motion.div
          className="flex w-max"
          animate={reduceMotion ? undefined : { x: ["-50%", "0%"] }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <MarqueeHalf />
          <MarqueeHalf />
        </motion.div>
      </motion.div>
    </section>
  );
}