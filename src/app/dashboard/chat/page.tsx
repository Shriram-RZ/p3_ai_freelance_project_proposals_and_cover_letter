import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Chat } from "@/components/dashboard/Chat";

export default async function ChatPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const sessions = await prisma.chatSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, updatedAt: true },
  });

  return (
    <Chat
      sessions={sessions.map((s) => ({
        id: s.id,
        title: s.title,
        updatedAt: s.updatedAt.toISOString(),
      }))}
      user={{ name: user.name, email: user.email }}
    />
  );
}
