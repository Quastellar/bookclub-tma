export async function apiFetch(input: RequestInfo | URL, init?: RequestInit & { label?: string }) {
  const startedAt = Date.now();
  const label = init?.label || '';
  try {
    const res = await fetch(input, init);
    const ms = Date.now() - startedAt;
    const info = { url: String(input), method: (init?.method || 'GET'), status: res.status, ms };
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('[API]', label, info, text);
      return new Response(text, { status: res.status, statusText: res.statusText, headers: res.headers });
    }
    console.log('[API]', label, info);
    return res;
  } catch (e: any) {
    const ms = Date.now() - startedAt;
    console.error('[API]', label, { url: String(input), method: (init?.method || 'GET'), error: e?.message, ms });
    throw e;
  }
}


