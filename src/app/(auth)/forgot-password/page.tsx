"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSent(true);
      if (data?.data?.devLink) setDevLink(data.data.devLink);
      toast.success("Check your email for a reset link");
    } catch {
      toast.error("Could not send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-semibold tracking-tight text-white">Reset your password</h1>
      <p className="mt-2 text-sm text-white/60">
        Enter your email and we'll send a secure link.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" loading={loading} variant="glow" size="lg" className="w-full">
          {loading ? "Sending" : "Send reset link"}
        </Button>
      </form>

      {sent && devLink && (
        <div className="mt-5 glass rounded-lg p-4 text-xs text-white/70">
          <div className="text-white/90 mb-1 font-medium">Dev mode link:</div>
          <Link href={devLink} className="text-brand-300 hover:underline break-all">
            {devLink}
          </Link>
        </div>
      )}

      <p className="mt-6 text-sm text-white/60">
        <Link href="/login" className="text-white hover:text-brand-300 font-medium">
          ← Back to login
        </Link>
      </p>
    </motion.div>
  );
}
