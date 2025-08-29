'use client';

import { useEffect, useState } from 'react';
import { normalizeForCandidate } from '@/lib/book';
import { tmaLogin, ensureAuth } from '@/lib/auth';
import AppBar from '../_components/AppBar';
import BookCover from '../_components/BookCover';
import BookListSkeleton from '../_components/BookListSkeleton';
import { useI18n } from '../_i18n/I18nProvider';
import { hapticError, hapticSuccess } from '@/lib/tg';
import { apiFetch } from '@/lib/api';

type TgWebApp = {
    MainButton?: { setText?: (s: string) => void; show?: () => void; onClick?: (fn: () => void) => void; offClick?: (fn: () => void) => void; hide?: () => void };
    showAlert?: (msg: string) => void;
    BackButton?: { show?: () => void; hide?: () => void; onClick?: (fn: () => void) => void };
    ready?: () => void;
    expand?: () => void;
};

function getTg(): TgWebApp | undefined {
    if (typeof window === 'undefined') return undefined;
    return (window as unknown as { Telegram?: { WebApp?: TgWebApp } })?.Telegram?.WebApp;
}

const API = process.env.NEXT_PUBLIC_API_URL!;

type SearchItem = { 
    sourceId?: string;
    title: string; 
    authors: string[]; 
    year?: number; 
    isbn13?: string; 
    isbn10?: string; 
    coverUrl?: string; 
    source?: string; 
};

