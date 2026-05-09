import { prisma } from "@/lib/prisma";
import { ok, requireAuth } from "@/lib/api";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const [proposals, coverLetters, generations, jobs, won, sent] = await Promise.all([
    prisma.proposal.count({ where: { userId: auth.sub } }),
    prisma.coverLetter.count({ where: { userId: auth.sub } }),
    prisma.aiGeneration.count({ where: { userId: auth.sub } }),
    prisma.savedJob.count({ where: { userId: auth.sub } }),
    prisma.proposal.count({ where: { userId: auth.sub, status: "won" } }),
    prisma.proposal.count({ where: { userId: auth.sub, status: { in: ["sent", "won", "lost"] } } }),
  ]);

  // 14-day activity series
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);
  const events = await prisma.aiGeneration.findMany({
    where: { userId: auth.sub, createdAt: { gte: since } },
    select: { createdAt: true, kind: true },
    orderBy: { createdAt: "asc" },
  });

  const series: { date: string; count: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    series.push({ date: key, count: 0 });
  }
  for (const e of events) {
    const k = e.createdAt.toISOString().slice(0, 10);
    const slot = series.find((s) => s.date === k);
    if (slot) slot.count++;
  }

  const conversionRate = sent > 0 ? Math.round((won / sent) * 100) : 0;

  const recent = await prisma.proposal.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, title: true, score: true, createdAt: true, status: true, platform: true },
  });

  return ok({
    counts: { proposals, coverLetters, generations, jobs, won, sent, conversionRate },
    series,
    recent,
  });
}
