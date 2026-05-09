import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, setAuthCookie } from "@/lib/auth";
import { ok, fail, readBody, Schemas } from "@/lib/api";

const Body = z.object({
  email: Schemas.email,
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  const parsed = await readBody(req, Body);
  if (parsed instanceof Response) return parsed;

  const user = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (!user) return fail("Incorrect email or password.", 401, "invalid_credentials");

  const matches = await verifyPassword(parsed.password, user.passwordHash);
  if (!matches) return fail("Incorrect email or password.", 401, "invalid_credentials");

  const token = await signSession({ sub: user.id, email: user.email, plan: user.plan });
  await setAuthCookie(token);

  return ok({
    user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
  });
}
