"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Mail,
  LayoutTemplate,
  Bookmark,
  MessageSquare,
  BarChart3,
  Settings,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/proposals", label: "Proposals", icon: FileText },
  { href: "/dashboard/cover-letters", label: "Cover Letters", icon: Mail },
  { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/dashboard/saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-white/5 bg-[#08081a]/40 backdrop-blur-xl">
      <Link href="/dashboard" className="flex items-center gap-2 p-5 border-b border-white/5">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-400 via-purple-500 to-brand-600 grid place-items-center shadow-[0_0_20px_rgba(139,92,246,0.5)]">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-white tracking-tight">Lumen</span>
      </Link>

      <div className="p-3 border-b border-white/5">
        <Link
          href="/dashboard/proposals/new"
          className="btn-shimmer relative flex items-center justify-between gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-purple-500 px-3 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)] hover:-translate-y-px transition-transform"
        >
          <span className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> New proposal
          </span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10">⌘N</kbd>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-white/5 border border-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <item.icon className="relative h-4 w-4 shrink-0" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="glass rounded-xl p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-white/50">Plan</span>
            <span className="text-[11px] text-brand-300">Free</span>
          </div>
          <div className="mt-2 text-sm text-white">50 / 50 credits</div>
          <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-brand-400 to-purple-500" />
          </div>
          <Link
            href="/dashboard/settings"
            className="mt-3 block text-center text-xs text-white/70 hover:text-white border border-white/10 rounded-md py-1.5 hover:border-white/20 transition-colors"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </aside>
  );
}
