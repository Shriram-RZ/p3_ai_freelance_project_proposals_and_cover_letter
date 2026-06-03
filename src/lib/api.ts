/**
 * Server-side API helpers — uniform success / error responses, request body
 * parsing with zod, and a thin auth guard for route handlers.
 */
import { NextResponse } from "next/server";
import { z, ZodError, type ZodTypeAny } from "zod";
import { getSession, type SessionPayload } from "./auth";

export type ApiHandler<T = unknown> = (ctx: {
  user: SessionPayload;
  body: T;
}) => Promise<Response> | Response;

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, code?: string) {
  return NextResponse.json({ ok: false, error: { message, code } }, { status });
}

export async function readBody<S extends ZodTypeAny>(
  req: Request,
  schema: S,
): Promise<z.output<S> | Response> {
  try {
    const json = await req.json().catch(() => ({}));
    return schema.parse(json);
  } catch (e) {
    if (e instanceof ZodError) {
      return fail(e.issues[0]?.message ?? "Invalid input", 400, "validation_error");
    }
    return fail("Invalid JSON body", 400);
  }
}

export async function requireAuth(): Promise<SessionPayload | Response> {
  const s = await getSession();
  if (!s) return fail("Not authenticated", 401, "unauthenticated");
  return s;
}

export const Schemas = {
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  nonEmpty: z.string().trim().min(1, "Required"),
};
