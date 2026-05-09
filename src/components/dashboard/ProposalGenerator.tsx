"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Wand2,
  RefreshCw,
  Save,
  FileDown,
  Gauge,
  DollarSign,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "./CopyButton";
import { exportToPDF } from "@/lib/pdf";

type ToneKey =
  | "professional"
  | "friendly"
  | "premium"
  | "confident"
  | "technical"
  | "persuasive"
  | "concise"
  | "startup";

type PlatformKey =
  | "upwork"
  | "fiverr"
  | "linkedin"
  | "freelancer"
  | "email"
  | "agency"
  | "general";

const TONES: { value: ToneKey; label: string; emoji: string }[] = [
  { value: "professional", label: "Professional", emoji: "🎯" },
  { value: "friendly", label: "Friendly", emoji: "👋" },
  { value: "premium", label: "Premium", emoji: "✨" },
  { value: "confident", label: "Confident", emoji: "💪" },
  { value: "technical", label: "Technical", emoji: "⚙️" },
  { value: "persuasive", label: "Persuasive", emoji: "🎤" },
  { value: "concise", label: "Concise", emoji: "✂️" },
  { value: "startup", label: "Startup", emoji: "⚡" },
];

const PLATFORMS: { value: PlatformKey; label: string }[] = [
  { value: "upwork", label: "Upwork" },
  { value: "fiverr", label: "Fiverr" },
  { value: "linkedin", label: "LinkedIn DM" },
  { value: "freelancer", label: "Freelancer.com" },
  { value: "email", label: "Cold Email" },
  { value: "agency", label: "Agency Pitch" },
  { value: "general", label: "General" },
];

type AnalysisOut = {
  category: string;
  complexity: "low" | "medium" | "high";
  urgency: "low" | "medium" | "high";
  required_skills: string[];
  client_intent: string;
  pain_points: string[];
  red_flags: string[];
  suggested_tone: string;
};

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

type Props = {
  initial?: {
    id?: string;
    title?: string;
    job?: string;
    platform?: PlatformKey;
    tone?: ToneKey;
    content?: string;
  };
  user: {
    name?: string | null;
    skills?: string[];
    hourlyRate?: number | null;
    portfolio?: string | null;
    experience?: string | null;
  };
};

