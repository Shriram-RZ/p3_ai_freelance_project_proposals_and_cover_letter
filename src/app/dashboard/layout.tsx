import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");

  return (
    <div className="relative min-h-screen flex">
      <div className="absolute inset-0 app-grid pointer-events-none opacity-40" />
      <Sidebar />
      <div className="relative flex-1 flex flex-col min-w-0">
        <Topbar user={{ name: user.name, email: user.email }} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
