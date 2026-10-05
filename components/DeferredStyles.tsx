"use client";

import { useEffect } from "react";

/**
 * Loads the pointer-spotlight stylesheet after first paint, so it stays out of
 * the render-blocking CSS chunk linked from the document head.
 *
 * Safe to arrive late: the spotlight is purely decorative and is gated on an
 * attribute the spotlight hook sets after mount.
 */
export function DeferredStyles() {
  useEffect(() => {
    const load = () => {
      void import("@noirly-dev/ui/effects.css");
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(load, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }

    const id = setTimeout(load, 1);
    return () => clearTimeout(id);
  }, []);

  return null;
}
