import Link from "next/link";
import { Sparkles } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-6 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-400 via-purple-500 to-brand-600 grid place-items-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Lumen</span>
          </Link>
          <p className="mt-4 text-sm text-white/50 max-w-xs">
            The AI freelance copilot. Made for people who'd rather be building than pitching.
          </p>
        </div>

        <div>
          <h4 className="text-[11px] uppercase tracking-[0.2em] text-white/40">Product</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li><a className="hover:text-white" href="#features">Features</a></li>
            <li><a className="hover:text-white" href="#demo">Demo</a></li>
            <li><a className="hover:text-white" href="#faq">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] uppercase tracking-[0.2em] text-white/40">Workspace</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li><Link href="/dashboard/proposals/new" className="hover:text-white">Proposal generator</Link></li>
            <li><Link href="/dashboard/cover-letters/new" className="hover:text-white">Cover letter writer</Link></li>
            <li><Link href="/dashboard/chat" className="hover:text-white">AI chat copilot</Link></li>
            <li><Link href="/dashboard/templates" className="hover:text-white">Templates</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] uppercase tracking-[0.2em] text-white/40">Account</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li><Link href="/login" className="hover:text-white">Log in</Link></li>
            <li><Link href="/signup" className="hover:text-white">Sign up</Link></li>
            <li><Link href="/forgot-password" className="hover:text-white">Reset password</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-10 flex items-center justify-between text-xs text-white/40 border-t border-white/5 pt-6">
        <span>© {new Date().getFullYear()} Lumen Labs · All rights reserved</span>
        <span>Built with Groq</span>
      </div>
    </footer>
  );
}
