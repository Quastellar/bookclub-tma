import crypto from 'crypto';

export function validateInitData(initDataRaw: string, botToken: string, maxAgeSec = 3600): boolean {
  if (!initDataRaw || !botToken) return false;

  const params = new URLSearchParams(initDataRaw);
  const hash = params.get('hash') ?? '';
  const authDate = Number(params.get('auth_date') ?? 0);
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const okHash = hmac.length === hash.length && crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(hash));
  const okAge = Number.isFinite(authDate) && (Date.now() / 1000 - authDate) <= maxAgeSec;

  return okHash && okAge;
}

export function parseUserFromInitData(initDataRaw: string): { id: number; username?: string; first_name?: string; last_name?: string } | null {
  const params = new URLSearchParams(initDataRaw);
  const userStr = params.get('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}
