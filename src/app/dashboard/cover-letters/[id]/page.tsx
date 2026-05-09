import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CoverLetterGenerator } from "@/components/dashboard/CoverLetterGenerator";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default async function CoverLetterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const item = await prisma.coverLetter.findFirst({
    where: { id, userId: user.id },
  });
  if (!item) notFound();

  return (
    <div className="px-6 lg:px-8 py-8">
      <PageHeader eyebrow="Cover Letter" title={item.title} />
      <div className="mt-8">
        <CoverLetterGenerator
          initial={{
            id: item.id,
            title: item.title,
            job: item.jobInput,
            company: item.company,
            role: item.role,
            tone: item.tone as never,
            content: item.content,
          }}
          user={{ name: user.name, skills: user.skills, experience: user.experience }}
        />
      </div>
    </div>
  );
}
