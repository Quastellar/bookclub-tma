"use client";

import { retrieveLaunchParams } from '@telegram-apps/sdk';

const API = process.env.NEXT_PUBLIC_API_URL!;
const IS_DEV = process.env.NODE_ENV !== 'production';

export function initWebApp(): void {
    if (typeof window !== 'undefined' && (window as unknown as { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp) {
        try {
            (window as unknown as { Telegram: { WebApp: { ready: () => void; expand: () => void } } }).Telegram.WebApp.ready();
            (window as unknown as { Telegram: { WebApp: { ready: () => void; expand: () => void } } }).Telegram.WebApp.expand();
        } catch {}
    }
}

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

export type TmaUser = { id: string; tgUserId: string; username?: string; name?: string; createdAt?: string; roles?: string[] } | null;

export function getUser(): TmaUser {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user');
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function isAuthed(): boolean {
    return !!getToken();
}

export function authHeaders(): Record<string, string> {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function tmaLogin(): Promise<{ token: string | null; user: TmaUser }> {
    initWebApp();

    let initDataRaw: string | null = null;
    try {
        const lp = retrieveLaunchParams();
        initDataRaw = lp.initDataRaw || null;
    } catch (e) {
        if (!IS_DEV) throw e;
    }

    // Фоллбэк: берём сырую строку из Telegram WebApp API, если SDK не вернул
    if (!initDataRaw) {
        try {
            const raw = (window as unknown as { Telegram?: { WebApp?: { initData?: string } } })?.Telegram?.WebApp?.initData;
            if (typeof raw === 'string' && raw.length > 0) {
                initDataRaw = raw;
            }
        } catch {}
    }

    if (!initDataRaw) {
        if (IS_DEV) {
            console.warn('TMA initDataRaw is empty (dev mode). Skipping Telegram login.');
            return { token: getToken(), user: getUser() };
        }
        console.warn('[TMA] initDataRaw is empty even inside Telegram.');
        throw new Error('initDataRaw is empty. Launch inside Telegram Mini App.');
    }

    const res = await fetch(`${API}/auth/telegram/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: initDataRaw }),
    });
    if (!res.ok) {
        const msg = await res.text();
        console.warn('[TMA] Auth failed', msg);
        throw new Error(`Auth failed: ${msg}`);
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data as { token: string; user: TmaUser };
}

export async function ensureAuth(): Promise<string | null> {
    let token = getToken();
    if (token) return token;
    try { await tmaLogin(); } catch {}
    token = getToken();
    return token;
}
