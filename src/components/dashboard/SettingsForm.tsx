"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type User = {
  name?: string | null;
  headline?: string | null;
  bio?: string | null;
  hourlyRate?: number | null;
  experience?: string | null;
  skills?: string[];
  portfolio?: string | null;
};

const EXP = [
  { v: "junior", l: "Junior — 0–2 yrs" },
  { v: "mid", l: "Mid — 2–5 yrs" },
  { v: "senior", l: "Senior — 5–10 yrs" },
  { v: "expert", l: "Expert — 10+ yrs" },
];

export function SettingsForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name ?? "");
  const [headline, setHeadline] = useState(user.headline ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [hourlyRate, setHourlyRate] = useState<number | "">(user.hourlyRate ?? "");
  const [experience, setExperience] = useState(user.experience ?? "");
  const [skills, setSkills] = useState<string[]>(user.skills ?? []);
  const [portfolio, setPortfolio] = useState(user.portfolio ?? "");
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  function addSkill() {
    const v = skillInput.trim();
    if (!v || skills.includes(v) || skills.length >= 40) return;
    setSkills([...skills, v]);
    setSkillInput("");
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          headline,
          bio,
          hourlyRate: hourlyRate === "" ? undefined : Number(hourlyRate),
          experience: experience || undefined,
          skills,
          portfolio,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error?.message ?? "Save failed");
      toast.success("Settings updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Profile</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="n">Name</Label>
              <Input id="n" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="h">Headline</Label>
              <Input id="h" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Senior full-stack freelancer" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="b">Bio</Label>
            <Textarea id="b" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="One paragraph the AI can pull from when writing in your voice." className="min-h-[120px]" />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="hr">Hourly rate (USD)</Label>
              <Input id="hr" type="number" min={0} max={10000} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Experience</Label>
              <Select value={experience || undefined} onValueChange={setExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose level" />
                </SelectTrigger>
                <SelectContent>
                  {EXP.map((e) => (
                    <SelectItem key={e.v} value={e.v}>{e.l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p">Portfolio URL</Label>
            <Input id="p" type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://yourdomain.com" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white">Skills</h2>
          <p className="text-xs text-white/60 mt-1">The AI weaves these in when relevant.</p>

          <div className="mt-4 flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="React, Postgres, Webflow…"
            />
            <Button type="button" onClick={addSkill} variant="secondary">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {skills.length === 0 && <span className="text-xs text-white/50">No skills yet</span>}
            {skills.map((s) => (
              <Badge key={s} variant="secondary" className="gap-1.5">
                {s}
                <button onClick={() => setSkills(skills.filter((x) => x !== s))} aria-label="Remove">
                  <X className="h-3 w-3 opacity-60 hover:opacity-100" />
                </button>
              </Badge>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-end">
          <Button onClick={save} loading={saving} variant="glow" size="lg">
            Save changes
          </Button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="glass rounded-2xl p-5">
          <div className="text-[11px] uppercase tracking-wider text-white/50">Plan</div>
          <div className="mt-2 text-2xl font-semibold text-white">Free</div>
          <p className="mt-1 text-xs text-white/60">50 generations / month, all features.</p>
          <Button variant="glow" className="w-full mt-4">Upgrade to Pro</Button>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-[11px] uppercase tracking-wider text-white/50">Danger zone</div>
          <p className="mt-2 text-xs text-white/60">Delete your account and all data permanently.</p>
          <Button variant="destructive" className="w-full mt-3">Delete account</Button>
        </div>
      </aside>
    </div>
  );
}
