import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { CoverLetterGenerator } from "@/components/dashboard/CoverLetterGenerator";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default async function NewCoverLetterPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  return (
    <div className="px-6 lg:px-8 py-8">
      <PageHeader
        eyebrow="Cover Letter Writer"
        title="Make recruiters stop scrolling."
        description="Mirrors the job post's keywords without sounding like an AI tried to."
      />
      <div className="mt-8">
        <CoverLetterGenerator
          user={{
            name: user.name,
            skills: user.skills,
            experience: user.experience,
          }}
        />
      </div>
    </div>
  );
}
