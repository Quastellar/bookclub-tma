type FetchInit = RequestInit & { label?: string };

export async function apiFetch(input: RequestInfo | URL, init?: FetchInit): Promise<Response> {
  const startedAt = Date.now();
  const label = init?.label || '';
  try {
    const res = await fetch(input, init);
    const ms = Date.now() - startedAt;
    const info = { url: String(input), method: (init?.method || 'GET'), status: res.status, ms };
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('[API]', label, info, text);
      return new Response(text, { status: res.status, statusText: res.statusText });
    }
    console.log('[API]', label, info);
    return res;
  } catch (e) {
    const ms = Date.now() - startedAt;
    const err = e instanceof Error ? e.message : String(e);
    console.error('[API]', label, { url: String(input), method: (init?.method || 'GET'), error: err, ms });
    throw e as unknown;
  }
}


