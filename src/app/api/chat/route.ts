import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { asChat, groqStream } from "@/lib/groq";
import { CHAT_SYSTEM } from "@/lib/prompts";
import { fail, requireAuth } from "@/lib/api";

const Body = z.object({
  // Accept null (new chats have no session yet) as well as undefined.
  sessionId: z.string().nullish(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1),
      })
    )
    .min(1)
    .max(40),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid", 400);

  let session = parsed.data.sessionId
    ? await prisma.chatSession.findFirst({
        where: { id: parsed.data.sessionId, userId: auth.sub },
      })
    : null;

  if (!session) {
    const first = parsed.data.messages[0]?.content ?? "New chat";
    session = await prisma.chatSession.create({
      data: {
        userId: auth.sub,
        title: first.slice(0, 60),
      },
    });
  }

  // persist the latest user turn
  const lastUserMsg = [...parsed.data.messages].reverse().find((m) => m.role === "user");
  if (lastUserMsg) {
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: lastUserMsg.content,
      },
    });
  }

  let stream: ReadableStream<Uint8Array>;
  try {
    stream = await groqStream(asChat(parsed.data.messages), {
      system: CHAT_SYSTEM,
      temperature: 0.8,
      maxOutputTokens: 1200,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Chat generation failed";
    const quota = /\b429\b|quota/i.test(msg);
    return fail(
      quota ? "AI quota exceeded — check your Groq plan & billing." : msg,
      502,
      "ai_error",
    );
  }

  // Wrap so we can persist the assistant message after the stream completes.
  let assistantBuf = "";
  const persisted = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            assistantBuf += decoder.decode(value, { stream: true });
            controller.enqueue(value);
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
        if (assistantBuf.trim() && session) {
          prisma.chatMessage
            .create({
              data: {
                sessionId: session.id,
                role: "assistant",
                content: assistantBuf,
              },
            })
            .catch(() => {});
          prisma.chatSession
            .update({ where: { id: session.id }, data: { updatedAt: new Date() } })
            .catch(() => {});
        }
      }
    },
  });

  return new Response(persisted, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Session-Id": session.id,
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
