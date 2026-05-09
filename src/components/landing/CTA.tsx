"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative glass-strong gradient-border rounded-3xl p-10 md:p-16 overflow-hidden"
        >
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-gradient-to-br from-brand-500/40 to-purple-500/30 blur-3xl" />
          <div className="relative text-center">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-white">
              Stop staring at the
              <br />
              <span className="text-gradient">blank proposal box.</span>
            </h2>
            <p className="mt-5 text-white/65 text-base md:text-lg max-w-xl mx-auto">
              50 free generations. No card. Plug in a brief, watch Lumen write something you'd
              actually send.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup">
                <Button size="xl" variant="glow" className="group">
                  Start free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="xl" variant="secondary">
                  I already have an account
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
