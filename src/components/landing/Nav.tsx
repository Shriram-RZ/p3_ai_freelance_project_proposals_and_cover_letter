"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-40 mx-auto w-full max-w-7xl px-6 pt-4"
    >
      <div className="glass rounded-full px-4 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-7 w-7 rounded-full bg-gradient-to-br from-brand-400 via-purple-500 to-brand-600 grid place-items-center shadow-[0_0_20px_rgba(139,92,246,0.6)] group-hover:scale-110 transition-transform">
            <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">Lumen</span>
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.18em] text-white/40 ml-1">AI Copilot</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">
              Start free
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
