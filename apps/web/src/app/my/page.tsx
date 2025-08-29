'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AppBar from '../_components/AppBar';
import BookCard from '../_components/BookCard';
import { authHeaders, getUser, tmaLogin, ensureAuth, getToken } from '@/lib/auth';
import { hapticError, hapticSuccess } from '@/lib/tg';
import { useI18n } from '../_i18n/I18nProvider';
import { apiFetch } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL!;

type CandidateDto = { 
    id: string; 
    Book?: { 
        titleNorm?: string; 
        authorsNorm?: string[];
        coverUrl?: string;
    }; 
    AddedBy?: { 
        id: string; 
        tgUserId?: string 
    } 
};

export default function MyProposalsPage() {
    const { t } = useI18n();
    const [items, setItems] = useState<CandidateDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [me, setMe] = useState<import('@/lib/auth').TmaUser | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch(`${API}/iterations/current/full`, { 
                headers: { ...authHeaders() }, 
                label: 'iterations.current.full' 
            });
            if (!res.ok) {
                if (res.status === 404) {
                    setItems([]);
                    return;
                }
                throw new Error(await res.text());
            }
            const data = await res.json();
            const currentUser = me || (typeof window !== 'undefined' ? getUser() : null);
            const mine = (data?.Candidates || []).filter((c: CandidateDto) => {
                const added = c?.AddedBy;
                return added?.id === currentUser?.id || (added?.tgUserId && added?.tgUserId === currentUser?.tgUserId);
            });
            setItems(mine);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg || 'Не удалось загрузить');
            console.error('Load my proposals error:', e);
        } finally {
            setLoading(false);
        }
    }, [me]);

    useEffect(() => {
        setIsClient(true);
        tmaLogin()
            .then((d) => { 
                setMe(d.user || null); 
            })
            .catch(() => {
                // Безопасная инициализация пользователя на клиенте
                if (typeof window !== 'undefined') {
                    setMe(getUser());
                }
            })
            .finally(load);
    }, [load]);

    const remove = async (id: string, title: string) => {
        const confirmed = window.confirm(`Удалить книгу "${title}"?`);
        if (!confirmed) return;
        
        try {
            setDeleting(id);
            const token = await ensureAuth();
            if (!token) { 
                hapticError(); 
                alert('Не авторизован'); 
                return; 
            }
            
            const res = await apiFetch(`${API}/candidates/${id}`, { 
                method: 'DELETE', 
                headers: { Authorization: `Bearer ${getToken()}` }, 
                label: 'candidates.delete' 
            });
            
            if (!res.ok) throw new Error(await res.text());
            
            hapticSuccess();
            await load();
        } catch (e) {
            hapticError();
            const msg = e instanceof Error ? e.message : String(e);
            alert(msg || `${t('common.error')}`);
            console.error('Delete candidate error:', e);
        } finally {
            setDeleting(null);
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

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            paddingBottom: '80px'
        }}>
            <AppBar title={t('my.title')} withBack />
            
            <main style={{
                padding: '16px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                {loading ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '48px 20px',
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            border: '3px solid #e5e7eb',
                            borderTop: '3px solid #f26419',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ color: '#6b7280' }}>Загрузка ваших предложений...</p>
                    </div>
                ) : error ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px 20px',
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #fecaca',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#dc2626',
                            margin: '0 0 12px 0'
                        }}>Ошибка загрузки</h3>
                        <p style={{
                            fontSize: '16px',
                            color: '#6b7280',
                            lineHeight: '1.6',
                            margin: '0 0 16px 0'
                        }}>
                            {error}
                        </p>
                        <button
                            onClick={load}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#f26419',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e34a0f';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f26419';
                            }}
                        >
                            Попробовать снова
                        </button>
                    </div>
                ) : items.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px 20px',
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0 0 12px 0'
                        }}>Пока нет предложений</h3>
                        <p style={{
                            fontSize: '16px',
                            color: '#6b7280',
                            lineHeight: '1.6',
                            margin: '0 0 24px 0'
                        }}>
                            Предложите первую книгу для обсуждения в клубе
                        </p>
                        <Link 
                            href="/search"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                backgroundColor: '#f26419',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '500',
                                textDecoration: 'none',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e34a0f';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f26419';
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            Найти книгу
                        </Link>
                    </div>
                ) : (
                    <div>
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
                                textAlign: 'center'
                            }}>
                                Мои предложения
                            </h1>
                            <p style={{
                                fontSize: '16px',
                                color: '#6b7280',
                                textAlign: 'center',
                                margin: '0'
                            }}>
                                {items.length} {items.length === 1 ? 'книга' : items.length < 5 ? 'книги' : 'книг'}
                            </p>
                        </div>

                        {/* Список книг */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {items.map((candidate) => (
                                <div 
                                    key={candidate.id}
                                    style={{
                                        padding: '20px',
                                        background: '#ffffff',
                                        borderRadius: '16px',
                                        border: '1px solid #e5e7eb',
                                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                        transition: 'all 0.25s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                    }}
                                >
                                    <BookCard
                                        title={candidate.Book?.titleNorm || 'Неизвестная книга'}
                                        authors={candidate.Book?.authorsNorm || []}
                                        coverUrl={candidate.Book?.coverUrl}
                                    />
                                    
                                    <div style={{
                                        marginTop: '16px',
                                        paddingTop: '16px',
                                        borderTop: '1px solid #f3f4f6',
                                        display: 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <button
                                            onClick={() => remove(candidate.id, candidate.Book?.titleNorm || 'книгу')}
                                            disabled={deleting === candidate.id}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 16px',
                                                backgroundColor: deleting === candidate.id ? '#f3f4f6' : '#ef4444',
                                                color: deleting === candidate.id ? '#6b7280' : 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                cursor: deleting === candidate.id ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.15s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (deleting !== candidate.id) {
                                                    e.currentTarget.style.backgroundColor = '#dc2626';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (deleting !== candidate.id) {
                                                    e.currentTarget.style.backgroundColor = '#ef4444';
                                                }
                                            }}
                                        >
                                            {deleting === candidate.id ? (
                                                <>
                                                    <div style={{
                                                        width: '14px',
                                                        height: '14px',
                                                        border: '2px solid #6b7280',
                                                        borderTop: '2px solid transparent',
                                                        borderRadius: '50%',
                                                        animation: 'spin 1s linear infinite'
                                                    }} />
                                                    Удаление...
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3,6 5,6 21,6"/>
                                                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                                        <line x1="10" y1="11" x2="10" y2="17"/>
                                                        <line x1="14" y1="11" x2="14" y2="17"/>
                                                    </svg>
                                                    Удалить
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Кнопка добавить еще */}
                        <div style={{
                            marginTop: '24px',
                            textAlign: 'center'
                        }}>
                            <Link 
                                href="/search"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '16px 24px',
                                    backgroundColor: '#f26419',
                                    color: 'white',
                                    border: '2px dashed transparent',
                                    borderRadius: '12px',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#f26419';
                                    e.currentTarget.style.borderColor = '#f26419';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f26419';
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Предложить еще книгу
                            </Link>
                        </div>
                    </div>
                )}
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