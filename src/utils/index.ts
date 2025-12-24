// ===============================
// General utility helpers
// ===============================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind + conditional class helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===============================
// Routing helpers
// ===============================

/**
 * Create page URLs consistently across the app
 * Example:
 *   createPageUrl("IncidentDetail", { id: "123" })
 *   → "/incident-detail?id=123"
 */
export function createPageUrl(
  page: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  const base = `/${kebabCase(page)}`;

  if (!params) return base;

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.append(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

// Convert CamelCase / PascalCase → kebab-case
function kebabCase(str: string) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

// ===============================
// API helpers
// ===============================

/**
 * Generic JSON fetch wrapper
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ===============================
// Formatting helpers
// ===============================

export function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString();
}

export function truncate(text: string, length = 120) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "…" : text;
}

// ===============================
// Environment helpers
// ===============================

export const isProd = import.meta.env.PROD;
export const isDev = import.meta.env.DEV;
