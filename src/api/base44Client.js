import { createClient } from "@supabase/supabase-js";

/**
 * This file replaces the Base44 SDK with a Vercel-friendly backend:
 * - Vite frontend calls Vercel Serverless Functions under /api
 * - Optional Supabase Auth: set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
 *
 * If Supabase env vars are not set, the app runs in "demo mode" (no auth header).
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

async function getAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

function toSnakeIncident(i) {
  if (!i) return i;
  return {
    ...i,
    created_date: i.createdAt,
    updated_date: i.updatedAt,
    affected_systems: i.affectedSystems ?? [],
    ai_analysis: i.aiAnalysis ?? null,
  };
}

function toSnakeArticle(a) {
  if (!a) return a;
  return {
    ...a,
    created_date: a.createdAt,
    updated_date: a.updatedAt,
  };
}

function toSnakePrediction(p) {
  if (!p) return p;
  return {
    ...p,
    created_date: p.createdAt,
  };
}

function toSnakeReview(r) {
  if (!r) return r;
  return {
    ...r,
    incident_id: r.incidentId,
    created_date: r.createdAt,
    updated_date: r.updatedAt,
  };
}

function toSnakeAutomation(a) {
  if (!a) return a;
  return {
    ...a,
    incident_id: a.incidentId,
    created_date: a.createdAt,
    updated_date: a.updatedAt,
  };
}

async function request(path, { method = "GET", body } = {}) {
  const token = await getAccessToken();
  const headers = { "content-type": "application/json" };
  if (token) headers["authorization"] = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let err = "Request failed";
    try {
      const data = await res.json();
      err = data.error || err;
    } catch {}
    throw new Error(err);
  }
  return res.json();
}

function parseOrder(order) {
  // Base44 style: "-created_date"
  if (!order) return "createdAt:desc";
  const desc = order.startsWith("-");
  const fieldRaw = desc ? order.slice(1) : order;
  const map = {
    created_date: "createdAt",
    updated_date: "updatedAt",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  };
  const field = map[fieldRaw] || fieldRaw;
  return `${field}:${desc ? "desc" : "asc"}`;
}

function makeEntity(resource, { snake } = {}) {
  return {
    async list(order = "-created_date", limit = 100) {
      const orderBy = parseOrder(order);
      const data = await request(`/api/${resource}?orderBy=${encodeURIComponent(orderBy)}&limit=${limit}`);
      return snake ? data.map(snake) : data;
    },
    async filter(where = {}) {
      // Minimal filter support needed by this app:
      // - { id }
      // - { incident_id }
      const params = new URLSearchParams();
      if (where.id) params.set("id", where.id);
      if (where.incident_id) params.set("incident_id", where.incident_id);
      if (where.incidentId) params.set("incidentId", where.incidentId);
      const data = await request(`/api/${resource}?${params.toString()}`);
      return snake ? data.map(snake) : data;
    },
    async create(data) {
      const out = await request(`/api/${resource}`, { method: "POST", body: data });
      return snake ? snake(out) : out;
    },
    async update(id, data) {
      const out = await request(`/api/${resource}/${id}`, { method: "PATCH", body: data });
      return snake ? snake(out) : out;
    },
    async delete(id) {
      return request(`/api/${resource}/${id}`, { method: "DELETE" });
    },
  };
}

export const base44 = {
  auth: {
    async me() {
      if (!supabase) return { id: "demo", email: "demo@local" };
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
    async logout() {
      if (!supabase) return;
      await supabase.auth.signOut();
    },
  },
  entities: {
    Incident: makeEntity("incidents", { snake: toSnakeIncident }),
    Decision: makeEntity("decisions"),
    AuditLog: makeEntity("audit-logs"),
    PredictiveAlert: makeEntity("predictions", { snake: toSnakePrediction }),
    KnowledgeBaseArticle: makeEntity("articles", { snake: toSnakeArticle }),
    PostIncidentReview: makeEntity("reviews", { snake: toSnakeReview }),
    IncidentAutomation: makeEntity("automations", { snake: toSnakeAutomation }),
  },
  integrations: {
    Core: {
      async InvokeLLM(payload) {
        return request("/api/ai/invoke-llm", { method: "POST", body: payload });
      },
    },
  },
  functions: {
    async invoke(name, payload) {
      return request(`/api/functions/${name}`, { method: "POST", body: payload });
    },
    async generatePredictions(payload) {
      return request("/api/functions/generatePredictions", { method: "POST", body: payload || {} });
    },
    async generatePostIncidentReview(payload) {
      return request("/api/functions/generatePostIncidentReview", { method: "POST", body: payload });
    },
    async automateIncidentResponse(payload) {
      return request("/api/functions/automateIncidentResponse", { method: "POST", body: payload });
    },
    async suggestKnowledgeArticles(payload) {
      return request("/api/functions/suggestKnowledgeArticles", { method: "POST", body: payload });
    },
    async generateArticleFromIncident(payload) {
      return request("/api/functions/generateArticleFromIncident", { method: "POST", body: payload });
    },
  },
};
