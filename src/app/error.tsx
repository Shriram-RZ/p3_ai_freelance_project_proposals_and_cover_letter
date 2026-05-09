"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen relative grid place-items-center px-6">
      <div className="absolute inset-0 app-grid pointer-events-none opacity-50" />
      <div className="relative text-center max-w-md">
        <div className="text-6xl font-semibold tracking-tight text-gradient-warm">Oops</div>
        <h1 className="mt-3 text-2xl font-semibold text-white">Something went sideways.</h1>
        <p className="mt-2 text-sm text-white/60">
          The page hit an error we didn't see coming. Try again — or refresh.
        </p>
        <div className="mt-7 flex items-center justify-center gap-2">
          <Button onClick={reset} variant="glow">Try again</Button>
        </div>
      </div>
    </main>
  );
}
