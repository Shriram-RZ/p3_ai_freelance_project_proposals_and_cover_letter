import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProposalGenerator } from "@/components/dashboard/ProposalGenerator";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: user.id },
  });
  if (!proposal) notFound();

  return (
    <div className="px-6 lg:px-8 py-8">
      <PageHeader
        eyebrow="Proposal"
        title={proposal.title}
        description="Edit, rewrite, score, or export this proposal."
      />
      <div className="mt-8">
        <ProposalGenerator
          initial={{
            id: proposal.id,
            title: proposal.title,
            job: proposal.jobInput,
            content: proposal.content,
            tone: proposal.tone as never,
            platform: proposal.platform as never,
          }}
          user={{
            name: user.name,
            skills: user.skills,
            hourlyRate: user.hourlyRate,
            portfolio: user.portfolio,
            experience: user.experience,
          }}
        />
      </div>
    </div>
  );
}