export default function SearchPage() {
    const { t } = useI18n();
    const [q, setQ] = useState('');
    const [items, setItems] = useState<SearchItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const tg = getTg();
        if (tg) {
            tg.ready?.();
            tg.expand?.();
            tg.BackButton?.show?.();
            tg.BackButton?.onClick?.(() => {
                if (typeof window !== 'undefined') {
                    window.history.back();
                }
            });
        }

        tmaLogin()
            .then(() => setReady(true))
            .catch(() => setReady(true));

        // Восстановить последний поисковый запрос
        if (typeof window !== 'undefined') {
            const savedQuery = localStorage.getItem('lastSearchQuery');
            if (savedQuery) {
                setQ(savedQuery);
            }
        }

        return () => {
            const tg = getTg();
            tg?.BackButton?.hide?.();
        };
    }, []);

    // Дебаунсинг поиска
    useEffect(() => {
        if (!q.trim()) {
            setItems([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            search(q);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [q]);

    // Сохранение поискового запроса
    useEffect(() => {
        if (q && typeof window !== 'undefined') {
            localStorage.setItem('lastSearchQuery', q);
        }
    }, [q]);

    const search = async (query: string) => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const url = `${API}/books/search?q=${encodeURIComponent(query)}`;
            console.log('[SEARCH] API URL:', API);
            console.log('[SEARCH] Full URL:', url);
            console.log('[SEARCH] Query:', query);
            
            // Проверим, доступен ли API вообще
            try {
                const testResponse = await fetch(`${API}/books/test`);
                console.log('[SEARCH] Test endpoint status:', testResponse.status);
                if (testResponse.ok) {
                    const testData = await testResponse.json();
                    console.log('[SEARCH] Test endpoint data:', testData);
                }
            } catch (testError) {
                console.error('[SEARCH] Test endpoint failed:', testError);
            }
            
            const response = await fetch(url);
            console.log('[SEARCH] Response status:', response.status);
            console.log('[SEARCH] Response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[SEARCH] Error response:', errorText);
                throw new Error(`Search failed: ${response.status} ${errorText}`);
            }
            
            const data = await response.json();
            console.log('[SEARCH] Response data:', data);
            console.log('[SEARCH] Data type:', typeof data);
            console.log('[SEARCH] Is array:', Array.isArray(data));
            if (Array.isArray(data) && data.length > 0) {
                console.log('[SEARCH] First item:', JSON.stringify(data[0], null, 2));
            }
            // API возвращает массив напрямую, не в объекте items
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Search error:', error);
            const tg = getTg();
            if (tg?.showAlert) {
                tg.showAlert('Ошибка поиска. Попробуйте еще раз.');
            }
            hapticError();
        } finally {
            setLoading(false);
        }
    };

    const addBook = async (item: SearchItem) => {
        try {
            console.log('[ADD_BOOK] Starting to add book:', item.title);
            console.log('[ADD_BOOK] Full item object:', JSON.stringify(item, null, 2));
            const token = await ensureAuth();
            console.log('[ADD_BOOK] Token received:', token ? 'yes' : 'no');
            if (!token) {
                throw new Error('Не удалось получить токен авторизации');
            }
            
            const candidateData = normalizeForCandidate(item);
            console.log('[ADD_BOOK] Candidate data:', candidateData);
            
            // Обернуть в объект с полем book, как ожидает бэкенд
            const requestBody = { book: candidateData };
            console.log('[ADD_BOOK] Request body:', requestBody);
            
            const response = await apiFetch(`${API}/candidates`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody),
                label: 'candidates.create'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to add book');
            }

            hapticSuccess();
            
            const tg = getTg();
            if (tg?.showAlert) {
                tg.showAlert('Книга добавлена! Перейдите в "Мои предложения" чтобы увидеть её.');
            }

            // Показать подсказку в MainButton
            if (tg?.MainButton) {
                tg.MainButton.setText?.('Перейти к "Мои предложения"');
                tg.MainButton.show?.();
                
                const handleMainButtonClick = () => {
                    if (typeof window !== 'undefined') {
                        window.location.href = '/my';
                    }
                };
                
                tg.MainButton.offClick?.(handleMainButtonClick);
                tg.MainButton.onClick?.(handleMainButtonClick);
                
                setTimeout(() => {
                    tg.MainButton?.hide?.();
                }, 5000);
            }

        } catch (error) {
            console.error('Add book error:', error);
            const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
            
            const tg = getTg();
            if (tg?.showAlert) {
                tg.showAlert(`Ошибка: ${message}`);
            }
            hapticError();
        }
    };

    if (!ready) {
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
            <AppBar title={t('search.title')} withBack />
            
            <main style={{
                padding: '16px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                {/* Поисковая форма */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            position: 'absolute',
                            left: '16px',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            pointerEvents: 'none',
                            zIndex: 1
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder={t('search.placeholder')}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px 48px 16px 48px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '16px',
                                fontSize: '16px',
                                background: '#ffffff',
                                color: '#1f2937',
                                transition: 'all 0.25s ease',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#f26419';
                                e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(242, 100, 25, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                            }}
                        />
                        {q && (
                            <button 
                                onClick={() => setQ('')}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#e5e7eb',
                                    border: 'none',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#d1d5db';
                                    e.currentTarget.style.color = '#374151';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#e5e7eb';
                                    e.currentTarget.style.color = '#6b7280';
                                }}
                                aria-label="Очистить"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* Результаты поиска */}
                <div>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    gap: '16px',
                                    padding: '20px',
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                }}>
                                    <div style={{
                                        width: '72px',
                                        height: '108px',
                                        background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 1.5s ease-in-out infinite',
                                        borderRadius: '8px',
                                        flexShrink: 0
                                    }} />
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{
                                            height: '20px',
                                            width: '80%',
                                            background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                                            backgroundSize: '200% 100%',
                                            animation: 'shimmer 1.5s ease-in-out infinite',
                                            borderRadius: '4px'
                                        }} />
                                        <div style={{
                                            height: '16px',
                                            width: '60%',
                                            background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                                            backgroundSize: '200% 100%',
                                            animation: 'shimmer 1.5s ease-in-out infinite',
                                            borderRadius: '4px'
                                        }} />
                                        <div style={{
                                            height: '32px',
                                            width: '120px',
                                            background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                                            backgroundSize: '200% 100%',
                                            animation: 'shimmer 1.5s ease-in-out infinite',
                                            borderRadius: '8px',
                                            marginTop: '8px'
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : items.length > 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            {items.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    gap: '16px',
                                    padding: '20px',
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.25s ease'
                                }} onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.borderColor = '#d1d5db';
                                }} onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                }}>
                                    <div style={{ flexShrink: 0 }}>
                                        <BookCover
                                            src={item.coverUrl || null}
                                            alt={item.title}
                                            width={72}
                                            height={108}
                                            fallbackText="📚"
                                        />
                                    </div>
                                    <div style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div>
                                            <h3 style={{
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: '#1f2937',
                                                lineHeight: '1.25',
                                                margin: '0 0 4px 0'
                                            }}>
                                                {item.title}
                                                {item.year && <span style={{
                                                    color: '#6b7280',
                                                    fontWeight: '400',
                                                    marginLeft: '8px'
                                                }}>({item.year})</span>}
                                            </h3>
                                            <p style={{
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                margin: '4px 0',
                                                lineHeight: '1.5'
                                            }}>
                                                {item.authors?.join(', ') || t('search.unknown_author')}
                                            </p>
                                            {(item.isbn13 || item.isbn10) && (
                                                <p style={{
                                                    fontSize: '12px',
                                                    color: '#9ca3af',
                                                    fontFamily: 'monospace',
                                                    letterSpacing: '0.5px',
                                                    margin: '4px 0 12px 0'
                                                }}>
                                                    {item.isbn13 || item.isbn10}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => addBook(item)}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                padding: '12px 20px',
                                                borderRadius: '12px',
                                                fontWeight: '500',
                                                fontSize: '14px',
                                                transition: 'all 0.25s ease',
                                                cursor: 'pointer',
                                                border: 'none',
                                                background: 'linear-gradient(135deg, #f26419 0%, #e34a0f 100%)',
                                                color: '#ffffff',
                                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                                alignSelf: 'flex-start'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, #e34a0f 0%, #bc350f 100%)';
                                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, #f26419 0%, #e34a0f 100%)';
                                                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <span>{t('search.add_button')}</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="12" y1="5" x2="12" y2="19"/>
                                                <line x1="5" y1="12" x2="19" y2="12"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : q && !loading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '48px 20px',
                            background: '#ffffff',
                            borderRadius: '16px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#1f2937',
                                margin: '0 0 12px 0'
                            }}>Ничего не найдено</h3>
                            <p style={{
                                fontSize: '16px',
                                color: '#6b7280',
                                lineHeight: '1.6',
                                margin: '0'
                            }}>
                                Попробуйте изменить поисковый запрос или проверьте правильность написания
                            </p>
                        </div>
                    ) : !q ? (
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
                            }}>Найдите свою следующую книгу</h3>
                            <p style={{
                                fontSize: '16px',
                                color: '#6b7280',
                                lineHeight: '1.6',
                                margin: '0 0 16px 0'
                            }}>
                                Введите название книги или имя автора для поиска
                            </p>
                            <button 
                                onClick={async () => {
                                    try {
                                        console.log('[TEST] Testing API connection...');
                                        const response = await fetch(`${API}/books/test`);
                                        console.log('[TEST] Status:', response.status);
                                        if (response.ok) {
                                            const data = await response.json();
                                            console.log('[TEST] Data:', data);
                                            alert(`API работает! Статус: ${response.status}, Сообщение: ${data.message}`);
                                        } else {
                                            alert(`API недоступен. Статус: ${response.status}`);
                                        }
                                    } catch (error) {
                                        console.error('[TEST] Error:', error);
                                        alert(`Ошибка соединения: ${error}`);
                                    }
                                }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#f26419',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
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
                                Тест API
                            </button>
                        </div>
                    ) : null}
                </div>
            </main>

            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}