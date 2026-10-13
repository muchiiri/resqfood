"use client";

import { useEffect } from "react";

// Registers the offline-page service worker. Production builds only, so it never gets in the way of npm run dev.
// A failure is ignored: the app works the same without the worker.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  }, []);

  return null;
}
