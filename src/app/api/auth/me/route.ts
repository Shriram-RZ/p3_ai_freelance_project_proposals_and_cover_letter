import { requireUser } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  if (!user) return fail("Not authenticated", 401);
  return ok({ user });
}

const Patch = z.object({
  name: z.string().trim().max(80).optional(),
  headline: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(800).optional(),
  hourlyRate: z.number().int().min(0).max(10_000).optional(),
  experience: z.enum(["junior", "mid", "senior", "expert"]).optional(),
  skills: z.array(z.string().trim().min(1)).max(40).optional(),
  portfolio: z.string().trim().url().optional().or(z.literal("")),
});

export async function PATCH(req: Request) {
  const user = await requireUser();
  if (!user) return fail("Not authenticated", 401);

  const json = await req.json().catch(() => ({}));
  const parsed = Patch.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid", 400);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...parsed.data,
      portfolio: parsed.data.portfolio === "" ? null : parsed.data.portfolio,
    },
    select: {
      id: true, email: true, name: true, headline: true, bio: true,
      hourlyRate: true, experience: true, skills: true, portfolio: true,
      plan: true, credits: true,
    },
  });
  return ok({ user: updated });
}
