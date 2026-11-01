"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import { toast } from "react-toastify";
import { ImageIcon, Plus, Pencil, Search, Trash2 } from "lucide-react";
import Loading from "@/components/admin/Loading";

// Keep this in sync with the backend's BLOCKS constant.
const BLOCKS = ["STATIONARY", "GIFT"];
const ALL_BLOCKS = "all";
const ALL_STATUS = "all";

type Category = {
  _id: string;
  name: string;
  image: string;
  block?: string;
  isActive: boolean;
};

const LIMIT = 10;

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

// The API stores a server file path/filename for the image. Adjust this if
// your static files are served from a different base or folder.
const getImageUrl = (path?: string) => {
  if (!path) return "";
  return `${SERVER_URL}/file/get/${path}`;
};

const Categories = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState(ALL_BLOCKS);
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS);

  const hasFilters =
    debouncedSearch !== "" ||
    blockFilter !== ALL_BLOCKS ||
    statusFilter !== ALL_STATUS;

  // create/edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [block, setBlock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  // delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  async function getCategories() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (blockFilter !== ALL_BLOCKS) params.block = blockFilter;
      if (statusFilter !== ALL_STATUS) params.isActive = statusFilter;

      const res = await axios.get(`${SERVER_URL}/category/${page}/${LIMIT}`, {
        params,
        withCredentials: true,
      });

      // the API returns either { totalPages, currentPage, data: [...] } or,
      // when there's nothing to show, a plain empty array
      const responseData = res?.data?.data;
      if (Array.isArray(responseData)) {
        setCategories([]);
        setTotalPages(1);
      } else {
        setCategories(responseData?.data || []);
        setTotalPages(responseData?.totalPages || 1);
      }
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function saveCategory() {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (!editingCategory && !image) {
      toast.error("Category image is required");
      return;
    }

    try {
      setLoading(true);
      const fieldData = new FormData();
      fieldData.append("name", name.trim());
      if (block) fieldData.append("block", block);
      if (image) fieldData.append("image", image);

      if (editingCategory) {
        fieldData.append("isActive", String(isActive));
        const res = await axios.put(
          `${SERVER_URL}/category/${editingCategory._id}`,
          fieldData,
          { withCredentials: true },
        );
        toast.success(res?.data?.message || "Category updated successfully");
      } else {
        const res = await axios.post(`${SERVER_URL}/category`, fieldData, {
          withCredentials: true,
        });
        toast.success(res?.data?.message || "Category created successfully");
      }

      closeForm();
      await getCategories();
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(item: Category, value: boolean) {
    try {
      setLoading(true);
      const fieldData = new FormData();
      fieldData.append("isActive", String(value));
      await axios.put(`${SERVER_URL}/category/${item._id}`, fieldData, {
        withCredentials: true,
      });
      setCategories((prev) =>
        prev.map((c) => (c._id === item._id ? { ...c, isActive: value } : c)),
      );
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory() {
    if (!deleteTarget) return;
    try {
      setLoading(true);
      const res = await axios.delete(
        `${SERVER_URL}/category/${deleteTarget._id}`,
        { withCredentials: true },
      );
      toast.success(res?.data?.message || "Category deleted successfully");
      setDeleteTarget(null);

      // if that was the last item on this page, go back one page
      if (categories.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await getCategories();
      }
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setBlockFilter(ALL_BLOCKS);
    setStatusFilter(ALL_STATUS);
    setPage(1);
  }

  function openCreate() {
    setEditingCategory(null);
    setName("");
    setBlock("");
    setIsActive(true);
    setImage(null);
    setImagePreview("");
    setFormOpen(true);
  }

  function openEdit(item: Category) {
    setEditingCategory(item);
    setName(item.name);
    setBlock(item.block || "");
    setIsActive(item.isActive);
    setImage(null);
    setImagePreview(getImageUrl(item.image));
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCategory(null);
    setName("");
    setBlock("");
    setIsActive(true);
    setImage(null);
    setImagePreview("");
  }

  function handleImageChange(eve: React.ChangeEvent<HTMLInputElement>) {
    const file = eve?.target?.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  // wait for the user to stop typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, blockFilter, statusFilter]);

  return (
    <>
      {loading && <Loading />}
      <div className="p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Add category
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Filters */}
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by category name"
                  className="pl-9"
                  value={search}
                  onChange={(eve) => setSearch(eve?.target?.value)}
                />
              </div>
              <div className="md:w-48">
                <Select
                  value={blockFilter}
                  onValueChange={(value) => {
                    setBlockFilter(value ?? ALL_BLOCKS);
                    setPage(1);
                  }}
                  items={[
                    { value: ALL_BLOCKS, label: "All blocks" },
                    ...BLOCKS.map((item) => ({
                      value: item,
                      label: capitalize(item),
                    })),
                  ]}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-label="Filter by block"
                  >
                    <SelectValue placeholder="All blocks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_BLOCKS}>All blocks</SelectItem>
                    {BLOCKS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {capitalize(item)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-44">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value ?? ALL_STATUS);
                    setPage(1);
                  }}
                  items={[
                    { value: ALL_STATUS, label: "All statuses" },
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                  ]}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-label="Filter by status"
                  >
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_STATUS}>All statuses</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      {hasFilters
                        ? "No categories match your search or filters."
                        : "No categories yet. Add your first category to get started."}
                    </TableCell>
                  </TableRow>
                )}
                {categories.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <ImageIcon className="size-5" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {item.block ? capitalize(item.block) : "-"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={(value) => toggleActive(item, value)}
                        aria-label={`Toggle ${item.name} active`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Edit ${item.name}`}
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Delete ${item.name}`}
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => (open ? setFormOpen(true) : closeForm())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit category" : "Add category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the details below. Leave the image empty to keep the current one."
                : "Add a new category with a name and an image."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Notebooks"
                value={name}
                onChange={(eve) => setName(eve?.target?.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="block">Block</Label>
              <Select
                value={block}
                onValueChange={(value) => setBlock(value ?? "")}
                items={BLOCKS.map((item) => ({
                  value: item,
                  label: capitalize(item),
                }))}
              >
                <SelectTrigger id="block" className="w-full">
                  <SelectValue placeholder="Select a block (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {BLOCKS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {capitalize(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 h-40 w-full rounded-md object-cover"
                />
              )}
            </div>

            {editingCategory && (
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeForm}>
              Cancel
            </Button>
            <Button onClick={saveCategory}>
              {editingCategory ? "Save changes" : "Add category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} will be permanently removed. This can't be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCategory}>
              Delete category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Categories;
