import { redirect } from "next/navigation";
import { FileText, Mail, TrendingUp, Zap, Trophy, Send } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default async function AnalyticsPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const [proposalsCount, coverLettersCount, gens, sent, won, lost, byPlatform, byTone] =
    await Promise.all([
      prisma.proposal.count({ where: { userId: user.id } }),
      prisma.coverLetter.count({ where: { userId: user.id } }),
      prisma.aiGeneration.count({ where: { userId: user.id } }),
      prisma.proposal.count({
        where: { userId: user.id, status: { in: ["sent", "won", "lost"] } },
      }),
      prisma.proposal.count({ where: { userId: user.id, status: "won" } }),
      prisma.proposal.count({ where: { userId: user.id, status: "lost" } }),
      prisma.proposal.groupBy({
        by: ["platform"],
        where: { userId: user.id },
        _count: { _all: true },
      }),
      prisma.proposal.groupBy({
        by: ["tone"],
        where: { userId: user.id },
        _count: { _all: true },
      }),
    ]);

  const conversion = sent > 0 ? Math.round((won / sent) * 100) : 0;

  // 14-day series
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

  const totalByPlatform = byPlatform.reduce((a, b) => a + b._count._all, 0);
  const totalByTone = byTone.reduce((a, b) => a + b._count._all, 0);

  return (
    <div className="px-6 lg:px-8 py-8">
      <PageHeader
        eyebrow="Analytics"
        title="What's actually working."
        description="Track conversion, find your best tones, and double down on what wins."
      />

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Proposals" value={proposalsCount} icon={FileText} index={0} />
        <StatCard label="Cover letters" value={coverLettersCount} icon={Mail} index={1} accent="from-fuchsia-500/30 to-pink-500/20" />
        <StatCard label="Sent" value={sent} icon={Send} index={2} accent="from-blue-500/30 to-indigo-500/20" />
        <StatCard
          label="Conversion"
          value={`${conversion}%`}
          delta={`${won} wins · ${lost} losses`}
          icon={TrendingUp}
          accent="from-emerald-500/30 to-cyan-500/20"
          index={3}
          trend={conversion > 30 ? "up" : "flat"}
        />
      </div>

      <div className="mt-6 grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generation activity (14d)</CardTitle>
                <CardDescription>Daily AI runs across all features.</CardDescription>
              </div>
              <Badge variant="secondary">{gens} total</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-48">
            <Sparkline data={series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Win rate</CardTitle>
            <CardDescription>Higher is better.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-semibold text-white">{conversion}%</span>
              <Trophy className="h-5 w-5 text-amber-300" />
            </div>
            <Progress value={conversion} />
            <div className="mt-3 text-xs text-white/60">
              {won} won out of {sent} proposals you've marked sent.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>By platform</CardTitle>
            <CardDescription>Where your proposals are going.</CardDescription>
          </CardHeader>
          <CardContent>
            {byPlatform.length === 0 ? (
              <p className="text-sm text-white/60">No data yet.</p>
            ) : (
              <ul className="space-y-3">
                {byPlatform.map((g) => {
                  const pct = totalByPlatform > 0 ? Math.round((g._count._all / totalByPlatform) * 100) : 0;
                  return (
                    <li key={g.platform}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80 capitalize">{g.platform}</span>
                        <span className="text-white/50">{g._count._all} · {pct}%</span>
                      </div>
                      <Progress value={pct} className="mt-1.5" />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By tone</CardTitle>
            <CardDescription>The voice you reach for most.</CardDescription>
          </CardHeader>
          <CardContent>
            {byTone.length === 0 ? (
              <p className="text-sm text-white/60">No data yet.</p>
            ) : (
              <ul className="space-y-3">
                {byTone.map((g) => {
                  const pct = totalByTone > 0 ? Math.round((g._count._all / totalByTone) * 100) : 0;
                  return (
                    <li key={g.tone}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80 capitalize">{g.tone}</span>
                        <span className="text-white/50">{g._count._all} · {pct}%</span>
                      </div>
                      <Progress value={pct} className="mt-1.5" />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
