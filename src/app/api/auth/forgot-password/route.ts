import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, readBody, Schemas } from "@/lib/api";
import { randomBytes, createHash } from "node:crypto";

const Body = z.object({ email: Schemas.email });

// In production, the token would be emailed. Here we return it in dev to make
// the flow demoable end-to-end without an email provider.
export async function POST(req: Request) {
  const parsed = await readBody(req, Body);
  if (parsed instanceof Response) return parsed;

  const user = await prisma.user.findUnique({ where: { email: parsed.email } });
  // Always return ok to avoid email enumeration.
  if (!user) {
    return ok({ message: "If that email exists, we just sent reset instructions." });
  }

  const raw = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password/${raw}`;
  // TODO: send via email provider in prod
  if (process.env.NODE_ENV !== "production") {
    return ok({
      message: "Reset link generated.",
      devLink: link,
    });
  }
  return ok({ message: "If that email exists, we just sent reset instructions." });
}
