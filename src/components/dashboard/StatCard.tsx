"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon: LucideIcon;
  accent?: string;
  index?: number;
};

export function StatCard({ label, value, delta, trend = "up", icon: Icon, accent = "from-brand-500/30 to-purple-500/20", index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative glass rounded-2xl p-5 overflow-hidden group"
    >
      <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${accent} blur-2xl opacity-50 group-hover:opacity-80 transition-opacity`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/50">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
          {delta && (
            <p className={`mt-1.5 text-xs ${trend === "up" ? "text-emerald-300" : trend === "down" ? "text-red-300" : "text-white/50"}`}>
              {delta}
            </p>
          )}
        </div>
        <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${accent} grid place-items-center border border-white/10`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
