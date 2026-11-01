"use client";

// app/admin/reels/page.tsx

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
import ReelPreview from "@/components/client/Reelpreview";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Film,
  Plus,
  Trash2,
} from "lucide-react";

type Reel = {
  _id: string;
  title: string;
  url: string;
  embedUrl?: string;
  slug?: string;
  active?: boolean;
  createdAt?: string;
};

const LIMIT = 12;

// youtube.ts
export function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:shorts|embed|live)\/|youtu\.be\/|[?&]v=)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

interface EmbedOptions {
  /** Start muted (always allowed to autoplay). Default true. */
  mute?: boolean;
  /** Enable the iframe JS API so the parent can unmute via postMessage. */
  api?: boolean;
}

export function getYouTubeEmbedUrl(
  url: string,
  { mute = true, api = false }: EmbedOptions = {},
): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  const params = new URLSearchParams({
    autoplay: "1",
    mute: mute ? "1" : "0",
    controls: "0", // hide the control bar
    loop: "1",
    playlist: id, // required for loop to work
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    disablekb: "1",
    fs: "0", // hide the fullscreen button
  });
  if (api) {
    params.set("enablejsapi", "1");
    if (typeof window !== "undefined") {
      params.set("origin", window.location.origin);
    }
  }
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

const ReelsPage = () => {
  const [loading, setLoading] = useState(false);
  const [reels, setReels] = useState<Reel[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [active, setActive] = useState(true);

  // delete dialog
  const [reelToDelete, setReelToDelete] = useState<Reel | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchReelsFunc(page);
  }, [page]);

  async function fetchReelsFunc(pageNumber: number) {
    try {
      setLoading(true);

      // no `active` filter here, so the admin sees every reel
      const res = await axios.get(
        `${SERVER_URL}/reels/${pageNumber}/${LIMIT}`,
        {
          withCredentials: true,
        },
      );

      const payload = res?.data?.data;

      if (Array.isArray(payload)) {
        setReels(payload);
        setTotalPages(1);
      } else {
        setReels(Array.isArray(payload?.data) ? payload.data : []);
        setTotalPages(Math.max(1, Number(payload?.totalPages) || 1));
      }
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Failed to load reels");
    } finally {
      setLoading(false);
    }
  }

  function resetCreateForm() {
    setTitle("");
    setUrl("");
    setActive(true);
  }

  function handleCreateOpenChange(open: boolean) {
    // don't let the dialog close while the request is running
    if (submitting) return;
    setCreateOpen(open);
    if (!open) resetCreateForm();
  }

  async function createReelFunc() {
    if (title.trim() === "") {
      toast.error("Title is required");
      return;
    }

    if (url.trim() === "") {
      toast.error("Reel URL is required");
      return;
    }

    try {
      setSubmitting(true);

      const res = await axios.post(
        `${SERVER_URL}/reels`,
        {
          title: title.trim(),
          url: url.trim(),
          active,
        },
        { withCredentials: true },
      );

      toast.success(res?.data?.message || "Reel created successfully");

      setCreateOpen(false);
      resetCreateForm();

      // newest reels come first, so jump back to page 1
      if (page === 1) {
        await fetchReelsFunc(1);
      } else {
        setPage(1);
      }
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteReelFunc() {
    if (!reelToDelete) return;

    try {
      setDeleting(true);

      const res = await axios.delete(
        `${SERVER_URL}/reels/${reelToDelete._id}`,
        { withCredentials: true },
      );

      toast.success(res?.data?.message || "Reel deleted successfully");

      const wasLastOnPage = reels.length === 1 && page > 1;
      setReelToDelete(null);

      if (wasLastOnPage) {
        setPage(page - 1);
      } else {
        await fetchReelsFunc(page);
      }
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
                <CardTitle>Reels</CardTitle>
                <CardDescription>
                  Manage the YouTube reels shown on the storefront
                </CardDescription>
              </div>
              <Button type="button" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                New Reel
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {reels.length === 0 && !loading && (
              <div className="flex flex-col items-center gap-2 border rounded-lg p-10 text-center text-muted-foreground">
                <Film className="size-8" />
                <p className="text-sm">
                  No reels yet. Click &quot;New Reel&quot; to add your first
                  one.
                </p>
              </div>
            )}

            {reels.length > 0 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {reels.map((reel) => (
                  <div
                    key={reel._id}
                    className="border rounded-lg overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-[9/16] bg-muted">
                      <ReelPreview
                        url={getYouTubeEmbedUrl(reel.embedUrl || "") || ""}
                        title={reel.title}
                      />
                      <span
                        className={`absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          reel.active === false
                            ? "bg-muted text-muted-foreground border"
                            : "bg-green-600 text-white"
                        }`}
                      >
                        {reel.active === false ? "Inactive" : "Active"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 p-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{reel.title}</p>
                        {reel.slug && (
                          <p className="text-xs text-muted-foreground truncate">
                            /{reel.slug}
                          </p>
                        )}
                        <a
                          href={reel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline max-w-full"
                        >
                          <ExternalLink className="size-3 shrink-0" />
                          <span className="truncate">Open on YouTube</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => setReelToDelete(reel)}
                        aria-label={`Delete ${reel.title}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page === 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create reel dialog */}
      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Reel</DialogTitle>
            <DialogDescription>
              Add a title and the YouTube reel link. A URL slug is created from
              the title automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Title</Label>
              <Input
                placeholder="Reel title"
                maxLength={150}
                value={title}
                onChange={(eve) => setTitle(eve.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>YouTube URL</Label>
              <Input
                placeholder="https://www.YouTube.com/reel/..."
                value={url}
                onChange={(eve) => setUrl(eve.target.value)}
              />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(eve) => setActive(eve.target.checked)}
                className="size-4"
              />
              Show this reel on the storefront
            </label>
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
              onClick={createReelFunc}
            >
              {submitting ? "Creating..." : "Create Reel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={reelToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setReelToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete reel?</DialogTitle>
            <DialogDescription>
              &quot;{reelToDelete?.title}&quot; will be permanently removed from
              the storefront. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setReelToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={deleteReelFunc}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReelsPage;
