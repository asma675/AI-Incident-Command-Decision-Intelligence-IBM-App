import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "./_lib/prisma.js";
import { json, readBody } from "./_lib/node.js";
import { invokeLLM } from "./_lib/openai.js";

function path(req: VercelRequest) {
  const url = req.url || "/";
  return url.split("?")[0] || "/";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const p = path(req);
  const method = (req.method || "GET").toUpperCase();

  // Health check
  if (p === "/api" || p === "/api/") return json(res, 200, { ok: true });

  // ---- Incidents ----
  if (p === "/api/incidents" && method === "GET") {
    const items = await prisma.incident.findMany({ orderBy: { createdAt: "desc" } });
    return json(res, 200, items);
  }

  if (p === "/api/incidents" && method === "POST") {
    const body = await readBody(req);
    const created = await prisma.incident.create({ data: body });
    return json(res, 201, created);
  }

  if (p.startsWith("/api/incidents/")) {
    const id = p.split("/").pop()!;
    if (method === "GET") {
      const item = await prisma.incident.findUnique({ where: { id } });
      return json(res, item ? 200 : 404, item ?? { error: "Not found" });
    }
    if (method === "PUT") {
      const body = await readBody(req);
      const updated = await prisma.incident.update({ where: { id }, data: body });
      return json(res, 200, updated);
    }
    if (method === "DELETE") {
      await prisma.incident.delete({ where: { id } });
      return json(res, 204, null);
    }
  }

  // ---- Articles ----
  if (p === "/api/articles" && method === "GET") {
    const items = await prisma.knowledgeBaseArticle.findMany({ orderBy: { updatedAt: "desc" } });
    return json(res, 200, items);
  }

  if (p === "/api/articles" && method === "POST") {
    const body = await readBody(req);
    const created = await prisma.knowledgeBaseArticle.create({ data: body });
    return json(res, 201, created);
  }

  if (p.startsWith("/api/articles/")) {
    const id = p.split("/").pop()!;
    if (method === "GET") {
      const item = await prisma.knowledgeBaseArticle.findUnique({ where: { id } });
      return json(res, item ? 200 : 404, item ?? { error: "Not found" });
    }
  }

  // ---- AI ----
  if (p === "/api/ai/invoke-llm" && method === "POST") {
    const body = await readBody(req);
    const result = await invokeLLM(body);
    return json(res, 200, result);
  }

  return json(res, 404, { error: "Route not found", path: p, method });
}
