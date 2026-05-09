"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIERS = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    body: "For freelancers just exploring AI-assisted writing.",
    features: [
      "50 AI generations / month",
      "All tones and platforms",
      "Basic proposal scoring",
      "Export to PDF",
    ],
    cta: "Start free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "/ month",
    body: "Everything you need to win client work consistently.",
    features: [
      "Unlimited AI generations",
      "Streaming chat copilot",
      "Pricing & timeline AI",
      "Conversion analytics",
      "Custom templates & memory",
    ],
    cta: "Go Pro",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    cadence: "/ seat / mo",
    body: "For agencies and small studios pitching together.",
    features: [
      "Everything in Pro",
      "Shared template library",
      "Multi-seat workspace",
      "Priority Gemini routing",
      "Branded PDF exports",
    ],
    cta: "Talk to sales",
    href: "/signup",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-28 mx-auto max-w-7xl px-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-brand-300/80">
          Pricing
        </span>
        <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-white">
          One won proposal pays it back. <span className="text-gradient">10×.</span>
        </h2>
        <p className="mt-4 text-white/60 text-base">
          Start free, no card. Upgrade when you start landing more replies.
        </p>
      </div>

      <div className="mt-14 grid md:grid-cols-3 gap-4">
        {TIERS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className={`relative rounded-2xl p-7 ${
              t.highlighted
                ? "glass-strong gradient-border glow-primary"
                : "glass"
            }`}
          >
            {t.highlighted && (
              <div className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-brand-500 to-purple-500 text-white text-[10px] uppercase tracking-wider px-2.5 py-1">
                Most loved
              </div>
            )}
            <h3 className="text-sm font-medium text-white/70">{t.name}</h3>
            <div className="mt-3 flex items-end gap-1.5">
              <span className="text-4xl font-semibold text-white tracking-tight">{t.price}</span>
              <span className="text-sm text-white/50 mb-1.5">{t.cadence}</span>
            </div>
            <p className="mt-2 text-sm text-white/60 leading-relaxed">{t.body}</p>

            <ul className="mt-6 space-y-2.5">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                  <Check className="h-4 w-4 mt-0.5 text-brand-300 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link href={t.href} className="mt-7 block">
              <Button
                className="w-full"
                variant={t.highlighted ? "glow" : "secondary"}
              >
                {t.cta}
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
