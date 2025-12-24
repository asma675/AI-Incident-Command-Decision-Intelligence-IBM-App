// src/api/client.js
const API_BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

function entityApi(name) {
  return {
    list: (sort = "-created_date", limit = 100) =>
      request(`/${name}${buildQuery({ _sort: sort, _limit: limit })}`),

    filter: (where = {}, sort = "-created_date", limit = 100) =>
      request(`/${name}${buildQuery({ ...where, _sort: sort, _limit: limit })}`),

    get: (id) => request(`/${name}/${id}`),

    create: (data) =>
      request(`/${name}`, { method: "POST", body: JSON.stringify(data) }),

    update: (id, data) =>
      request(`/${name}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

    remove: (id) =>
      request(`/${name}/${id}`, { method: "DELETE" }),
  };
}

export const api = {
  entities: {
    Incident: entityApi("Incident"),
    Decision: entityApi("Decision"),
    PredictiveAlert: entityApi("PredictiveAlert"),
    KnowledgeBaseArticle: entityApi("KnowledgeBaseArticle"),
    PostIncidentReview: entityApi("PostIncidentReview"),
    AuditLog: entityApi("AuditLog"),
    IncidentAutomation: entityApi("IncidentAutomation"),
  },

  functions: {
    invoke: (name, payload = {}) =>
      request(`/functions/${name}`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  ai: {
    invokeLLM: ({ prompt, system }) =>
      request(`/ai/invoke-llm`, {
        method: "POST",
        body: JSON.stringify({ prompt, system }),
      }),
  },

  auth: {
    me: async () => ({ email: "user@demo.local" }),
    logout: async () => true,
  },
};
