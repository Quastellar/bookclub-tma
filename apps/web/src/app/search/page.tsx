'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { normalizeForCandidate } from '@/lib/book';
import { ensureAuth } from '@/lib/auth';
import { useI18n } from '../_i18n/I18nProvider';
import { apiFetch } from '@/lib/api';
import { useTelegramTheme } from '../_providers/TelegramThemeProvider';
import { GlassHeader } from '../_components/GlassHeader';
import BookCard from '../_components/BookCard';
import { FilterChips } from '../_components/FilterChips';

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

const MOCK_GENRES = [
    { id: 'fiction', label: 'Художественная литература', count: 245 },
    { id: 'non-fiction', label: 'Нон-фикшн', count: 128 },
    { id: 'sci-fi', label: 'Фантастика', count: 89 },
    { id: 'mystery', label: 'Детективы', count: 67 },
    { id: 'biography', label: 'Биографии', count: 45 },
    { id: 'history', label: 'История', count: 78 },
    { id: 'psychology', label: 'Психология', count: 56 },
    { id: 'business', label: 'Бизнес', count: 92 },
];

export default function SearchPage() {
    const { t } = useI18n();
    const { tg, isReady } = useTelegramTheme();
    
    const [q, setQ] = useState('');
    const [items, setItems] = useState<SearchItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Восстановление последнего поискового запроса
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedQuery = localStorage.getItem('lastSearchQuery');
            if (savedQuery) {
                setQ(savedQuery);
            }
        }
    }, []);

    // Инициализация Telegram WebApp
    useEffect(() => {
        if (isReady && tg) {
            tg.ready();
            tg.expand();
            
            // Скрыть BackButton
            tg.BackButton?.hide();
        }
    }, [isReady, tg]);

    // Дебаунсинг поиска
    useEffect(() => {
        if (!q.trim()) {
            setItems([]);
            setHasSearched(false);
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

    const search = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) return;

        setLoading(true);
        setHasSearched(true);

        try {
            const url = `${API}/books/search?q=${encodeURIComponent(query)}`;
            console.log('[SEARCH] Searching for:', query);
            
            const response = await apiFetch(url, { label: 'books.search' });
            
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('[SEARCH] Response data:', data);
            
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('[SEARCH] Error:', error);
            setItems([]);
            
            // Показать ошибку через Telegram
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('error');
            }
        } finally {
            setLoading(false);
        }
    }, [tg]);

    const addBook = useCallback(async (item: SearchItem) => {
        try {
            console.log('[ADD_BOOK] Starting to add book:', item.title);
            
            const token = await ensureAuth();
            if (!token) {
                throw new Error('Не удалось получить токен авторизации');
            }

            const candidateData = normalizeForCandidate(item);
            const requestBody = { book: candidateData };
            
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

            // Haptic feedback для успеха
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('success');
            }
            
            // Показать уведомление
            if (tg?.showAlert) {
                tg.showAlert('Книга добавлена! Перейдите в "Мои предложения" чтобы увидеть её.');
            }

            // Показать подсказку в MainButton
            if (tg?.MainButton) {
                tg.MainButton.setText('Перейти к "Мои предложения"');
                tg.MainButton.show();
                
                const goToMyProposals = () => {
                    if (typeof window !== 'undefined') {
                        window.location.href = '/my';
                    }
                };
                
                tg.MainButton.onClick(goToMyProposals);
                
                // Скрыть кнопку через 5 секунд
                setTimeout(() => {
                    tg.MainButton?.hide();
                    tg.MainButton?.offClick(goToMyProposals);
                }, 5000);
            }

        } catch (error) {
            console.error('[ADD_BOOK] Error:', error);
            
            // Haptic feedback для ошибки
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('error');
            }
            
            const msg = error instanceof Error ? error.message : 'Произошла ошибка';
            
            if (tg?.showAlert) {
                tg.showAlert(`Ошибка: ${msg}`);
            }
        }
    }, [tg]);

    const clearSearch = useCallback(() => {
        setQ('');
        setItems([]);
        setHasSearched(false);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('lastSearchQuery');
        }
    }, []);

    const filteredItems = useMemo(() => {
        if (selectedGenres.length === 0) return items;
        
        // В реальном приложении здесь была бы фильтрация по жанрам
        // Пока возвращаем все элементы
        return items;
    }, [items, selectedGenres]);

    const renderEmptyState = () => {
        if (loading) return null;
        
        if (!hasSearched) {
            return (
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-2xl) var(--space-m)',
                    background: 'var(--card-gradient)',
                    borderRadius: 'var(--radius-large)',
                    border: '1px solid var(--color-border-subtle)',
                    backdropFilter: 'blur(12px)',
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--space-m)' }}>📚</div>
                    <h3 style={{
                        fontSize: 'var(--font-size-h1)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        margin: '0 0 var(--space-s) 0',
                    }}>
                        Найдите свою следующую книгу
                    </h3>
                    <p style={{
                        fontSize: 'var(--font-size-body)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 'var(--line-height-relaxed)',
                        margin: '0 0 var(--space-l) 0',
                    }}>
                        Введите название книги или имя автора для поиска в библиотеке Google Books
                    </p>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => setQ('Харари')}
                        style={{ fontSize: 'var(--font-size-body)' }}
                    >
                        🔥 Популярные сейчас
                    </button>
                </div>
            );
        }

        if (hasSearched && filteredItems.length === 0 && !loading) {
            return (
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-2xl) var(--space-m)',
                    background: 'var(--card-gradient)',
                    borderRadius: 'var(--radius-large)',
                    border: '1px solid var(--color-border-subtle)',
                    backdropFilter: 'blur(12px)',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-m)' }}>🔍</div>
                    <h3 style={{
                        fontSize: 'var(--font-size-h1)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        margin: '0 0 var(--space-s) 0',
                    }}>
                        Ничего не найдено
                    </h3>
                    <p style={{
                        fontSize: 'var(--font-size-body)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 'var(--line-height-relaxed)',
                        margin: '0 0 var(--space-l) 0',
                    }}>
                        Попробуйте изменить поисковый запрос или проверьте правильность написания
                    </p>
                    <button 
                        className="btn btn-ghost"
                        onClick={clearSearch}
                    >
                        Очистить поиск
                    </button>
                </div>
            );
        }

        return null;
    };

    const renderSearchResults = () => {
        if (loading) {
            return (
                <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-s)' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: '128px', borderRadius: 'var(--radius-card)' }} />
                    ))}
                </div>
            );
        }

        if (filteredItems.length === 0) {
            return renderEmptyState();
        }

        return (
            <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-s)' }}>
                {filteredItems.map((item, index) => (
                    <BookCard
                        key={`${item.sourceId || item.title}-${index}`}
                        title={item.title}
                        authors={item.authors}
                        year={item.year}
                        coverUrl={item.coverUrl}
                        onClick={() => addBook(item)}
                        isInteractive
                        footer={
                            <button 
                                className="btn btn-primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addBook(item);
                                }}
                                style={{ width: '100%' }}
                            >
                                {t('search.add_button')}
                            </button>
                        }
                    />
                ))}
            </div>
        );
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg-base)',
            paddingBottom: '80px',
        }}>
            <GlassHeader 
                title="Поиск книг"
                subtitle="Найдите книгу для следующего чтения"
                showBack
            />
            
            <div className="container">
                {/* Search Input */}
                <div style={{ marginBottom: 'var(--space-l)' }}>
                    <div 
                        className="input-group"
                        style={{
                            position: 'relative',
                            background: 'var(--color-bg-glass)',
                            backdropFilter: 'blur(24px)',
                            borderRadius: 'var(--radius-button)',
                            border: `2px solid ${isInputFocused ? 'var(--color-accent-warm)' : 'var(--color-border-subtle)'}`,
                            boxShadow: isInputFocused ? '0 0 0 4px rgba(240,179,90,0.1)' : 'var(--shadow-soft)',
                            transition: 'all var(--duration-fast) var(--ease-out)',
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            left: 'var(--space-m)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)',
                            pointerEvents: 'none',
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                        </div>
                        
                        <input
                            type="text"
                            placeholder="Введите название книги или автора"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            style={{
                                width: '100%',
                                minHeight: 'var(--touch-target-min)',
                                padding: 'var(--space-s) var(--space-2xl) var(--space-s) 3.5rem',
                                background: 'transparent',
                                border: 'none',
                                fontSize: 'var(--font-size-body)',
                                color: 'var(--color-text-primary)',
                                borderRadius: 'var(--radius-button)',
                            }}
                        />
                        
                        {q && (
                            <button 
                                onClick={clearSearch}
                                style={{
                                    position: 'absolute',
                                    right: 'var(--space-s)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--color-text-muted)',
                                    color: 'var(--color-bg-base)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all var(--duration-fast) var(--ease-out)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--color-text-secondary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'var(--color-text-muted)';
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Chips */}
                {hasSearched && (
                    <div style={{ marginBottom: 'var(--space-l)' }}>
                        <FilterChips
                            filters={MOCK_GENRES}
                            selectedFilters={selectedGenres}
                            onFilterChange={setSelectedGenres}
                        />
                    </div>
                )}

                {/* Results */}
                <div style={{ position: 'relative' }}>
                    {renderSearchResults()}
                </div>
            </div>
        </div>
    );
}