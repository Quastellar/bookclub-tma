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
    const [isClient, setIsClient] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const user = isClient ? getUser() : null;

    // Проверяем права админа
    const isAdmin = user?.roles?.includes('admin') ?? false;

    useEffect(() => {
        setIsClient(true);
    }, []);

    const loadCurrent = async () => {
        try {
            const token = await ensureAuth();
            if (!token) {
                setCurrentIter(null);
                return;
            }
            
            const res = await apiFetch(`${API}/iterations/current/admin`, { 
                headers: { Authorization: `Bearer ${token}` },
                label: 'admin.current' 
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentIter(data);
                console.log('[ADMIN] Loaded current iteration:', data);
            } else {
                setCurrentIter(null);
            }
        } catch (e) {
            console.error('[ADMIN] Error loading current iteration:', e);
            setCurrentIter(null);
        }
    };

    useEffect(() => {
        if (isClient) {
            loadCurrent();
        }
    }, [isClient]);

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
        const confirmed = window.confirm('Открыть итерацию для голосования?');
        if (!confirmed) return;
        
        setActionLoading('open');
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
            setActionLoading(null);
        }
    };

    const closeIteration = async (id: string) => {
        const confirmed = window.confirm('Закрыть итерацию и объявить результаты?');
        if (!confirmed) return;
        
        setActionLoading('close');
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
            setActionLoading(null);
        }
    };

    const setDeadline = async (id: string) => {
        if (!newDeadline) {
            hapticError();
            alert('Выберите дату и время');
            return;
        }
        
        setActionLoading('deadline');
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
            setActionLoading(null);
        }
    };

    if (!isClient) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #f26419',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: '#6b7280' }}>Загрузка...</p>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                paddingBottom: '80px'
            }}>
                <AppBar title={t('admin.title')} withBack />
                
                <main style={{
                    padding: '16px',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '48px 20px',
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #fecaca',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#dc2626',
                            margin: '0 0 12px 0'
                        }}>Доступ запрещён</h3>
                        <p style={{
                            fontSize: '16px',
                            color: '#6b7280',
                            lineHeight: '1.6',
                            margin: '0'
                        }}>
                            Требуются права администратора
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            paddingBottom: '80px'
        }}>
            <AppBar title={t('admin.title')} withBack />
            
            <main style={{
                padding: '16px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                {/* Ошибки */}
                {error && (
                    <div style={{
                        padding: '16px',
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#dc2626',
                            fontWeight: '500'
                        }}>
                            ⚠️ {error}
                        </div>
                    </div>
                )}

                {/* Заголовок */}
                <div style={{
                    padding: '24px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    marginBottom: '24px'
                }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 8px 0',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        ⚙️ Панель администратора
                    </h1>
                    <p style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        textAlign: 'center',
                        margin: '0'
                    }}>
                        Управление итерациями книжного клуба
                    </p>
                </div>

                {/* Текущая итерация */}
                <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    padding: '24px',
                    marginBottom: '24px'
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 16px 0'
                    }}>
