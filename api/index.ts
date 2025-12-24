import type { VercelRequest, VercelResponse } from "@vercel/node";

import { prisma } from "../server/prisma.js";
import { getOpenAIClient } from "../server/openai.js";
import { sendJson, readBody, methodNotAllowed, getUserId } from "../server/node.js";

type AnyObj = Record<string, any>;

function pathname(req: VercelRequest): string {
  const url = req.url || "/";
  return (url.split("?")[0] || "/").replace(/\/$/, "");
}

function pickFirst(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function sortFromQuery(q: AnyObj): { orderBy?: AnyObj } {
  const sortRaw = pickFirst(q._sort as any);
  if (!sortRaw) return {};

  // Base44 uses strings like "-created_date"
  const order: "asc" | "desc" = sortRaw.startsWith("-") ? "desc" : "asc";
  const fieldRaw = sortRaw.replace(/^[-+]/, "");

  const map: Record<string, string> = {
    created_date: "createdAt",
    updated_date: "updatedAt",
    decided_at: "decidedAt",
  };

  const field = map[fieldRaw] || fieldRaw;
  return { orderBy: { [field]: order } };
}

function incidentSnakeToData(b: AnyObj, userId: string | null): AnyObj {
  return {
    title: b.title,
    description: b.description ?? null,
    severity: b.severity,
    status: b.status ?? "analyzing",
    source: b.source ?? null,
    logs: b.logs ?? null,
    affectedSystems: b.affected_systems ?? b.affectedSystems ?? null,
    tags: b.tags ?? null,
    aiAnalysis: b.ai_analysis ?? b.aiAnalysis ?? null,
    createdBy: userId ?? b.created_by ?? b.createdBy ?? null,
  };
}

function decisionSnakeToData(b: AnyObj): AnyObj {
  return {
    incidentId: b.incident_id ?? b.incidentId,
    recommendationAction: b.recommendation_action ?? b.recommendationAction,
    decision: b.decision,
    decisionReason: b.decision_reason ?? b.decisionReason ?? null,
    decidedBy: b.decided_by ?? b.decidedBy ?? null,
    decidedAt: b.decided_at ? new Date(b.decided_at) : null,
  };
}

function predictionSnakeToData(b: AnyObj): AnyObj {
  return {
    predictedIssue: b.predicted_issue ?? b.predictedIssue,
    description: b.description ?? null,
    severity: b.severity,
    likelihood: typeof b.likelihood === "number" ? b.likelihood : Number(b.likelihood ?? 0),
    confidenceScore:
      b.confidence_score == null ? null : typeof b.confidence_score === "number" ? b.confidence_score : Number(b.confidence_score),
    predictedTimeframe: b.predicted_timeframe ?? b.predictedTimeframe ?? null,
    affectedSystems: b.affected_systems ?? b.affectedSystems ?? null,
    contributingFactors: b.contributing_factors ?? b.contributingFactors ?? null,
    preventativeActions: b.preventative_actions ?? b.preventativeActions ?? null,
    status: b.status ?? "active",
  };
}

function articleSnakeToData(b: AnyObj): AnyObj {
  return {
    title: b.title,
    summary: b.summary ?? null,
    content: b.content,
    category: b.category ?? "general",
    status: b.status ?? "draft",
    author: b.author ?? null,
    tags: b.tags ?? null,
    relatedSystems: b.related_systems ?? b.relatedSystems ?? null,
  };
}

function reviewSnakeToData(b: AnyObj): AnyObj {
  return {
    incidentId: b.incident_id ?? b.incidentId,
    executiveSummary: b.executive_summary ?? b.executiveSummary,
    rootCauseAnalysis: b.root_cause_analysis ?? b.rootCauseAnalysis ?? null,
    timeline: b.timeline ?? null,
    impactAssessment: b.impact_assessment ?? b.impactAssessment ?? null,
    keyLearnings: b.key_learnings ?? b.keyLearnings ?? null,
    followUpActions: b.follow_up_actions ?? b.followUpActions ?? null,
    confidenceScore:
      b.confidence_score == null ? null : typeof b.confidence_score === "number" ? b.confidence_score : Number(b.confidence_score),
  };
}

function auditSnakeToData(b: AnyObj): AnyObj {
  return {
    incidentId: b.incident_id ?? b.incidentId ?? null,
    actionType: b.action_type ?? b.actionType,
    actor: b.actor ?? null,
    details: b.details ?? null,
  };
}

function automationSnakeToData(b: AnyObj): AnyObj {
  return {
    incidentId: b.incident_id ?? b.incidentId,
    automationType: b.automation_type ?? b.automationType,
    status: b.status ?? "queued",
    executedAt: b.executed_at ? new Date(b.executed_at) : null,
    result: b.result ?? null,
  };
}

function toSnake(obj: AnyObj): AnyObj {
  const out: AnyObj = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    const snake = k
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      .replace(/-/g, "_")
      .toLowerCase();
    out[snake] = v;
  }
  // normalize date field names to Base44 conventions
  if (obj.createdAt) out.created_date = obj.createdAt;
  if (obj.updatedAt) out.updated_date = obj.updatedAt;
  if (obj.decidedAt) out.decided_at = obj.decidedAt;
  // normalize relation keys
  if (obj.incidentId) out.incident_id = obj.incidentId;
  if (obj.affectedSystems) out.affected_systems = obj.affectedSystems;
  if (obj.aiAnalysis) out.ai_analysis = obj.aiAnalysis;
  if (obj.keyLearnings) out.key_learnings = obj.keyLearnings;
  if (obj.followUpActions) out.follow_up_actions = obj.followUpActions;
  if (obj.recommendationAction) out.recommendation_action = obj.recommendationAction;
  if (obj.decisionReason) out.decision_reason = obj.decisionReason;
  if (obj.decidedBy) out.decided_by = obj.decidedBy;
  if (obj.predictedIssue) out.predicted_issue = obj.predictedIssue;
  if (obj.confidenceScore != null) out.confidence_score = obj.confidenceScore;
  if (obj.predictedTimeframe) out.predicted_timeframe = obj.predictedTimeframe;
  if (obj.contributingFactors) out.contributing_factors = obj.contributingFactors;
  if (obj.preventativeActions) out.preventative_actions = obj.preventativeActions;
  if (obj.relatedSystems) out.related_systems = obj.relatedSystems;
  if (obj.executiveSummary) out.executive_summary = obj.executiveSummary;
  if (obj.automationType) out.automation_type = obj.automationType;
  if (obj.actionType) out.action_type = obj.actionType;
  return out;
}

