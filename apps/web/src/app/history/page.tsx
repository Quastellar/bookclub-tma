'use client';

import { useEffect, useState } from 'react';
import AppBar from '../_components/AppBar';
import { useI18n } from '../_i18n/I18nProvider';

const API = process.env.NEXT_PUBLIC_API_URL!;

type HistoryItem = {
    id: string;
    name: string;
    closedAt?: string;
    winnerCandidateId?: string | null;
    voteCounts?: Record<string, number>;
    Candidates?: Array<{ id: string; Book?: { titleNorm?: string; authorsNorm?: string[] } }>;
};

export default function HistoryPage() {
    const { t } = useI18n();
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API}/iterations/history`);
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setItems(data);
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                setError(msg || 'Не удалось загрузить');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div style={{ padding: 16 }}>
            <AppBar title={t('history.title')} withBack />
            {loading && <div style={{ marginTop: 8 }}>{t('common.loading')}</div>}
            {error && <div style={{ marginTop: 8, color: 'crimson' }}>{t('common.error')}: {error}</div>}

            <ul style={{ listStyle: 'none', marginTop: 12 }}>
                {items.map((it) => {
                    const winnerId = it.winnerCandidateId;
                    const winner = (it.Candidates || []).find((c) => c.id === winnerId);
                    const votes = it.voteCounts?.[winnerId] ?? 0;
                    return (
                        <li key={it.id} style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: 'var(--tg-theme-secondary-bg-color, #f1f1f1)' }}>
                            <div style={{ fontWeight: 800 }}>{it.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--tg-theme-hint-color, #999)' }}>{t('history.closedAt')}: {formatDate(it.closedAt)}</div>
                            {winner ? (
                                <div style={{ marginTop: 8 }}>
                                    {t('history.winner')}: <b>{winner.Book?.titleNorm}</b>
                                    <div style={{ opacity: 0.8 }}>{(winner.Book?.authorsNorm || []).join(', ')}</div>
                                    <div style={{ fontSize: 12, color: 'var(--tg-theme-hint-color, #999)' }}>Голосов: {votes}</div>
                                </div>
                            ) : (
                                <div style={{ marginTop: 8 }}>{t('history.noWinner')}</div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function formatDate(iso?: string) {
    try {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('ru-RU');
    } catch { return ''; }
}


