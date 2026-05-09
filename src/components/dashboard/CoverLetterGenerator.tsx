"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Wand2, FileDown, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type Props = {
  initial?: {
    id?: string;
    title?: string;
    job?: string;
    company?: string | null;
    role?: string | null;
    tone?: ToneKey;
    content?: string;
  };
  user: {
    name?: string | null;
    skills?: string[];
    experience?: string | null;
  };
};

export function CoverLetterGenerator({ initial, user }: Props) {
  const [job, setJob] = useState(initial?.job ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [tone, setTone] = useState<ToneKey>(initial?.tone ?? "professional");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [savedId, setSavedId] = useState<string | null>(initial?.id ?? null);
  const [generating, setGenerating] = useState(false);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  async function generate() {
    if (job.trim().length < 20) {
      toast.error("Paste a few sentences from the job posting first.");
      return;
    }
    setGenerating(true);
    setContent("");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "cover-letter",
          job,
          company: company || undefined,
          role: role || undefined,
          tone,
          experience: user.experience || undefined,
          skills: user.skills,
          userName: user.name ?? undefined,
          title: title || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error?.message ?? "Generation failed");
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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Rewrite failed");
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!savedId) return toast.error("Generate first to save.");
    try {
      const res = await fetch(`/api/cover-letters/${savedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title, tone }),
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
    exportToPDF({
      title: title || `${role || "Cover letter"}${company ? ` — ${company}` : ""}`,
      body: content,
      meta: [
        { label: "Tone", value: tone },
        { label: "Date", value: new Date().toLocaleDateString() },
        ...(role ? [{ label: "Role", value: role }] : []),
        ...(company ? [{ label: "Company", value: company }] : []),
      ],
      signature: user.name ? `Sincerely,\n${user.name}` : undefined,
    });
    toast.success("PDF downloaded");
  }

  return (
    <div className="grid lg:grid-cols-[400px_1fr] gap-6">
      <div className="space-y-4">
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand-300" />
            <h2 className="text-sm font-semibold text-white">Job posting</h2>
          </div>
          <Textarea
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder="Paste the role description, responsibilities, and any 'about us' copy here."
            className="min-h-[200px]"
          />
          <div className="text-[11px] text-white/50 flex justify-between">
            <span>{job.length} chars</span>
            <span>ATS keyword matching is automatic</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Details</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Senior Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Linear"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title (for your library)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Auto-generated if empty"
            />
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

        <Button
          onClick={generate}
          loading={generating}
          variant="glow"
          size="lg"
          className="w-full"
        >
          {generating ? "Writing your letter" : (<><Sparkles className="h-4 w-4" /> Generate cover letter</>)}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="glass-strong gradient-border rounded-2xl">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Mail className="h-3.5 w-3.5 text-brand-300" />
              <span>{generating ? "Generating" : content ? `${wordCount} words · ATS-ready` : "Workspace"}</span>
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
              <Empty />
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="prose-output min-h-[460px] bg-transparent border-none focus-visible:ring-0 resize-none p-0 text-sm text-white/90"
              />
            )}
          </div>
          {content && (
            <div className="border-t border-white/5 px-5 py-3 flex flex-wrap gap-1.5">
              {[
                { l: "More personable", i: "Soften the tone slightly so it feels more personable, without losing the professionalism." },
                { l: "Tighter", i: "Cut 25% of the length while keeping the strongest evidence." },
                { l: "Stronger hook", i: "Rewrite only the opening paragraph to hook with a specific reference to the job post." },
                { l: "Add metrics", i: "Insert one specific quantitative achievement that fits the role." },
                { l: "ATS keywords", i: "Naturally weave in the most important keywords from the job post." },
              ].map((q) => (
                <button
                  key={q.l}
                  onClick={() => rewrite(q.i)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/70 hover:border-white/30 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <Wand2 className="h-3 w-3" /> {q.l}
                </button>
              ))}
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-white">ATS-ready checklist</h3>
          <ul className="mt-3 space-y-2 text-xs text-white/70">
            <li className="flex gap-2"><span className="text-emerald-300">✓</span> One page, plain paragraphs (no fancy tables)</li>
            <li className="flex gap-2"><span className="text-emerald-300">✓</span> Mirrors job-post keywords in context, not as a list</li>
            <li className="flex gap-2"><span className="text-emerald-300">✓</span> Specific evidence over generic claims</li>
            <li className="flex gap-2"><span className="text-emerald-300">✓</span> Confident, low-friction CTA at the end</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="h-[460px] flex flex-col items-center justify-center text-center">
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-fuchsia-400 to-pink-500 grid place-items-center mb-4 animate-pulse-glow">
        <Mail className="h-5 w-5 text-white" />
      </div>
      <p className="text-white/80 font-medium">Paste the job, hit Generate.</p>
      <p className="text-white/50 text-sm mt-1 max-w-sm">
        Lumen mirrors the right keywords without sounding like a robot.
      </p>
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
