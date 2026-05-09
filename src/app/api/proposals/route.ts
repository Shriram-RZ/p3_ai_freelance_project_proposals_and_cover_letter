import { prisma } from "@/lib/prisma";
import { ok, requireAuth } from "@/lib/api";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const items = await prisma.proposal.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      platform: true,
      tone: true,
      status: true,
      score: true,
      starred: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return ok({ items });
}
