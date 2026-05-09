import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, requireAuth } from "@/lib/api";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const items = await prisma.savedJob.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return ok({ items });
}

const Body = z.object({
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().min(10),
  source: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  budget: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid", 400);
  const item = await prisma.savedJob.create({
    data: {
      ...parsed.data,
      url: parsed.data.url || null,
      userId: auth.sub,
    },
  });
  return ok({ item });
}
