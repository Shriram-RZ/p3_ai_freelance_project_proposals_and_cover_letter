import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen relative grid lg:grid-cols-[1fr_1.05fr]">
      <div className="absolute inset-0 app-grid pointer-events-none opacity-60" />

      {/* left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 -right-20 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-400 via-purple-500 to-brand-600 grid place-items-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Lumen</span>
        </Link>

        <div className="relative">
          <p className="text-3xl md:text-4xl font-semibold text-white tracking-tight leading-tight max-w-md">
            "Lumen wrote my last six winning Upwork proposals.
            <span className="text-gradient">I'm never going back to writing them by hand.</span>"
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-fuchsia-400 to-pink-500 grid place-items-center text-xs font-medium text-white">
              MR
            </div>
            <div className="text-sm">
              <div className="text-white">Maya Reyes</div>
              <div className="text-white/50">Full-stack freelancer</div>
            </div>
          </div>
        </div>

        <div className="relative text-xs text-white/40">
          12,400+ freelancers · 380,000+ proposals generated
        </div>
      </div>

      {/* right panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}
