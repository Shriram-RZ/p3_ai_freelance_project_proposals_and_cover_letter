"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Does Lumen sound like a robot?",
    a: "No — that's the entire point. We've trained the prompts hard against AI clichés ('leverage', 'in today's fast-paced world'). Output reads like a human who actually read the brief.",
  },
  {
    q: "Which AI does this run on?",
    a: "Groq (Llama 3.1 8B Instant). It's blazing fast, accurate, and cheap enough that we can give you generous limits even on the free tier.",
  },
  {
    q: "Will it learn my style?",
    a: "On Pro, yes — drop your past proposals, your portfolio, your voice. Lumen mirrors how you write, not how an AI thinks you should.",
  },
  {
    q: "Can I export to PDF for clients?",
    a: "Every proposal and cover letter exports to clean, ATS-friendly PDF in one click. Branded exports come with the Team plan.",
  },
  {
    q: "What about plagiarism / detection?",
    a: "Lumen rewrites for you, doesn't copy. The output is unique to your brief and skills. AI-detection scores are already low — we recommend always editing the final 10% yourself anyway.",
  },
  {
    q: "Do you store my proposals?",
    a: "Yes — they're saved to your dashboard so you can edit, score, and track them. You can delete anything at any time. We never train on your data.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-28 mx-auto max-w-3xl px-6">
      <div className="text-center">
        <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-brand-300/80">FAQ</span>
        <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-white">
          Things people ask first.
        </h2>
      </div>

      <div className="mt-12 space-y-2">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="glass rounded-xl"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="text-sm md:text-base font-medium text-white">{f.q}</span>
                <span className="shrink-0 text-white/60">
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-white/70 leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
