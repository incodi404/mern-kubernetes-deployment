"use client";

import { WHATSAPP_NUMBER } from "@/constant";
import React, { useEffect, useState } from "react";

// Update these to your business's WhatsApp number and default message.
// Phone number must be in international format, digits only (no "+", spaces, or dashes).
const WHATSAPP_MESSAGE = "Hi! I'd like to know more about your services.";

function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // slight delay so the button "pops in" after the page settles
    const enter = setTimeout(() => setMounted(true), 400);
    // auto-show the attractor bubble shortly after
    const show = setTimeout(() => setShowTooltip(true), 1200);
    // auto-hide it after a while so it doesn't linger forever
    const hide = setTimeout(() => setShowTooltip(false), 7000);

    return () => {
      clearTimeout(enter);
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  function handleClick() {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      WHATSAPP_MESSAGE,
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Attractor tooltip */}
      <div
        className={`relative max-w-[220px] rounded-2xl rounded-br-sm bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-xl transition-all duration-300 ease-out ${
          showTooltip
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setShowTooltip(false)}
          className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600 hover:bg-gray-300"
        >
          ×
        </button>
        Need help? Chat with us on WhatsApp! 👋
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={handleClick}
        aria-label="Chat on WhatsApp"
        className={`group relative flex size-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl active:scale-95 ${
          mounted ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        {/* Pulsing ring animation to draw the eye */}
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366]" />

        {/* WhatsApp icon */}
        <svg
          viewBox="0 0 32 32"
          className="relative size-7 fill-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.908 6.471L4 29l7.72-1.862A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3Zm0 21.818c-1.98 0-3.822-.58-5.372-1.577l-.385-.243-4.58 1.104 1.128-4.462-.252-.398A9.77 9.77 0 0 1 6.182 15c0-5.42 4.4-9.818 9.819-9.818S25.818 9.58 25.818 15 21.42 24.818 16.001 24.818Zm5.386-7.354c-.295-.148-1.746-.862-2.017-.96-.271-.099-.468-.148-.665.148-.197.295-.763.96-.936 1.157-.172.197-.345.222-.64.074-.295-.148-1.245-.459-2.372-1.463-.877-.782-1.47-1.748-1.642-2.043-.172-.295-.018-.454.13-.601.134-.133.295-.345.443-.517.148-.172.197-.295.295-.492.099-.198.05-.37-.024-.518-.074-.148-.665-1.604-.912-2.197-.24-.578-.484-.5-.665-.51-.172-.008-.37-.01-.567-.01-.197 0-.517.074-.788.37-.271.295-1.033 1.01-1.033 2.464 0 1.454 1.058 2.86 1.206 3.058.148.197 2.083 3.181 5.046 4.462.705.304 1.255.486 1.684.622.708.225 1.352.193 1.86.117.567-.085 1.746-.714 1.992-1.403.246-.69.246-1.28.172-1.404-.074-.123-.271-.197-.567-.345Z" />
        </svg>
      </button>
    </div>
  );
}

export default WhatsAppButton;
