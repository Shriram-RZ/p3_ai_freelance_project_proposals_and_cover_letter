/**
 * Minimal, dependency-free Groq client (OpenAI-compatible REST + SSE streaming).
 * Single source of truth — every AI route in the app goes through here.
 */

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

type Role = "system" | "user" | "assistant";
export type Message = { role: Role; content: string };

export type GroqOpts = {
  system?: string;
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  json?: boolean;
  retries?: number;
};

export class GroqError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

function getKey() {
  const k = process.env.GROQ_API_KEY;
  if (!k) throw new GroqError("GROQ_API_KEY is not set", 500);
  return k;
}

function model() {
  return process.env.GROQ_MODEL || "llama-3.1-8b-instant";
}

function buildMessages(messages: Message[], opts: GroqOpts): Message[] {
  if (opts.system) {
    return [{ role: "system", content: opts.system }, ...messages];
  }
  return messages;
}

function buildBody(messages: Message[], opts: GroqOpts, stream: boolean) {
  const body: Record<string, unknown> = {
    model: model(),
    messages: buildMessages(messages, opts),
    temperature: opts.temperature ?? 0.8,
    top_p: opts.topP ?? 0.95,
    max_tokens: opts.maxOutputTokens ?? 2048,
    stream,
    ...(opts.json ? { response_format: { type: "json_object" } } : {}),
  };
  return body;
}

async function callOnce(body: unknown) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getKey()}`,
    },
    body: JSON.stringify(body),
  });
  return res;
}

function toMessages(prompt: string | Message[]): Message[] {
  return typeof prompt === "string" ? [{ role: "user", content: prompt }] : prompt;
}

export async function groqGenerate(
  prompt: string | Message[],
  opts: GroqOpts = {}
): Promise<string> {
  const messages = toMessages(prompt);
  const body = buildBody(messages, opts, false);
  const retries = opts.retries ?? 2;

  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await callOnce(body);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        // 429 / 5xx → retry
        if ((res.status === 429 || res.status >= 500) && i < retries) {
          await new Promise((r) => setTimeout(r, 400 * (i + 1) ** 2));
          continue;
        }
        throw new GroqError(`Groq ${res.status}: ${text.slice(0, 400)}`, res.status);
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const out = data.choices?.[0]?.message?.content ?? "";
      if (!out) throw new GroqError("Empty response from Groq");
      return out.trim();
    } catch (e) {
      lastErr = e;
      if (i === retries) throw e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1) ** 2));
    }
  }
  throw lastErr instanceof Error ? lastErr : new GroqError("Unknown Groq error");
}

export async function groqJSON<T = unknown>(
  prompt: string | Message[],
  opts: Omit<GroqOpts, "json"> = {}
): Promise<T> {
  const raw = await groqGenerate(prompt, { ...opts, json: true });
  // Be defensive — some models still wrap JSON in fences.
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

/**
 * Streaming via SSE. Yields incremental text chunks.
 * Returns a ReadableStream that the API route can pipe to the client.
 */
export async function groqStream(
  prompt: string | Message[],
  opts: GroqOpts = {}
): Promise<ReadableStream<Uint8Array>> {
  const messages = toMessages(prompt);
  const body = buildBody(messages, opts, true);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getKey()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new GroqError(`Groq stream ${res.status}: ${text.slice(0, 400)}`, res.status);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        // SSE events are separated by newlines; lines start with `data: `.
        const lines = buffer.split("\n");
        // keep the last (possibly partial) line in the buffer
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const m = line.match(/^data:\s*(.*)$/);
          if (!m) continue;
          const payload = m[1].trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload) as {
              choices?: { delta?: { content?: string } }[];
            };
            const text = parsed.choices?.[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            // ignore parse errors on partial chunks
          }
        }
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

/** Build chat-style multi-turn conversation. */
export function asChat(
  messages: { role: "user" | "assistant"; content: string }[]
): Message[] {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}
