import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEMPLATES = [
  {
    name: "Upwork — Senior Developer",
    category: "proposal",
    platform: "upwork",
    description: "High-converting proposal for senior dev roles on Upwork",
    body:
      "Hi {clientName},\n\nI noticed you need {projectFocus}. I've shipped {relevantWork} and I'd love to help. Here's how I'd approach this:\n\n1. {step1}\n2. {step2}\n3. {step3}\n\nTimeline: {timeline}. Happy to jump on a quick call.\n\n— {yourName}",
  },
  {
    name: "Premium Agency Pitch",
    category: "proposal",
    platform: "agency",
    description: "Confident, premium-sounding pitch for design agencies",
    body:
      "Hello {clientName},\n\nWe build {category} products that ship — and we move fast. Reading your brief, three things stand out: {pain1}, {pain2}, {pain3}.\n\nHere's our take.\n{strategy}\n\nLet's make it happen.",
  },
  {
    name: "LinkedIn Cold Outreach",
    category: "outreach",
    platform: "linkedin",
    description: "Friendly, value-led DM that doesn't feel salesy",
    body:
      "Hey {firstName} — saw your post on {topic} and your point on {insight} stuck with me.\n\nI work on {value} and recently helped {socialProof}. Open to a 15-min chat next week?",
  },
  {
    name: "Concise Cover Letter",
    category: "cover-letter",
    platform: null,
    description: "Tight, ATS-friendly cover letter for product / engineering roles",
    body:
      "Dear {hiringManager},\n\nI'm applying for the {role} role at {company}. Over the last {years} years I've {wins}. What drew me in: {hookFromJobPost}.\n\nI'd love to bring this energy to your team.\n\n— {yourName}",
  },
  {
    name: "Follow-up after Silence",
    category: "follow-up",
    platform: null,
    description: "A non-pushy nudge for clients who went quiet",
    body:
      "Hey {clientName},\n\nCircling back on the {project} brief. I've been thinking about {idea} and have a quick suggestion that might help.\n\nWorth a 10-min chat?",
  },
];

async function main() {
  for (const t of TEMPLATES) {
    await prisma.template.upsert({
      where: { id: `seed-${t.name.toLowerCase().replace(/\s+/g, "-")}` },
      update: { ...t, isPublic: true },
      create: { id: `seed-${t.name.toLowerCase().replace(/\s+/g, "-")}`, ...t, isPublic: true },
    });
  }
  console.log(`Seeded ${TEMPLATES.length} templates.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
