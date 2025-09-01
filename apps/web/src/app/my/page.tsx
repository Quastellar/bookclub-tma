'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import BookCard from '../_components/BookCard';
import { authHeaders, getUser, tmaLogin, ensureAuth, getToken } from '@/lib/auth';
import { hapticError, hapticSuccess } from '@/lib/tg';
import { useI18n } from '../_i18n/I18nProvider';
import { apiFetch } from '@/lib/api';
import { useTelegramTheme } from '../_providers/TelegramThemeProvider';
import { useSharedState } from '../_providers/SharedStateProvider';
import { GlassHeader } from '../_components/GlassHeader';
import styles from './my-page.module.css';

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
    const { tg, isReady } = useTelegramTheme();
    const { state, updateCandidatesCache, isCacheValid } = useSharedState();
    const [items, setItems] = useState<CandidateDto[]>([]);
    const [loading, setLoading] = useState(true); // Начинаем с true
    const [error, setError] = useState<string | null>(null);
    const [me, setMe] = useState<import('@/lib/auth').TmaUser | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    const load = useCallback(async (forceRefresh = false) => {
        // Проверяем кэш (5 минут)
        if (!forceRefresh && isCacheValid('candidatesCache', 5 * 60 * 1000) && state.candidatesCache.data) {
            console.log('[MY] Using cached data');
            const currentUser = typeof window !== 'undefined' ? getUser() : null;
            if (currentUser) {
                const mine = (state.candidatesCache.data as CandidateDto[]).filter((c: CandidateDto) => {
                    const added = c?.AddedBy;
                    return added?.id === currentUser?.id || (added?.tgUserId && added?.tgUserId === currentUser?.tgUserId);
                });
                setItems(mine);
                setLoading(false); // Важно: убираем loading для кэшированных данных
                return;
            }
        }

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
                    setLoading(false);
                    return;
                }
                throw new Error(await res.text());
            }
            const data = await res.json();
            
            // Кэшируем все кандидаты
            updateCandidatesCache(data?.Candidates || []);
            
            // Получаем текущего пользователя в момент выполнения
            const currentUser = typeof window !== 'undefined' ? getUser() : null;
            if (!currentUser) {
                setItems([]);
                setLoading(false);
                return;
            }
            
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
    }, [isCacheValid, state.candidatesCache.data, updateCandidatesCache]);

    useEffect(() => {
        setIsClient(true);
        
        // Простая инициализация пользователя
        const initUser = async () => {
            try {
                const authData = await tmaLogin();
                setMe(authData.user || null);
            } catch (error) {
                // Безопасная инициализация пользователя на клиенте
                if (typeof window !== 'undefined') {
                    setMe(getUser());
                }
            } finally {
                setInitialized(true);
            }
        };
        
        initUser();
    }, []); // Только при монтировании

    // Загружаем данные когда компонент готов
    useEffect(() => {
        if (isClient && initialized) {
            load();
        }
    }, [isClient, initialized, load]);

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
             await load(true); // Принудительно обновляем после удаления
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
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner} />
                    <p className={styles.loadingText}>Загрузка...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
                         <GlassHeader title="Мои предложения" subtitle="Книги, которые вы предложили для чтения" />
            
            <div className="container">
                {loading ? (
                    <div className={`card-glass ${styles.loadingContainer}`}>
                        <div className={styles.loadingSpinner} />
                        <p className={styles.loadingText}>Загрузка ваших предложений...</p>
                    </div>
                ) : error ? (
                    <div className={`card-glass ${styles.errorContainer}`}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <h3 className={styles.errorTitle}>Ошибка загрузки</h3>
                        <p className={styles.errorText}>
                            {error}
                        </p>
                                                 <button
                             onClick={() => load()}
                             className={styles.viewButton}
                         >
                             Попробовать снова
                         </button>
                    </div>
                ) : items.length === 0 ? (
                                         <div className={`card-glass ${styles.emptyState}`}>
                        <div className={styles.emptyIcon}>📚</div>
                        <h3 className={styles.emptyTitle}>Пока нет предложений</h3>
                        <p className={styles.emptyText}>
                            Предложите первую книгу для обсуждения в клубе
                        </p>
                        <Link 
                            href="/search"
                            className={styles.viewButton}
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
                        <div className={`card-glass ${styles.headerCard}`}>
                            <h1 className={styles.headerTitle}>
                                Мои предложения
                            </h1>
                            <p className={styles.headerSubtitle}>
                                {items.length} {items.length === 1 ? 'книга' : items.length < 5 ? 'книги' : 'книг'}
                            </p>
                        </div>

                        {/* Список книг */}
                        <div className={styles.candidateList}>
                            {items.map((candidate) => (
                                <div 
                                    key={candidate.id}
                                    className={`card-glass ${styles.candidateCard}`}
                                >
                                    <BookCard
                                        title={candidate.Book?.titleNorm || 'Неизвестная книга'}
                                        authors={candidate.Book?.authorsNorm || []}
                                        coverUrl={candidate.Book?.coverUrl}
                                    />
                                    
                                                                         <div className={styles.deleteButtonContainer}>
                                        <button
                                            onClick={() => remove(candidate.id, candidate.Book?.titleNorm || 'книгу')}
                                            disabled={deleting === candidate.id}
                                            className={`${styles.deleteButton} ${deleting === candidate.id ? styles.deleteButtonDisabled : ''}`}
                                        >
                                                                                         {deleting === candidate.id ? (
                                                 <>
                                                     <div className={styles.deleteSpinner} />
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
                        <div className={styles.addMoreSection}>
                            <Link 
                                href="/search"
                                className={styles.viewButton}
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
            </div>


        </div>
    );
}