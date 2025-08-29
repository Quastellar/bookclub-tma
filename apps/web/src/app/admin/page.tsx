'use client';

import { useEffect, useState } from 'react';
import AppBar from '../_components/AppBar';
import { useI18n } from '../_i18n/I18nProvider';
import { ensureAuth, getUser } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import { hapticError, hapticSuccess } from '@/lib/tg';

const API = process.env.NEXT_PUBLIC_API_URL!;

type Iteration = {
    id: string;
    name: string;
    status: 'PLANNED' | 'OPEN' | 'CLOSED';
    meetingDate?: string | null;
    openedAt?: string | null;
    closedAt?: string | null;
    Candidates?: Array<{ id: string; Book?: { titleNorm?: string; authorsNorm?: string[] } }>;
};

export default function AdminPage() {
    const { t } = useI18n();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentIter, setCurrentIter] = useState<Iteration | null>(null);
    const [newIterName, setNewIterName] = useState('');
    const [newDeadline, setNewDeadline] = useState('');
    const user = getUser();

    // Проверяем права админа
    const isAdmin = user?.roles?.includes('admin') ?? false;

    const loadCurrent = async () => {
        try {
            const res = await apiFetch(`${API}/iterations/current`, { label: 'admin.current' });
            if (res.ok) {
                const data = await res.json();
                setCurrentIter(data);
            } else {
                setCurrentIter(null);
            }
        } catch {
            setCurrentIter(null);
        }
    };

    useEffect(() => {
        loadCurrent();
    }, []);

    const createIteration = async () => {
        if (!newIterName.trim()) {
            hapticError();
            alert('Введите название итерации');
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const token = await ensureAuth();
            if (!token) throw new Error('Не авторизован');

            const res = await apiFetch(`${API}/iterations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ 
                    name: newIterName.trim(),
                    meetingDate: newDeadline ? newDeadline : undefined 
                }),
                label: 'admin.create'
            });

            if (!res.ok) throw new Error(await res.text());
            
            hapticSuccess();
            setNewIterName('');
            setNewDeadline('');
            await loadCurrent();
        } catch (e) {
            hapticError();
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const openIteration = async (id: string) => {
        if (!confirm('Открыть итерацию для голосования?')) return;
        
        setLoading(true);
        try {
            const token = await ensureAuth();
            if (!token) throw new Error('Не авторизован');

            const res = await apiFetch(`${API}/iterations/${id}/open`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                label: 'admin.open'
            });

            if (!res.ok) throw new Error(await res.text());
            
            hapticSuccess();
            await loadCurrent();
        } catch (e) {
            hapticError();
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const closeIteration = async (id: string) => {
        if (!confirm('Закрыть итерацию и объявить результаты?')) return;
        
        setLoading(true);
        try {
            const token = await ensureAuth();
            if (!token) throw new Error('Не авторизован');

            const res = await apiFetch(`${API}/iterations/${id}/close`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                label: 'admin.close'
            });

            if (!res.ok) throw new Error(await res.text());
            
            hapticSuccess();
            alert('Итерация закрыта! Результаты отправлены в канал.');
            await loadCurrent();
        } catch (e) {
            hapticError();
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const setDeadline = async (id: string) => {
        if (!newDeadline) {
            hapticError();
            alert('Выберите дату и время');
            return;
        }
        
        setLoading(true);
        try {
            const token = await ensureAuth();
            if (!token) throw new Error('Не авторизован');

            const res = await apiFetch(`${API}/iterations/${id}/deadline`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ meetingDate: newDeadline }),
                label: 'admin.deadline'
            });

            if (!res.ok) throw new Error(await res.text());
            
            hapticSuccess();
            setNewDeadline('');
            await loadCurrent();
        } catch (e) {
            hapticError();
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return (
            <div style={{ padding: 16 }}>
                <AppBar title={t('admin.title')} withBack />
                <div style={{ marginTop: 20, textAlign: 'center', color: 'crimson' }}>
                    ❌ Доступ запрещён. Требуются права администратора.
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: 16 }}>
            <AppBar title={t('admin.title')} withBack />
            
            {error && (
                <div style={{ marginTop: 12, padding: 12, background: '#ffebee', color: 'crimson', borderRadius: 8 }}>
                    ❌ {error}
                </div>
            )}

            {/* Текущая итерация */}
            <div style={{ marginTop: 16 }}>
                <h3>{t('admin.currentIteration')}</h3>
                {currentIter ? (
                    <div style={{ 
                        background: 'var(--tg-theme-secondary-bg-color, #f1f1f1)', 
                        padding: 12, 
                        borderRadius: 8,
                        marginBottom: 16
                    }}>
                        <div><strong>{currentIter.name}</strong></div>
                        <div>Статус: <span style={{ 
                            color: currentIter.status === 'OPEN' ? 'green' : 
                                   currentIter.status === 'CLOSED' ? 'gray' : 'orange' 
                        }}>
                            {currentIter.status === 'OPEN' ? '🟢 Открыта' : 
                             currentIter.status === 'CLOSED' ? '⚫ Закрыта' : '🟡 Планируется'}
                        </span></div>
                        {currentIter.meetingDate && (
                            <div>Дедлайн: {new Date(currentIter.meetingDate).toLocaleString('ru-RU')}</div>
                        )}
                        <div>Кандидатов: {(currentIter.Candidates || []).length}</div>
                        
                        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {currentIter.status === 'PLANNED' && (
                                <button 
                                    onClick={() => openIteration(currentIter.id)}
                                    disabled={loading}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    🟢 Открыть голосование
                                </button>
                            )}
                            
                            {currentIter.status === 'OPEN' && (
                                <button 
                                    onClick={() => closeIteration(currentIter.id)}
                                    disabled={loading}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    ⚫ Закрыть и объявить результаты
                                </button>
                            )}
                        </div>

                        {/* Установка дедлайна */}
                        {currentIter.status !== 'CLOSED' && (
                            <div style={{ marginTop: 16 }}>
                                <h4>Изменить дедлайн</h4>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <input
                                        type="datetime-local"
                                        value={newDeadline}
                                        onChange={e => setNewDeadline(e.target.value)}
                                        style={{
                                            padding: 8,
                                            border: '1px solid #ccc',
                                            borderRadius: 4,
                                            background: 'var(--tg-theme-secondary-bg-color, #fff)',
                                            color: 'var(--tg-theme-text-color, #000)'
                                        }}
                                    />
                                    <button 
                                        onClick={() => setDeadline(currentIter.id)}
                                        disabled={loading || !newDeadline}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#2196F3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 6,
                                            cursor: loading || !newDeadline ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        ⏰ Установить
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ color: 'var(--tg-theme-hint-color, #999)' }}>
                        Нет активной итерации
                    </div>
                )}
            </div>

            {/* Создание новой итерации */}
            <div style={{ marginTop: 24 }}>
                <h3>Создать новую итерацию</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                        type="text"
                        placeholder="Название итерации (например: Ноябрь 2024)"
                        value={newIterName}
                        onChange={e => setNewIterName(e.target.value)}
                        style={{
                            padding: 12,
                            border: '1px solid #ccc',
                            borderRadius: 6,
                            background: 'var(--tg-theme-secondary-bg-color, #fff)',
                            color: 'var(--tg-theme-text-color, #000)'
                        }}
                    />
                    
                    <input
                        type="datetime-local"
                        placeholder="Дедлайн (необязательно)"
                        value={newDeadline}
                        onChange={e => setNewDeadline(e.target.value)}
                        style={{
                            padding: 12,
                            border: '1px solid #ccc',
                            borderRadius: 6,
                            background: 'var(--tg-theme-secondary-bg-color, #fff)',
                            color: 'var(--tg-theme-text-color, #000)'
                        }}
                    />
                    
                    <button 
                        onClick={createIteration}
                        disabled={loading || !newIterName.trim()}
                        style={{
                            padding: '12px 20px',
                            background: loading || !newIterName.trim() ? '#ccc' : 'var(--tg-theme-button-color, #007AFF)',
                            color: 'var(--tg-theme-button-text-color, white)',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 16,
                            fontWeight: 'bold',
                            cursor: loading || !newIterName.trim() ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? '⏳ Создание...' : '➕ Создать итерацию'}
                    </button>
                </div>
            </div>
        </div>
    );
}
