import { z } from "zod";
import { groqJSON } from "@/lib/groq";
import { pricingPrompt } from "@/lib/prompts";
import { ok, fail, readBody, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  job: z.string().trim().min(20),
  hourlyRate: z.number().int().min(0).max(10_000).optional(),
  experience: z.string().trim().optional(),
});

type PricingOut = {
  scope: string;
  fixedPrice: number;
  hourlyMin: number;
  hourlyMax: number;
  hours: number;
  days: number;
  rationale: string;
  risks: string[];
};

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const parsed = await readBody(req, Body);
  if (parsed instanceof Response) return parsed;

  try {
    const result = await groqJSON<PricingOut>(
      pricingPrompt({
        job: parsed.job,
        hourlyRate: parsed.hourlyRate,
        experience: parsed.experience,
      }),
      { temperature: 0.3, maxOutputTokens: 600 }
    );

    await prisma.pricingEstimation.create({
      data: {
        userId: auth.sub,
        jobInput: parsed.job,
        hourlyRate: parsed.hourlyRate,
        scope: result.scope,
        fixedPrice: result.fixedPrice,
        hourlyMin: result.hourlyMin,
        hourlyMax: result.hourlyMax,
        hours: result.hours,
        rationale: result.rationale,
      },
    });

    return ok(result);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Pricing failed", 502);
  }
}
