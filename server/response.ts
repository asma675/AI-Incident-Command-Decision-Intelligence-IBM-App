export function json(resBody: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(resBody), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers,
    },
  });
}

export function error(status: number, message: string, extra?: unknown) {
  return json({ error: message, ...(extra ? { extra } : {}) }, { status });
}
