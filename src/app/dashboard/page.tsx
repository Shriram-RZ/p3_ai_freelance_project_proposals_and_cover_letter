import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileText,
  Mail,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Bookmark,
  MessageSquare,
  Zap,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/StatCard";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { relativeTime, truncate } from "@/lib/utils";

export default async function DashboardHome() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const [proposalsCount, coverLettersCount, gens, jobs, won, sent, recent, recentJobs] =
    await Promise.all([
      prisma.proposal.count({ where: { userId: user.id } }),
      prisma.coverLetter.count({ where: { userId: user.id } }),
      prisma.aiGeneration.count({ where: { userId: user.id } }),
      prisma.savedJob.count({ where: { userId: user.id } }),
      prisma.proposal.count({ where: { userId: user.id, status: "won" } }),
      prisma.proposal.count({
        where: { userId: user.id, status: { in: ["sent", "won", "lost"] } },
      }),
      prisma.proposal.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          platform: true,
          status: true,
          score: true,
          createdAt: true,
        },
      }),
      prisma.savedJob.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    ]);

  const conversion = sent > 0 ? Math.round((won / sent) * 100) : 0;

  // 14-day generations series
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);
  const events = await prisma.aiGeneration.findMany({
    where: { userId: user.id, createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const series: { date: string; count: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    series.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  for (const e of events) {
    const k = e.createdAt.toISOString().slice(0, 10);
    const slot = series.find((s) => s.date === k);
    if (slot) slot.count++;
  }

  const firstName = (user.name || user.email).split(/\s|@/)[0];

  return (
    <div className="px-6 lg:px-8 py-8">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-300/80">Workspace</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Pick up a draft, write something new, or let the copilot warm up.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/proposals/new"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-brand-500 to-brand-700 px-4 py-2.5 text-sm text-white font-medium shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)] hover:-translate-y-px transition-transform btn-shimmer"
          >
            <Sparkles className="h-4 w-4" /> New proposal
          </Link>
          <Link
            href="/dashboard/cover-letters/new"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
          >
            <Mail className="h-4 w-4" /> New cover letter
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Proposals"
          value={proposalsCount}
          delta="+ this month"
          icon={FileText}
          accent="from-brand-500/30 to-purple-500/20"
          index={0}
        />
        <StatCard
          label="Cover letters"
          value={coverLettersCount}
          delta="ATS-ready"
          icon={Mail}
          accent="from-fuchsia-500/30 to-pink-500/20"
          index={1}
        />
        <StatCard
          label="Conversion"
          value={`${conversion}%`}
          delta={sent > 0 ? `${won}/${sent} wins` : "Send a few first"}
          trend={conversion > 30 ? "up" : "flat"}
          icon={TrendingUp}
          accent="from-emerald-500/30 to-cyan-500/20"
          index={2}
        />
        <StatCard
          label="AI runs"
          value={gens}
          delta={`${user.credits} credits left`}
          icon={Zap}
          accent="from-amber-500/30 to-orange-500/20"
          index={3}
        />
      </div>

      <div className="mt-6 grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Last 14 days</CardTitle>
                <CardDescription>Generations across proposals, cover letters, and chat.</CardDescription>
              </div>
              <Badge variant="secondary">{events.length} runs</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-44">
            <Sparkline data={series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Most-used flows in one tap.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { href: "/dashboard/proposals/new", icon: Sparkles, label: "New proposal", accent: "from-brand-500/30 to-purple-500/20" },
              { href: "/dashboard/cover-letters/new", icon: Mail, label: "Cover letter", accent: "from-fuchsia-500/30 to-pink-500/20" },
              { href: "/dashboard/chat", icon: MessageSquare, label: "Open AI chat", accent: "from-blue-500/30 to-indigo-500/20" },
              { href: "/dashboard/saved-jobs", icon: Bookmark, label: "Saved jobs", accent: "from-emerald-500/30 to-cyan-500/20" },
            ].map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="group glass rounded-xl p-3 hover:border-white/20 transition-colors"
              >
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${q.accent} grid place-items-center border border-white/10`}>
                  <q.icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="mt-2 text-sm text-white">{q.label}</div>
                <ArrowRight className="mt-1 h-3 w-3 text-white/40 group-hover:translate-x-0.5 group-hover:text-white/80 transition" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent proposals</CardTitle>
              <Link href="/dashboard/proposals" className="text-xs text-brand-300 hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-white/60">
                No proposals yet —{" "}
                <Link href="/dashboard/proposals/new" className="text-brand-300 hover:underline">
                  write your first.
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {recent.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/dashboard/proposals/${p.id}`}
                      className="flex items-center gap-4 px-6 py-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm text-white truncate">
                          {truncate(p.title, 70)}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                          <span className="capitalize">{p.platform}</span>
                          <span>·</span>
                          <span>{relativeTime(p.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                        {typeof p.score === "number" && (
                          <Badge variant="secondary">{p.score}</Badge>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Saved jobs</CardTitle>
              <Link href="/dashboard/saved-jobs" className="text-xs text-brand-300 hover:underline">
                Manage
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentJobs.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-white/60">
                Save briefs you want to come back to later.
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {recentJobs.map((j) => (
                  <li key={j.id} className="px-6 py-3 hover:bg-white/5 transition-colors">
                    <div className="text-sm text-white truncate">{truncate(j.title, 60)}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                      {j.source && <span className="capitalize">{j.source}</span>}
                      {j.budget && <span>· {j.budget}</span>}
                      <span>· {relativeTime(j.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Tips card */}
      <div className="mt-6">
        <div className="relative glass-strong gradient-border rounded-2xl p-6 overflow-hidden">
          <div className="pointer-events-none absolute -top-20 right-10 h-40 w-40 rounded-full bg-gradient-to-br from-brand-500/30 to-purple-500/30 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-400 to-purple-500 grid place-items-center shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Coach tip</h3>
              <p className="mt-1 text-sm text-white/70 max-w-2xl">
                Proposals starting with a specific reference to the brief have a 47% higher reply
                rate. Try the <span className="text-white">"premium"</span> tone for $1k+ briefs and
                <span className="text-white"> "concise"</span> for short Upwork posts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function statusVariant(s: string) {
  if (s === "won") return "success" as const;
  if (s === "lost") return "danger" as const;
  if (s === "sent") return "default" as const;
  return "secondary" as const;
}
