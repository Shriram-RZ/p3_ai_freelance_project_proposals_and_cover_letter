import { z } from "zod";
import { groqJSON } from "@/lib/groq";
import { ok, fail, readBody, requireAuth } from "@/lib/api";

const Body = z.object({
  job: z.string().trim().min(20, "Paste at least a few sentences from the brief."),
});

type Analysis = {
  category: string;
  complexity: "low" | "medium" | "high";
  urgency: "low" | "medium" | "high";
  required_skills: string[];
  client_intent: string;
  pain_points: string[];
  red_flags: string[];
  suggested_tone: string;
};

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const parsed = await readBody(req, Body);
  if (parsed instanceof Response) return parsed;

  const prompt = `
You are analyzing a freelance job brief. Return STRICT JSON only:
{
  "category": "<short category, e.g. 'Webflow site', 'iOS app', 'B2B copywriting'>",
  "complexity": "low" | "medium" | "high",
  "urgency": "low" | "medium" | "high",
  "required_skills": [<short string>, ...],
  "client_intent": "<one sentence on what they actually want>",
  "pain_points": [<short string>, ...],
  "red_flags": [<short string>, ...],
  "suggested_tone": "<one of: professional, friendly, premium, confident, technical, persuasive, concise, startup>"
}

BRIEF:
"""
${parsed.job}
"""
`.trim();

  try {
    const result = await groqJSON<Analysis>(prompt, {
      temperature: 0.2,
      maxOutputTokens: 600,
    });
    return ok(result);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Analyze failed", 502);
  }
}
