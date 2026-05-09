import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ProposalGenerator } from "@/components/dashboard/ProposalGenerator";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default async function NewProposalPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  return (
    <div className="px-6 lg:px-8 py-8">
      <PageHeader
        eyebrow="AI Proposal Generator"
        title="Write something they'll actually reply to."
        description="Paste the brief, pick the platform & tone, and Lumen drafts a proposal that sounds human and converts."
      />
      <div className="mt-8">
        <ProposalGenerator
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
