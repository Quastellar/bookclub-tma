'use client';

import { useEffect, useState } from 'react';
import { normalizeForCandidate } from '@/lib/book';
import { tmaLogin, getUser, ensureAuth } from '@/lib/auth';
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
    return (window as unknown as { Telegram?: { WebApp?: TgWebApp } })?.Telegram?.WebApp;
}

const API = process.env.NEXT_PUBLIC_API_URL!;

type SearchItem = { 
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
            tg.BackButton?.onClick?.(() => window.history.back());
        }

        tmaLogin()
            .then(() => setReady(true))
            .catch(() => setReady(true));

        // Восстановить последний поисковый запрос
        const savedQuery = localStorage.getItem('lastSearchQuery');
        if (savedQuery) {
            setQ(savedQuery);
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
        if (q) {
            localStorage.setItem('lastSearchQuery', q);
        }
    }, [q]);

    const search = async (query: string) => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API}/books/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            
            const data = await response.json();
            setItems(data.items || []);
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
            await ensureAuth();
            
            const candidateData = normalizeForCandidate(item);
            
            const response = await apiFetch(`${API}/candidates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(candidateData),
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
                    window.location.href = '/my';
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
            <div className="loading-container">
                <div className="loading-spinner" />
                <p>Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="search-page">
            <AppBar title={t('search.title')} withBack />
            
            <main className="search-main">
                <div className="search-form">
                    <div className="search-input-container">
                        <div className="search-input-icon">
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
                            className="search-input"
                        />
                        {q && (
                            <button 
                                onClick={() => setQ('')}
                                className="search-clear-btn"
                                aria-label="Очистить"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="search-results">
                    {loading ? (
                        <BookListSkeleton count={5} />
                    ) : items.length > 0 ? (
                        <div className="search-results-list">
                            {items.map((item, i) => (
                                <div key={i} className="search-result-item">
                                    <div className="search-result-cover">
                                        <BookCover
                                            src={item.coverUrl || null}
                                            alt={item.title}
                                            width={72}
                                            height={108}
                                            fallbackText="📚"
                                        />
                                    </div>
                                    <div className="search-result-content">
                                        <div className="search-result-header">
                                            <h3 className="search-result-title">
                                                {item.title}
                                                {item.year && <span className="search-result-year">({item.year})</span>}
                                            </h3>
                                            <p className="search-result-authors">
                                                {item.authors?.join(', ') || t('search.unknown_author')}
                                            </p>
                                            {(item.isbn13 || item.isbn10) && (
                                                <p className="search-result-isbn">
                                                    {item.isbn13 || item.isbn10}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => addBook(item)}
                                            className="btn btn-primary search-add-btn"
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
                        <div className="search-empty">
                            <div className="search-empty-icon">🔍</div>
                            <h3 className="search-empty-title">Ничего не найдено</h3>
                            <p className="search-empty-text">
                                Попробуйте изменить поисковый запрос или проверьте правильность написания
                            </p>
                        </div>
                    ) : !q ? (
                        <div className="search-placeholder">
                            <div className="search-placeholder-icon">📖</div>
                            <h3 className="search-placeholder-title">Найдите свою следующую книгу</h3>
                            <p className="search-placeholder-text">
                                Введите название книги или имя автора для поиска
                            </p>
                        </div>
                    ) : null}
                </div>
            </main>

            <style jsx>{`
                .loading-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-lg);
                }

                .loading-spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid var(--neutral-200);
                    border-top: 3px solid var(--primary-500);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .search-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, var(--neutral-0) 0%, var(--neutral-50) 100%);
                    padding-bottom: 80px;
                }

                .search-main {
                    padding: var(--space-lg);
                    max-width: 600px;
                    margin: 0 auto;
                }

                .search-form {
                    margin-bottom: var(--space-xl);
                }

                .search-input-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-input-icon {
                    position: absolute;
                    left: var(--space-lg);
                    color: var(--neutral-500);
                    display: flex;
                    align-items: center;
                    pointer-events: none;
                    z-index: 1;
                }

                .search-input {
                    width: 100%;
                    padding: var(--space-lg) var(--space-4xl) var(--space-lg) 48px;
                    border: 1px solid var(--neutral-200);
                    border-radius: var(--radius-xl);
                    font-size: var(--text-base);
                    background: var(--neutral-0);
                    color: var(--neutral-800);
                    transition: all var(--duration-normal) var(--ease-in-out-smooth);
                    box-shadow: var(--shadow-xs);
                }

                .search-input:focus {
                    outline: none;
                    border-color: var(--primary-400);
                    box-shadow: var(--shadow-sm), 0 0 0 3px var(--primary-100);
                }

                .search-clear-btn {
                    position: absolute;
                    right: var(--space-md);
                    width: 32px;
                    height: 32px;
                    border-radius: var(--radius-full);
                    background: var(--neutral-200);
                    border: none;
                    color: var(--neutral-600);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all var(--duration-fast) var(--ease-in-out-smooth);
                }

                .search-clear-btn:hover {
                    background: var(--neutral-300);
                    color: var(--neutral-700);
                }

                .search-results-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-lg);
                }

                .search-result-item {
                    display: flex;
                    gap: var(--space-lg);
                    padding: var(--space-xl);
                    background: var(--neutral-0);
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--neutral-200);
                    box-shadow: var(--shadow-xs);
                    transition: all var(--duration-normal) var(--ease-in-out-smooth);
                    animation: slideIn var(--duration-normal) var(--ease-in-out-smooth);
                }

                .search-result-item:hover {
                    box-shadow: var(--shadow-md);
                    transform: translateY(-2px);
                    border-color: var(--neutral-300);
                }

                .search-result-cover {
                    flex-shrink: 0;
                }

                .search-result-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .search-result-header {
                    flex: 1;
                }

                .search-result-title {
                    font-size: var(--text-base);
                    font-weight: 600;
                    color: var(--neutral-900);
                    line-height: var(--line-height-tight);
                    margin: 0 0 var(--space-xs) 0;
                }

                .search-result-year {
                    color: var(--neutral-600);
                    font-weight: 400;
                    margin-left: var(--space-xs);
                }

                .search-result-authors {
                    font-size: var(--text-sm);
                    color: var(--neutral-600);
                    margin: var(--space-xs) 0;
                    line-height: var(--line-height-normal);
                }

                .search-result-isbn {
                    font-size: var(--text-xs);
                    color: var(--neutral-500);
                    font-family: monospace;
                    letter-spacing: 0.5px;
                    margin: var(--space-xs) 0 var(--space-md) 0;
                }

                .search-add-btn {
                    align-self: flex-start;
                    gap: var(--space-xs);
                }

                .search-empty,
                .search-placeholder {
                    text-align: center;
                    padding: var(--space-4xl) var(--space-xl);
                    background: var(--neutral-0);
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--neutral-200);
                    box-shadow: var(--shadow-xs);
                }

                .search-empty-icon,
                .search-placeholder-icon {
                    font-size: 3rem;
                    margin-bottom: var(--space-lg);
                }

                .search-empty-title,
                .search-placeholder-title {
                    font-size: var(--text-xl);
                    font-weight: 600;
                    color: var(--neutral-900);
                    margin: 0 0 var(--space-md) 0;
                }

                .search-empty-text,
                .search-placeholder-text {
                    font-size: var(--text-base);
                    color: var(--neutral-600);
                    line-height: var(--line-height-relaxed);
                    margin: 0;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 480px) {
                    .search-main {
                        padding: var(--space-md);
                    }

                    .search-result-item {
                        gap: var(--space-md);
                        padding: var(--space-lg);
                    }

                    .search-result-title {
                        font-size: var(--text-sm);
                    }

                    .search-empty,
                    .search-placeholder {
                        padding: var(--space-3xl) var(--space-lg);
                    }
                }
            `}</style>
        </div>
    );
}