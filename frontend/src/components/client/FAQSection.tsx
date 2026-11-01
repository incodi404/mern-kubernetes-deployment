"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const FAQ_DATA = [
  {
    category: "About us",
    items: [
      {
        q: "What is Being Backpacker?",
        a: "Being Backpacker is a Siliguri-based eco-tour operator offering curated holidays, trekking adventures, customized trips, student excursions, family and group tours, wildlife experiences, cab services and travel assistance across India and selected international destinations.",
      },
      {
        q: "Where is Being Backpacker based?",
        a: "We are based in Siliguri, West Bengal, the gateway to the Himalayas. Our location gives us strong local knowledge of Darjeeling, Sikkim, North Bengal and nearby Himalayan destinations.",
      },
      {
        q: "What makes Being Backpacker different from a regular travel agency?",
        a: "We combine local destination expertise, personalized planning, responsible tourism and smart travel technology. We don't simply arrange bookings. We help create experiences around your interests, budget and travel style.",
      },
    ],
  },
  {
    category: "Voynara AI",
    items: [
      {
        q: "What is Voynara AI?",
        a: "Voynara AI is our smart travel comparison platform. It helps you compare hotel bookings and complete travel packages and spot better-value options.",
      },
      {
        q: "How does Voynara AI work?",
        a: "Enter your origin, destination, travel dates, duration, number of guests and preferred budget level. Voynara AI then compares the available options so you can understand prices, inclusions and potential savings before you decide.",
      },
      {
        q: "Which travel websites does Voynara AI compare?",
        a: "It compares options across MakeMyTrip, Goibibo, Agoda and Booking.com, with fares refreshed during each search. Always check availability, inclusions and terms before you pay.",
      },
    ],
  },
  {
    category: "Trekking",
    items: [
      {
        q: "Does Being Backpacker organize trekking trips?",
        a: "Yes. We organize guided treks ranging from beginner-friendly trails to challenging high-altitude Himalayan routes, including Sandakphu–Phalut, Dzongri–Goecha La and Singalila Ridge.",
      },
      {
        q: "Do I need previous trekking experience?",
        a: "Not always. We offer routes for different experience levels. The right trek depends on your fitness, experience, altitude, duration and route difficulty.",
      },
      {
        q: "Is trekking safe with Being Backpacker?",
        a: "Safety is built into our approach through trained leaders, first-aid support, route planning, safety checks and altitude-aware itineraries. Mountain travel still involves inherent risks, weather changes and physical challenges.",
      },
    ],
  },
  {
    category: "Holidays & packages",
    items: [
      {
        q: "Can I customize my travel package?",
        a: "Absolutely. Request an itinerary based on your destination, dates, group size, interests, accommodation preferences and budget.",
      },
      {
        q: "Do you provide cab services?",
        a: "Yes. We offer Pan-India cab services for travellers exploring destinations across the country.",
      },
      {
        q: "Can you arrange an offbeat or less-touristy trip?",
        a: "Yes. Offbeat destinations, village experiences, nature trails and local cultural experiences are an important part of our travel philosophy.",
      },
    ],
  },
  {
    category: "School & college trips",
    items: [
      {
        q: "Does Being Backpacker organize educational excursions?",
        a: "Yes. We design journeys for schools, colleges and universities that combine travel, experiential learning, adventure, nature, culture and team-building.",
      },
      {
        q: "Can you customize an excursion for our curriculum?",
        a: "Yes. Excursions can be tailored to the age group, curriculum objectives, learning goals, duration and budget, from one-day outings to multi-day expeditions.",
      },
      {
        q: "How do you manage student safety?",
        a: "Our model includes trained staff, first-aid responders, medical backup, emergency support, supervision and, where applicable, GPS-based check-ins. Specific arrangements depend on the programme.",
      },
    ],
  },
  {
    category: "Eco-tourism",
    items: [
      {
        q: "What does eco-tourism mean to Being Backpacker?",
        a: "Travelling in a way that respects nature, local communities and culture, while encouraging responsible practices and supporting local livelihoods.",
      },
      {
        q: "How do you support local communities?",
        a: "We work with local guides, homestays, drivers, activity providers and community businesses so tourism contributes to local livelihoods.",
      },
      {
        q: "How can I travel responsibly?",
        a: "Reduce plastic and waste, respect local traditions, avoid damaging natural surroundings, support local businesses and leave destinations as you found them.",
      },
    ],
  },
  {
    category: "Booking & planning",
    items: [
      {
        q: "How can I plan a trip with Being Backpacker?",
        a: "Tell us your destination or travel idea, dates, number of travellers and approximate budget. Our team will turn it into a practical itinerary.",
      },
      {
        q: "How early should I book my trip?",
        a: "For regular holidays, book in advance, especially in peak season. For treks, school excursions and large groups, plan earlier, since transport, accommodation and permits may need advance coordination.",
      },
      {
        q: "How do I request a quotation?",
        a: "Fill in the enquiry form above, or message us on WhatsApp with your destination, dates, group size and requirements. We'll work out a suitable plan and price.",
      },
    ],
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function FAQSection() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(0);

  const switchCategory = (i: number) => {
    setActive(i);
    setOpen(0);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/60 to-white py-14 sm:py-20 lg:py-28">
      {/* slow drifting glows */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-emerald-200/50 blur-3xl"
        animate={reduce ? undefined : { x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-lime-200/50 blur-3xl"
        animate={reduce ? undefined : { x: [0, -60, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          className="mx-auto mb-8 max-w-2xl sm:mb-14 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Questions before you pack?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:mt-4 sm:text-base">
            Quick answers about our trips, treks, school excursions and how
            planning with us works.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Category selector */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            <div
              role="tablist"
              aria-label="FAQ categories"
              className="flex flex-wrap justify-center gap-2 lg:sticky lg:top-24 lg:flex-col lg:flex-nowrap lg:justify-start"
            >
              {FAQ_DATA.map((cat, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={cat.category}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => switchCategory(i)}
                    className={`relative cursor-pointer rounded-full px-4 py-2 text-center text-[13px] font-semibold sm:px-5 sm:py-2.5 sm:text-sm lg:rounded-2xl lg:py-3 lg:text-left transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      isActive
                        ? "text-slate-950"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="faq-pill"
                        className="absolute inset-0 rounded-full lg:rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-300 shadow-md shadow-emerald-600/20"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                    <span className="relative z-10">{cat.category}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Questions */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.ul
                key={active}
                role="tabpanel"
                className="space-y-3 sm:space-y-4"
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.08 } },
                }}
              >
                {FAQ_DATA[active].items.map((item, i) => {
                  const isOpen = open === i;
                  return (
                    <motion.li
                      key={item.q}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.5, ease: EASE },
                        },
                      }}
                      className={`overflow-hidden rounded-2xl border transition-colors sm:rounded-3xl duration-300 ${
                        isOpen
                          ? "border-emerald-300 bg-white shadow-xl shadow-emerald-900/5"
                          : "border-slate-200 bg-white/70 hover:border-slate-300"
                      }`}
                    >
                      <button
                        onClick={() => setOpen(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 sm:gap-6 sm:px-8 sm:py-6"
                      >
                        <span
                          className={`min-w-0 text-[15px] font-semibold leading-snug transition-colors duration-300 sm:text-lg ${
                            isOpen ? "text-emerald-700" : "text-slate-900"
                          }`}
                        >
                          {item.q}
                        </span>

                        {/* plus that turns into a minus */}
                        <span
                          aria-hidden
                          className={`relative h-8 w-8 shrink-0 rounded-full sm:h-9 sm:w-9 border transition-colors duration-300 ${
                            isOpen
                              ? "border-emerald-600 bg-emerald-600"
                              : "border-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute left-1/2 top-1/2 h-0.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300 ${
                              isOpen ? "bg-white" : "bg-slate-700"
                            }`}
                          />
                          <span
                            className={`absolute left-1/2 top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
                              isOpen
                                ? "scale-y-0 bg-white"
                                : "scale-y-100 bg-slate-700"
                            }`}
                          />
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: EASE }}
                          >
                            <p className="max-w-2xl px-4 pb-5 text-sm leading-relaxed text-slate-600 sm:px-8 sm:pb-7 sm:text-base">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </AnimatePresence>

            <motion.p
              className="mt-6 break-words text-center text-sm text-slate-500 sm:mt-8 sm:text-left"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Still unsure? Call{" "}
              <a
                href="tel:+918900532714"
                className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
              >
                +91-8900532714
              </a>{" "}
              or write to{" "}
              <a
                href="mailto:beingbackpackers@gmail.com"
                className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
              >
                beingbackpackers@gmail.com
              </a>
              .
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
