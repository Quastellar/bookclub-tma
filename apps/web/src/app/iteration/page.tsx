'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { tmaLogin, getUser, getToken } from '@/lib/auth';
import { hapticError, hapticSuccess } from '@/lib/tg';
import AppBar from '../_components/AppBar';
import { useI18n } from '../_i18n/I18nProvider';
import { apiFetch } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL!;

type IterationDto = {
    id: string;
    name: string;
    status: 'PLANNED' | 'OPEN' | 'CLOSED';
    meetingDate?: string | null;
    Candidates?: Array<{ id: string; Book?: { titleNorm?: string; authorsNorm?: string[] }; AddedBy?: { id: string; username?: string; name?: string } }>;
    voteCounts?: Record<string, number>;
    myVoteCandidateId?: string | null;
};

export default function IterationPage() {
    const { t } = useI18n();
    const [iter, setIter] = useState<IterationDto | null>(null);
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingCandidateId, setPendingCandidateId] = useState<string | null>(null);
    const user = getUser();

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            const url = token ? `${API}/iterations/current/full` : `${API}/iterations/current`;
            const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await apiFetch(url, { headers, label: 'iterations.current' });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setIter(data);
        } catch (e) {
            setIter(null);
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg || 'Не удалось загрузить');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        tmaLogin()
            .then(() => setReady(true))
            .catch((e) => { console.error(e); setReady(true); })
            .finally(() => { load(); });
    }, []);

    // Управление Telegram MainButton под подтверждение выбора (пример)
    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg) return;

        if (pendingCandidateId) {
            tg.MainButton.setText('Подтвердить голос');
            tg.MainButton.show();
            const handler = () => vote(pendingCandidateId);
            tg.MainButton.onClick(handler);
            return () => tg.MainButton.offClick(handler);
        } else {
            tg.MainButton.hide();
        }
    }, [pendingCandidateId, vote]);

    async function vote(candidateId: string) {
        // оптимистичное UI: показываем ваш выбор сразу
        setIter((prev) => prev ? { ...prev, myVoteCandidateId: candidateId } : prev);
        setPendingCandidateId(candidateId);
        // гарантируем наличие токена
        let token = getToken();
        if (!token) {
            try { await tmaLogin(); } catch {}
            token = getToken();
            if (!token) {
                hapticError();
                (window as any).Telegram?.WebApp?.showAlert?.('Не авторизован. Откройте Mini App в Telegram.') ?? alert('Не авторизован. Откройте Mini App в Telegram.');
                setPendingCandidateId(null);
                await load();
                return;
            }
        }
        console.log('[VOTE] try', { candidateId, token: Boolean(getToken()) });
        const res = await apiFetch(`${API}/votes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify({ candidateId }),
            label: 'votes.create'
        });
        if (!res.ok) {
            const t = await res.text();
            console.warn('[VOTE] failed', res.status, t);
            hapticError();
            (window as any).Telegram?.WebApp?.showAlert?.(`Ошибка: ${t}`) ?? alert(`Ошибка: ${t}`);
            // откат
            await load();
        } else {
            console.log('[VOTE] ok');
            hapticSuccess();
            (window as any).Telegram?.WebApp?.showAlert?.('Голос учтён') ?? alert('Голос учтён');
            await load();
        }
        setPendingCandidateId(null);
    }

    return (
        <div style={{ padding: 16 }}>
            <AppBar title={iter?.name || t('iteration.title')} right={<Link href="/search" style={{ fontSize: 14, color: 'var(--tg-theme-link-color, #007AFF)' }}>{t('iteration.addBook')}</Link>} />
            {!ready && <div style={{ marginTop: 8 }}>Входим через Telegram…</div>}
            {user && <div style={{ margin: '8px 0' }}>{t('common.user')}: {user.username || user.name || user.id}</div>}

            {loading && <div style={{ marginTop: 12 }}>{t('common.loading')}</div>}
            {error && <div style={{ marginTop: 12, color: 'crimson' }}>{t('common.error')}: {error}</div>}
            {!loading && !iter && !error && (
                <div style={{ marginTop: 12 }}>{t('iteration.noIteration')}</div>
            )}

            {iter && (
                <ul style={{ listStyle: 'none', marginTop: 12 }}>
                    {(iter.Candidates || []).map((c) => {
                        const by = c.AddedBy as { id?: string; username?: string; name?: string } | undefined;
                        const isSelf = user && by && (user.id === by.id);
                        const count = iter.voteCounts?.[c.id] ?? 0;
                        const isMine = iter.myVoteCandidateId === c.id;
                        return (
                            <li key={c.id} style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: 'var(--tg-theme-secondary-bg-color, #f1f1f1)' }}>
                                <div><b>{c.Book?.titleNorm}</b></div>
                                <div style={{ opacity: 0.8 }}>{(c.Book?.authorsNorm || []).join(', ')}</div>
                                {by && (
                                    <div style={{ fontSize: 12, color: 'var(--tg-theme-hint-color, #999)' }}>{t('iteration.addedBy')}: {by.username || by.name || by.id}</div>
                                )}
                                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--tg-theme-hint-color, #999)' }}>{t('iteration.votes')}: {count} {isMine ? `• ${t('iteration.yourChoice')}` : ''}</div>
                                <div style={{ marginTop: 8 }}>
                                    <button
                                        onClick={() => vote(c.id)}
                                        disabled={!!isSelf}
                                        style={{
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            border: 'none',
                                            background: isMine ? 'var(--tg-theme-button-color, #2F9E44)' : 'var(--tg-theme-button-color, #007AFF)',
                                            color: 'var(--tg-theme-button-text-color, #fff)',
                                            fontWeight: 700,
                                            opacity: isSelf ? 0.5 : 1,
                                        }}
                                    >{isSelf ? t('iteration.cannotSelf') : (isMine ? t('iteration.voted') : t('iteration.vote'))}</button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {iter && (
                <div style={{ marginTop: 16, fontSize: 13, color: 'var(--tg-theme-hint-color, #666)' }}>
                    {t('iteration.status')}: {iter.status}
                    {iter.meetingDate && (
                        <span> • {t('iteration.meeting')} {formatDateTime(iter.meetingDate)}{renderCountdownI18n(iter.meetingDate, t)}</span>
                    )}
                </div>
            )}
        </div>
    );
}

function formatDateTime(iso?: string) {
    try {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
}

function renderCountdown(iso?: string) {
    if (!iso) return '';
    const target = new Date(iso).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return ' (идёт/прошла)';
    const days = Math.floor(diff / (24*60*60*1000));
    const hours = Math.floor((diff % (24*60*60*1000)) / (60*60*1000));
    return ` (через ${days}д ${hours}ч)`;
}

function renderCountdownI18n(iso: string, t: (k: string) => string) {
    const target = new Date(iso).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return ` (${t('iteration.running')})`;
    const days = Math.floor(diff / (24*60*60*1000));
    const hours = Math.floor((diff % (24*60*60*1000)) / (60*60*1000));
    return ` (${t('iteration.in')} ${days}д ${hours}ч)`;
}
