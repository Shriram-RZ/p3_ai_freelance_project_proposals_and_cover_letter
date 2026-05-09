import { prisma } from "@/lib/prisma";
import { ok, requireAuth } from "@/lib/api";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const sessions = await prisma.chatSession.findMany({
    where: { userId: auth.sub },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
  return ok({ sessions });
}

export async function POST() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const session = await prisma.chatSession.create({
    data: { userId: auth.sub, title: "New chat" },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
  return ok({ session });
}
