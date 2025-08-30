'use client';

import { useEffect, useState } from 'react';
import AppBar from '../_components/AppBar';
import BookCard from '../_components/BookCard';
import { useI18n } from '../_i18n/I18nProvider';
import { useTelegramTheme } from '../_providers/TelegramThemeProvider';

const API = process.env.NEXT_PUBLIC_API_URL!;

type HistoryItem = {
    id: string;
    name: string;
    closedAt?: string;
    winnerCandidateId?: string | null;
    voteCounts?: Record<string, number>;
    Candidates?: Array<{ 
        id: string; 
        Book?: { 
            titleNorm?: string; 
            authorsNorm?: string[];
            coverUrl?: string;
        } 
    }>;
};

export default function HistoryPage() {
    const { t } = useI18n();
    const { tg, isReady } = useTelegramTheme();
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API}/iterations/history`);
                if (!res.ok) {
                    if (res.status === 404) {
                        setItems([]);
                        return;
                    }
                    throw new Error(await res.text());
                }
                const data = await res.json();
                setItems(Array.isArray(data) ? data : []);
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                setError(msg || 'Не удалось загрузить');
                console.error('Load history error:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const retry = () => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API}/iterations/history`);
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setItems(Array.isArray(data) ? data : []);
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                setError(msg || 'Не удалось загрузить');
            } finally {
                setLoading(false);
            }
        };
        load();
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            paddingBottom: '80px'
        }}>
            <AppBar title={t('history.title')} withBack />
            
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
                        <p style={{ color: '#6b7280' }}>Загрузка истории...</p>
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
                            onClick={retry}
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
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📖</div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0 0 12px 0'
                        }}>Пока нет истории</h3>
                        <p style={{
                            fontSize: '16px',
                            color: '#6b7280',
                            lineHeight: '1.6',
                            margin: '0'
                        }}>
                            Завершенные итерации книжного клуба появятся здесь
                        </p>
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
                                История клуба
                            </h1>
                            <p style={{
                                fontSize: '16px',
                                color: '#6b7280',
                                textAlign: 'center',
                                margin: '0'
                            }}>
                                {items.length} завершенная {items.length === 1 ? 'итерация' : items.length < 5 ? 'итерации' : 'итераций'}
                            </p>
                        </div>

                        {/* Список итераций */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {items.map((iteration) => {
                                const winnerId = iteration.winnerCandidateId;
                                const winner = winnerId ? (iteration.Candidates || []).find((c) => c.id === winnerId) : null;
                                const votes = winnerId && iteration.voteCounts ? (iteration.voteCounts[winnerId] ?? 0) : 0;
                                
                                return (
                                    <div 
                                        key={iteration.id}
                                        style={{
                                            background: '#ffffff',
                                            borderRadius: '16px',
                                            border: '1px solid #e5e7eb',
                                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                            overflow: 'hidden',
                                            transition: 'all 0.25s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        {/* Заголовок итерации */}
                                        <div style={{
                                            padding: '20px 20px 16px 20px',
                                            borderBottom: '1px solid #f3f4f6'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                gap: '16px'
                                            }}>
                                                <div>
                                                    <h3 style={{
                                                        fontSize: '18px',
                                                        fontWeight: '600',
                                                        color: '#1f2937',
                                                        margin: '0 0 4px 0'
                                                    }}>
                                                        {iteration.name}
                                                    </h3>
                                                    <p style={{
                                                        fontSize: '14px',
                                                        color: '#6b7280',
                                                        margin: '0'
                                                    }}>
                                                        Завершена: {formatDate(iteration.closedAt)}
                                                    </p>
                                                </div>
                                                <div style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '8px',
                                                    background: '#f3f4f6',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    color: '#374151'
                                                }}>
                                                    ✅ Завершена
                                                </div>
                                            </div>
                                        </div>

                                        {/* Победитель */}
                                        <div style={{ padding: '20px' }}>
                                            {winner ? (
                                                <div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '16px'
                                                    }}>
                                                        <div style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            background: '#fef3c7',
                                                            color: '#92400e',
                                                            fontSize: '12px',
                                                            fontWeight: '500'
                                                        }}>
                                                            🏆 Победитель
                                                        </div>
                                                        <div style={{
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            background: '#e5e7eb',
                                                            color: '#374151',
                                                            fontSize: '12px',
                                                            fontWeight: '500'
                                                        }}>
                                                            {votes} голосов
                                                        </div>
                                                    </div>
                                                    
                                                    <BookCard
                                                        title={winner.Book?.titleNorm || 'Неизвестная книга'}
                                                        authors={winner.Book?.authorsNorm || []}
                                                        coverUrl={winner.Book?.coverUrl}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '20px',
                                                    color: '#6b7280'
                                                }}>
                                                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤷‍♂️</div>
                                                    <p style={{
                                                        fontSize: '16px',
                                                        fontWeight: '500',
                                                        margin: '0'
                                                    }}>
                                                        Победитель не определен
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
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

function formatDate(iso?: string) {
    try {
        if (!iso) return 'Неизвестно';
        return new Date(iso).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch { 
        return 'Неизвестно'; 
    }
}