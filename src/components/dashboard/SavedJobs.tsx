"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Plus, ArrowRight, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { relativeTime, truncate } from "@/lib/utils";

type Job = {
  id: string;
  title: string;
  description: string;
  source?: string | null;
  url?: string | null;
  budget?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string | Date;
};

const STATUSES: { value: Job["status"]; label: string; variant: "default" | "success" | "warning" | "danger" | "secondary" }[] = [
  { value: "new", label: "New", variant: "secondary" },
  { value: "applied", label: "Applied", variant: "default" },
  { value: "interviewing", label: "Interviewing", variant: "warning" },
  { value: "won", label: "Won", variant: "success" },
  { value: "lost", label: "Lost", variant: "danger" },
];

export function SavedJobs({ initial }: { initial: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(initial);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    source: "",
    url: "",
    budget: "",
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          source: form.source || undefined,
          url: form.url || undefined,
          budget: form.budget || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error?.message ?? "Failed");
      setJobs([data.data.item, ...jobs]);
      setOpen(false);
      setForm({ title: "", description: "", source: "", url: "", budget: "" });
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    const prev = jobs;
    setJobs((j) => j.map((x) => (x.id === id ? { ...x, status } : x)));
    try {
      await fetch(`/api/saved-jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {
      setJobs(prev);
      toast.error("Could not update");
    }
  }

  async function remove(id: string) {
    const prev = jobs;
    setJobs((j) => j.filter((x) => x.id !== id));
    try {
      await fetch(`/api/saved-jobs/${id}`, { method: "DELETE" });
    } catch {
      setJobs(prev);
      toast.error("Could not delete");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <Button onClick={() => setOpen((v) => !v)} variant="glow">
          <Plus className="h-4 w-4" /> Save a job
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={add}
            className="glass rounded-2xl p-5 mb-6 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="t">Title</Label>
                <Input id="t" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="src">Source</Label>
                <Input id="src" placeholder="upwork / linkedin" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b">Budget</Label>
                <Input id="b" placeholder="$2,500 fixed" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="d">Description</Label>
                <Textarea id="d" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={submitting}>Save</Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {jobs.length === 0 ? (
        <div className="glass rounded-3xl p-14 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center animate-pulse-glow">
            <Bookmark className="h-5 w-5 text-white" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-white">Your job board, your rules</h3>
          <p className="mt-1 text-sm text-white/60 max-w-sm mx-auto">
            Save briefs you want to apply to later. Lumen will help you write the proposal when you're ready.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((j) => {
            const s = STATUSES.find((x) => x.value === j.status) ?? STATUSES[0];
            return (
              <article key={j.id} className="glass rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white line-clamp-2">{j.title}</h3>
                  <button
                    onClick={() => remove(j.id)}
                    className="text-white/40 hover:text-red-300 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {j.source && <Badge variant="outline">{j.source}</Badge>}
                  {j.budget && <Badge variant="secondary">{j.budget}</Badge>}
                  <Badge variant={s.variant}>{s.label}</Badge>
                </div>
                <p className="text-xs text-white/60 leading-relaxed line-clamp-4">
                  {truncate(j.description, 240)}
                </p>
                <div className="mt-auto flex items-center justify-between text-[11px] text-white/40">
                  <span>{relativeTime(j.createdAt)}</span>
                  <div className="flex items-center gap-1.5">
                    {j.url && (
                      <a
                        href={j.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white/60 hover:text-white inline-flex items-center gap-1"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <Link
                      href={`/dashboard/proposals/new?from=${encodeURIComponent(j.description)}`}
                      className="text-brand-300 inline-flex items-center gap-1 hover:underline"
                    >
                      Write proposal <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
                <div className="flex gap-1 -mb-1">
                  {STATUSES.map((st) => (
                    <button
                      key={st.value}
                      onClick={() => updateStatus(j.id, st.value)}
                      className={`flex-1 text-[10px] py-1 rounded-md border transition-colors ${
                        st.value === j.status
                          ? "border-white/20 bg-white/5 text-white"
                          : "border-white/5 text-white/40 hover:text-white/70 hover:border-white/15"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
