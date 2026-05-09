"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const T = [
  {
    quote:
      "I went from 1 reply per 30 proposals to 1 in 6. Lumen's tone presets alone are worth it.",
    name: "Maya Reyes",
    role: "Full-stack freelancer · ex-Vercel",
    accent: "from-brand-500 to-purple-500",
  },
  {
    quote:
      "The AI actually reads the brief. The first line of every proposal references something specific. Game over.",
    name: "Rohan Iyer",
    role: "iOS developer · Bangalore",
    accent: "from-fuchsia-500 to-pink-500",
  },
  {
    quote:
      "I run a 4-person studio. Pricing AI saved us from underbidding three projects last month.",
    name: "Lena Karlsson",
    role: "Founder · Unfold Studio",
    accent: "from-emerald-500 to-cyan-500",
  },
  {
    quote:
      "Cover letter generator landed me a Series A startup interview in two days. I didn't change a word.",
    name: "Daniel Park",
    role: "Product designer · Seoul",
    accent: "from-amber-500 to-orange-500",
  },
  {
    quote:
      "The streaming chat copilot replaced three Notion docs of personal templates I'd been hoarding for years.",
    name: "Priya Mehta",
    role: "Brand strategist · London",
    accent: "from-rose-500 to-red-500",
  },
  {
    quote:
      "Finally an AI tool that doesn't write like an AI tool. My clients can't tell the difference.",
    name: "Tomás Núñez",
    role: "Backend dev · Buenos Aires",
    accent: "from-blue-500 to-indigo-500",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-28 mx-auto max-w-7xl px-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-brand-300/80">
          Loved by freelancers
        </span>
        <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-white">
          Less <span className="line-through text-white/40">writer's block</span>. More wins.
        </h2>
      </div>

      <div className="mt-14 columns-1 md:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
        {T.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
            className="break-inside-avoid glass rounded-2xl p-5"
          >
            <div className="flex">
              {[...Array(5)].map((_, k) => (
                <Star key={k} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="mt-3 text-sm text-white/85 leading-relaxed">"{t.quote}"</p>
            <div className="mt-4 flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-full bg-gradient-to-br ${t.accent} grid place-items-center text-xs font-semibold text-white`}
              >
                {t.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <div className="text-sm text-white">{t.name}</div>
                <div className="text-xs text-white/50">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
