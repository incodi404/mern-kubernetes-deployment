import React from "react";
import { motion } from "motion/react";
import { CloudShader } from "../ui/cloud-shader";

function Backup() {
  return (
    <div className="relative w-full overflow-hidden bg-linear-to-t from-[#8cbfe8] to-[#3876ba] pb-20 min-h-screen">
      {/* clouds drift left to right; the sky fades in softly on mount */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        {/* the shader renders at half size and upscales 2x — the clouds are
            soft so nothing visible is lost, and the GPU does a quarter of
            the fragment work, which keeps the drift smooth */}
        <div className="absolute h-1/2 w-1/2 origin-top-left scale-200">
          <CloudShader speed={1} className="absolute inset-0" />
        </div>
      </motion.div>

      {/* a soft vertical vignette behind the copy only — keeps the clouds
          fully visible at the edges while guaranteeing text contrast */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-144 bg-linear-to-b from-[#1c3a5e]/25 via-[#1c3a5e]/5 to-transparent" />

      {/* hero content, left aligned with the navbar */}
      <div className="relative z-20 mt-36 w-full md:mt-52 flex justify-center items-center px-5">
        <div className="max-w-7xl flex justify-center items-center flex-col">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur-md md:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            100+ packages · AI-Assisted Price Comparison
          </span>

          <h1 className="text-[2.75rem] font-bold leading-[1.05] tracking-tight text-center text-white [text-shadow:0_4px_24px_rgba(15,42,67,0.45)] sm:text-6xl md:text-8xl">
            Your window seat
            <br className="hidden sm:block" /> to anywhere on Earth
          </h1>

          <p className="mt-5 text-base leading-relaxed text-balance text-white/90 [text-shadow:0_2px_10px_rgba(15,42,67,0.5)] md:text-xl text-center max-w-2xl">
            Search 400+ airlines, watch fares drop in real time, and book in
            under a minute — no hidden fees, no fine print.
          </p>

          <div className="mt-9 flex justify-center items-center gap-4 flex-wrap">
            <a
              href="/voynara-ai"
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#1c3a5e] shadow-[0_8px_24px_-6px_rgba(15,42,67,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-6px_rgba(15,42,67,0.55)] active:translate-y-0"
            >
              Try Voynara AI
            </a>
            <a
              href="/travel-packages"
              className="rounded-full bg-[#1c3a5e] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(15,42,67,0.6)] ring-1 ring-white/20 transition-all duration-300 hover:bg-[#234a76] hover:-translate-y-0.5 active:translate-y-0"
            >
              Explore Travel Packages
            </a>
          </div>
        </div>
      </div>

      {/* window-seat wing view with a gentle in-flight bob */}
      <motion.div
        className="pointer-events-none absolute -bottom-6 left-0 z-10 w-[85%] md:w-[70%]"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src="https://assets.aceternity.com/components/plane-wing.png"
          alt="Airplane wing above the clouds"
          className="h-auto w-full object-cover"
        />
      </motion.div>
    </div>
  );
}

export default Backup;
