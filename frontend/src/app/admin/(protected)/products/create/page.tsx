"use client";

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
import Image from "next/image";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Loading from "@/components/admin/Loading";
import { Plus, Trash2, X } from "lucide-react";

type Subcategory = {
  _id: string;
  name: string;
  block?: string;
};

type Variant = {
  value: string;
  mrp: string;
  discount: string;
  sellingPrice: string;
};

const SECTIONS = ["Bestseller", "New Arrivals", "Top Products"];
const BLOCKS = ["STATIONARY", "GIFT"];

const CreateProductPage = () => {
  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const router = useRouter();

  // fields
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [description, setDescription] = useState("");
  const [block, setBlock] = useState<string>("");
  const [rating, setRating] = useState("");

  const [variants, setVariants] = useState<Variant[]>([
    { value: "", mrp: "", discount: "", sellingPrice: "" },
  ]);

  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    [],
  );

  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchSubcategoriesFunc();
  }, []);

  async function fetchSubcategoriesFunc() {
    try {
      // large limit to effectively pull "all" subcategories for the checklist
      const res = await axios.get(`${SERVER_URL}/subcategory/1/1000`, {
        withCredentials: true,
      });

      const data = res?.data?.data;
      const list = Array.isArray(data) ? [] : data?.data || [];
      setSubcategories(list);
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(
        error?.response?.data?.message || "Failed to load subcategories",
      );
    }
  }

  // variant handlers
  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { value: "", mrp: "", discount: "", sellingPrice: "" },
    ]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, key: keyof Variant, value: string) {
    setVariants((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  }

  // block changes the set of subcategories available, so clear picks that
  // belonged to the old block
  function handleBlockChange(value: string | null) {
    setBlock(value ?? "");
    setSelectedSubcategories([]);
  }

  const filteredSubcategories = block
    ? subcategories.filter((sub) => sub.block === block)
    : [];

  // subcategory checklist
  function toggleSubcategory(id: string) {
    setSelectedSubcategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  // sections handlers
  function toggleSection(section: string) {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((item) => item !== section)
        : [...prev, section],
    );
  }

  // images
  function handleImagesChange(eve: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(eve.target.files || []);
    if (files.length === 0) return;

    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function createProductFunc() {
    if (title.trim() === "") {
      toast.error("Title is required");
      return;
    }

    if (description.trim() === "") {
      toast.error("Description is required");
      return;
    }

    const cleanedVariants = variants.filter((item) => item.value.trim());

    // console.log(cleanedVariants);

    if (cleanedVariants.length === 0) {
      toast.error("At least one variant is required");
      return;
    }

    for (const item of cleanedVariants) {
      if (
        item.mrp === "" ||
        item.discount === "" ||
        item.sellingPrice === "" ||
        isNaN(Number(item.mrp)) ||
        isNaN(Number(item.discount)) ||
        isNaN(Number(item.sellingPrice))
      ) {
        toast.error("Variant prices should be valid numbers");
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

    if (images.length === 0) {
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
      if (rating.trim()) formData.append("rating", rating.trim());

      formData.append(
        "variant",
        JSON.stringify(
          cleanedVariants.map((item) => ({
            value: item.value.trim(),
            mrp: Number(item.mrp),
            discount: Number(item.discount),
            sellingPrice: Number(item.sellingPrice),
          })),
        ),
      );

      formData.append("subcategory", JSON.stringify(selectedSubcategories));

      if (selectedSections.length > 0) {
        formData.append("sections", JSON.stringify(selectedSections));
      }

      images.forEach((file) => formData.append("images", file));

      const res = await axios.post(`${SERVER_URL}/product`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res?.data?.message || "Product created successfully");
      router.push("/admin/products");
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loading && <Loading />}
      <div className="p-6 flex justify-center">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Create Product</CardTitle>
            <CardDescription>
              Fill in the details below to add a new product
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

                <div className="grid gap-1.5">
                  <Label>Rating (optional)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    placeholder="0"
                    value={rating}
                    onChange={(eve) => setRating(eve.target.value)}
                  />
                </div>
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

                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center"
                  >
                    <Input
                      placeholder="Value (e.g. 500g)"
                      value={variant.value}
                      onChange={(eve) =>
                        updateVariant(index, "value", eve.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="MRP"
                      value={variant.mrp}
                      onChange={(eve) =>
                        updateVariant(index, "mrp", eve.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Discount (in %)"
                      value={variant.discount}
                      onChange={(eve) =>
                        updateVariant(index, "discount", eve.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Selling Price"
                      value={variant.sellingPrice}
                      onChange={(eve) =>
                        updateVariant(index, "sellingPrice", eve.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
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
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                />
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((src, index) => (
                      <div
                        key={index}
                        className="relative w-20 h-20 rounded-md overflow-hidden bg-muted"
                      >
                        <Image
                          src={src}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
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
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              type="button"
              className="w-full"
              onClick={createProductFunc}
            >
              Create Product
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default CreateProductPage;