async function handleInvokeLLM(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const body = (await readBody(req)) as AnyObj;
  const prompt: string = body?.prompt ?? "";
  const system: string | undefined = body?.system;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const client = getOpenAIClient();
  if (!client) return sendJson(res, 400, { error: "OPENAI_API_KEY not set" });
  if (!prompt) return sendJson(res, 400, { error: "Missing prompt" });

  const completion = await client.chat.completions.create({
    model,
    messages: [
      ...(system ? [{ role: "system" as const, content: system }] : []),
      { role: "user" as const, content: prompt },
    ],
    temperature: 0.2,
  });

  const text = completion.choices[0]?.message?.content ?? "";
  return sendJson(res, 200, { text });
}

async function aiFromIncident(incident: AnyObj, mode: "response" | "pir" | "article" | "prediction") {
  const client = getOpenAIClient();
  if (!client) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const base = {
    title: incident.title,
    severity: incident.severity,
    status: incident.status,
    description: incident.description,
    affectedSystems: incident.affectedSystems,
    logs: incident.logs,
    aiAnalysis: incident.aiAnalysis,
  };

  const system =
    mode === "response"
      ? "You are an incident commander copilot. Create a concise incident response plan as JSON with keys: summary, immediate_actions (array), comms_plan (array), owners (array)."
      : mode === "pir"
        ? "You are a post-incident review assistant. Produce JSON with keys: executive_summary, root_cause_analysis, key_learnings (array), follow_up_actions (array), confidence_score (0-1)."
        : mode === "article"
          ? "You are a knowledge base writer. Produce JSON with keys: title, summary, content, category, tags (array), related_systems (array)."
          : "You are a reliability engineer. Produce JSON with keys: predicted_issue, description, severity, likelihood (0-1), confidence_score (0-1), predicted_timeframe, contributing_factors (array), preventative_actions (array), affected_systems (array).";

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(base) },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return null;

  // Keep as string; callers parse safely with `safeParseJSON`.
  return raw
}

