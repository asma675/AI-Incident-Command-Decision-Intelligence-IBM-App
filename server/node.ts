import type { VercelRequest, VercelResponse } from "@vercel/node";
import { jwtVerify } from "jose";

const encoder = new TextEncoder();

export function sendJson(res: VercelResponse, status: number, body: unknown) {
  res.status(status).setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export async function readBody(req: VercelRequest) {
  if (!req.body) return null;
  return req.body;
}

export async function getUserId(req: VercelRequest): Promise<string | null> {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]) {
  res.setHeader("Allow", allowed.join(", "));
  sendJson(res, 405, { error: "Method not allowed" });
}
