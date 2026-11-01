"use client";

// app/admin/products/[productId]/edit/page.tsx

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/admin/Loading";
import { Plus, RotateCcw, Trash2, X } from "lucide-react";

type Subcategory = {
  _id: string;
  name: string;
  block?: string;
};

type Variant = {
  variantId: string;
  value: string;
  mrp: string;
  discount: string;
  sellingPrice: string;
};

const SECTIONS = ["Bestseller", "New Arrivals", "Top Products"];
const BLOCKS = ["STATIONARY", "GIFT"];

// TODO: adjust to however your server serves uploaded files
const imageUrl = (filename: string) => `${SERVER_URL}/file/get/${filename}`;

const newVariantId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const emptyVariant = (): Variant => ({
  variantId: newVariantId(),
  value: "",
  mrp: "",
  discount: "",
  sellingPrice: "",
});

const EditProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const productId = id;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // the real Mongo _id of the loaded product (the PUT API needs this,
  // the URL param may be a slug)
  const [productDbId, setProductDbId] = useState("");

  // fields
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [description, setDescription] = useState("");
  const [block, setBlock] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    [],
  );
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  // images: existing ones come from the server and can be marked for removal,
  // new ones are uploaded and appended to the kept ones
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // revoke blob URLs when leaving the page
  useEffect(() => {
    return () => {
      newImagePreviews.forEach((src) => URL.revokeObjectURL(src));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPage() {
    try {
      setLoading(true);

      const [subRes, productRes] = await Promise.all([
        axios.get(`${SERVER_URL}/subcategory/1/1000`, {
          withCredentials: true,
        }),
        // TODO: confirm this is your "get single product" endpoint
        axios.get(`${SERVER_URL}/product/1/1?slug=${productId}`, {
          withCredentials: true,
        }),
      ]);

      const subData = subRes?.data?.data;
      setSubcategories(Array.isArray(subData) ? [] : subData?.data || []);

      const rawData = productRes?.data?.data?.data;
      let product = null;
      if (Array.isArray(rawData) && rawData.length > 0) {
        product = rawData[0];
      }

      if (!product) {
        toast.error("Product not found");
        router.push("/admin/products");
        return;
      }

      setProductDbId(product._id || "");
      setTitle(product.title || "");
      setSubTitle(product.subTitle || "");
      setDescription(product.description || "");
      setBlock(product.block || "");
      setIsActive(product.isActive !== false);
      setExistingImages(product.images || []);
      setRemovedImages([]);
      setSelectedSections(product.sections || []);

      // subcategory may come back as ids or populated objects
      setSelectedSubcategories(
        (product.subcategory || []).map((s: any) =>
          typeof s === "string" ? s : s?._id,
        ),
      );

      const loadedVariants: Variant[] = (product.variant || []).map(
        (v: any) => ({
          variantId: v.variantId || newVariantId(),
          value: v.value ?? "",
          mrp: String(v.mrp ?? ""),
          discount: String(v.discount ?? ""),
          sellingPrice: String(v.sellingPrice ?? ""),
        }),
      );
      setVariants(
        loadedVariants.length > 0 ? loadedVariants : [emptyVariant()],
      );
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  }

  // variant handlers
  function addVariant() {
    setVariants((prev) => [...prev, emptyVariant()]);
  }

  function removeVariant(variantId: string) {
    setVariants((prev) => prev.filter((item) => item.variantId !== variantId));
  }

  function updateVariant(variantId: string, key: keyof Variant, value: string) {
    setVariants((prev) =>
      prev.map((item) =>
        item.variantId === variantId ? { ...item, [key]: value } : item,
      ),
    );
  }

  // changing block changes the available subcategories, so clear old picks
  function handleBlockChange(value: string | null) {
    const next = value ?? "";
    if (next === block) return;
    setBlock(next);
    setSelectedSubcategories([]);
  }

  const filteredSubcategories = block
    ? subcategories.filter((sub) => sub.block === block)
    : [];

  function toggleSubcategory(id: string) {
    setSelectedSubcategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function toggleSection(section: string) {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((item) => item !== section)
        : [...prev, section],
    );
  }

  // existing images: mark for removal / undo (nothing is deleted until Save)
  async function toggleRemoveExistingImage(filename: string) {
    try {
      setLoading(true);
      const res = await axios.delete(
        `${SERVER_URL}/product/image/${productDbId}/${filename}`,
        { withCredentials: true },
      );

      toast.success("Image has been deleted");
      loadPage();
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // new images
  function handleImagesChange(eve: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(eve.target.files || []);
    if (files.length === 0) return;

    setNewImages((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
    eve.target.value = "";
  }

  function removeNewImage(index: number) {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function updateProductFunc() {
    if (title.trim() === "") {
      toast.error("Title is required");
      return;
    }

    if (description.trim() === "") {
      toast.error("Description is required");
      return;
    }

    const cleanedVariants = variants.filter((item) => item.value.trim());

    if (cleanedVariants.length === 0) {
      toast.error("At least one variant is required");
      return;
    }

    // the API ignores the whole variant list if any item is invalid
    for (const item of cleanedVariants) {
      if (
        item.mrp === "" ||
        item.discount === "" ||
        item.sellingPrice === "" ||
        isNaN(Number(item.mrp)) ||
        isNaN(Number(item.discount)) ||
        isNaN(Number(item.sellingPrice)) ||
        Number(item.mrp) < 0 ||
        Number(item.discount) < 0 ||
        Number(item.sellingPrice) < 0
      ) {
        toast.error("Variant prices should be valid, non-negative numbers");
        return;
      }
    }

    if (!block) {
      toast.error("Block is required");
      return;
    }

    if (selectedSubcategories.length === 0) {
      toast.error("At least one subcategory is required");
      return;
    }

    const keptCount = existingImages.length - removedImages.length;
    if (keptCount + newImages.length === 0) {
      toast.error("At least one product image is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      if (subTitle.trim()) formData.append("subTitle", subTitle.trim());
      formData.append("description", description.trim());
      formData.append("block", block);
      formData.append("isActive", JSON.stringify(isActive));

      formData.append(
        "variant",
        JSON.stringify(
          cleanedVariants.map((item) => ({
            variantId: item.variantId,
            value: item.value.trim(),
            mrp: Number(item.mrp),
            discount: Number(item.discount),
            sellingPrice: Number(item.sellingPrice),
          })),
        ),
      );

      formData.append("subcategory", JSON.stringify(selectedSubcategories));
      formData.append("sections", JSON.stringify(selectedSections));

      // filenames of existing images to delete (needs the backend patch)
      if (removedImages.length > 0) {
        formData.append("removeImages", JSON.stringify(removedImages));
      }

      newImages.forEach((file) => formData.append("images", file));

      const res = await axios.put(
        `${SERVER_URL}/product/${productDbId || productId}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success(res?.data?.message || "Product updated successfully");
      router.push("/admin/products");
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (productId?.trim() === "") return;
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return (
    <>
      {loading && <Loading />}
      <div className="p-6 flex justify-center">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
            <CardDescription>
              Update the details below and save your changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8">
              {/* Basic info */}
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label>Title</Label>
                  <Input
                    placeholder="Product title"
                    value={title}
                    onChange={(eve) => setTitle(eve.target.value)}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label>Sub Title (optional)</Label>
                  <Input
                    placeholder="Product sub title"
                    value={subTitle}
                    onChange={(eve) => setSubTitle(eve.target.value)}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Product description"
                    value={description}
                    onChange={(eve) => setDescription(eve.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label>Block</Label>
                  <Select
                    value={block}
                    onValueChange={(value) => handleBlockChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a block">
                        {block || undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {BLOCKS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(checked === true)}
                  />
                  Active (visible in the store)
                </label>
              </div>

              {/* Variants */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Variants</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                  >
                    <Plus className="size-4" />
                    Add Variant
                  </Button>
                </div>

                {variants.map((variant) => (
                  <div
                    key={variant.variantId}
                    className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center"
                  >
                    <Input
                      placeholder="Value (e.g. 500g)"
                      value={variant.value}
                      onChange={(eve) =>
                        updateVariant(
                          variant.variantId,
                          "value",
                          eve.target.value,
                        )
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="MRP"
                      value={variant.mrp}
                      onChange={(eve) =>
                        updateVariant(
                          variant.variantId,
                          "mrp",
                          eve.target.value,
                        )
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="Discount"
                      value={variant.discount}
                      onChange={(eve) =>
                        updateVariant(
                          variant.variantId,
                          "discount",
                          eve.target.value,
                        )
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="Selling Price"
                      value={variant.sellingPrice}
                      onChange={(eve) =>
                        updateVariant(
                          variant.variantId,
                          "sellingPrice",
                          eve.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.variantId)}
                      aria-label="Remove variant"
                      className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Subcategories */}
              <div className="grid gap-3">
                <Label>Subcategories</Label>
                {!block && (
                  <p className="text-sm text-muted-foreground">
                    Select a block above to see its subcategories.
                  </p>
                )}
                {block && filteredSubcategories.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No subcategories found for the {block} block.
                  </p>
                )}
                {block && filteredSubcategories.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {filteredSubcategories.map((sub) => (
                      <label
                        key={sub._id}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedSubcategories.includes(sub._id)}
                          onCheckedChange={() => toggleSubcategory(sub._id)}
                        />
                        {sub.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Sections */}
              <div className="grid gap-3">
                <Label>Sections (optional)</Label>
                <div className="flex flex-wrap gap-4 border rounded-lg p-3">
                  {SECTIONS.map((section) => (
                    <label
                      key={section}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedSections.includes(section)}
                        onCheckedChange={() => toggleSection(section)}
                      />
                      {section}
                    </label>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="grid gap-3">
                <Label>Product Images</Label>

                {existingImages.length > 0 && (
                  <div className="grid gap-2">
                    <p className="text-sm text-muted-foreground">
                      Current images (removed images are deleted when you save)
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map((filename) => {
                        const isRemoved = removedImages.includes(filename);
                        return (
                          <div
                            key={filename}
                            className="relative w-20 h-20 rounded-md overflow-hidden bg-muted"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl(filename)}
                              alt="Product"
                              className={`w-full h-full object-cover ${
                                isRemoved ? "opacity-30 grayscale" : ""
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                toggleRemoveExistingImage(filename)
                              }
                              aria-label={
                                isRemoved
                                  ? "Keep this image"
                                  : "Remove this image"
                              }
                              className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
                            >
                              {isRemoved ? (
                                <RotateCcw className="size-3" />
                              ) : (
                                <X className="size-3" />
                              )}
                            </button>
                            {isRemoved && (
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                                Will be removed
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">
                    Add more images (they are added to the kept ones)
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                  />
                  {newImagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {newImagePreviews.map((src, index) => (
                        <div
                          key={src}
                          className="relative w-20 h-20 rounded-md overflow-hidden bg-muted"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={`New image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            aria-label="Remove image"
                            className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              type="button"
              className="w-full"
              onClick={updateProductFunc}
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/admin/products")}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default EditProductPage;