async function handleFunctions(req: VercelRequest, res: VercelResponse, subpath: string) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const body = (await readBody(req)) as AnyObj;

  if (subpath === "automateIncidentResponse") {
    const incidentId = body?.incident_id || body?.incidentId;
    if (!incidentId) return sendJson(res, 400, { error: "Missing incident_id" });

    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) return sendJson(res, 404, { error: "Incident not found" });

    const planRaw = await aiFromIncident(incident, "response");
    const result = planRaw
      ? JSON.parse(planRaw)
      : {
          summary: `Auto-response plan for ${incident.title}`,
          immediate_actions: ["Assess impact", "Engage owners", "Update status"],
          comms_plan: ["Send initial comms", "Provide updates every 30 minutes"],
          owners: [],
        };

    const created = await prisma.incidentAutomation.create({
      data: {
        incidentId: incidentId,
        automationType: "automateIncidentResponse",
        status: "completed",
        executedAt: new Date(),
        result,
      },
    });
    return sendJson(res, 200, toSnake(created));
  }

  if (subpath === "generatePostIncidentReview") {
    const incidentId = body?.incident_id || body?.incidentId;
    if (!incidentId) return sendJson(res, 400, { error: "Missing incident_id" });

    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) return sendJson(res, 404, { error: "Incident not found" });

    const pirRaw = await aiFromIncident(incident, "pir");
    const pir = pirRaw
      ? JSON.parse(pirRaw)
      : {
          executive_summary: `Review for ${incident.title}`,
          root_cause_analysis: "TBD",
          key_learnings: [],
          follow_up_actions: [],
          confidence_score: 0.5,
        };

    const created = await prisma.postIncidentReview.create({
      data: {
        incidentId,
        executiveSummary: pir.executive_summary || pir.executiveSummary || "",
        rootCauseAnalysis: pir.root_cause_analysis || pir.rootCauseAnalysis || null,
        keyLearnings: pir.key_learnings || pir.keyLearnings || [],
        followUpActions: pir.follow_up_actions || pir.followUpActions || [],
        confidenceScore: pir.confidence_score ?? pir.confidenceScore ?? null,
      },
    });

    return sendJson(res, 200, toSnake(created));
  }

  if (subpath === "generateArticleFromIncident") {
    const incidentId = body?.incident_id || body?.incidentId;
    if (!incidentId) return sendJson(res, 400, { error: "Missing incident_id" });

    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) return sendJson(res, 404, { error: "Incident not found" });

    const artRaw = await aiFromIncident(incident, "article");
    const art = artRaw
      ? JSON.parse(artRaw)
      : {
          title: `KB: ${incident.title}`,
          summary: "Auto-generated knowledge base article.",
          content: incident.description || "",
          category: "general",
          tags: [],
          related_systems: incident.affectedSystems || [],
        };

    const created = await prisma.knowledgeBaseArticle.create({
      data: {
        title: art.title,
        summary: art.summary ?? null,
        content: art.content ?? "",
        category: art.category ?? "general",
        status: "published",
        author: body?.author ?? null,
        tags: art.tags ?? [],
        relatedSystems: art.related_systems ?? art.relatedSystems ?? [],
      },
    });

    return sendJson(res, 200, toSnake(created));
  }

  if (subpath === "suggestKnowledgeArticles") {
    const incidentId = body?.incident_id || body?.incidentId;
    if (!incidentId) return sendJson(res, 400, { error: "Missing incident_id" });

    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) return sendJson(res, 404, { error: "Incident not found" });

    const systems = Array.isArray(incident.affectedSystems) ? incident.affectedSystems : [];

    const articles = await prisma.knowledgeBaseArticle.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
    });

    // naive filter: keep if shares any system name in relatedSystems
    const matched = articles.filter((a) => {
      const rel = Array.isArray(a.relatedSystems) ? a.relatedSystems : [];
      return systems.some((s: any) => rel.includes(s));
    });

    return sendJson(res, 200, matched.map((a) => toSnake(a)));
  }

  if (subpath === "generatePredictions") {
    // generate a couple predictions from open incidents (rule-based if no AI)
    const incidents = await prisma.incident.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    const created = [];
    for (const inc of incidents.slice(0, 3)) {
      const base = {
        predicted_issue: `Follow-on risk from ${inc.title}`,
        description: inc.description || "Potential recurrence or downstream impact.",
        severity: inc.severity,
        likelihood: inc.severity === "P1" ? 0.7 : inc.severity === "P2" ? 0.5 : 0.3,
        confidence_score: 0.5,
        predicted_timeframe: "24-72 hours",
        contributing_factors: [],
        preventative_actions: ["Review monitoring", "Validate rollback plans"],
        affected_systems: inc.affectedSystems || [],
      };

      const aiRaw = await aiFromIncident(inc, "prediction");
      const pred = aiRaw ? JSON.parse(aiRaw) : base;

      created.push(await prisma.predictiveAlert.create({
        data: {
          predictedIssue: pred.predicted_issue || pred.predictedIssue,
          description: pred.description ?? null,
          severity: pred.severity || inc.severity,
          likelihood: pred.likelihood ?? base.likelihood,
          confidenceScore: pred.confidence_score ?? pred.confidenceScore ?? null,
          predictedTimeframe: pred.predicted_timeframe ?? pred.predictedTimeframe ?? null,
          contributingFactors: pred.contributing_factors ?? pred.contributingFactors ?? [],
          preventativeActions: pred.preventative_actions ?? pred.preventativeActions ?? [],
          affectedSystems: pred.affected_systems ?? pred.affectedSystems ?? [],
        }
      }))
    }

    return sendJson(res, 200, created.map((p) => toSnake(p)));
  }

  return sendJson(res, 404, { error: "Unknown function" });
}

