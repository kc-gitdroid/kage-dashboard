"use client";

import { useEffect } from "react";

export default function ServiceWorkerReset() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => {
        // Keep the preview usable even if an old service worker cannot be removed.
      });

    if ("caches" in window) {
      void caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {
          // Ignore cache cleanup issues during development.
        });
    }
  }, []);

  return null;
}

export { ServiceWorkerReset };
