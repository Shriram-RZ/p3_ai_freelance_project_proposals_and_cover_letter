import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SavedJobs } from "@/components/dashboard/SavedJobs";

export default async function SavedJobsPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const jobs = await prisma.savedJob.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="px-6 lg:px-8 py-8">
      <PageHeader
        eyebrow="Pipeline"
        title="Saved jobs"
        description="A clean Kanban for the briefs you actually care about."
      />
      <div className="mt-6">
        <SavedJobs
          initial={jobs.map((j) => ({
            id: j.id,
            title: j.title,
            description: j.description,
            source: j.source,
            url: j.url,
            budget: j.budget,
            notes: j.notes,
            status: j.status,
            createdAt: j.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