async function crud(req: VercelRequest, res: VercelResponse, entity: string, id?: string) {
  const userId = await getUserId(req);
  const q = req.query as AnyObj;
  const sort = sortFromQuery(q);

  // LIST
  if (!id && req.method === "GET") {
    if (entity === "Incident") {
      const where: AnyObj = {};
      // Base44 client sometimes passes an id filter on list()
      if (pickFirst(q.id)) where.id = pickFirst(q.id);
      if (pickFirst(q.status)) where.status = pickFirst(q.status);
      if (pickFirst(q.severity)) where.severity = pickFirst(q.severity);
      const rows = await prisma.incident.findMany({ where, ...sort });
      return sendJson(res, 200, rows.map((r) => toSnake(r)));
    }
    if (entity === "Decision") {
      const where: AnyObj = {};
      if (pickFirst(q.id)) where.id = pickFirst(q.id);
      if (pickFirst(q.incident_id)) where.incidentId = pickFirst(q.incident_id);
      const rows = await prisma.decision.findMany({ where, ...sort });
      return sendJson(res, 200, rows.map((r) => toSnake(r)));
    }
    if (entity === "PredictiveAlert") {
      const where: AnyObj = {};
      if (pickFirst(q.id)) where.id = pickFirst(q.id);
      if (pickFirst(q.status)) where.status = pickFirst(q.status);
      const rows = await prisma.predictiveAlert.findMany({ where, ...sort });
      return sendJson(res, 200, rows.map((r) => toSnake(r)));
    }
    if (entity === "KnowledgeBaseArticle") {
      const where: AnyObj = {};
      if (pickFirst(q.id)) where.id = pickFirst(q.id);
      if (pickFirst(q.status)) where.status = pickFirst(q.status);
      if (pickFirst(q.category)) where.category = pickFirst(q.category);
      const rows = await prisma.knowledgeBaseArticle.findMany({ where, ...sort });
      return sendJson(res, 200, rows.map((r) => toSnake(r)));
    }
    if (entity === "PostIncidentReview") {
      const where: AnyObj = {};
      if (pickFirst(q.id)) where.id = pickFirst(q.id);
      if (pickFirst(q.incident_id)) where.incidentId = pickFirst(q.incident_id);
      const rows = await prisma.postIncidentReview.findMany({ where, ...sort });
      return sendJson(res, 200, rows.map((r) => toSnake(r)));
    }
    if (entity === "AuditLog") {
      const where: AnyObj = {};
      if (pickFirst(q.id)) where.id = pickFirst(q.id);
      if (pickFirst(q.incident_id)) where.incidentId = pickFirst(q.incident_id);
      const rows = await prisma.auditLog.findMany({ where, ...sort });
      return sendJson(res, 200, rows.map((r) => toSnake(r)));
    }
    if (entity === "IncidentAutomation") {
      const where: AnyObj = {};
      if (pickFirst(q.id)) where.id = pickFirst(q.id);
      if (pickFirst(q.incident_id)) where.incidentId = pickFirst(q.incident_id);
      const rows = await prisma.incidentAutomation.findMany({ where, ...sort });
      return sendJson(res, 200, rows.map((r) => toSnake(r)));
    }
    return sendJson(res, 404, { error: "Unknown entity" });
  }

  // CREATE
  if (!id && req.method === "POST") {
    const body = (await readBody(req)) as AnyObj;
    if (entity === "Incident") {
      const created = await prisma.incident.create({ data: incidentSnakeToData(body, userId) as any });
      return sendJson(res, 200, toSnake(created));
    }
    if (entity === "Decision") {
      const created = await prisma.decision.create({ data: decisionSnakeToData(body) as any });
      return sendJson(res, 200, toSnake(created));
    }
    if (entity === "PredictiveAlert") {
      const created = await prisma.predictiveAlert.create({ data: predictionSnakeToData(body) as any });
      return sendJson(res, 200, toSnake(created));
    }
    if (entity === "KnowledgeBaseArticle") {
      const created = await prisma.knowledgeBaseArticle.create({ data: articleSnakeToData(body) as any });
      return sendJson(res, 200, toSnake(created));
    }
    if (entity === "PostIncidentReview") {
      const created = await prisma.postIncidentReview.create({ data: reviewSnakeToData(body) as any });
      return sendJson(res, 200, toSnake(created));
    }
    if (entity === "AuditLog") {
      const created = await prisma.auditLog.create({ data: auditSnakeToData(body) as any });
      return sendJson(res, 200, toSnake(created));
    }
    if (entity === "IncidentAutomation") {
      const created = await prisma.incidentAutomation.create({ data: automationSnakeToData(body) as any });
      return sendJson(res, 200, toSnake(created));
    }
    return sendJson(res, 404, { error: "Unknown entity" });
  }

  // READ
  if (id && req.method === "GET") {
    if (entity === "Incident") {
      const row = await prisma.incident.findUnique({ where: { id } });
      if (!row) return sendJson(res, 404, { error: "Not found" });
      return sendJson(res, 200, toSnake(row));
    }
    if (entity === "Decision") {
      const row = await prisma.decision.findUnique({ where: { id } });
      if (!row) return sendJson(res, 404, { error: "Not found" });
      return sendJson(res, 200, toSnake(row));
    }
    if (entity === "PredictiveAlert") {
      const row = await prisma.predictiveAlert.findUnique({ where: { id } });
      if (!row) return sendJson(res, 404, { error: "Not found" });
      return sendJson(res, 200, toSnake(row));
    }
    if (entity === "KnowledgeBaseArticle") {
      const row = await prisma.knowledgeBaseArticle.findUnique({ where: { id } });
      if (!row) return sendJson(res, 404, { error: "Not found" });
      return sendJson(res, 200, toSnake(row));
    }
    if (entity === "PostIncidentReview") {
      const row = await prisma.postIncidentReview.findUnique({ where: { id } });
      if (!row) return sendJson(res, 404, { error: "Not found" });
      return sendJson(res, 200, toSnake(row));
    }
    if (entity === "AuditLog") {
      const row = await prisma.auditLog.findUnique({ where: { id } });
      if (!row) return sendJson(res, 404, { error: "Not found" });
      return sendJson(res, 200, toSnake(row));
    }
    if (entity === "IncidentAutomation") {
      const row = await prisma.incidentAutomation.findUnique({ where: { id } });
      if (!row) return sendJson(res, 404, { error: "Not found" });
      return sendJson(res, 200, toSnake(row));
    }
    return sendJson(res, 404, { error: "Unknown entity" });
  }

  // UPDATE
  if (id && (req.method === "PUT" || req.method === "PATCH")) {
    const body = (await readBody(req)) as AnyObj;
    if (entity === "Incident") {
      const updated = await prisma.incident.update({ where: { id }, data: incidentSnakeToData(body, userId) });
      return sendJson(res, 200, toSnake(updated));
    }
    if (entity === "Decision") {
      const updated = await prisma.decision.update({ where: { id }, data: decisionSnakeToData(body) });
      return sendJson(res, 200, toSnake(updated));
    }
    if (entity === "PredictiveAlert") {
      const updated = await prisma.predictiveAlert.update({ where: { id }, data: predictionSnakeToData(body) });
      return sendJson(res, 200, toSnake(updated));
    }
    if (entity === "KnowledgeBaseArticle") {
      const updated = await prisma.knowledgeBaseArticle.update({ where: { id }, data: articleSnakeToData(body) });
      return sendJson(res, 200, toSnake(updated));
    }
    if (entity === "PostIncidentReview") {
      const updated = await prisma.postIncidentReview.update({ where: { id }, data: reviewSnakeToData(body) });
      return sendJson(res, 200, toSnake(updated));
    }
    if (entity === "AuditLog") {
      const updated = await prisma.auditLog.update({ where: { id }, data: auditSnakeToData(body) });
      return sendJson(res, 200, toSnake(updated));
    }
    if (entity === "IncidentAutomation") {
      const updated = await prisma.incidentAutomation.update({ where: { id }, data: automationSnakeToData(body) });
      return sendJson(res, 200, toSnake(updated));
    }
    return sendJson(res, 404, { error: "Unknown entity" });
  }

  // DELETE
  if (id && req.method === "DELETE") {
    if (entity === "Incident") {
      await prisma.incident.delete({ where: { id } });
      return sendJson(res, 200, { ok: true });
    }
    if (entity === "Decision") {
      await prisma.decision.delete({ where: { id } });
      return sendJson(res, 200, { ok: true });
    }
    if (entity === "PredictiveAlert") {
      await prisma.predictiveAlert.delete({ where: { id } });
      return sendJson(res, 200, { ok: true });
    }
    if (entity === "KnowledgeBaseArticle") {
      await prisma.knowledgeBaseArticle.delete({ where: { id } });
      return sendJson(res, 200, { ok: true });
    }
    if (entity === "PostIncidentReview") {
      await prisma.postIncidentReview.delete({ where: { id } });
      return sendJson(res, 200, { ok: true });
    }
    if (entity === "AuditLog") {
      await prisma.auditLog.delete({ where: { id } });
      return sendJson(res, 200, { ok: true });
    }
    if (entity === "IncidentAutomation") {
      await prisma.incidentAutomation.delete({ where: { id } });
      return sendJson(res, 200, { ok: true });
    }
    return sendJson(res, 404, { error: "Unknown entity" });
  }

  return methodNotAllowed(res, ["GET", "POST", "PUT", "PATCH", "DELETE"]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const p = pathname(req);

    // e.g. /api/index or /api
    const rel = p.replace(/^\/api\/?/, "");
    if (!rel || rel === "index") {
      return sendJson(res, 200, { ok: true, message: "API online" });
    }

    const parts = rel.split("/").filter(Boolean);

    // /api/ai/invoke-llm
    if (parts[0] === "ai" && parts[1] === "invoke-llm") {
      return await handleInvokeLLM(req, res);
    }

    // /api/functions/<name>
    if (parts[0] === "functions" && parts[1]) {
      return await handleFunctions(req, res, parts[1]);
    }

    // Entities
    // Frontend uses REST resource names like:
    // /api/incidents, /api/decisions, /api/predictions, /api/articles,
    // /api/reviews, /api/audit-logs, /api/automations
    const entity = parts[0];
    const id = parts.length > 1 ? parts[1] : undefined;

    // Allow both the original singular Model names and the plural/slug resource names
    // expected by the Base44-style client.
    const map: Record<string, string> = {
      // Model-name routes (keep)
      Incident: "Incident",
      Decision: "Decision",
      PredictiveAlert: "PredictiveAlert",
      KnowledgeBaseArticle: "KnowledgeBaseArticle",
      AuditLog: "AuditLog",
      IncidentAutomation: "IncidentAutomation",
      PostIncidentReview: "PostIncidentReview",

      // Resource-name routes (frontend)
      incidents: "Incident",
      decisions: "Decision",
      predictions: "PredictiveAlert",
      articles: "KnowledgeBaseArticle",
      reviews: "PostIncidentReview",
      "audit-logs": "AuditLog",
      automations: "IncidentAutomation",
    };

    const model = map[entity];
    if (!model) return sendJson(res, 404, { error: "Unknown route" });

    return await crud(req, res, model, id);
  } catch (err: any) {
    console.error(err);
    return sendJson(res, 500, { error: "Internal error", detail: err?.message || String(err) });
  }
}
