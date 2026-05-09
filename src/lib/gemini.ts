/**
 * Minimal, dependency-free Gemini Flash client (REST + SSE streaming).
 * Single source of truth — every AI route in the app goes through here.
 */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

type Part = { text: string };
type Role = "user" | "model";
type Content = { role?: Role; parts: Part[] };

export type GeminiOpts = {
  system?: string;
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  json?: boolean;
  retries?: number;
};

export class GeminiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

function getKey() {
  const k = process.env.GEMINI_API_KEY;
  if (!k) throw new GeminiError("GEMINI_API_KEY is not set", 500);
  return k;
}

function model() {
  return process.env.GEMINI_MODEL || "gemini-flash-latest";
}

function buildBody(contents: Content[], opts: GeminiOpts) {
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.8,
      topP: opts.topP ?? 0.95,
      maxOutputTokens: opts.maxOutputTokens ?? 2048,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (opts.system) {
    body.systemInstruction = { role: "system", parts: [{ text: opts.system }] };
  }
  return body;
}

async function callOnce(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": getKey(),
    },
    body: JSON.stringify(body),
  });
  return res;
}

export async function geminiGenerate(
  prompt: string | Content[],
  opts: GeminiOpts = {}
): Promise<string> {
  const contents: Content[] =
    typeof prompt === "string"
      ? [{ role: "user", parts: [{ text: prompt }] }]
      : prompt;

  const url = `${ENDPOINT}/${model()}:generateContent`;
  const body = buildBody(contents, opts);
  const retries = opts.retries ?? 2;

  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await callOnce(url, body);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        // 429 / 5xx → retry
        if ((res.status === 429 || res.status >= 500) && i < retries) {
          await new Promise((r) => setTimeout(r, 400 * (i + 1) ** 2));
          continue;
        }
        throw new GeminiError(`Gemini ${res.status}: ${text.slice(0, 400)}`, res.status);
      }
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const out =
        data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      if (!out) throw new GeminiError("Empty response from Gemini");
      return out.trim();
    } catch (e) {
      lastErr = e;
      if (i === retries) throw e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1) ** 2));
    }
  }
  throw lastErr instanceof Error ? lastErr : new GeminiError("Unknown Gemini error");
}

export async function geminiJSON<T = unknown>(
  prompt: string | Content[],
  opts: Omit<GeminiOpts, "json"> = {}
): Promise<T> {
  const raw = await geminiGenerate(prompt, { ...opts, json: true });
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
export async function geminiStream(
  prompt: string | Content[],
  opts: GeminiOpts = {}
): Promise<ReadableStream<Uint8Array>> {
  const contents: Content[] =
    typeof prompt === "string"
      ? [{ role: "user", parts: [{ text: prompt }] }]
      : prompt;
  const url = `${ENDPOINT}/${model()}:streamGenerateContent?alt=sse`;
  const body = buildBody(contents, opts);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": getKey(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new GeminiError(`Gemini stream ${res.status}: ${text.slice(0, 400)}`, res.status);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        // Each SSE line starts with `data: `
        for (const line of chunk.split("\n")) {
          const m = line.match(/^data:\s*(.*)$/);
          if (!m) continue;
          const payload = m[1].trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload) as {
              candidates?: { content?: { parts?: { text?: string }[] } }[];
            };
            const text =
              parsed.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
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
): Content[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}
