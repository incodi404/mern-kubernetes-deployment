"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import { toast } from "react-toastify";
import Loading from "@/components/admin/Loading";
import { Eye } from "lucide-react";

type InterestProduct = {
  _id: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  productId: string;
  productSnapshot: {
    title: string;
    description: string;
    images: string[];
  };
  variantSnapshot: {
    value: string;
    variantId: string;
    mrp: number;
    discount: number;
    sellingPrice: number;
  };
  totalQuantity: number;
  isViewed: boolean;
};

const LIMIT = 10;

const InterestProductsPage = () => {
  const [loading, setLoading] = useState(false);
  const [interests, setInterests] = useState<InterestProduct[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [variantId, setVariantId] = useState("");
  const [variantValue, setVariantValue] = useState("");
  const [isViewed, setIsViewed] = useState("All");
  const [minQuantity, setMinQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");

  // drawer
  const [selected, setSelected] = useState<InterestProduct | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchInterestsFunc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchInterestsFunc() {
    try {
      setLoading(true);

      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (userName.trim()) params.userName = userName.trim();
      if (userPhone.trim()) params.userPhone = userPhone.trim();
      if (userEmail.trim()) params.userEmail = userEmail.trim();
      if (productTitle.trim()) params.productTitle = productTitle.trim();
      if (variantId.trim()) params.variantId = variantId.trim();
      if (variantValue.trim()) params.variantValue = variantValue.trim();
      if (isViewed !== "All") params.isViewed = isViewed;
      if (minQuantity.trim()) params.minQuantity = minQuantity.trim();
      if (maxQuantity.trim()) params.maxQuantity = maxQuantity.trim();

      const res = await axios.get(
        `${SERVER_URL}/product/interested/${page}/${LIMIT}`,
        {
          params,
          withCredentials: true,
        },
      );

      const data = res?.data?.data;

      if (Array.isArray(data)) {
        setInterests([]);
        setTotalPages(1);
      } else {
        setInterests(data?.data || []);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    setPage(1);
    fetchInterestsFunc();
  }

  function resetFilters() {
    setSearch("");
    setUserName("");
    setUserPhone("");
    setUserEmail("");
    setProductTitle("");
    setVariantId("");
    setVariantValue("");
    setIsViewed("All");
    setMinQuantity("");
    setMaxQuantity("");
    setPage(1);
  }

  function openDrawer(item: InterestProduct) {
    setSelected(item);
    setDrawerOpen(true);
  }

  return (
    <>
      {loading && <Loading />}
      <div className="p-6 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-semibold">Interested Products</h1>
          <p className="text-sm text-muted-foreground">
            Users who showed interest in a product variant
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 bg-muted/40 p-4 rounded-xl">
          <div className="grid gap-1.5">
            <Label>Search</Label>
            <Input
              placeholder="Name, phone, product or variant"
              value={search}
              onChange={(eve) => setSearch(eve.target.value)}
              className="w-56"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>User Name</Label>
            <Input
              placeholder="User name"
              value={userName}
              onChange={(eve) => setUserName(eve.target.value)}
              className="w-40"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Phone</Label>
            <Input
              placeholder="Phone"
              value={userPhone}
              onChange={(eve) => setUserPhone(eve.target.value)}
              className="w-36"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Email</Label>
            <Input
              placeholder="Email"
              value={userEmail}
              onChange={(eve) => setUserEmail(eve.target.value)}
              className="w-44"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Product Title</Label>
            <Input
              placeholder="Product title"
              value={productTitle}
              onChange={(eve) => setProductTitle(eve.target.value)}
              className="w-44"
            />
          </div>

          {/* <div className="grid gap-1.5">
            <Label>Variant ID</Label>
            <Input
              placeholder="VAR1234"
              value={variantId}
              onChange={(eve) => setVariantId(eve.target.value)}
              className="w-32"
            />
          </div> */}

          {/* <div className="grid gap-1.5">
            <Label>Variant Value</Label>
            <Input
              placeholder="e.g. 500g"
              value={variantValue}
              onChange={(eve) => setVariantValue(eve.target.value)}
              className="w-32"
            />
          </div> */}

          <div className="grid gap-1.5">
            <Label>Viewed</Label>
            <Select
              value={isViewed}
              onValueChange={(value) => setIsViewed(value ?? "All")}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="true">Viewed</SelectItem>
                <SelectItem value="false">Not Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Min Qty</Label>
            <Input
              type="number"
              placeholder="0"
              value={minQuantity}
              onChange={(eve) => setMinQuantity(eve.target.value)}
              className="w-24"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Max Qty</Label>
            <Input
              type="number"
              placeholder="0"
              value={maxQuantity}
              onChange={(eve) => setMaxQuantity(eve.target.value)}
              className="w-24"
            />
          </div>

          <Button type="button" onClick={applyFilters}>
            Apply
          </Button>
          <Button type="button" variant="outline" onClick={resetFilters}>
            Reset
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Viewed</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interests.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    No interested products found
                  </TableCell>
                </TableRow>
              )}

              {interests.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.userName}</TableCell>
                  <TableCell>{item.userPhone}</TableCell>
                  <TableCell>{item.productSnapshot?.title}</TableCell>
                  <TableCell>{item.variantSnapshot?.value}</TableCell>
                  <TableCell>{item.totalQuantity}</TableCell>
                  <TableCell>
                    ₹
                    {item.variantSnapshot?.sellingPrice?.toLocaleString(
                      "en-IN",
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.isViewed ? "default" : "secondary"}>
                      {item.isViewed ? "Viewed" : "Not Viewed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => openDrawer(item)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted"
                      aria-label="View details"
                    >
                      <Eye className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Details Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg w-full">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.productSnapshot?.title}</SheetTitle>
                <SheetDescription>
                  Interest from {selected.userName}
                </SheetDescription>
              </SheetHeader>

              <div className="px-4 pb-6 flex flex-col gap-6">
                <div>
                  <Badge variant={selected.isViewed ? "default" : "secondary"}>
                    {selected.isViewed ? "Viewed" : "Not Viewed"}
                  </Badge>
                </div>

                {!!selected.productSnapshot?.images?.length && (
                  <div className="flex gap-2 flex-wrap">
                    {selected.productSnapshot.images.map((img, i) => (
                      <div
                        key={i}
                        className="w-20 h-20 relative rounded-md overflow-hidden bg-muted"
                      >
                        <img
                          src={`${SERVER_URL}/file/get/${img}`}
                          alt={selected.productSnapshot.title}
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selected.userPhone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selected.userEmail || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{selected.totalQuantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Variant ID</p>
                    <p className="font-medium">
                      {selected.variantSnapshot?.variantId}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Variant Value</p>
                    <p className="font-medium">
                      {selected.variantSnapshot?.value}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Selling Price</p>
                    <p className="font-medium">
                      ₹
                      {selected.variantSnapshot?.sellingPrice?.toLocaleString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">MRP</p>
                    <p className="font-medium">
                      ₹{selected.variantSnapshot?.mrp?.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Discount</p>
                    <p className="font-medium">
                      {selected.variantSnapshot?.discount}%
                    </p>
                  </div>
                </div>

                {/* <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">
                    {selected.productSnapshot?.description}
                  </p>
                </div> */}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default InterestProductsPage;
