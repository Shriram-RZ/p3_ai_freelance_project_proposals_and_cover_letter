"use client";

import { motion } from "framer-motion";
import { Sparkles, Send, Wand2, FileText } from "lucide-react";

const PROPOSAL_TEXT = `Hi Sarah — saw your note about the checkout bottleneck on the Shopify theme. The conversion drop you're seeing on mobile is almost always a paint-blocking script combined with the Apple Pay button mounting late.

Here's how I'd tighten it up:
1. Audit Liquid for unused sections, defer non-critical scripts
2. Move Apple Pay to a static placeholder, mount post-LCP
3. Re-test with Lighthouse + a real iPhone, target sub-2.4s LCP

I shipped a similar fix for a DTC apparel brand last quarter and bumped their checkout completion 18% in two weeks.

Happy to do a free 15-min teardown of your live store first — no pitch attached.`;

export function ProposalPreview() {
  return (
    <div className="relative">
      {/* Floating job-card behind */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        className="absolute -right-4 -top-6 w-72 hidden lg:block"
      >
        <div className="glass rounded-2xl p-4 rotate-3 hover:rotate-0 transition-transform">
          <div className="flex items-center gap-2 text-[11px] text-white/50 uppercase tracking-wider">
            <FileText className="h-3 w-3" /> Job Brief · Upwork
          </div>
          <p className="mt-2 text-xs text-white/70 leading-relaxed line-clamp-5">
            We need a Shopify dev to fix a slow checkout. LCP on mobile is ~4.8s. Looking for
            someone who can audit, ship fixes, and prove the gain. Budget flexible for the
            right person.
          </p>
        </div>
      </motion.div>

      {/* Main editor card */}
      <div className="glass-strong gradient-border rounded-2xl p-1">
        <div className="rounded-2xl bg-gradient-to-b from-[#0d0f24]/80 to-[#0a0a17]/80 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <span className="ml-2 text-[11px] text-white/50">proposal-shopify.lumen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="ml-2 text-[11px] text-brand-300">Generating</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-brand-300" />
              <span className="text-[11px] uppercase tracking-wider text-white/50">
                AI Proposal · Premium tone
              </span>
            </div>
            <TypewriterBlock text={PROPOSAL_TEXT} />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
              Score · <span className="text-emerald-300 font-medium">94 / 100</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-[11px] px-2.5 py-1 rounded-md border border-white/10 text-white/70 hover:bg-white/5 inline-flex items-center gap-1.5">
                <Wand2 className="h-3 w-3" /> Rewrite
              </button>
              <button className="text-[11px] px-2.5 py-1 rounded-md bg-gradient-to-b from-brand-500 to-brand-700 text-white inline-flex items-center gap-1.5 shadow-[0_6px_20px_-6px_rgba(99,102,241,0.6)]">
                <Send className="h-3 w-3" /> Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chip — pricing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute -left-6 bottom-6 hidden md:block animate-float"
      >
        <div className="glass rounded-xl p-3 w-44">
          <div className="text-[10px] uppercase tracking-wider text-white/50">Suggested rate</div>
          <div className="mt-1 text-lg font-semibold text-white">$2,400 fixed</div>
          <div className="text-[11px] text-emerald-300">5–7 day turnaround</div>
        </div>
      </motion.div>
    </div>
  );
}

function TypewriterBlock({ text }: { text: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 1 },
        show: { transition: { staggerChildren: 0.012 } },
      }}
      className="prose-output text-[13px] text-white/85 max-h-72 overflow-hidden"
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1 },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
}
