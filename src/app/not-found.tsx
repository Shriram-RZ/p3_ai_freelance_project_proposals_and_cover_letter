import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen relative grid place-items-center px-6">
      <div className="absolute inset-0 app-grid pointer-events-none opacity-50" />
      <div className="relative text-center max-w-md">
        <div className="text-7xl font-semibold tracking-tight text-gradient">404</div>
        <h1 className="mt-3 text-2xl font-semibold text-white">Couldn't find that page.</h1>
        <p className="mt-2 text-sm text-white/60">
          The link is wrong, or the proposal got moved. Either way — you've got better things to do.
        </p>
        <div className="mt-7 flex items-center justify-center gap-2">
          <Link href="/dashboard">
            <Button variant="glow">Back to workspace</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Go home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
