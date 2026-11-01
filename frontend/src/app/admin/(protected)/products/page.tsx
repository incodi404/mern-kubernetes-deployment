"use client";

// app/admin/products/page.tsx

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Loading from "@/components/admin/Loading";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";

type ProductVariant = {
  variantId: string;
  value: string;
  mrp: number;
  discount: number;
  sellingPrice: number;
};

type Product = {
  _id: string;
  title: string;
  subTitle?: string;
  block: string;
  isActive: boolean;
  sections?: string[];
  images?: string[];
  variant?: ProductVariant[];
  // added by the $lookup stages in getAllProducts
  subcategories?: { _id: string; name: string }[];
  categories?: { _id: string; name: string }[];
  slug: string;
};

const BLOCKS = ["STATIONARY", "GIFT"];
const SECTIONS = ["Bestseller", "New Arrivals", "Top Products"];
const LIMIT = 10;

// TODO: adjust to however your server serves uploaded files
const imageUrl = (filename: string) => `${SERVER_URL}/file/get/${filename}`;

function priceRange(variants?: ProductVariant[]) {
  if (!variants || variants.length === 0) return "-";
  const prices = variants.map((v) => v.sellingPrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
}

const ProductsPage = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [block, setBlock] = useState("all");
  const [status, setStatus] = useState("all");
  const [section, setSection] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [debouncedPrice, setDebouncedPrice] = useState({ min: "", max: "" });

  // debounce text inputs so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedPrice({ min: minPrice.trim(), max: maxPrice.trim() }),
      400,
    );
    return () => clearTimeout(t);
  }, [minPrice, maxPrice]);

  // any filter change goes back to page 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, block, status, section, debouncedPrice]);

  const fetchProductsFunc = useCallback(async () => {
    try {
      setLoading(true);

      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (block !== "all") params.block = block;
      if (status !== "all") params.isActive = status;
      if (section !== "all") params.sections = section;
      if (debouncedPrice.min !== "") params.minPrice = debouncedPrice.min;
      if (debouncedPrice.max !== "") params.maxPrice = debouncedPrice.max;

      const res = await axios.get(`${SERVER_URL}/product/${page}/${LIMIT}`, {
        params,
        withCredentials: true,
      });

      // "No products found" comes back as data: []
      const data = res?.data?.data;
      if (Array.isArray(data) || !data) {
        setProducts([]);
        setTotalPages(1);
      } else {
        console.log("Products: ", data.data);
        setProducts(data.data || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, block, status, section, debouncedPrice]);

  useEffect(() => {
    fetchProductsFunc();
  }, [fetchProductsFunc]);

  async function deleteProductFunc(product: Product) {
    const ok = window.confirm(
      `Delete "${product.title}"? This also removes its images and cannot be undone.`,
    );
    if (!ok) return;

    try {
      setLoading(true);

      const res = await axios.delete(`${SERVER_URL}/product/${product._id}`, {
        withCredentials: true,
      });

      toast.success(res?.data?.message || "Product deleted successfully");

      // if that was the only row on this page, step back one page
      if (products.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchProductsFunc();
      }
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setBlock("all");
    setStatus("all");
    setSection("all");
    setMinPrice("");
    setMaxPrice("");
  }

  const hasFilters =
    search !== "" ||
    block !== "all" ||
    status !== "all" ||
    section !== "all" ||
    minPrice !== "" ||
    maxPrice !== "";

  return (
    <>
      {loading && <Loading />}
      <div className="p-6 flex justify-center">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  Search, filter, edit or remove products
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={() => router.push("/admin/products/create")}
              >
                <Plus className="size-4" />
                Create Product
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-6">
              {/* Filters */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  className="lg:col-span-2"
                  placeholder="Search title, description, category..."
                  value={search}
                  onChange={(eve) => setSearch(eve.target.value)}
                />

                <Select
                  value={block}
                  onValueChange={(value) => setBlock(value ?? "all")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Block">
                      {block === "all" ? "All blocks" : block}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All blocks</SelectItem>
                    {BLOCKS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value ?? "all")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status">
                      {status === "all"
                        ? "All statuses"
                        : status === "true"
                          ? "Active"
                          : "Inactive"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={section}
                  onValueChange={(value) => setSection(value ?? "all")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Section">
                      {section === "all" ? "All sections" : section}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sections</SelectItem>
                    {SECTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min={0}
                  placeholder="Min price"
                  value={minPrice}
                  onChange={(eve) => setMinPrice(eve.target.value)}
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Max price"
                  value={maxPrice}
                  onChange={(eve) => setMaxPrice(eve.target.value)}
                />

                {hasFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-muted-foreground">
                    <tr>
                      <th className="p-3 font-medium">Product</th>
                      <th className="p-3 font-medium">Block</th>
                      <th className="p-3 font-medium">Categories</th>
                      <th className="p-3 font-medium">Variants</th>
                      <th className="p-3 font-medium">Price</th>
                      <th className="p-3 font-medium">Sections</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={8}
                          className="p-8 text-center text-muted-foreground"
                        >
                          {hasFilters
                            ? "No products match these filters."
                            : "No products yet. Create your first product to get started."}
                        </td>
                      </tr>
                    )}

                    {products.map((product) => (
                      <tr key={product._id} className="border-t align-top">
                        <td className="p-3">
                          <div className="flex items-center gap-3 min-w-56">
                            <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-muted">
                              {product.images?.[0] && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={imageUrl(product.images[0])}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {product.title}
                              </p>
                              {product.subTitle && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {product.subTitle}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-3">{product.block}</td>

                        <td className="p-3">
                          <div className="min-w-40">
                            <p>
                              {product.categories
                                ?.map((c) => c.name)
                                .join(", ") || "-"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.subcategories
                                ?.map((s) => s.name)
                                .join(", ")}
                            </p>
                          </div>
                        </td>

                        <td className="p-3">
                          {product.variant?.map((v) => v.value).join(", ") ||
                            "-"}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {priceRange(product.variant)}
                        </td>

                        <td className="p-3">
                          {product.sections && product.sections.length > 0
                            ? product.sections.join(", ")
                            : "-"}
                        </td>

                        <td className="p-3">
                          <span
                            className={
                              product.isActive
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/admin/products/${product?.slug}`)
                              }
                            >
                              <Pencil className="size-4" />
                              Edit
                            </Button>
                            <button
                              type="button"
                              onClick={() => deleteProductFunc(product)}
                              aria-label={`Delete ${product.title}`}
                              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ProductsPage;
