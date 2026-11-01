"use client";

import React, { Suspense, useState } from "react";
import ClientHeader from "@/components/client/ClientHeader";
import BannerCarousel from "@/components/client/BannerCarousel";
import ClientFooter from "@/components/client/ClientFooter";
import Blocks from "@/components/client/Blocks";
import NewArrivals from "@/components/client/NewArrivals";
import TopProducts from "@/components/client/TopProducts";
import VisualCategoryStrip from "@/components/client/VisualCategoryStrip";
import ProductSections from "@/components/client/Productsections";
import { ProductRow } from "@/components/client/Productsections";
import CategorySelector from "@/components/client/CategorySelector";
import CategoryImageStrip from "@/components/client/CategoryImageStrip";
import ContactCTA from "@/components/client/ContactCTA";
import ReelsCarousel from "@/components/client/Reelscarousel";

export default function Home() {
  const [blockFilter, setBlockFilter] = useState("");

  return (
    <div className="bg-[#FAFAFB] text-slate-800 flex flex-col">
      <BannerCarousel />

      <CategorySelector onSelect={setBlockFilter} />

      <CategoryImageStrip />
      <div className="py-7">
        <ProductRow
          title="New Arrivals"
          subtitle="Fresh pieces, just landed."
          section="New Arrivals"
          filter={blockFilter}
        />
        <ProductRow
          title="Best Sellers"
          subtitle="Customer favourites."
          section="Bestseller"
          filter={blockFilter}
        />
        <ProductRow
          title="Top Products"
          subtitle="Our most loved picks."
          section="Top Products"
          filter={blockFilter}
        />
        <ProductRow
          title="All Products"
          subtitle="Browse everything."
          filter={blockFilter}
        />
      </div>
      <ReelsCarousel/>
      <ContactCTA />
    </div>
  );
}
