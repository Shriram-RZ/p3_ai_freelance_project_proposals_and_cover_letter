import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { relativeTime, truncate } from "@/lib/utils";

export default async function CoverLettersListPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const items = await prisma.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="px-6 lg:px-8 py-8">
      <PageHeader
        eyebrow="Library"
        title="Cover Letters"
        description="ATS-friendly drafts, tone variations, and quick exports."
        actions={
          <Link href="/dashboard/cover-letters/new">
            <Button variant="glow">
              <Sparkles className="h-4 w-4" /> New cover letter
            </Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <div className="mt-12 glass rounded-3xl p-14 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-fuchsia-400 to-pink-500 grid place-items-center animate-pulse-glow">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-white">Nothing yet</h3>
          <p className="mt-1 text-sm text-white/60 max-w-sm mx-auto">
            Drop a job post, choose a tone, and Lumen drafts the rest.
          </p>
          <Link href="/dashboard/cover-letters/new" className="inline-block mt-5">
            <Button variant="glow">Write your first</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/cover-letters/${c.id}`}
              className="group glass rounded-2xl p-5 hover:border-white/20 transition-colors"
            >
              <h3 className="text-sm font-semibold text-white line-clamp-2">{c.title}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.role && <Badge variant="outline">{c.role}</Badge>}
                {c.company && <Badge variant="secondary">{c.company}</Badge>}
                <Badge variant="default" className="capitalize">{c.tone}</Badge>
              </div>
              <p className="mt-3 text-xs text-white/55 line-clamp-3 leading-relaxed">
                {truncate(c.content, 180)}
              </p>
              <div className="mt-3 text-[11px] text-white/40">{relativeTime(c.createdAt)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
