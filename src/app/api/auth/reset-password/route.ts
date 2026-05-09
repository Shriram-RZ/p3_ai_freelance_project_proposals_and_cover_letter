import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, setAuthCookie } from "@/lib/auth";
import { ok, fail, readBody, Schemas } from "@/lib/api";
import { createHash } from "node:crypto";

const Body = z.object({
  token: z.string().min(16),
  password: Schemas.password,
});

export async function POST(req: Request) {
  const parsed = await readBody(req, Body);
  if (parsed instanceof Response) return parsed;

  const tokenHash = createHash("sha256").update(parsed.token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.used || record.expiresAt < new Date()) {
    return fail("This reset link is invalid or has expired.", 400, "invalid_token");
  }

  const passwordHash = await hashPassword(parsed.password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
  ]);

  const token = await signSession({
    sub: record.user.id,
    email: record.user.email,
    plan: record.user.plan,
  });
  await setAuthCookie(token);
  return ok({ ok: true });
}
