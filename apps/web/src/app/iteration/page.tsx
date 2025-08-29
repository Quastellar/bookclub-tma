'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { tmaLogin, getUser, getToken } from '@/lib/auth';
import { hapticError, hapticSuccess } from '@/lib/tg';
import AppBar from '../_components/AppBar';
import { useI18n } from '../_i18n/I18nProvider';
import { apiFetch } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL!;

type TgWebApp = {
    MainButton: { setText: (s: string) => void; show: () => void; hide: () => void; onClick: (fn: () => void) => void; offClick: (fn: () => void) => void };
    showAlert?: (msg: string) => void;
};

function getTg(): TgWebApp | undefined {
    if (typeof window === 'undefined') return undefined;
    return (window as unknown as { Telegram?: { WebApp?: TgWebApp } })?.Telegram?.WebApp;
}

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
    const [isClient, setIsClient] = useState(false);
    const user = isClient ? getUser() : null;

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            const url = token ? `${API}/iterations/current/full` : `${API}/iterations/current`;
            const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await apiFetch(url, { headers, label: 'iterations.current' });
            if (!res.ok) {
                if (res.status === 404) {
                    setIter(null);
                    return;
                }
                throw new Error(`HTTP ${res.status}`);
            }
            const data = await res.json();
            setIter(data);
        } catch (e) {
            console.error('Load iteration failed:', e);
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const vote = async (candidateId: string) => {
        if (!iter || iter.status !== 'OPEN') return;

        try {
            await tmaLogin();
            
            setPendingCandidateId(candidateId);
            
            const prevVote = iter.myVoteCandidateId;
            const prevCounts = { ...iter.voteCounts };
            
            const newIter: IterationDto = {
                ...iter,
                myVoteCandidateId: candidateId,
                voteCounts: {
                    ...iter.voteCounts,
                    [candidateId]: (iter.voteCounts?.[candidateId] || 0) + 1,
                    ...(prevVote && prevVote !== candidateId ? { [prevVote]: Math.max(0, (iter.voteCounts?.[prevVote] || 0) - 1) } : {})
                }
            };
            setIter(newIter);

            const res = await apiFetch(`${API}/votes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId }),
                label: 'votes.create'
            });

            if (!res.ok) {
                setIter(prevData => prevData ? {
                    ...prevData,
                    myVoteCandidateId: prevVote,
                    voteCounts: prevCounts
                } : null);
                throw new Error('Vote failed');
            }

            hapticSuccess();
            const tg = getTg();
            if (tg?.showAlert) {
                tg.showAlert('Ваш голос учтен!');
            }

        } catch (error) {
            console.error('Vote error:', error);
            hapticError();
            const tg = getTg();
            if (tg?.showAlert) {
                tg.showAlert('Ошибка при голосовании. Попробуйте еще раз.');
            }
        } finally {
            setPendingCandidateId(null);
        }
    };

    const confirmVote = () => {
        if (!iter?.myVoteCandidateId) return;
        
        const candidate = iter.Candidates?.find(c => c.id === iter.myVoteCandidateId);
        if (!candidate) return;
        
        const tg = getTg();
        if (tg?.showAlert) {
            tg.showAlert(`Ваш голос за "${candidate.Book?.titleNorm || 'Unknown'}" учтен!`);
        }
    };

    useEffect(() => {
        setIsClient(true);
        
        tmaLogin()
            .then(() => setReady(true))
            .catch(() => setReady(true));
    }, []);

    useEffect(() => {
        if (ready) {
            load();
        }
    }, [ready]);

    useEffect(() => {
        if (!isClient || !iter) return;

        const tg = getTg();
        if (!tg?.MainButton) return;

        if (iter.status === 'OPEN' && iter.myVoteCandidateId) {
            tg.MainButton.setText('Подтвердить голос');
            tg.MainButton.show();
            
            const handleConfirm = () => confirmVote();
            tg.MainButton.offClick(handleConfirm);
            tg.MainButton.onClick(handleConfirm);
        } else {
            tg.MainButton.hide();
        }

        return () => {
            tg.MainButton?.hide();
        };
    }, [isClient, iter]);

    if (!ready || !isClient) {
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
            <AppBar title={t('iteration.title')} />
            
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
                        <p style={{ color: '#6b7280' }}>Загрузка итерации...</p>
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
                ) : !iter ? (
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
                        }}>Нет активной итерации</h3>
                        <p style={{
                            fontSize: '16px',
                            color: '#6b7280',
                            lineHeight: '1.6',
                            margin: '0 0 24px 0'
                        }}>
                            В данный момент голосование не проводится
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
                            Предложить книгу
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Заголовок итерации */}
                        <div style={{
                            padding: '24px',
                            background: '#ffffff',
                            borderRadius: '16px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}>
                            <h1 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#1f2937',
                                margin: '0 0 12px 0',
                                textAlign: 'center'
                            }}>
                                {iter.name}
                            </h1>
                            
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginBottom: '16px'
                            }}>
                                <div style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    ...(iter.status === 'OPEN' ? {
                                        background: '#d1fae5',
                                        color: '#065f46'
                                    } : iter.status === 'CLOSED' ? {
                                        background: '#fee2e2',
                                        color: '#991b1b'
                                    } : {
                                        background: '#fef3c7',
                                        color: '#92400e'
                                    })
                                }}>
                                    {iter.status === 'OPEN' ? '🗳️ Голосование открыто' : 
                                     iter.status === 'CLOSED' ? '✅ Завершено' : 
                                     '📋 Планируется'}
                                </div>
                            </div>
                            
                            {iter.meetingDate && (
                                <p style={{
                                    fontSize: '16px',
                                    color: '#6b7280',
                                    textAlign: 'center',
                                    margin: '0'
                                }}>
                                    📅 Встреча: {new Date(iter.meetingDate).toLocaleDateString('ru-RU')}
                                </p>
                            )}
                        </div>

                        {/* Список кандидатов */}
                        {iter.Candidates && iter.Candidates.length > 0 ? (
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
                                    margin: '0 0 20px 0',
                                    textAlign: 'center'
                                }}>
                                    Книги на голосование
                                </h2>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {iter.Candidates.map((candidate) => (
                                        <div 
                                            key={candidate.id}
                                            style={{
                                                padding: '20px',
                                                borderRadius: '12px',
                                                border: `2px solid ${iter.myVoteCandidateId === candidate.id ? '#f26419' : '#e5e7eb'}`,
                                                background: iter.myVoteCandidateId === candidate.id ? '#fff7ed' : '#ffffff',
                                                transition: 'all 0.25s ease',
                                                cursor: iter.status === 'OPEN' ? 'pointer' : 'default'
                                            }}
                                            onClick={() => iter.status === 'OPEN' && vote(candidate.id)}
                                            onMouseEnter={(e) => {
                                                if (iter.status === 'OPEN') {
                                                    e.currentTarget.style.borderColor = '#f26419';
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (iter.status === 'OPEN') {
                                                    e.currentTarget.style.borderColor = iter.myVoteCandidateId === candidate.id ? '#f26419' : '#e5e7eb';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                gap: '16px'
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{
                                                        fontSize: '18px',
                                                        fontWeight: '600',
                                                        color: '#1f2937',
                                                        margin: '0 0 8px 0',
                                                        lineHeight: '1.3'
                                                    }}>
                                                        {candidate.Book?.titleNorm || 'Неизвестная книга'}
                                                    </h3>
                                                    
                                                    <p style={{
                                                        fontSize: '14px',
                                                        color: '#6b7280',
                                                        margin: '0 0 8px 0'
                                                    }}>
                                                        Автор: {candidate.Book?.authorsNorm?.join(', ') || 'Неизвестен'}
                                                    </p>
                                                    
                                                    <p style={{
                                                        fontSize: '12px',
                                                        color: '#9ca3af',
                                                        margin: '0'
                                                    }}>
                                                        Предложил: {candidate.AddedBy?.username || candidate.AddedBy?.name || 'Аноним'}
                                                    </p>
                                                </div>
                                                
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    {iter.voteCounts && (
                                                        <div style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '8px',
                                                            background: '#f3f4f6',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            color: '#374151'
                                                        }}>
                                                            {iter.voteCounts[candidate.id] || 0} 🗳️
                                                        </div>
                                                    )}
                                                    
                                                    {iter.myVoteCandidateId === candidate.id && (
                                                        <div style={{
                                                            padding: '2px 6px',
                                                            borderRadius: '6px',
                                                            background: '#f26419',
                                                            color: 'white',
                                                            fontSize: '12px',
                                                            fontWeight: '500'
                                                        }}>
                                                            Ваш выбор
                                                        </div>
                                                    )}
                                                    
                                                    {pendingCandidateId === candidate.id && (
                                                        <div style={{
                                                            width: '16px',
                                                            height: '16px',
                                                            border: '2px solid #f26419',
                                                            borderTop: '2px solid transparent',
                                                            borderRadius: '50%',
                                                            animation: 'spin 1s linear infinite'
                                                        }} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '48px 20px',
                                background: '#ffffff',
                                borderRadius: '16px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📖</div>
                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    margin: '0 0 12px 0'
                                }}>Пока нет книг</h3>
                                <p style={{
                                    fontSize: '16px',
                                    color: '#6b7280',
                                    lineHeight: '1.6',
                                    margin: '0 0 24px 0'
                                }}>
                                    Будьте первым, кто предложит книгу!
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
                                    Предложить книгу
                                </Link>
                            </div>
                        )}
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
