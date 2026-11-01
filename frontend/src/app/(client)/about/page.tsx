"use client";

import React from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  Reveal,
  Stagger,
  StaggerItem,
  fadeDown,
  fadeUp,
  staggerContainer,
} from "@/components/client/animations";
import shop1 from "@/assets/IMG_3888.JPG.jpg";
import shop2 from "@/assets/IMG_3889.JPG.jpg";
import shop3 from "@/assets/IMG_3890.JPG.jpg";
import shop4 from "@/assets/IMG_3892.JPG.jpg";

/*
  ASSETS NOTE:
  Put your 4 shop interior images in your assets folder (e.g. src/assets/),
  then import them here and paste them into the `offerings` array below.

  Example:
    import shop1 from "@/assets/shop1.jpg";
    import shop2 from "@/assets/shop2.jpg";
    import shop3 from "@/assets/shop3.jpg";
    import shop4 from "@/assets/shop4.jpg";

  Then set:  image: shop1,  image: shop2,  and so on.
  While `image` is empty, a placeholder box is shown instead.
  (If you use next/image or Vite, a static import may be an object or a string,
  so use `shop1.src` for Next.js static imports.)

  Layout: rows alternate automatically (image left / text right, then
  text left / image right), each side sliding in on scroll.

  Colour split: ~60% white, ~30% dark purple, ~10% gold.
  Animation helpers come from components/client/Animation.tsx
  (adjust the import path above if your alias differs).
*/

type Offering = {
  title: string;
  text: string;
  more: string;
  points: string[];
  image: string;
  alt: string;
};

const offerings: Offering[] = [
  {
    title: "School & Office Supplies",
    text: "From everyday school stationery and premium notebooks to specialized drawing materials, pens for regular use and premiums.",
    more: "Whether it is a student starting a new class or a professional restocking the desk, you will find dependable essentials here, chosen for quality and everyday value.",
    points: [
      "Notebooks & stationery",
      "Everyday & premium pens",
      "Drawing materials",
    ],
    image: shop1.src, // TODO: shop1
    alt: "Depcom shop interior view 1",
  },
  {
    title: "Crafts & Drawing Materials",
    text: "Complete drawing kits, craft paper, tools, and accessories to spark your creativity.",
    more: "Creativity grows with the right tools. From first-time young artists to hobbyists and project makers, our shelves are stocked to help every idea take shape.",
    points: ["Drawing kits", "Craft paper & tools", "Creative accessories"],
    image: shop2.src, // TODO: shop2
    alt: "Depcom shop interior view 2",
  },
  {
    title: "Toys for All Ages",
    text: "A fun and engaging range of toys designed to entertain, educate, and delight children of different age groups.",
    more: "We believe play is part of learning. Browse toys that keep little hands busy and curious minds growing, from simple fun to activities that teach as they entertain.",
    points: [
      "Fun & engaging toys",
      "Educational picks",
      "Options for different age groups",
    ],
    image: shop4.src, // TODO: shop3
    alt: "Depcom shop interior view 3",
  },
  {
    title: "Gifts, Home Décor & Utility Items",
    text: "Showpieces, elegant photo frames, attractive gift packs, and practical home utility items perfect for any special occasion.",
    more: "Looking for a present that says something thoughtful? From birthdays to festivals and housewarmings, find a gift or a touch of décor that suits the moment and the budget.",
    points: [
      "Showpieces & photo frames",
      "Attractive gift packs",
      "Practical home utility items",
    ],
    image: shop3.src, // TODO: shop4
    alt: "Depcom shop interior view 4",
  },
];

const services = [
  {
    title: "Photocopying & Printing",
    text: "High-quality black & white and color photocopying, including A3 size sheets. Ideal for assignments, notes, documents and office paperwork.",
  },
  {
    title: "Photo & Image Printing",
    text: "Sharp, vivid prints for photos, images, and documents. Keep your memories and important pages looking their best.",
  },
  {
    title: "School Project Assistance",
    text: "Dedicated support, materials, and printing solutions to bring students' school projects to life! Everything a student needs, all in one place.",
  },
];

const reasons = [
  {
    title: "Everything Under One Roof",
    text: "Stationery, gifts, toys, décor and printing, so one visit often covers your entire list.",
  },
  {
    title: "Carefully Curated Selection",
    text: "We choose our products with care, focusing on quality, usefulness and value for our customers.",
  },
  {
    title: "Friendly, Familiar Service",
    text: "As a neighbourhood shop, we know our community and are always happy to help you find the right thing.",
  },
  {
    title: "Trusted for 5+ Years",
    text: "Years of serving families, students and offices have built the trust we are proud of.",
  },
];

/* Floating stationery & gift icons for the hero.
   Swap any emoji for an <img> (from your assets) if you prefer real pictures. */