export function ProposalGenerator({ initial, user }: Props) {
  const [job, setJob] = useState(initial?.job ?? "");
  const [platform, setPlatform] = useState<PlatformKey>(initial?.platform ?? "upwork");
  const [tone, setTone] = useState<ToneKey>(initial?.tone ?? "premium");
  const [industry, setIndustry] = useState("");
  const [content, setContent] = useState(initial?.content ?? "");
  const [savedId, setSavedId] = useState<string | null>(initial?.id ?? null);
  const [title, setTitle] = useState(initial?.title ?? "");

  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [pricing, setPricing] = useState(false);
  const [, startTransition] = useTransition();

  const [analysis, setAnalysis] = useState<AnalysisOut | null>(null);
  const [score, setScore] = useState<ScoreOut | null>(null);
  const [price, setPrice] = useState<PricingOut | null>(null);
  const [followUp, setFollowUp] = useState<string | null>(null);

  async function generate() {
    if (job.trim().length < 20) {
      toast.error("Paste a few sentences from the brief first.");
      return;
    }
    setGenerating(true);
    setContent("");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "proposal",
          job,
          platform,
          tone,
          industry: industry || undefined,
          experience: user.experience || undefined,
          skills: user.skills,
          hourlyRate: user.hourlyRate ?? undefined,
          portfolio: user.portfolio ?? undefined,
          userName: user.name ?? undefined,
          title: title || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error?.message ?? "Generation failed");
      // Animate text in
      streamIntoState(data.data.content, setContent);
      setSavedId(data.data.saved?.id ?? null);
      if (!title && data.data.saved?.title) setTitle(data.data.saved.title);
      toast.success(`Generated in ${(data.data.durationMs / 1000).toFixed(1)}s`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function rewrite(instruction: string) {
    if (!content.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, instruction, tone }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error?.message ?? "Rewrite failed");
      streamIntoState(data.data.content, setContent);
      toast.success("Rewritten");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Rewrite failed");
    } finally {
      setGenerating(false);
    }
  }

  async function analyze() {
    if (job.trim().length < 20) {
      toast.error("Paste the brief first.");
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error?.message ?? "Analysis failed");
      setAnalysis(data.data);
      // Auto-suggest tone
      const suggested = data.data.suggested_tone as ToneKey;
      if (TONES.some((t) => t.value === suggested) && suggested !== tone) {
        setTone(suggested);
        toast.success(`Tone set to "${suggested}" based on the brief`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  async function runScore() {
    if (!content.trim()) return;
    setScoring(true);
    try {
      const res = await fetch("/api/ai/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          jobInput: job,
          proposalId: savedId ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error?.message ?? "Scoring failed");
      setScore(data.data);
      toast.success(`Score: ${data.data.score}/100`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Scoring failed");
    } finally {
      setScoring(false);
    }
  }

  async function runPricing() {
    if (!job.trim()) return;
    setPricing(true);
    try {
      const res = await fetch("/api/ai/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job,
          hourlyRate: user.hourlyRate ?? undefined,
          experience: user.experience ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error?.message ?? "Pricing failed");
      setPrice(data.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Pricing failed");
    } finally {
      setPricing(false);
    }
  }

  async function generateFollowUp() {
    if (!content.trim()) return;
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          instruction:
            "Write a short, friendly follow-up message for this proposal — assume 4 days passed without a reply. 40-80 words.",
          tone: "friendly",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error?.message ?? "Failed");
      setFollowUp(data.data.content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function save() {
    if (!content.trim() || !savedId) {
      toast.error("Generate first to save.");
      return;
    }
    try {
      const res = await fetch(`/api/proposals/${savedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          title,
          tone,
          estimatedPrice: price?.fixedPrice,
          estimatedDays: price?.days,
          followUp: followUp ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error?.message ?? "Save failed");
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  function exportPdf() {
    if (!content.trim()) return;
    startTransition(() => {
      exportToPDF({
        title: title || "Freelance proposal",
        body: content,
        meta: [
          { label: "Platform", value: PLATFORMS.find((p) => p.value === platform)?.label ?? "" },
          { label: "Tone", value: tone },
          { label: "Date", value: new Date().toLocaleDateString() },
        ],
        signature: user.name ? `— ${user.name}` : undefined,
      });
      toast.success("PDF downloaded");
    });
  }

  return (
    <div className="grid lg:grid-cols-[400px_1fr] gap-6">
      {/* Left — input panel */}
      <div className="space-y-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-brand-300" />
            <h2 className="text-sm font-semibold text-white">Brief</h2>
          </div>
          <Textarea
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder="Paste the job description, client message, or project requirements here…"
            className="min-h-[180px]"
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/50">
            <span>{job.length} chars</span>
            <button
              onClick={analyze}
              disabled={analyzing || job.trim().length < 20}
              className="text-brand-300 hover:underline disabled:opacity-40 disabled:no-underline inline-flex items-center gap-1"
            >
              {analyzing ? "Analyzing…" : (<>Analyze brief <ArrowRight className="h-3 w-3" /></>)}
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Setup</h2>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Shopify checkout speed-up"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as PlatformKey)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as ToneKey)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.emoji} {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry (optional)</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. SaaS, e-commerce, fintech"
            />
          </div>
        </div>

        <Button
          onClick={generate}
          loading={generating}
          variant="glow"
          size="lg"
          className="w-full"
        >
          {generating ? "Writing your proposal" : (<><Sparkles className="h-4 w-4" /> Generate proposal</>)}
        </Button>

        <Button
          onClick={runPricing}
          loading={pricing}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          <DollarSign className="h-4 w-4" /> Suggest pricing & timeline
        </Button>

        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-2xl p-5 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-300" />
                <h2 className="text-sm font-semibold text-white">Brief analysis</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Cell k="Category" v={analysis.category} />
                <Cell k="Complexity" v={analysis.complexity} />
                <Cell k="Urgency" v={analysis.urgency} />
                <Cell k="Suggested tone" v={analysis.suggested_tone} />
              </div>
              <div className="mt-3 space-y-2">
                <Section title="Client intent" body={analysis.client_intent} />
                <ChipsRow title="Required skills" items={analysis.required_skills} variant="default" />
                {analysis.pain_points.length > 0 && (
                  <ChipsRow title="Pain points" items={analysis.pain_points} variant="warning" />
                )}
                {analysis.red_flags.length > 0 && (
                  <ChipsRow title="Red flags" items={analysis.red_flags} variant="danger" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right — output workspace */}
      <div className="space-y-4">
        <div className="glass-strong gradient-border rounded-2xl">
          <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="thinking-dot" style={{ animationPlayState: generating ? "running" : "paused", opacity: generating ? 1 : 0.2 }} />
              <span className="thinking-dot" style={{ animationPlayState: generating ? "running" : "paused", opacity: generating ? 1 : 0.2 }} />
              <span className="thinking-dot" style={{ animationPlayState: generating ? "running" : "paused", opacity: generating ? 1 : 0.2 }} />
              <span className="ml-1">
                {generating ? "Generating with Gemini Flash" : content ? "Ready" : "Workspace"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CopyButton text={content} />
              <Button variant="secondary" size="sm" onClick={exportPdf} disabled={!content}>
                <FileDown className="h-3.5 w-3.5" /> PDF
              </Button>
              <Button variant="secondary" size="sm" onClick={save} disabled={!content || !savedId}>
                <Save className="h-3.5 w-3.5" /> Save
              </Button>
            </div>
          </div>

          <div className="p-5 min-h-[480px]">
            {!content && !generating ? (
              <EmptyOutput onSample={() => setJob(SAMPLE_BRIEF)} />
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="prose-output min-h-[460px] bg-transparent border-none focus-visible:ring-0 focus-visible:border-none resize-none p-0 text-sm text-white/90"
              />
            )}
          </div>

          {content && (
            <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { l: "Shorter", i: "Cut 30% of the length without losing the core argument." },
                  { l: "More premium", i: "Make the tone quietly premium and confident." },
                  { l: "More technical", i: "Add specific technical depth and tools used." },
                  { l: "Add CTA", i: "End with a stronger, low-friction CTA." },
                  { l: "Punchier opener", i: "Rewrite only the opening line to be sharper and more specific." },
                ].map((q) => (
                  <button
                    key={q.l}
                    onClick={() => rewrite(q.i)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <Wand2 className="h-3 w-3" /> {q.l}
                  </button>
                ))}
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={runScore}
                loading={scoring}
              >
                <Gauge className="h-3.5 w-3.5" /> Score this
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <ScoreCard score={score} />
          <PriceCard price={price} />
        </div>

        <FollowUpCard followUp={followUp} onGenerate={generateFollowUp} />
      </div>
    </div>
  );
}

const SAMPLE_BRIEF =
  "We need a Shopify dev to fix a slow checkout. Mobile LCP is ~4.8s, conversion dropped 12% last month. Looking for someone who can audit, ship fixes, and prove the gain with before/after Lighthouse scores. Budget flexible for the right person — open to fixed or hourly.";

function EmptyOutput({ onSample }: { onSample: () => void }) {
  return (
    <div className="h-[460px] flex flex-col items-center justify-center text-center">
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 grid place-items-center mb-4 animate-pulse-glow">
        <Sparkles className="h-5 w-5 text-white" />
      </div>
      <p className="text-white/80 font-medium">Paste a brief, hit Generate.</p>
      <p className="text-white/50 text-sm mt-1 max-w-sm">
        Lumen reads the brief, matches your skills, and writes a proposal that sounds like you.
      </p>
      <button
        onClick={onSample}
        className="mt-5 text-xs text-brand-300 hover:underline"
      >
        Or try a sample brief →
      </button>
    </div>
  );
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{k}</div>
      <div className="text-white capitalize">{v}</div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/40">{title}</div>
      <p className="text-white/80 mt-0.5">{body}</p>
    </div>
  );
}

function ChipsRow({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "default" | "warning" | "danger";
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{title}</div>
      <div className="flex flex-wrap gap-1">
        {items.slice(0, 8).map((s, i) => (
          <Badge key={i} variant={variant}>
            {s}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ScoreCard({ score }: { score: ScoreOut | null }) {
  if (!score) {
    return (
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Gauge className="h-4 w-4 text-brand-300" />
          <h3 className="text-sm font-semibold text-white">Conversion score</h3>
        </div>
        <p className="text-xs text-white/50">
          Generate first, then run the scorer to see how your proposal stacks up.
        </p>
      </div>
    );
  }
  const tone =
    score.score >= 85
      ? "from-emerald-500/30 to-cyan-500/20"
      : score.score >= 65
      ? "from-amber-500/30 to-orange-500/20"
      : "from-red-500/30 to-pink-500/20";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative glass rounded-2xl p-5 overflow-hidden`}
    >
      <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${tone} blur-2xl`} />
      <div className="relative">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold text-white tracking-tight">{score.score}</span>
          <span className="text-sm text-white/50">/ 100</span>
        </div>
        <Progress value={score.score} className="mt-3" />
        <div className="mt-3 grid grid-cols-5 gap-1.5 text-[10px]">
          {Object.entries(score.breakdown).map(([k, v]) => (
            <div key={k} className="rounded-md border border-white/5 bg-white/[0.02] px-1.5 py-1">
              <div className="text-white/40 truncate capitalize">{k}</div>
              <div className="text-white">{v}</div>
            </div>
          ))}
        </div>
        {score.fixes.length > 0 && (
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider text-white/40">Quick fixes</div>
            <ul className="mt-1 space-y-1 text-xs text-white/75">
              {score.fixes.slice(0, 3).map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-300">→</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PriceCard({ price }: { price: PricingOut | null }) {
  if (!price) {
    return (
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="h-4 w-4 text-emerald-300" />
          <h3 className="text-sm font-semibold text-white">Pricing & timeline</h3>
        </div>
        <p className="text-xs text-white/50">
          Get a fair fixed price, hourly range, and realistic timeline based on the brief.
        </p>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative glass rounded-2xl p-5 overflow-hidden"
    >
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/15 blur-2xl" />
      <div className="relative">
        <div className="flex items-end gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40">Fixed</div>
            <div className="text-3xl font-semibold text-white">${price.fixedPrice.toLocaleString()}</div>
          </div>
          <div className="text-white/40 text-sm mb-1">·</div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40">Hourly</div>
            <div className="text-sm text-white">${price.hourlyMin}–${price.hourlyMax} / hr</div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-white/60">
          <span>{price.hours}h estimated</span>
          <span>·</span>
          <span>{price.days} days</span>
        </div>
        <p className="mt-3 text-xs text-white/70 leading-relaxed">{price.rationale}</p>
        {price.risks.length > 0 && (
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider text-white/40">Risks to flag</div>
            <ul className="mt-1 space-y-1 text-xs text-white/70">
              {price.risks.slice(0, 3).map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function FollowUpCard({
  followUp,
  onGenerate,
}: {
  followUp: string | null;
  onGenerate: () => void;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-brand-300" />
          <h3 className="text-sm font-semibold text-white">Follow-up message</h3>
        </div>
        <Button size="sm" variant="secondary" onClick={onGenerate}>
          {followUp ? "Regenerate" : "Generate"}
        </Button>
      </div>
      {followUp ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="prose-output text-sm text-white/85">{followUp}</p>
          <div className="mt-3 flex justify-end">
            <CopyButton text={followUp} />
          </div>
        </div>
      ) : (
        <p className="text-xs text-white/50">
          Need a soft nudge if the client goes quiet? Generate one ready-to-send.
        </p>
      )}
    </div>
  );
}

function streamIntoState(text: string, set: (s: string) => void) {
  let i = 0;
  set("");
  const id = setInterval(() => {
    i += Math.max(2, Math.round(text.length / 120));
    if (i >= text.length) {
      set(text);
      clearInterval(id);
    } else {
      set(text.slice(0, i));
    }
  }, 16);
}
