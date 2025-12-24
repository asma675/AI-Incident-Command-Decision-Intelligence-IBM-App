
async function request(path, opts = {}) {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });

  // Try parse JSON even on errors so UI doesn't hard-crash
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    usp.set(k, String(v));
  }
  const q = usp.toString();
  return q ? `?${q}` : "";
}

function entityClient(entityName) {
  // Your server handler routes are like:
  // /api/Incident, /api/Incident/<id>
  const base = `/api/${entityName}`;

  return {
    async list({ filter, sort } = {}) {
      // Base44-ish query style:
      // filter -> { status: "active" }
      // sort -> "-created_date"
      const query = buildQuery({
        ...(filter || {}),
        ...(sort ? { _sort: sort } : {}),
      });
      return request(`${base}${query}`);
    },

    async get(id) {
      if (!id) throw new Error("Missing id");
      return request(`${base}/${id}`);
    },

    async create(data) {
      return request(`${base}`, {
        method: "POST",
        body: JSON.stringify(data || {}),
      });
    },

    async update(id, data) {
      if (!id) throw new Error("Missing id");
      return request(`${base}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data || {}),
      });
    },

    async delete(id) {
      if (!id) throw new Error("Missing id");
      return request(`${base}/${id}`, { method: "DELETE" });
    },
  };
}

export const base44 = {
  // Minimal auth shim so Layout.jsx doesn't break
  auth: {
    async me() {
      // return null-ish user; Layout.jsx already handles not authenticated
      return { id: null, email: null };
    },
    async logout() {
      return { ok: true };
    },
  },

  entities: {
    Incident: entityClient("Incident"),
    Decision: entityClient("Decision"),
    PredictiveAlert: entityClient("PredictiveAlert"),
    KnowledgeBaseArticle: entityClient("KnowledgeBaseArticle"),
    PostIncidentReview: entityClient("PostIncidentReview"),
    AuditLog: entityClient("AuditLog"),
    IncidentAutomation: entityClient("IncidentAutomation"),
  },
};
