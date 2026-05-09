import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, requireAuth } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

const Patch = z.object({
  status: z.enum(["new", "applied", "interviewing", "won", "lost"]).optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await ctx.params;
  const json = await req.json().catch(() => ({}));
  const parsed = Patch.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid", 400);
  const r = await prisma.savedJob.updateMany({
    where: { id, userId: auth.sub },
    data: parsed.data,
  });
  if (r.count === 0) return fail("Not found", 404);
  return ok({ updated: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await ctx.params;
  const r = await prisma.savedJob.deleteMany({
    where: { id, userId: auth.sub },
  });
  if (r.count === 0) return fail("Not found", 404);
  return ok({ deleted: true });
}
