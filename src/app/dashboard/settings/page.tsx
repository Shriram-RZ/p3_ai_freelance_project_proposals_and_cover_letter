import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  return (
    <div className="px-6 lg:px-8 py-8">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="The more Lumen knows about you, the better it writes in your voice."
      />
      <div className="mt-8">
        <SettingsForm
          user={{
            name: user.name,
            headline: user.headline,
            bio: user.bio,
            hourlyRate: user.hourlyRate,
            experience: user.experience,
            skills: user.skills,
            portfolio: user.portfolio,
          }}
        />
      </div>
    </div>
  );
}
