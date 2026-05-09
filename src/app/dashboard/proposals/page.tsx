import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { relativeTime, truncate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function ProposalsListPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const items = await prisma.proposal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      platform: true,
      tone: true,
      status: true,
      score: true,
      starred: true,
      jobInput: true,
      content: true,
      createdAt: true,
    },
  });

  return (
    <div className="px-6 lg:px-8 py-8">
      <PageHeader
        eyebrow="Library"
        title="Proposals"
        description="Every draft, every send, every win — all in one place."
        actions={
          <Link href="/dashboard/proposals/new">
            <Button variant="glow">
              <Sparkles className="h-4 w-4" /> New proposal
            </Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/proposals/${p.id}`}
              className="group glass rounded-2xl p-5 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-white line-clamp-2">{p.title}</h3>
                {typeof p.score === "number" && <Badge variant="secondary">{p.score}</Badge>}
              </div>
              <p className="mt-2 text-xs text-white/55 line-clamp-3 leading-relaxed">
                {truncate(p.content, 180)}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  <Badge variant="outline">{p.platform}</Badge>
                </div>
                <span className="text-[11px] text-white/40">{relativeTime(p.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function statusVariant(s: string) {
  if (s === "won") return "success" as const;
  if (s === "lost") return "danger" as const;
  if (s === "sent") return "default" as const;
  return "secondary" as const;
}

function EmptyState() {
  return (
    <div className="mt-12 glass rounded-3xl p-14 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 grid place-items-center animate-pulse-glow">
        <FileText className="h-5 w-5 text-white" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">No proposals yet</h3>
      <p className="mt-1 text-sm text-white/60 max-w-sm mx-auto">
        Drop a brief, choose a tone, and Lumen writes the rest. Average first proposal: 1.4 seconds.
      </p>
      <Link href="/dashboard/proposals/new" className="inline-block mt-5">
        <Button variant="glow">
          <Sparkles className="h-4 w-4" /> Write your first
        </Button>
      </Link>
    </div>
  );
}
