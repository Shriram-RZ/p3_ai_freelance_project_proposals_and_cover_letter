import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, requireAuth } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await ctx.params;
  const item = await prisma.coverLetter.findFirst({
    where: { id, userId: auth.sub },
  });
  if (!item) return fail("Not found", 404);
  return ok({ item });
}

const Patch = z.object({
  title: z.string().trim().max(140).optional(),
  content: z.string().trim().optional(),
  starred: z.boolean().optional(),
  tone: z.string().optional(),
  atsScore: z.number().int().min(0).max(100).optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await ctx.params;
  const json = await req.json().catch(() => ({}));
  const parsed = Patch.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid", 400);

  const r = await prisma.coverLetter.updateMany({
    where: { id, userId: auth.sub },
    data: parsed.data,
  });
  if (r.count === 0) return fail("Not found", 404);
  const item = await prisma.coverLetter.findUnique({ where: { id } });
  return ok({ item });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await ctx.params;
  const r = await prisma.coverLetter.deleteMany({
    where: { id, userId: auth.sub },
  });
  if (r.count === 0) return fail("Not found", 404);
  return ok({ deleted: true });
}
