"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProposalPreview } from "./ProposalPreview";

const variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      {/* Glow orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[640px] w-[640px] rounded-full bg-gradient-to-br from-brand-500/30 via-purple-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-32 -left-32 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-32 -right-32 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 relative">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div>
            <motion.div
              variants={variants}
              initial="hidden"
              animate="show"
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-300" />
              <span>Powered by Gemini Flash · Built for freelancers</span>
            </motion.div>

            <motion.h1
              variants={variants}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[0.98] text-white"
            >
              Win more <span className="text-gradient">freelance clients</span>
              <br />
              with an AI copilot.
            </motion.h1>

            <motion.p
              variants={variants}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-6 max-w-xl text-base md:text-lg text-white/65 leading-relaxed"
            >
              Generate high-converting proposals, cover letters, and outreach in seconds.
              Lumen reads the brief, matches your skills, and writes like a human who actually
              read it.
            </motion.p>

            <motion.div
              variants={variants}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link href="/signup">
                <Button size="xl" variant="glow" className="group">
                  Start writing free
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="xl" variant="secondary">
                  See it work
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={variants}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-8 flex items-center gap-4 text-xs text-white/50"
            >
              <div className="flex -space-x-2">
                {[
                  "from-brand-400 to-purple-500",
                  "from-fuchsia-400 to-pink-500",
                  "from-emerald-400 to-cyan-500",
                  "from-amber-400 to-orange-500",
                ].map((g, i) => (
                  <div
                    key={i}
                    className={`h-7 w-7 rounded-full bg-gradient-to-br ${g} ring-2 ring-[#0a0a17]`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span>Loved by 12,400+ freelancers</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <ProposalPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
