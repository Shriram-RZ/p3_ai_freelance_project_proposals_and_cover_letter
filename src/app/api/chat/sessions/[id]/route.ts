import { prisma } from "@/lib/prisma";
import { ok, fail, requireAuth } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await ctx.params;
  const session = await prisma.chatSession.findFirst({
    where: { id, userId: auth.sub },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
    },
  });
  if (!session) return fail("Not found", 404);
  return ok({ session });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await ctx.params;
  const r = await prisma.chatSession.deleteMany({
    where: { id, userId: auth.sub },
  });
  if (r.count === 0) return fail("Not found", 404);
  return ok({ deleted: true });
}
