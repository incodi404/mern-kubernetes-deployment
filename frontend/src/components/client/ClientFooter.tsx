"use client";

import React from "react";
import Logo from "@/assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { MdArrowOutward } from "react-icons/md";
import {
  FaFacebookF,
  FaGoogle,
  FaInstagram,
  FaPinterestP,
} from "react-icons/fa6";
import { motion } from "framer-motion";

function ClientFooter() {
  const sections = [
    {
      title: "Home",
      link: "/",
    },
    {
      title: "Products",
      link: "/products",
    },
    {
      title: "About Us",
      link: "/about",
    },
    {
      title: "Contact Us",
      link: "/contact",
    },
  ];

  const social = [
    {
      title: "Instagram",
      link: "https://www.instagram.com/thegallery6867",
      icon: FaInstagram,
      color: "#E1306C",
    },
    {
      title: "Facebook",
      link: "https://www.facebook.com/share/1BywDMohyi/?mibextid=wwXIfr",
      icon: FaFacebookF,
      color: "#1877F2",
    },
    {
      title: "Pinterest",
      link: "https://pin.it/1AnIQghLz",
      icon: FaPinterestP,
      color: "#E60023",
    },
    {
      title: "Google",
      link: "https://share.google/7H1zL5fPcSfpjvWqL",
      icon: FaGoogle,
      color: "#E60023",
    },
  ];

  const contact = ["+91-9007035528", "info.thegaallery@gmail.com"];

  return (
    <>
      <div className="bg-purple-900 px-5 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          <section className="space-y-3">
            <section className="flex items-start justify-start gap-5 flex-wrap flex-col">
              <section className="w-15 h-15 rounded-md">
                <Image
                  src={Logo}
                  alt="Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </section>
              <section>
                <p className="font-sans text-xl sm:text-2xl font-black leading-[1.05] tracking-tight text-white">
                  Depcom
                </p>
              </section>
            </section>
            {/* Social icons */}
            <div className="flex items-center gap-3 pt-2">
              {social.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.title}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit our ${item.title}`}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                    whileFocus="hover"
                    whileTap={{ scale: 0.9 }}
                    className="relative flex h-11 w-11 items-center justify-center rounded-full border text-lg text-white outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                    variants={{
                      rest: {
                        y: 0,
                        backgroundColor: "rgba(255,255,255,0.06)",
                        borderColor: "rgba(255,255,255,0.2)",
                      },
                      hover: {
                        y: -6,
                        backgroundColor: item.color,
                        borderColor: item.color,
                        transition: {
                          type: "spring",
                          stiffness: 350,
                          damping: 16,
                        },
                      },
                    }}
                  >
                    {/* Pulse ring */}
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                      variants={{
                        rest: { scale: 1, opacity: 0 },
                        hover: {
                          scale: [1, 1.6],
                          opacity: [0.45, 0],
                          transition: {
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeOut",
                          },
                        },
                      }}
                    />

                    {/* Icon wiggle */}
                    <motion.span
                      className="relative flex"
                      variants={{
                        rest: { rotate: 0, scale: 1 },
                        hover: {
                          rotate: [0, -15, 15, 0],
                          scale: 1.15,
                          transition: { duration: 0.5 },
                        },
                      }}
                    >
                      <Icon />
                    </motion.span>

                    {/* Tooltip */}
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-900 shadow-md"
                      variants={{
                        rest: { opacity: 0, y: 4 },
                        hover: { opacity: 1, y: 0 },
                      }}
                    >
                      {item.title}
                    </motion.span>
                  </motion.a>
                );
              })}
            </div>
            <p className="text-sm sm:text-base text-white/60 mt-5">
              © Copyright <b>Depcom</b> {new Date().getFullYear()}. All rights
              reserved.
            </p>
          </section>
          <section></section>
          <section>
            <h3 className="text-base sm:text-lg font-semibold tracking-normal mb-3 text-white">
              Pages
            </h3>
            <section className="space-y-3 flex flex-col gap-0">
              {sections.map((sec, i) => (
                <Link
                  href={sec?.link}
                  key={i}
                  className="text-sm sm:text-base text-white/70 hover:text-white transition duration-200"
                >
                  {sec?.title}
                </Link>
              ))}
            </section>
          </section>
          <section>
            <h3 className="text-base sm:text-lg font-semibold tracking-normal mb-3 text-white">
              Social
            </h3>
            <section className="space-y-3">
              <section className="space-y-3 flex flex-col gap-0">
                {social.map((sec, i) => (
                  <Link
                    href={sec?.link}
                    key={i}
                    className="text-sm sm:text-base text-white/70 hover:text-white transition duration-200"
                  >
                    {sec?.title}
                  </Link>
                ))}
              </section>
            </section>
          </section>
          <section>
            <h3 className="text-base sm:text-lg font-semibold tracking-normal mb-3 text-white">
              Contact
            </h3>
            <section className="space-y-3">
              {contact.map((sec, i) => (
                <p
                  className="text-sm sm:text-base text-white/70 hover:text-white transition duration-200"
                  key={i}
                >
                  {sec}
                </p>
              ))}
            </section>
          </section>
        </div>
        <div className="mt-10">
          <h1
            className="md:text-7xl bg-clip-text pb-10 text-transparent bg-gradient-to-t from-white/[0.25] to-white/[0.01] text-center font-sans font-bold"
            style={{ fontSize: "min(10vw, 320px)" }}
          >
            Depcom
          </h1>
        </div>

        {/* Bottom divider + credit */}
        <div className="mt-10">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <p className="mt-6 text-center text-xs sm:text-sm tracking-wide text-white/55">
            Designed, Developed and Managed by{" "}
            <a
              href="https://duootech.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 border-b border-white/30 pb-px font-medium text-white transition-colors duration-200 hover:border-white"
            >
              DuooTech
              <MdArrowOutward className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default ClientFooter;
