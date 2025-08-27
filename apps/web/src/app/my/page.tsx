'use client';

import { useEffect, useState } from 'react';
import AppBar from '../_components/AppBar';
import { authHeaders, getUser, tmaLogin, ensureAuth, getToken } from '@/lib/auth';
import { hapticError, hapticSuccess } from '@/lib/tg';
import { useI18n } from '../_i18n/I18nProvider';
import { apiFetch } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL!;

type CandidateDto = { id: string; Book?: { titleNorm?: string; authorsNorm?: string[] }; AddedBy?: { id: string; tgUserId?: string } };

export default function MyProposalsPage() {
    const { t } = useI18n();
    const [items, setItems] = useState<CandidateDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [me, setMe] = useState<import('@/lib/auth').TmaUser>(getUser());

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch(`${API}/iterations/current/full`, { headers: { ...authHeaders() }, label: 'iterations.current.full' });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            const currentUser = me || getUser();
            const mine = (data?.Candidates || []).filter((c: CandidateDto) => {
                const added = c?.AddedBy;
                return added?.id === currentUser?.id || (added?.tgUserId && added?.tgUserId === currentUser?.tgUserId);
            });
            setItems(mine);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg || 'Не удалось загрузить');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        tmaLogin()
            .then((d) => { setMe(d.user ?? getUser()); setReady(true); })
            .catch(() => setReady(true))
            .finally(load);
    }, []);

    const remove = async (id: string) => {
        if (!confirm(t('my.confirmDelete'))) return;
        try {
            const token = await ensureAuth();
            if (!token) { hapticError(); alert('Не авторизован'); return; }
            const res = await apiFetch(`${API}/candidates/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` }, label: 'candidates.delete' });
            if (!res.ok) throw new Error(await res.text());
            hapticSuccess();
            await load();
        } catch (e) {
            hapticError();
            const msg = e instanceof Error ? e.message : String(e);
            alert(msg || `${t('common.error')}`);
        }
    };

    return (
        <div style={{ padding: 16 }}>
            <AppBar title={t('my.title')} withBack />
            {!ready && <div style={{ marginTop: 8 }}>{t('common.entering')}</div>}
            {loading && <div style={{ marginTop: 8 }}>{t('common.loading')}</div>}
            {error && <div style={{ marginTop: 8, color: 'crimson' }}>{error}</div>}
            {!loading && items.length === 0 && <div style={{ marginTop: 8 }}>{t('my.none')}</div>}

            <ul style={{ listStyle: 'none', marginTop: 12 }}>
                {items.map((c: any) => (
                    <li key={c.id} style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: 'var(--tg-theme-secondary-bg-color, #f1f1f1)' }}>
                        <div><b>{c.Book?.titleNorm}</b></div>
                        <div style={{ opacity: 0.8 }}>{(c.Book?.authorsNorm || []).join(', ')}</div>
                        <div style={{ marginTop: 8 }}>
                            <button onClick={() => remove(c.id)} style={{ padding: '8px 12px', border: 'none', borderRadius: 8, background: '#E5484D', color: '#fff', fontWeight: 700 }}>{t('my.delete')}</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}


