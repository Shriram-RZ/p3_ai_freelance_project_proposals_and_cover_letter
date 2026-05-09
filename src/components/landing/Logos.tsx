"use client";

import { motion } from "framer-motion";

const PLATFORMS = ["Upwork", "Fiverr", "LinkedIn", "Freelancer", "Toptal", "Contra"];

export function Logos() {
  return (
    <section className="border-y border-white/5 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-[11px] uppercase tracking-[0.22em] text-white/40">
          Battle-tested across every freelance platform
        </p>
        <div className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-4 items-center">
          {PLATFORMS.map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="text-center text-white/40 font-display font-medium tracking-tight text-lg hover:text-white/70 transition-colors"
            >
              {p}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
