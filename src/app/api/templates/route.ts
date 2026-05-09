import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, requireAuth } from "@/lib/api";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const items = await prisma.template.findMany({
    where: {
      OR: [{ userId: auth.sub }, { isPublic: true }],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return ok({ items });
}

const Body = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.enum(["proposal", "cover-letter", "follow-up", "outreach"]),
  platform: z.string().optional(),
  description: z.string().trim().max(400).optional(),
  body: z.string().trim().min(10),
});

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid", 400);
  const t = await prisma.template.create({
    data: { ...parsed.data, userId: auth.sub },
  });
  return ok({ item: t });
}
