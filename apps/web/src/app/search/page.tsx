'use client';

import { useEffect, useState } from 'react';
// import Link from 'next/link';
import Image from 'next/image';
import { normalizeForCandidate } from '@/lib/book';
import { tmaLogin, getUser, ensureAuth, getToken } from '@/lib/auth';
import AppBar from '../_components/AppBar';
import { useI18n } from '../_i18n/I18nProvider';
import { hapticError, hapticSuccess } from '@/lib/tg';
import { apiFetch } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL!;

type TgWebApp = {
    MainButton?: { setText?: (s: string) => void; show?: () => void; onClick?: (fn: () => void) => void; offClick?: (fn: () => void) => void };
    showAlert?: (msg: string) => void;
    BackButton?: { show?: () => void; hide?: () => void; onClick?: (fn: () => void) => void };
    ready?: () => void;
    expand?: () => void;
};

function getTg(): TgWebApp | undefined {
    return (window as unknown as { Telegram?: { WebApp?: TgWebApp } })?.Telegram?.WebApp;
}

export default function SearchPage() {
    const { t } = useI18n();
    const [q, setQ] = useState('');
    type SearchItem = { title: string; authors: string[]; year?: number; isbn13?: string; isbn10?: string; coverUrl?: string; source?: string };
    const [items, setItems] = useState<SearchItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const user = getUser();

    useEffect(() => {
        const tg = getTg();
        if (tg) {
            tg.ready?.();
            tg.expand?.();
            tg.BackButton?.show?.();
            tg.BackButton?.onClick?.(() => window.history.back());
        }

        tmaLogin()
            .then(() => setReady(true))
            .catch(() => setReady(true));

        return () => {
            const tg = getTg();
            tg?.BackButton?.hide?.();
        };
    }, []);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('lastSearchQuery');
            if (saved) setQ(saved);
        } catch {}
    }, []);

    useEffect(() => {
        if (!q.trim()) {
            setItems([]);
            return;
        }

        setLoading(true);
        const h = setTimeout(async () => {
            try {
                const res = await apiFetch(`${API}/books/lookup?q=${encodeURIComponent(q.trim())}`, { label: 'books.lookup' });
                if (res.ok) {
                    const data = await res.json();
                    setItems(data);
                } else {
                    setItems([]);
                }
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        }, 400);
        return () => clearTimeout(h);
    }, [q]);

    useEffect(() => {
        try {
            localStorage.setItem('lastSearchQuery', q);
        } catch {}
    }, [q]);

    const normalizeCover = (url?: string | null): string | null => {
        if (!url) return null;
        let u = url.trim();
        if (!u) return null;
        if (u.startsWith('http://')) u = 'https://' + u.slice(7);
        // иногда увеличиваем размер у ссылок Google Books
        u = u.replace('zoom=1', 'zoom=0');
        return u;
    };

    const addCandidate = async (it: { title: string; authors?: string[]; year?: number; isbn13?: string; isbn10?: string; coverUrl?: string; source?: string }) => {
        const book = normalizeForCandidate({
            title: it.title,
            authors: it.authors || [],
            year: it.year,
            isbn13: it.isbn13,
            isbn10: it.isbn10,
            coverUrl: it.coverUrl,
            source: it.source,
            meta: {},
        });
        console.log('[CANDIDATE][REQUEST]', book);
        try {
            const token = await ensureAuth();
            if (!token) {
                hapticError();
                const tg = getTg();
                if (tg?.showAlert) tg.showAlert('Не авторизован. Откройте Mini App в Telegram.'); else alert('Не авторизован. Откройте Mini App в Telegram.');
                return;
            }
            const res = await apiFetch(`${API}/candidates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ book, reason: '' }),
                label: 'candidates.create'
            });

            if (!res.ok) {
                const t = await res.text();
                hapticError();
                const tg = getTg();
                if (tg?.showAlert) tg.showAlert(`Ошибка: ${t}`); else alert(`Ошибка: ${t}`);
                return;
            }

            hapticSuccess();
            const tg = getTg();
            if (tg?.showAlert) tg.showAlert('✅ Книга добавлена в список кандидатов!'); else alert('✅ Книга добавлена!');
            // подсказка: перейти в Мои
            try {
                const tg = getTg();
                tg?.MainButton?.setText?.('Открыть Мои');
                tg?.MainButton?.show?.();
                const handler = () => { window.location.href = '/my'; };
                tg?.MainButton?.onClick?.(handler);
                setTimeout(() => tg?.MainButton?.offClick?.(handler), 4000);
            } catch {}
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Не удалось отправить запрос';
            hapticError();
            const tg = getTg();
            if (tg?.showAlert) tg.showAlert(`Ошибка сети: ${msg}`); else alert(`Ошибка сети: ${msg}`);
        }
    };

    if (!ready) {
        return (
            <div style={{ padding: 20, textAlign: 'center' }}>
                Загрузка…
            </div>
        );
    }

    return (
        <div style={{
            padding: 20,
            minHeight: '100vh',
            background: 'var(--tg-theme-bg-color, #ffffff)',
            color: 'var(--tg-theme-text-color, #000000)'
        }}>
            <AppBar title={t('search.title')} withBack />

            {user && (
                <div style={{
                    background: 'var(--tg-theme-secondary-bg-color, #f1f1f1)',
                    padding: 10,
                    borderRadius: 6,
                    marginBottom: 20,
                    fontSize: 14
                }}>
                    {t('common.user')}: {user.username || user.name || user.id}
                </div>
            )}

            <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder={t('search.placeholder')}
                style={{
                    width: '100%',
                    padding: 15,
                    border: '1px solid var(--tg-theme-hint-color, #ccc)',
                    borderRadius: 8,
                    fontSize: 16,
                    background: 'var(--tg-theme-secondary-bg-color, #ffffff)',
                    color: 'var(--tg-theme-text-color, #000000)',
                    marginBottom: 20
                }}
            />

            {loading && (
                <div style={{ textAlign: 'center', padding: 20 }}>{t('common.loading')}</div>
            )}

            <div>
                {items.map((x, i) => {
                    const cover = normalizeCover(x.coverUrl);

                    return (
                        <div key={i} style={{
                            display: 'grid',
                            gridTemplateColumns: '72px 1fr',
                            gap: 12,
                            border: '1px solid var(--tg-theme-hint-color, #eee)',
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 12,
                            background: 'var(--tg-theme-secondary-bg-color, #f9f9f9)'
                        }}>
                            <div>
                                {cover ? (
                                    <div style={{ position: 'relative', width: 72, height: 108 }}>
                                        <Image
                                            src={cover}
                                            alt={x.title || 'cover'}
                                            fill
                                            sizes="72px"
                                            style={{ objectFit: 'cover', borderRadius: 6 }}
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div style={{
                                        width: 72, height: 108,
                                        background: 'var(--tg-theme-secondary-bg-color, #eee)',
                                        borderRadius: 6, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: 'var(--tg-theme-hint-color, #999)',
                                        fontSize: 12
                                    }}>
                                        {t('search.noCover')}
                                    </div>
                                )}
                            </div>

                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: 6 }}>
                                    {x.title} {x.year ? `(${x.year})` : ''}
                                </div>
                                <div style={{
                                    color: 'var(--tg-theme-hint-color, #999)',
                                    marginBottom: 8,
                                    fontSize: 14
                                }}>
                                    {(x.authors || []).join(', ')}
                                </div>
                                <div style={{ fontSize: 12, marginBottom: 10 }}>
                                    {t('search.isbn')}: {x.isbn13 || x.isbn10 || '—'}
                                </div>

                                <button
                                    onClick={() => addCandidate(x)}
                                    style={{
                                        background: 'var(--tg-theme-button-color, #007AFF)',
                                        color: 'var(--tg-theme-button-text-color, white)',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        cursor: 'pointer'
                                    }}
                                >
                                    ➕ {t('search.propose')}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}