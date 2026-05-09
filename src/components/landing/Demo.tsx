"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, ArrowDown } from "lucide-react";

const SAMPLE_BRIEFS = [
  {
    label: "Upwork — Shopify dev",
    brief:
      "We need a Shopify dev to fix a slow checkout. Mobile LCP is ~4.8s, conversion dropped 12% last month. Looking for someone who can audit, ship fixes, and prove the gain. Budget flexible for the right person.",
    output: `Hi Sarah — saw your note about the checkout bottleneck. The conversion drop on mobile is almost always a paint-blocking script combined with the Apple Pay button mounting late.

Here's how I'd tighten it up:
1. Audit Liquid for unused sections, defer non-critical scripts
2. Move Apple Pay to a static placeholder, mount post-LCP
3. Re-test with Lighthouse + a real iPhone, target sub-2.4s LCP

I shipped a similar fix for a DTC apparel brand last quarter and bumped checkout completion 18% in two weeks.

Free 15-min teardown of your live store first — no pitch attached?`,
  },
  {
    label: "LinkedIn — cold outreach",
    brief:
      "Founder of a Series A logistics startup. Posted about hiring fractional design help for their dashboard.",
    output: `Hey Anil — saw your post on the Linear-meets-Roadie dashboard you're shipping. The point about ops teams "living in the rejection inbox" stuck with me.

I work on B2B dashboards (last project: cut Helm's drag-drop time 40%). Open to a 15-min Loom teardown of your current screens? No pitch — just notes.`,
  },
  {
    label: "Cover letter — product role",
    brief:
      "Senior Product Designer at Linear. Looking for someone who's shipped tools used daily by engineers.",
    output: `Dear Linear team,

The line about "calm, fast, and built for people who care about their craft" is why I'm writing. I've spent the last six years designing tools my users open every day — at Vercel and before that on Notion's docs team.

What I'd bring: a deep respect for command-line ergonomics, an obsession with motion that doesn't waste milliseconds, and the kind of taste that only comes from shipping the same component twelve times. I'd love to talk about the changelog redesign and where it's heading.

— Maya`,
  },
];

export function Demo() {
  const [active, setActive] = useState(0);
  const sample = SAMPLE_BRIEFS[active];

  return (
    <section id="demo" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-brand-300/80">
            Live demo
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-white">
            See Lumen <span className="text-gradient-warm">read a brief</span> & write a winner.
          </h2>
        </div>

        <div className="mt-12 flex flex-wrap gap-2 justify-center">
          {SAMPLE_BRIEFS.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                i === active
                  ? "bg-brand-500/20 border-brand-400/40 text-brand-200"
                  : "border-white/10 text-white/60 hover:border-white/20"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-4">
          <motion.div
            key={`brief-${active}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">
              Job brief
            </div>
            <p className="mt-3 text-sm text-white/80 leading-relaxed">{sample.brief}</p>
          </motion.div>

          <motion.div
            key={`out-${active}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="glass-strong gradient-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/40">
                <Sparkles className="h-3 w-3 text-brand-300" /> Lumen output
              </div>
              <span className="text-[11px] text-emerald-300">Ready in 1.4s</span>
            </div>
            <p className="prose-output mt-3 text-sm text-white/85 whitespace-pre-wrap">
              {sample.output}
            </p>
          </motion.div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/40">
          <ArrowDown className="h-3.5 w-3.5" />
          Try every tone, every platform, every brief. Always free to start.
        </div>
      </div>
    </section>
  );
}
