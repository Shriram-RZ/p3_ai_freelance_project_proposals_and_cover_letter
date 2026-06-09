import { z } from "zod";
import { groqGenerate } from "@/lib/groq";
import { rewritePrompt, type Tone } from "@/lib/prompts";
import { ok, fail, readBody, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  content: z.string().trim().min(10),
  instruction: z.string().trim().min(2).max(400),
  tone: z
    .enum([
      "professional",
      "friendly",
      "premium",
      "confident",
      "technical",
      "persuasive",
      "concise",
      "startup",
    ])
    .optional(),
});

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const parsed = await readBody(req, Body);
  if (parsed instanceof Response) return parsed;

  try {
    const out = await groqGenerate(
      rewritePrompt({
        content: parsed.content,
        instruction: parsed.instruction,
        tone: parsed.tone as Tone | undefined,
      }),
      { temperature: 0.7, maxOutputTokens: 1024 }
    );
    await prisma.aiGeneration.create({
      data: {
        userId: auth.sub,
        kind: "rewrite",
        prompt: parsed.instruction,
        output: out,
      },
    });
    return ok({ content: out });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Rewrite failed", 502);
  }
}
