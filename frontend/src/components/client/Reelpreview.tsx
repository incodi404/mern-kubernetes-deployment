"use client";
import { getYouTubeEmbedUrl } from "@/app/admin/(protected)/reels/page";
import { useEffect, useRef, useState } from "react";
// import { getYouTubeEmbedUrl } from "@/lib/youtube";

interface ReelPreviewProps {
  /** Raw YouTube Shorts / watch / youtu.be link */
  url: string;
  title: string;
  /** Set to false to unmount the iframe (e.g. for slides far from the active one). */
  load?: boolean;
}

/**
 * Muted, looping, control-free YouTube preview that fills its parent.
 * Non-interactive: clicks pass through to the parent card.
 * The iframe only loads once the card scrolls near the viewport.
 */
export default function ReelPreview({
  url,
  title,
  load = true,
}: ReelPreviewProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  // Muted so browsers allow autoplay
  const src = getYouTubeEmbedUrl(url, { mute: true });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  // When the iframe is unmounted, forget that it had loaded
  useEffect(() => {
    if (!load) setLoaded(false);
  }, [load]);

  return (
    <div
      ref={boxRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {src && visible && load && (
        <iframe
          src={src}
          title={title}
          tabIndex={-1}
          allow="autoplay; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
          className={`pointer-events-none absolute inset-0 h-full w-full border-0 bg-black transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
