"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Bot, Plus, Sparkles, Trash2, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
type Session = { id: string; title: string; updatedAt?: string };

const QUICK_PROMPTS = [
  "Make my last proposal sound more premium",
  "Rewrite this cover letter as concise as possible",
  "Generate a cold-email outreach for a Series A SaaS founder",
  "What's a fair price for a 3-page Webflow build?",
  "Write a follow-up after 5 days of silence",
];

export function Chat({
  sessions: initialSessions,
  user,
}: {
  sessions: Session[];
  user: { name?: string | null; email: string };
}) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  async function loadSession(id: string) {
    setActiveId(id);
    setMessages([]);
    try {
      const res = await fetch(`/api/chat/sessions/${id}`);
      const data = await res.json();
      if (!res.ok || !data.ok) return;
      const msgs: Msg[] = data.data.session.messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));
      setMessages(msgs);
    } catch {}
  }

  async function deleteSession(id: string) {
    try {
      await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
      setSessions((s) => s.filter((x) => x.id !== id));
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
    } catch {
      toast.error("Could not delete");
    }
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeId,
          messages: next,
        }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? "Chat failed");
      }
      const sessionId = res.headers.get("X-Session-Id");
      if (sessionId && sessionId !== activeId) {
        setActiveId(sessionId);
        setSessions((s) =>
          s.find((x) => x.id === sessionId)
            ? s
            : [{ id: sessionId, title: content.slice(0, 60) }, ...s]
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat failed");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  }

  function newChat() {
    setActiveId(null);
    setMessages([]);
  }

  const initials = (user.name || user.email)
    .split(/\s|@/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] h-[calc(100vh-69px)]">
      {/* Sessions sidebar */}
      <aside className="hidden lg:flex flex-col border-r border-white/5 bg-white/[0.015]">
        <div className="p-3">
          <Button onClick={newChat} variant="secondary" className="w-full justify-start">
            <Plus className="h-4 w-4" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {sessions.length === 0 ? (
            <p className="px-3 py-2 text-xs text-white/50">No sessions yet.</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors",
                  activeId === s.id ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
                )}
                onClick={() => loadSession(s.id)}
              >
                <span className="truncate">{s.title || "New chat"}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(s.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-red-300 transition-opacity"
                  aria-label="Delete chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Chat area */}
      <section className="flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto" ref={scrollerRef}>
          <div className="mx-auto max-w-3xl px-6 py-8">
            {messages.length === 0 ? (
              <Welcome onPick={(p) => send(p)} />
            ) : (
              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "")}
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full grid place-items-center shrink-0 border",
                          m.role === "user"
                            ? "bg-white/10 border-white/15"
                            : "bg-gradient-to-br from-brand-400 to-purple-500 border-white/10"
                        )}
                      >
                        {m.role === "user" ? (
                          <span className="text-[11px] font-medium text-white">{initials}</span>
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                          m.role === "user"
                            ? "bg-brand-500/15 border border-brand-400/20 text-white"
                            : "glass text-white/90"
                        )}
                      >
                        {m.role === "assistant" ? (
                          <div className="prose prose-invert prose-sm max-w-none [&_p]:my-2 [&_ul]:my-2 [&_li]:my-0.5 [&_pre]:bg-black/30 [&_pre]:p-3 [&_pre]:rounded-md [&_code]:text-xs [&_code]:bg-white/5 [&_code]:px-1 [&_code]:rounded">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {streaming && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 grid place-items-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="glass rounded-2xl px-4 py-3 text-sm text-white/70 inline-flex items-center gap-1">
                      <span className="thinking-dot" />
                      <span className="thinking-dot" />
                      <span className="thinking-dot" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/5 bg-[#08081a]/60 backdrop-blur-xl px-6 py-4">
          <div className="mx-auto max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="relative glass-strong rounded-2xl flex items-end gap-2 p-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Ask me to rewrite, score, or generate something. Shift + Enter for new line."
                className="flex-1 bg-transparent border-none outline-none resize-none px-3 py-2 text-sm text-white placeholder:text-white/40 max-h-40"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || streaming}
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-2 text-[10px] text-white/40 text-center">
              Lumen learns from each turn. It can rewrite, score, generate follow-ups, suggest pricing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Welcome({ onPick }: { onPick: (p: string) => void }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 grid place-items-center mb-5 animate-pulse-glow">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-3xl font-semibold tracking-tight text-white">
        Your freelance copilot.
      </h2>
      <p className="mt-2 text-sm text-white/60 max-w-sm mx-auto">
        Ask anything about your proposals, pricing, or outreach. It writes, rewrites, and reviews.
      </p>
      <div className="mt-8 grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="group text-left glass rounded-xl p-3 hover:border-white/20 transition-colors"
          >
            <span className="text-sm text-white/85">{p}</span>
            <div className="mt-1 text-[11px] text-white/40 inline-flex items-center gap-1">
              <ArrowUp className="h-3 w-3 rotate-45 group-hover:translate-x-0.5 transition-transform" /> Try it
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