const heroItems = [
  {
    icon: "📚",
    pos: "left-[5%] top-[14%]",
    dur: 5,
    delay: 0.2,
    rot: 10,
    mobile: true,
  },
  {
    icon: "🎁",
    pos: "right-[6%] top-[12%]",
    dur: 6,
    delay: 0.4,
    rot: -12,
    mobile: true,
  },
  {
    icon: "✏️",
    pos: "left-[8%] bottom-[10%]",
    dur: 4.5,
    delay: 0.6,
    rot: 14,
    mobile: true,
  },
  {
    icon: "🧸",
    pos: "right-[8%] bottom-[10%]",
    dur: 5.5,
    delay: 0.8,
    rot: -8,
    mobile: true,
  },
  {
    icon: "🎨",
    pos: "left-[28%] top-[8%]",
    dur: 6.5,
    delay: 1,
    rot: 12,
    mobile: false,
  },
  {
    icon: "📓",
    pos: "right-[28%] bottom-[8%]",
    dur: 5,
    delay: 1.2,
    rot: -10,
    mobile: false,
  },
  {
    icon: "✂️",
    pos: "left-[19%] bottom-[34%]",
    dur: 4.8,
    delay: 1.4,
    rot: 16,
    mobile: false,
  },
  {
    icon: "🖍️",
    pos: "right-[19%] top-[30%]",
    dur: 5.8,
    delay: 1.6,
    rot: -14,
    mobile: false,
  },
  {
    icon: "🖊️",
    pos: "left-[40%] bottom-[6%]",
    dur: 5.2,
    delay: 1.8,
    rot: 9,
    mobile: false,
  },
  {
    icon: "🎀",
    pos: "right-[40%] top-[6%]",
    dur: 6.2,
    delay: 2,
    rot: -9,
    mobile: false,
  },
];

const HeroFloaters: React.FC = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0">
    {heroItems.map((it) => (
      <div
        key={it.icon}
        className={`absolute ${it.pos} ${it.mobile ? "" : "hidden md:block"} opacity-60 sm:opacity-100`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -16, 0],
            rotate: [-it.rot, it.rot, -it.rot],
          }}
          transition={{
            opacity: { duration: 0.6, delay: it.delay },
            scale: {
              type: "spring",
              stiffness: 160,
              damping: 12,
              delay: it.delay,
            },
            y: {
              duration: it.dur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: it.delay,
            },
            rotate: {
              duration: it.dur * 1.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: it.delay,
            },
          }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl shadow-lg shadow-black/20 backdrop-blur-sm sm:h-16 sm:w-16 sm:text-4xl"
        >
          {it.icon}
        </motion.div>
      </div>
    ))}
  </div>
);

const GoldBar: React.FC<{ center?: boolean }> = ({ center }) => (
  <Reveal direction="zoom">
    <span
      className={`block h-1 w-[70px] rounded-full bg-[#d4a017] ${
        center ? "mx-auto mt-2 mb-5" : "mx-auto"
      }`}
    />
  </Reveal>
);

