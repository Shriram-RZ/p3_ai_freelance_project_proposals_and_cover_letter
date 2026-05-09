"use client";

import { motion } from "framer-motion";
import { Bot, FileText, Gauge, MessageSquare, Sparkles, TrendingUp, Wand2, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI proposal engine",
    body: "Reads the brief, matches your skills, writes a proposal that sounds like you on a good day.",
    accent: "from-brand-500/30 to-purple-500/20",
  },
  {
    icon: FileText,
    title: "Cover letters that pass ATS",
    body: "Mirrors job-post keywords without sounding like a robot. One draft, one click, one shot at the role.",
    accent: "from-fuchsia-500/30 to-pink-500/20",
  },
  {
    icon: Gauge,
    title: "Conversion scoring",
    body: "Every proposal gets graded across relevance, voice, and CTA. Know what to fix before you hit send.",
    accent: "from-emerald-500/30 to-cyan-500/20",
  },
  {
    icon: TrendingUp,
    title: "Smart pricing & timeline",
    body: "AI estimates a fair fixed price, hourly range, and realistic deadline based on the actual scope.",
    accent: "from-amber-500/30 to-orange-500/20",
  },
  {
    icon: MessageSquare,
    title: "Chat copilot",
    body: "Ask it to make a proposal shorter, more premium, more technical — and stream the rewrite live.",
    accent: "from-blue-500/30 to-indigo-500/20",
  },
  {
    icon: Wand2,
    title: "Tone presets",
    body: "Eight tones, from quietly premium to scrappy startup. Switch the whole vibe with one click.",
    accent: "from-purple-500/30 to-violet-500/20",
  },
  {
    icon: Bot,
    title: "Platform-aware",
    body: "Upwork, Fiverr, LinkedIn DM, cold email, agency pitch — each generates with the right format and length.",
    accent: "from-rose-500/30 to-red-500/20",
  },
  {
    icon: Zap,
    title: "Streaming output",
    body: "No spinners, no waiting. Watch the proposal type itself out, edit it as it goes.",
    accent: "from-yellow-500/30 to-amber-500/20",
  },
];

export function Features() {
  return (
    <section id="features" className="py-28 mx-auto max-w-7xl px-6 relative">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-brand-300/80">
          Features
        </span>
        <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-white">
          Everything you need to <span className="text-gradient">close the client</span>.
        </h2>
        <p className="mt-4 text-white/60 text-base">
          Built for freelancers who want to stop guessing what to write — and start winning more
          briefs.
        </p>
      </div>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.06 }}
            className="group relative glass rounded-2xl p-5 hover:border-white/20 transition-colors"
          >
            <div
              className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity blur-xl pointer-events-none`}
            />
            <div className="relative">
              <div className={`inline-flex h-9 w-9 rounded-lg items-center justify-center bg-gradient-to-br ${f.accent} border border-white/10`}>
                <f.icon className="h-4 w-4 text-white" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">{f.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
