"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import { toast } from "react-toastify";
import Loading from "@/components/admin/Loading";
import { Pencil, Trash2, Plus } from "lucide-react";

// NOTE: BLOCKS mirrors the backend constant — keep this in sync if it changes there.
const BLOCKS = ["STATIONARY", "GIFT"];

// NOTE: assuming uploaded images are served from SERVER_URL + "/uploads/<filename>".
// Adjust IMAGE_BASE if your static file route differs.
const IMAGE_BASE = `${SERVER_URL}/file/get`;

const LIMIT = 10;

type Category = {
  _id: string;
  name: string;
  isActive?: boolean;
  block?: string;
};

type Subcategory = {
  _id: string;
  name: string;
  catagoryId: string;
  categoryName?: string;
  category?: Category;
  image: string;
  block?: string;
  isActive: boolean;
  createdAt?: string;
};

type FormState = {
  name: string;
  catagoryId: string;
  block: string; // "" = none
  isActive: boolean;
  imageFile: File | null;
};

const EMPTY_FORM: FormState = {
  name: "",
  catagoryId: "",
  block: "",
  isActive: true,
  imageFile: null,
};

const SubcategoryPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [search, setSearch] = useState("");
  const [categoryNameFilter, setCategoryNameFilter] = useState("All");
  const [isActiveFilter, setIsActiveFilter] = useState("All");
  const [blockFilter, setBlockFilter] = useState("All");

  // dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoriesFunc();
  }, []);

  useEffect(() => {
    fetchSubcategoriesFunc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchCategoriesFunc() {
    try {
      const res = await axios.get(`${SERVER_URL}/category/1/100`, {
        withCredentials: true,
      });
      const data = res?.data?.data;
      setCategories(Array.isArray(data) ? [] : data?.data || []);
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(
        error?.response?.data?.message || "Failed to fetch categories",
      );
    }
  }

  async function fetchSubcategoriesFunc() {
    try {
      setLoading(true);

      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (categoryNameFilter !== "All")
        params.categoryName = categoryNameFilter;
      if (isActiveFilter !== "All") params.isActive = isActiveFilter;
      if (blockFilter !== "All") params.block = blockFilter;

      const res = await axios.get(
        `${SERVER_URL}/subcategory/${page}/${LIMIT}`,
        {
          params,
          withCredentials: true,
        },
      );

      const data = res?.data?.data;

      if (Array.isArray(data)) {
        setSubcategories([]);
        setTotalPages(1);
      } else {
        // console.log("Data: ", data?.data);
        setSubcategories(data?.data || []);
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
    fetchSubcategoriesFunc();
  }

  function resetFilters() {
    setSearch("");
    setCategoryNameFilter("All");
    setIsActiveFilter("All");
    setBlockFilter("All");
    setPage(1);
  }

  function openCreateDialog() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImagePreview(null);
    setDialogOpen(true);
  }

  function openEditDialog(subcategory: Subcategory) {
    setEditingId(subcategory._id);
    setForm({
      name: subcategory.name,
      catagoryId: subcategory.catagoryId,
      block: subcategory.block || "",
      isActive: subcategory.isActive,
      imageFile: null,
    });
    setImagePreview(
      subcategory.image ? `${IMAGE_BASE}/${subcategory.image}` : null,
    );
    setDialogOpen(true);
  }

  function handleImageChange(file: File | null) {
    setForm((prev) => ({ ...prev, imageFile: file }));
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!form.catagoryId) {
      toast.error("Category is required");
      return;
    }

    if (!editingId && !form.imageFile) {
      toast.error("Subcategory image is required");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("catagoryId", form.catagoryId);
      //   if (form.block) formData.append("block", form.block);
      if (editingId) formData.append("isActive", String(form.isActive));
      if (form.imageFile) formData.append("image", form.imageFile);

      let res;
      if (editingId) {
        res = await axios.put(
          `${SERVER_URL}/subcategory/${editingId}`,
          formData,
          { withCredentials: true },
        );
      } else {
        res = await axios.post(`${SERVER_URL}/subcategory`, formData, {
          withCredentials: true,
        });
      }

      toast.success(
        res?.data?.message ||
          (editingId
            ? "Subcategory updated successfully"
            : "Subcategory created successfully"),
      );

      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchSubcategoriesFunc();
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(subCategoryId: string) {
    const confirmed = window.confirm(
      "Delete this subcategory? This cannot be undone.",
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await axios.delete(
        `${SERVER_URL}/subcategory/${subCategoryId}`,
        { withCredentials: true },
      );
      toast.success(res?.data?.message || "Subcategory deleted successfully");
      fetchSubcategoriesFunc();
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {(loading || submitting) && <Loading />}
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Subcategories</h1>
            <p className="text-sm text-muted-foreground">
              Manage subcategories under each category
            </p>
          </div>
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="size-4" />
            New Subcategory
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 bg-muted/40 p-4 rounded-xl">
          <div className="grid gap-1.5">
            <Label>Search</Label>
            <Input
              placeholder="Subcategory name"
              value={search}
              onChange={(eve) => setSearch(eve.target.value)}
              className="w-56"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Category</Label>
            <Select
              value={categoryNameFilter}
              onValueChange={(value) => setCategoryNameFilter(value ?? "All")}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Block</Label>
            <Select
              value={blockFilter}
              onValueChange={(value) => setBlockFilter(value ?? "All")}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {BLOCKS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select
              value={isActiveFilter}
              onValueChange={(value) => setIsActiveFilter(value ?? "All")}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategories.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No subcategories found
                  </TableCell>
                </TableRow>
              )}

              {subcategories.map((sub) => (
                <TableRow key={sub._id}>
                  <TableCell>
                    {sub.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${IMAGE_BASE}/${sub.image}`}
                        alt={sub.name}
                        className="w-10 h-10 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>
                    {sub.categoryName || sub.category?.name || "-"}
                  </TableCell>
                  <TableCell>
                    {sub.block ? (
                      <Badge variant="outline">{sub.block}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sub.isActive ? "default" : "secondary"}>
                      {sub.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEditDialog(sub)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted"
                        aria-label="Edit subcategory"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sub._id)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-destructive/10 text-destructive"
                        aria-label="Delete subcategory"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
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

      {/* Create / Update Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Update Subcategory" : "Create Subcategory"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the details below and save your changes."
                : "Fill in the details to add a new subcategory."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input
                placeholder="Subcategory name"
                value={form.name}
                onChange={(eve) =>
                  setForm((prev) => ({ ...prev, name: eve.target.value }))
                }
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select
                value={form.catagoryId}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, catagoryId: value ?? "" }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* <div className="grid gap-1.5">
              <Label>Block (optional)</Label>
              <Select
                value={form.block || "none"}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    block: value === "none" ? "" : (value ?? ""),
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {BLOCKS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            <div className="grid gap-1.5">
              <Label>
                Image{editingId ? " (leave blank to keep current)" : ""}
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(eve) =>
                  handleImageChange(eve.target.files?.[0] || null)
                }
              />
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-md mt-1"
                />
              )}
            </div>

            {editingId && (
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked: boolean) =>
                    setForm((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {editingId ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubcategoryPage;