const About: React.FC = () => {
  // Page scroll progress (gold bar at the very top)
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  // Hero reacts to scrolling: gently shrinks and fades as you move down
  const heroScroll = useScroll();
  const heroOpacity = useTransform(
    heroScroll.scrollYProgress,
    [0, 0.2],
    [1, 0.6],
  );

  return (
    <main className="overflow-x-hidden bg-white font-sans text-[#2d2538]">
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed top-0 left-0 z-50 h-1 w-full origin-left bg-[#d4a017]"
      />

      {/* Hero (dark purple) */}
      <motion.section
        style={{ opacity: heroOpacity }}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative w-full overflow-hidden bg-purple-950 px-4 py-20 text-center text-white sm:px-8 md:py-24"
      >
        {/* soft animated gold glow */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#d4a017]/20 blur-3xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <HeroFloaters />
        <motion.h1
          variants={fadeDown}
          className="relative mb-3 text-3xl font-bold sm:text-4xl md:text-5xl"
        >
          About Us
        </motion.h1>
        <motion.span
          variants={{
            hidden: { scaleX: 0, opacity: 0 },
            visible: { scaleX: 1, opacity: 1, transition: { duration: 0.6 } },
          }}
          className="relative mx-auto block h-1 w-[70px] origin-center rounded-full bg-[#d4a017]"
        />
        <motion.p
          variants={fadeUp}
          className="relative mt-4 text-base font-semibold sm:text-lg text-[#d4a017]"
        >
          5 Years of Excellence — A Variety World for Everyone!
        </motion.p>
      </motion.section>

      {/* Intro (white) */}
      <section className="w-full px-4 py-10 sm:px-8 lg:px-16">
        <Reveal>
          <p className="mx-auto mb-4 max-w-[820px] text-center text-base leading-7 sm:text-lg sm:leading-8">
            Welcome to <strong className="text-purple-900">Depcom</strong> —
            your trusted neighbourhood destination for quality, creativity, and
            daily essentials! For over 5 years, we have been proudly serving our
            community with a commitment to excellence, offering a carefully
            curated selection of products and essential services under one roof.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto max-w-[820px] text-center text-base leading-7 sm:text-lg sm:leading-8">
            What started as a small neighbourhood store has grown into a variety
            world for everyone: a place where students, parents, gift-seekers
            and creative minds can find what they need without running from shop
            to shop. Our goal is simple: quality products, honest service and a
            warm welcome every time you walk in.
          </p>
        </Reveal>
      </section>

      {/* What we offer: text + image rows, alternating sides */}
      <section className="w-full px-4 py-10 sm:px-8 lg:px-16">
        <Reveal>
          <h2 className="text-center text-2xl font-bold sm:text-3xl text-purple-900">
            What We Offer
          </h2>
        </Reveal>
        <GoldBar center />
        <Reveal>
          <p className="mx-auto mb-10 max-w-[760px] text-center leading-7 text-[#5a5266]">
            Whether you are preparing for a new school year, searching for the
            perfect gift, or completing an important project, Depcom is here to
            help you every step of the way:
          </p>
        </Reveal>

        {offerings.map((o, i) => {
          const reverse = i % 2 === 1;
          return (
            <div
              key={o.title}
              className={`mb-12 flex flex-col items-center gap-6 md:gap-10 ${
                reverse ? "md:flex-row-reverse" : "md:flex-row"
              }`}
            >
              {/* image (slides in from its own side) */}
              <Reveal
                direction={reverse ? "right" : "left"}
                className="w-full max-w-[360px] md:w-[300px] md:shrink-0"
              >
                {o.image ? (
                  <img
                    src={o.image}
                    alt={o.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div
                    role="img"
                    aria-label={o.alt}
                    className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border-2 border-dashed border-purple-900 bg-purple-50 font-semibold text-purple-900"
                  >
                    Image {i + 1}
                  </div>
                )}
              </Reveal>

              {/* text (slides in from the opposite side) */}
              <Reveal
                direction={reverse ? "left" : "right"}
                delay={0.1}
                className="min-w-0 flex-1"
              >
                <h3 className="mb-3 border-l-4 border-[#d4a017] pl-3 text-2xl font-semibold text-purple-900">
                  {o.title}
                </h3>
                <p className="mb-2 leading-7 text-[#4a4256]">{o.text}</p>
                <p className="mb-2 leading-7 text-[#4a4256]">{o.more}</p>
                <ul className="mt-3 list-disc pl-5 leading-8 text-purple-900 marker:text-[#d4a017]">
                  {o.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Reveal>
            </div>
          );
        })}
      </section>

      {/* Services (dark purple band) */}
      <section className="bg-purple-950">
        <div className="w-full px-4 py-12 sm:px-8 lg:px-16">
          <Reveal>
            <h2 className="text-center text-2xl font-bold sm:text-3xl text-white">
              Our Print &amp; Project Services
            </h2>
          </Reveal>
          <GoldBar center />
          <Reveal>
            <p className="mx-auto mb-9 max-w-[760px] text-center leading-7 text-purple-100">
              In addition to our wide product selection, we offer dependable
              digital printing and documentation services to make your work
              easier:
            </p>
          </Reveal>
          <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {services.map((s) => (
              <StaggerItem
                key={s.title}
                className="rounded-2xl border-b-4 border-[#d4a017] bg-white p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <h3 className="mb-2 text-lg font-semibold text-purple-900">
                  {s.title}
                </h3>
                <p className="leading-7 text-[#4a4256]">{s.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Why choose us (white) */}
      <section className="w-full px-4 py-12 sm:px-8 lg:px-16">
        <Reveal>
          <h2 className="text-center text-2xl font-bold sm:text-3xl text-purple-900">
            Why Choose Depcom?
          </h2>
        </Reveal>
        <GoldBar center />
        <Reveal>
          <p className="mx-auto mb-9 max-w-[760px] text-center leading-7 text-[#5a5266]">
            We pride ourselves on friendly service, quality products, and
            complete customer satisfaction.
          </p>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <StaggerItem
              key={r.title}
              className="rounded-2xl border border-purple-100 border-b-4 border-b-[#d4a017] bg-white p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <h3 className="mb-2 text-lg font-semibold text-purple-900">
                {r.title}
              </h3>
              <p className="leading-7 text-[#4a4256]">{r.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </main>
  );
};

export default About;
