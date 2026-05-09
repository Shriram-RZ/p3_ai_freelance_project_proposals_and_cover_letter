import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, setAuthCookie } from "@/lib/auth";
import { ok, fail, readBody, Schemas } from "@/lib/api";

const Body = z.object({
  email: Schemas.email,
  password: Schemas.password,
  name: z.string().trim().min(1).max(80).optional(),
});

export async function POST(req: Request) {
  const parsed = await readBody(req, Body);
  if (parsed instanceof Response) return parsed;

  const exists = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (exists) return fail("An account with this email already exists.", 409, "user_exists");

  const passwordHash = await hashPassword(parsed.password);
  const user = await prisma.user.create({
    data: {
      email: parsed.email,
      passwordHash,
      name: parsed.name ?? null,
    },
    select: { id: true, email: true, name: true, plan: true, credits: true },
  });

  const token = await signSession({ sub: user.id, email: user.email, plan: user.plan });
  await setAuthCookie(token);

  return ok({ user });
}
