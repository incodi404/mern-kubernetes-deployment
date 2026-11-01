"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import MakeInIndia from "@/assets/makeinindia.png";
import Heading2 from "./Heading2";
import Image from "next/image";

export default function MakeInIndiaSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // 0 = section top touches viewport bottom, 1 = section bottom touches viewport top
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Smooths out jerky wheel/trackpad scrolling
  const p = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });

  // In -> hold -> out. Each element uses slightly shifted ranges for a stagger.
  const headingOpacity = useTransform(
    p,
    [0.05, 0.28, 0.72, 0.95],
    [0, 1, 1, 0],
  );
  const headingY = useTransform(
    p,
    [0.05, 0.28, 0.72, 0.95],
    reduce ? [0, 0, 0, 0] : [80, 0, 0, -80],
  );

  const lineScale = useTransform(p, [0.12, 0.34, 0.66, 0.88], [0, 1, 1, 0]);

  const imageOpacity = useTransform(p, [0.1, 0.36, 0.64, 0.9], [0, 1, 1, 0]);
  const imageY = useTransform(
    p,
    [0.1, 0.36, 0.64, 0.9],
    reduce ? [0, 0, 0, 0] : [120, 0, 0, -120],
  );
  const imageScale = useTransform(
    p,
    [0.1, 0.36, 0.64, 0.9],
    reduce ? [1, 1, 1, 1] : [0.8, 1, 1, 0.8],
  );
  const imageRotate = useTransform(
    p,
    [0.1, 0.36, 0.64, 0.9],
    reduce ? [0, 0, 0, 0] : [-4, 0, 0, 4],
  );

  // Background glow breathes with scroll
  const glowScale = useTransform(
    p,
    [0, 0.5, 1],
    reduce ? [1, 1, 1] : [0.6, 1.3, 0.6],
  );
  const glowOpacity = useTransform(p, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[70vh] flex-col items-center justify-center gap-5 overflow-hidden"
    >
      {/* Tricolour glow */}
      <motion.div
        aria-hidden
        style={{ scale: glowScale, opacity: glowOpacity }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-orange-400/30 via-white/10 to-green-500/30 blur-3xl"
      />

      {/* Heading + underline */}
      <motion.div
        style={{ opacity: headingOpacity, y: headingY }}
        className="flex flex-col items-center gap-3"
      >
        <Heading2>Make In India</Heading2>
        <motion.span
          style={{ scaleX: lineScale, originX: 0.5 }}
          className="h-1 w-24 rounded-full bg-gradient-to-r from-orange-500 via-white to-green-600"
        />
      </motion.div>

      {/* Image: scroll-driven wrapper, hover on the inner element to avoid conflicts */}
      <motion.div
        style={{
          opacity: imageOpacity,
          y: imageY,
          scale: imageScale,
          rotate: imageRotate,
        }}
      >
        <motion.div
          whileHover={reduce ? undefined : { scale: 1.05, y: -6 }}
          transition={{ type: "spring", stiffness: 250, damping: 18 }}
          className="rounded-2xl p-4 drop-shadow-xl"
        >
          <Image src={MakeInIndia} alt="Make In India" className="w-[25rem]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
