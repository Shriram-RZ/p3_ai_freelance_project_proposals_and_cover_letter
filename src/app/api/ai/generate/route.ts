import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { groqGenerate } from "@/lib/groq";
import { proposalPrompt, coverLetterPrompt, type Tone, type Platform } from "@/lib/prompts";
import { ok, fail, readBody, requireAuth } from "@/lib/api";

const ToneEnum = z.enum([
  "professional",
  "friendly",
  "premium",
  "confident",
  "technical",
  "persuasive",
  "concise",
  "startup",
]);

const PlatformEnum = z.enum([
  "upwork",
  "fiverr",
  "linkedin",
  "freelancer",
  "email",
  "agency",
  "general",
]);

const Body = z.object({
  kind: z.enum(["proposal", "cover-letter"]),
  job: z.string().trim().min(20, "Paste at least a few sentences from the job."),
  tone: ToneEnum.default("professional"),
  platform: PlatformEnum.default("general"),
  industry: z.string().trim().optional(),
  experience: z.string().trim().optional(),
  skills: z.array(z.string().trim().min(1)).max(40).optional(),
  hourlyRate: z.number().int().min(0).max(10_000).optional(),
  portfolio: z.string().trim().url().optional().or(z.literal("")),
  userName: z.string().trim().max(80).optional(),
  // cover letter specific
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
  // persistence
  save: z.boolean().default(true),
  title: z.string().trim().max(140).optional(),
});

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const parsed = await readBody(req, Body);
  if (parsed instanceof Response) return parsed;

  const start = Date.now();
  let prompt = "";
  if (parsed.kind === "proposal") {
    prompt = proposalPrompt({
      job: parsed.job,
      platform: parsed.platform as Platform,
      tone: parsed.tone as Tone,
      industry: parsed.industry,
      experience: parsed.experience,
      skills: parsed.skills,
      hourlyRate: parsed.hourlyRate,
      portfolio: parsed.portfolio || undefined,
      userName: parsed.userName,
    });
  } else {
    prompt = coverLetterPrompt({
      job: parsed.job,
      company: parsed.company,
      role: parsed.role,
      tone: parsed.tone as Tone,
      experience: parsed.experience,
      skills: parsed.skills,
      userName: parsed.userName,
    });
  }

  let content: string;
  try {
    content = await groqGenerate(prompt, { temperature: 0.85, maxOutputTokens: 1024 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "AI generation failed";
    return fail(msg, 502, "ai_error");
  }
  const durationMs = Date.now() - start;

  let saved = null;
  if (parsed.save) {
    if (parsed.kind === "proposal") {
      saved = await prisma.proposal.create({
        data: {
          userId: auth.sub,
          title: parsed.title || autoTitle(parsed.job),
          jobInput: parsed.job,
          platform: parsed.platform,
          tone: parsed.tone,
          industry: parsed.industry,
          experience: parsed.experience,
          content,
        },
      });
    } else {
      saved = await prisma.coverLetter.create({
        data: {
          userId: auth.sub,
          title: parsed.title || autoTitle(parsed.role || parsed.job),
          jobInput: parsed.job,
          company: parsed.company,
          role: parsed.role,
          tone: parsed.tone,
          content,
        },
      });
    }
  }

  await prisma.aiGeneration.create({
    data: {
      userId: auth.sub,
      kind: parsed.kind,
      prompt: prompt.slice(0, 10_000),
      output: content,
      durationMs,
    },
  });
  await prisma.analyticsEvent.create({
    data: {
      userId: auth.sub,
      type: "generated",
      resourceType: parsed.kind,
      resourceId: saved?.id,
    },
  });

  return ok({ content, saved, durationMs });
}

function autoTitle(input: string) {
  const first = input.replace(/\s+/g, " ").trim().slice(0, 60);
  return first || "Untitled";
}
