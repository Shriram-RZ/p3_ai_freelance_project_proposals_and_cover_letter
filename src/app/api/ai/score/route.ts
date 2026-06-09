import { z } from "zod";
import { groqJSON } from "@/lib/groq";
import { scorePrompt } from "@/lib/prompts";
import { ok, fail, readBody, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  content: z.string().trim().min(20),
  jobInput: z.string().trim().optional(),
  proposalId: z.string().optional(),
});

type ScoreOut = {
  score: number;
  breakdown: {
    relevance: number;
    specificity: number;
    conversion: number;
    voice: number;
    length: number;
  };
  wins: string[];
  fixes: string[];
};

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const parsed = await readBody(req, Body);
  if (parsed instanceof Response) return parsed;

  try {
    const result = await groqJSON<ScoreOut>(
      scorePrompt({ content: parsed.content, jobInput: parsed.jobInput }),
      { temperature: 0.2, maxOutputTokens: 600 }
    );
    if (parsed.proposalId) {
      await prisma.proposal.updateMany({
        where: { id: parsed.proposalId, userId: auth.sub },
        data: { score: Math.max(0, Math.min(100, Math.round(result.score))) },
      });
    }
    return ok(result);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Scoring failed", 502);
  }
}
