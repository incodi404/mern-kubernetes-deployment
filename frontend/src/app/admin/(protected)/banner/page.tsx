"use client";

// app/admin/banners/page.tsx

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import { toast } from "react-toastify";
import Loading from "@/components/admin/Loading";
import { ExternalLink, ImageIcon, Plus, Trash2, X } from "lucide-react";

type Banner = {
  _id: string;
  title: string;
  subtitle?: string;
  link?: string;
  image: string;
  createdAt?: string;
};

// TODO: adjust to however your server serves uploaded files
const imageUrl = (filename: string) => `${SERVER_URL}/file/get/${filename}`;

const BannersPage = () => {
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);

  // create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  // delete dialog
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBannersFunc();
  }, []);

  // revoke the preview URL when it changes or the page unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  async function fetchBannersFunc() {
    try {
      setLoading(true);

      const res = await axios.get(`${SERVER_URL}/banner`, {
        withCredentials: true,
      });

      const data = res?.data?.data;
      setBanners(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Failed to load banners");
    } finally {
      setLoading(false);
    }
  }

  function resetCreateForm() {
    setTitle("");
    setSubtitle("");
    setLink("");
    setImage(null);
    setImagePreview("");
  }

  function handleCreateOpenChange(open: boolean) {
    // don't let the dialog close while the request is running
    if (submitting) return;
    setCreateOpen(open);
    if (!open) resetCreateForm();
  }

  function handleImageChange(eve: React.ChangeEvent<HTMLInputElement>) {
    const file = eve.target.files?.[0];
    if (!file) return;

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    eve.target.value = "";
  }

  function removeImage() {
    setImage(null);
    setImagePreview("");
  }

  async function createBannerFunc() {
    if (title.trim() === "") {
      toast.error("Title is required");
      return;
    }

    if (!image) {
      toast.error("Banner image is required");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      if (subtitle.trim()) formData.append("subtitle", subtitle.trim());
      if (link.trim()) formData.append("link", link.trim());
      // field name must match upload.single("...") on the banner route
      formData.append("image", image);

      const res = await axios.post(`${SERVER_URL}/banner`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res?.data?.message || "Banner created successfully");

      setCreateOpen(false);
      resetCreateForm();
      await fetchBannersFunc();
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteBannerFunc() {
    if (!bannerToDelete) return;

    try {
      setDeleting(true);

      const res = await axios.delete(
        `${SERVER_URL}/banner/${bannerToDelete._id}`,
        { withCredentials: true },
      );

      toast.success(res?.data?.message || "Banner deleted successfully");

      setBanners((prev) =>
        prev.filter((item) => item._id !== bannerToDelete._id),
      );
      setBannerToDelete(null);
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {loading && <Loading />}

      <div className="p-6 flex justify-center">
        <Card className="w-full max-w-5xl">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Banners</CardTitle>
                <CardDescription>
                  Manage the banners shown on the storefront
                </CardDescription>
              </div>
              <Button type="button" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                New Banner
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {banners.length === 0 && !loading && (
              <div className="flex flex-col items-center gap-2 border rounded-lg p-10 text-center text-muted-foreground">
                <ImageIcon className="size-8" />
                <p className="text-sm">
                  No banners yet. Click &quot;New Banner&quot; to add your first
                  one.
                </p>
              </div>
            )}

            {banners.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {banners.map((banner) => (
                  <div
                    key={banner._id}
                    className="border rounded-lg overflow-hidden flex flex-col"
                  >
                    <div className="aspect-video bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl(banner.image)}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex items-start justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{banner.title}</p>
                        {banner.subtitle && (
                          <p className="text-sm text-muted-foreground truncate">
                            {banner.subtitle}
                          </p>
                        )}
                        {banner.link && (
                          <a
                            href={banner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline max-w-full"
                          >
                            <ExternalLink className="size-3 shrink-0" />
                            <span className="truncate">{banner.link}</span>
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setBannerToDelete(banner)}
                        aria-label={`Delete ${banner.title}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create banner dialog */}
      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Banner</DialogTitle>
            <DialogDescription>
              Add a title and an image. Subtitle and link are optional.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Title</Label>
              <Input
                placeholder="Banner title"
                value={title}
                onChange={(eve) => setTitle(eve.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Subtitle (optional)</Label>
              <Input
                placeholder="Banner subtitle"
                value={subtitle}
                onChange={(eve) => setSubtitle(eve.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Link (optional)</Label>
              <Input
                placeholder="https://... or /category/gifts"
                value={link}
                onChange={(eve) => setLink(eve.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Image</Label>
              {!imagePreview ? (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              ) : (
                <div className="relative w-[10rem] h-[10rem] rounded-lg overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    aria-label="Remove image"
                    className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1 text-white hover:bg-black/80"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleCreateOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={createBannerFunc}
            >
              {submitting ? "Creating..." : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={bannerToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setBannerToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete banner?</DialogTitle>
            <DialogDescription>
              &quot;{bannerToDelete?.title}&quot; and its image will be
              permanently removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setBannerToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={deleteBannerFunc}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BannersPage;
