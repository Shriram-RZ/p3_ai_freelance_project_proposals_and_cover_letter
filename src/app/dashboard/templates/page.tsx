import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/dashboard/CopyButton";

export default async function TemplatesPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const items = await prisma.template.findMany({
    where: {
      OR: [{ userId: user.id }, { isPublic: true }],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const grouped = groupBy(items, (t) => t.category);

  return (
    <div className="px-6 lg:px-8 py-8">
      <PageHeader
        eyebrow="Templates"
        title="Reusable scaffolds, ready to remix."
        description="Curated openers, full proposals, follow-ups, and outreach DMs. Drop in your details and ship."
      />

      <div className="mt-8 space-y-10">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((cat) => (
          <section key={cat as string}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-white/80 uppercase tracking-wider">
                {readableCategory(cat as string)}
              </h2>
              <Badge variant="secondary">{grouped[cat as string].length}</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {grouped[cat as string].map((t) => (
                <article key={t.id} className="glass rounded-2xl p-5 group">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-white">{t.name}</h3>
                    <div className="flex items-center gap-1.5">
                      {t.platform && <Badge variant="outline">{t.platform}</Badge>}
                      {t.isPublic && <Badge variant="default">Curated</Badge>}
                    </div>
                  </div>
                  {t.description && (
                    <p className="mt-1 text-xs text-white/60">{t.description}</p>
                  )}
                  <pre className="mt-3 max-h-44 overflow-y-auto rounded-lg border border-white/5 bg-white/[0.02] p-3 text-[12px] leading-relaxed text-white/80 whitespace-pre-wrap font-sans">
                    {t.body}
                  </pre>
                  <div className="mt-3 flex justify-end">
                    <CopyButton text={t.body} label="Copy template" />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function groupBy<T>(arr: T[], key: (t: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of arr) {
    const k = key(item);
    (out[k] ??= []).push(item);
  }
  return out;
}

function readableCategory(c: string) {
  return (
    {
      proposal: "Proposals",
      "cover-letter": "Cover letters",
      "follow-up": "Follow-ups",
      outreach: "Outreach",
    }[c] ?? c
  );
}
