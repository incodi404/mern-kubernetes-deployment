"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutGrid,
  Menu,
  Phone,
  X,
  Info,
  PhoneCall,
  Home,
} from "lucide-react";
import Logo from "@/assets/logo.png";
import Search from "@/components/client/Search";
import { BsPhoneFill } from "react-icons/bs";
import { FaPhoneAlt } from "react-icons/fa";

/*
 * The props are kept so existing <ClientHeader ... /> usages don't break,
 * but the header no longer uses them.
 */
interface ClientHeaderProps {
  showVisualCategoryStrip?: boolean;
  cartCount?: number;
  wishlistCount?: number;
}

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home, primary: false },
  { href: "/products", label: "All Products", icon: LayoutGrid, primary: true },
  { href: "/reels", label: "All Reels", icon: LayoutGrid, primary: true },
  { href: "/about", label: "About Us", icon: Info, primary: true },
  { href: "/contact", label: "Contact Us", icon: Phone, primary: false },
];

export default function ClientHeader(_props: ClientHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // lock background scroll + close on Escape while the drawer is open
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="relative w-full z-40 bg-white">
      <div className="w-full bg-white border-b border-purple-100/70 shadow-[0_2px_12px_-4px_rgba(88,28,135,0.06)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4 sm:gap-6">
          {/* Mobile Hamburger & Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden p-2 -ml-2 rounded-xl text-purple-950 hover:bg-purple-50 transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo & Name */}
            <Link
              href="/"
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
            >
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden ring-2 ring-purple-100 group-hover:ring-purple-300 transition-all shrink-0 bg-white">
                <Image
                  src={Logo}
                  alt="Depcom Logo"
                  fill
                  sizes="(max-width: 640px) 36px, 44px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight text-purple-950 group-hover:text-purple-800 transition-colors">
                  Depcom
                </span>
                <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Gifts & Fine Stationery
                </span>
              </div>
            </Link>
          </div>

          {/* Large Search Bar in the Center (desktop / tablet) */}
          <div className="hidden md:flex flex-1 max-w-3xl mx-auto px-2">
            <Search
              placeholder="Search gifts, notebooks, pens, craft supplies, hampers..."
              buttonText="Search"
              showCategorySelector={true}
              showSuggestions={true}
              size="md"
            />
          </div>

          {/* All Products + Contact Us buttons (desktop / tablet only) */}
          <nav
            aria-label="Main navigation"
            className="hidden xl:flex items-center gap-2 shrink-0"
          >
            {NAV_LINKS.map(({ href, label, icon: Icon, primary }) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  primary
                    ? "bg-purple-950 text-white hover:bg-purple-800"
                    : "border border-purple-200 bg-white text-purple-950 hover:bg-purple-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <Link
            href={"/contact"}
            className={`p-2 bg-amber-400 rounded-full flex xl:hidden`}
          >
            <FaPhoneAlt className="w-3 h-3 text-purple-700" />
            {/* <span>C</span> */}
          </Link>
        </div>

        {/* Mobile Full-Width Search Bar */}
        <div className="md:hidden px-4 pb-3 pt-1">
          <Search
            placeholder="Search gifts, stationery, diaries..."
            buttonText="Go"
            showCategorySelector={false}
            showSuggestions={true}
            size="sm"
          />
        </div>
      </div>

      {/* MOBILE SLIDE-IN DRAWER */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          isMobileMenuOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          role="presentation"
          onClick={() => setIsMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <aside
          role="dialog"
          aria-label="Navigation menu"
          className={`absolute top-0 left-0 h-full w-[80%] max-w-xs bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <Link href={"/"}>
            <div className="p-4 flex items-center justify-between bg-purple-950 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white shrink-0">
                  <Image
                    src={Logo}
                    alt="Depcom"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold">Depcom</p>
                  <p className="text-[10px] text-purple-200">
                    Gifts & Fine Stationery
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-1.5 rounded-full hover:bg-purple-800 transition-colors text-purple-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </Link>

          {/* Links */}
          <nav
            aria-label="Mobile navigation"
            className="flex-1 overflow-y-auto p-4"
          >
            <ul className="space-y-2">
              {NAV_LINKS.map(({ href, label, icon: Icon, primary }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                      primary
                        ? "bg-purple-950 text-white hover:bg-purple-800"
                        : "border border-purple-200 bg-white text-purple-950 hover:bg-purple-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </header>
  );
}
