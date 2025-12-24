import { jwtVerify } from "jose";

const encoder = new TextEncoder();

export type AuthUser = { id: string };

export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    // If no secret configured, accept token-less requests in demo mode.
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    const sub = payload.sub;
    if (!sub || typeof sub !== "string") return null;
    return { id: sub };
  } catch {
    return null;
  }
}
