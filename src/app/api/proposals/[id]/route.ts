import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, requireAuth } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await ctx.params;
  const item = await prisma.proposal.findFirst({
    where: { id, userId: auth.sub },
  });
  if (!item) return fail("Not found", 404);
  return ok({ item });
}

const Patch = z.object({
  title: z.string().trim().max(140).optional(),
  content: z.string().trim().optional(),
  status: z.enum(["draft", "sent", "won", "lost"]).optional(),
  starred: z.boolean().optional(),
  tone: z.string().optional(),
  estimatedPrice: z.number().int().optional(),
  estimatedDays: z.number().int().optional(),
  followUp: z.string().optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await ctx.params;
  const json = await req.json().catch(() => ({}));
  const parsed = Patch.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid", 400);

  const result = await prisma.proposal.updateMany({
    where: { id, userId: auth.sub },
    data: parsed.data,
  });
  if (result.count === 0) return fail("Not found", 404);
  const item = await prisma.proposal.findUnique({ where: { id } });
  return ok({ item });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await ctx.params;
  const result = await prisma.proposal.deleteMany({
    where: { id, userId: auth.sub },
  });
  if (result.count === 0) return fail("Not found", 404);
  return ok({ deleted: true });
}
