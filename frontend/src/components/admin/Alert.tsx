"use client";

import { useEffect } from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  open: boolean;
  message: string;
  onClose: () => void;
  type?: AlertType;
  /** Auto-close delay in ms. Pass 0 to disable. */
  duration?: number;
}

const styles: Record<AlertType, string> = {
  success: "bg-emerald-50 border-emerald-300 text-emerald-800",
  error: "bg-red-50 border-red-300 text-red-800",
  warning: "bg-amber-50 border-amber-300 text-amber-800",
  info: "bg-sky-50 border-sky-300 text-sky-800",
};

const icons: Record<AlertType, string> = {
  success:
    "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.86-9.81a.75.75 0 1 0-1.22-.88l-3.48 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.14-.09l4-5.5Z",
  error:
    "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z",
  warning:
    "M8.49 2.5c.67-1.17 2.35-1.17 3.02 0l6.28 10.87c.68 1.17-.17 2.63-1.51 2.63H3.72c-1.35 0-2.19-1.46-1.52-2.63L8.49 2.5ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  info: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9 9a.75.75 0 0 0 0 1.5h.25v3H9a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5h-.25V9.75A.75.75 0 0 0 10 9H9Z",
};

export default function Alert({
  open,
  message,
  onClose,
  type = "info",
  duration = 5000,
}: AlertProps) {
  useEffect(() => {
    if (!open || duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${styles[type]}`}
    >
      <svg
        className="size-5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path fillRule="evenodd" clipRule="evenodd" d={icons[type]} />
      </svg>
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
      >
        <svg
          className="size-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M6.28 5.22 5.22 6.28 8.94 10l-3.72 3.72 1.06 1.06L10 11.06l3.72 3.72 1.06-1.06L11.06 10l3.72-3.72-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </div>
  );
}