шв                         Текущая итерация
                    </h2>

                    {currentIter ? (
                        <div>
                            {/* Информация об итерации */}
                            <div style={{
                                padding: '16px',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                marginBottom: '20px'
                            }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    margin: '0 0 12px 0'
                                }}>
                                    {currentIter.name}
                                </h3>
                                
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '8px'
                                }}>
                                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Статус:</span>
                                    <div style={{
                                        padding: '4px 8px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        ...(currentIter.status === 'OPEN' ? {
                                            background: '#d1fae5',
                                            color: '#065f46'
                                        } : currentIter.status === 'CLOSED' ? {
                                            background: '#f3f4f6',
                                            color: '#374151'
                                        } : {
                                            background: '#fef3c7',
                                            color: '#92400e'
                                        })
                                    }}>
                                        {currentIter.status === 'OPEN' ? '🟢 Открыта' : 
                                         currentIter.status === 'CLOSED' ? '⚫ Закрыта' : '🟡 Планируется'}
                                    </div>
                                </div>

                                {currentIter.meetingDate && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '8px'
                                    }}>
                                        <span style={{ color: '#6b7280', fontWeight: '500' }}>Дедлайн:</span>
                                        <span style={{ color: '#1f2937' }}>
                                            {new Date(currentIter.meetingDate).toLocaleString('ru-RU')}
                                        </span>
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Кандидатов:</span>
                                    <div style={{
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        background: '#e5e7eb',
                                        color: '#374151',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}>
                                        {(currentIter.Candidates || []).length}
                                    </div>
                                </div>
                            </div>

                            {/* Действия */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                {currentIter.status === 'PLANNED' && (
                                    <button 
                                        onClick={() => openIteration(currentIter.id)}
                                        disabled={actionLoading === 'open'}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '12px 20px',
                                            background: actionLoading === 'open' ? '#f3f4f6' : '#10b981',
                                            color: actionLoading === 'open' ? '#6b7280' : 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            cursor: actionLoading === 'open' ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (actionLoading !== 'open') {
                                                e.currentTarget.style.background = '#059669';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (actionLoading !== 'open') {
                                                e.currentTarget.style.background = '#10b981';
                                            }
                                        }}
                                    >
                                        {actionLoading === 'open' ? (
                                            <>
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    border: '2px solid #6b7280',
                                                    borderTop: '2px solid transparent',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite'
                                                }} />
                                                Открываем...
                                            </>
                                        ) : (
                                            <>
                                                🟢 Открыть голосование
                                            </>
                                        )}
                                    </button>
                                )}
                                
                                {currentIter.status === 'OPEN' && (
                                    <button 
                                        onClick={() => closeIteration(currentIter.id)}
                                        disabled={actionLoading === 'close'}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '12px 20px',
                                            background: actionLoading === 'close' ? '#f3f4f6' : '#ef4444',
                                            color: actionLoading === 'close' ? '#6b7280' : 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            cursor: actionLoading === 'close' ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (actionLoading !== 'close') {
                                                e.currentTarget.style.background = '#dc2626';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (actionLoading !== 'close') {
                                                e.currentTarget.style.background = '#ef4444';
                                            }
                                        }}
                                    >
                                        {actionLoading === 'close' ? (
                                            <>
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    border: '2px solid #6b7280',
                                                    borderTop: '2px solid transparent',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite'
                                                }} />
                                                Закрываем...
                                            </>
                                        ) : (
                                            <>
                                                ⚫ Закрыть и объявить результаты
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* Установка дедлайна */}
                                {currentIter.status !== 'CLOSED' && (
                                    <div style={{
                                        padding: '16px',
                                        background: '#f8fafc',
                                        borderRadius: '12px',
                                        marginTop: '8px'
                                    }}>
                                        <h4 style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#1f2937',
                                            margin: '0 0 12px 0'
                                        }}>
                                            Изменить дедлайн
                                        </h4>
                                        <div style={{
                                            display: 'flex',
                                            gap: '8px',
                                            alignItems: 'flex-end',
                                            flexWrap: 'wrap'
                                        }}>
                                            <div style={{ flex: '1', minWidth: '200px' }}>
                                                <input
                                                    type="datetime-local"
                                                    value={newDeadline}
                                                    onChange={e => setNewDeadline(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        fontSize: '16px',
                                                        background: '#ffffff',
                                                        color: '#1f2937'
                                                    }}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => setDeadline(currentIter.id)}
                                                disabled={actionLoading === 'deadline' || !newDeadline}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '12px 16px',
                                                    background: actionLoading === 'deadline' || !newDeadline ? '#f3f4f6' : '#3b82f6',
                                                    color: actionLoading === 'deadline' || !newDeadline ? '#6b7280' : 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    cursor: actionLoading === 'deadline' || !newDeadline ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.15s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (actionLoading !== 'deadline' && newDeadline) {
                                                        e.currentTarget.style.background = '#2563eb';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (actionLoading !== 'deadline' && newDeadline) {
                                                        e.currentTarget.style.background = '#3b82f6';
                                                    }
                                                }}
                                            >
                                                {actionLoading === 'deadline' ? (
                                                    <>
                                                        <div style={{
                                                            width: '14px',
                                                            height: '14px',
                                                            border: '2px solid #6b7280',
                                                            borderTop: '2px solid transparent',
                                                            borderRadius: '50%',
                                                            animation: 'spin 1s linear infinite'
                                                        }} />
                                                        Устанавливаем...
                                                    </>
                                                ) : (
                                                    <>
                                                        ⏰ Установить
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '32px 20px',
                            color: '#6b7280'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📋</div>
                            <p style={{
                                fontSize: '16px',
                                fontWeight: '500',
                                margin: '0'
                            }}>
                                Нет активной итерации
                            </p>
                        </div>
                    )}
                </div>

                {/* Создание новой итерации */}
                <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    padding: '24px'
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 16px 0'
                    }}>
                        Создать новую итерацию
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>
                                Название итерации
                            </label>
                            <input
                                type="text"
                                placeholder="Например: Ноябрь 2024"
                                value={newIterName}
                                onChange={e => setNewIterName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    background: '#ffffff',
                                    color: '#1f2937',
                                    transition: 'border-color 0.15s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#f26419';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(242, 100, 25, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#d1d5db';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                        
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>
                                Дедлайн (необязательно)
                            </label>
                            <input
                                type="datetime-local"
                                value={newDeadline}
                                onChange={e => setNewDeadline(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    background: '#ffffff',
                                    color: '#1f2937',
                                    transition: 'border-color 0.15s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#f26419';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(242, 100, 25, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#d1d5db';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                        
                        <button 
                            onClick={createIteration}
                            disabled={loading || !newIterName.trim()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '16px 24px',
                                background: loading || !newIterName.trim() ? '#f3f4f6' : '#f26419',
                                color: loading || !newIterName.trim() ? '#6b7280' : 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: loading || !newIterName.trim() ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && newIterName.trim()) {
                                    e.currentTarget.style.background = '#e34a0f';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading && newIterName.trim()) {
                                    e.currentTarget.style.background = '#f26419';
                                }
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid #6b7280',
                                        borderTop: '2px solid transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }} />
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                    Создать итерацию
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}