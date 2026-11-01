"use client";
import { getYouTubeEmbedUrl } from "@/app/admin/(protected)/reels/page";
import { useEffect, useRef } from "react";

interface ReelPlayerProps {
  url: string;
  title: string;
  className?: string;
}

/**
 * Plays a YouTube reel with sound and no controls.
 *
 * Browsers only allow unmuted autoplay after the visitor has interacted with
 * the page. So the video starts muted (always allowed) and we then ask the
 * YouTube player to unmute. If a browser refuses, the reel keeps playing
 * muted instead of showing a dead player.
 */
export default function ReelPlayer({ url, title, className }: ReelPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timers = useRef<number[]>([]);
  const src = getYouTubeEmbedUrl(url, { mute: true, api: true });

  const send = (func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*",
    );
  };

  const handleLoad = () => {
    // Tell the player we want to talk to it, then retry the unmute a few
    // times because the player needs a moment before it accepts commands.
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
      "*",
    );
    timers.current = [300, 1000, 2000].map((ms) =>
      window.setTimeout(() => {
        send("unMute");
        send("setVolume", [100]);
        send("playVideo");
      }, ms),
    );
  };

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  if (!src) return null;

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      onLoad={handleLoad}
      className={
        className ?? "absolute inset-0 h-full w-full border-0 bg-black"
      }
      allow="autoplay; encrypted-media"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
