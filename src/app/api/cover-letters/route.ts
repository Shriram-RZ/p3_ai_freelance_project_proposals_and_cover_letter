import { prisma } from "@/lib/prisma";
import { ok, requireAuth } from "@/lib/api";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const items = await prisma.coverLetter.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      company: true,
      role: true,
      tone: true,
      starred: true,
      atsScore: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return ok({ items });
}
