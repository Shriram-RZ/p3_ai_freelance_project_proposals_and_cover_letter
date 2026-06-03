"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * A thin top-of-page progress bar that appears whenever a client-side
 * navigation starts (any internal link click or router push) and completes
 * when the new route's pathname resolves. Gives instant "something is
 * happening" feedback while server components stream in.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);

  const activeRef = useRef(false);
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    if (activeRef.current) return;
    activeRef.current = true;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setActive(true);
    setProgress(8);
    trickle.current = setInterval(() => {
      // Ease toward 90% but never reach it until navigation resolves.
      setProgress((p) => (p >= 90 ? p : p + Math.max(0.5, (90 - p) * 0.08)));
    }, 200);
  }

  function done() {
    if (!activeRef.current) return;
    activeRef.current = false;
    if (trickle.current) clearInterval(trickle.current);
    setProgress(100);
    hideTimer.current = setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 350);
  }

  // Start the bar on internal link clicks (capture phase so we run first).
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (!href || href.startsWith("#") || (target && target !== "_self")) return;
      if (anchor.hasAttribute("download")) return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        // Same page (no navigation) — skip.
        if (url.pathname === window.location.pathname && url.search === window.location.search)
          return;
      } catch {
        return;
      }

      start();
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Resolve the bar whenever the pathname settles on a new route.
  useEffect(() => {
    done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (trickle.current) clearInterval(trickle.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5"
      style={{ opacity: active ? 1 : 0, transition: "opacity 0.3s ease 0.15s" }}
    >
      <div
        className="h-full bg-gradient-to-r from-brand-400 via-purple-400 to-brand-300"
        style={{
          width: `${progress}%`,
          transition: "width 0.2s ease",
          boxShadow: "0 0 10px rgba(99,102,241,0.8), 0 0 4px rgba(168,85,247,0.6)",
        }}
      />
    </div>
  );
}
