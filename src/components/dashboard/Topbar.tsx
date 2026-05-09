"use client";

import { useRouter } from "next/navigation";
import { LogOut, Search, Bell } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = { user: { name?: string | null; email: string } };

export function Topbar({ user }: Props) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  const initials = (user.name || user.email)
    .split(/\s|@/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3.5 border-b border-white/5 bg-[#08081a]/60 backdrop-blur-xl">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
        <input
          placeholder="Search proposals, jobs, templates…"
          className="w-full h-10 rounded-lg border border-white/10 bg-white/5 pl-9 pr-16 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20 transition-colors"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/50">
          ⌘ K
        </kbd>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none" aria-label="Account menu">
            <Avatar className="ring-2 ring-white/5 hover:ring-brand-400/40 transition-all">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user.name || "Signed in"}</DropdownMenuLabel>
            <div className="px-2 pb-2 text-xs text-white/50 truncate">{user.email}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/">Visit landing</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-300 focus:bg-red-500/10">
              <LogOut className="h-3.5 w-3.5 mr-1" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
