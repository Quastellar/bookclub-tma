'use client';

import { useEffect, useState } from 'react';
import BookCard from '../_components/BookCard';
import { useI18n } from '../_i18n/I18nProvider';
import { useTelegramTheme } from '../_providers/TelegramThemeProvider';
import { GlassHeader } from '../_components/GlassHeader';
import styles from './history-page.module.css';

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
        <div className={styles.pageContainer}>
            <GlassHeader title="История итераций" subtitle="Завершенные итерации книжного клуба" />
            
            <div className="container">
                {loading ? (
                    <div className={`card-glass ${styles.loadingContainer}`}>
                        <div className={styles.loadingSpinner} />
                        <p className={styles.loadingText}>Загрузка истории...</p>
                    </div>
                ) : error ? (
                    <div className={`card-glass ${styles.errorContainer}`}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <h3 className={styles.errorTitle}>Ошибка загрузки</h3>
                        <p className={styles.errorText}>
                            {error}
                        </p>
                        <button
                            onClick={retry}
                            className={styles.retryButton}
                        >
                            Попробовать снова
                        </button>
                    </div>
                ) : items.length === 0 ? (
                    <div className={`card-glass ${styles.emptyState}`}>
                        <div className={styles.emptyIcon}>📖</div>
                        <h3 className={styles.emptyTitle}>Пока нет истории</h3>
                        <p className={styles.emptyText}>
                            Завершенные итерации книжного клуба появятся здесь
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* Заголовок */}
                        <div className={`card-glass ${styles.headerCard}`}>
                            <h1 className={styles.headerTitle}>
                                История клуба
                            </h1>
                            <p className={styles.headerSubtitle}>
                                {items.length} завершенная {items.length === 1 ? 'итерация' : items.length < 5 ? 'итерации' : 'итераций'}
                            </p>
                        </div>

                        {/* Список итераций */}
                        <div className={styles.candidatesList}>
                            {items.map((iteration) => {
                                const winnerId = iteration.winnerCandidateId;
                                const winner = winnerId ? (iteration.Candidates || []).find((c) => c.id === winnerId) : null;
                                const votes = winnerId && iteration.voteCounts ? (iteration.voteCounts[winnerId] ?? 0) : 0;
                                
                                return (
                                    <div 
                                        key={iteration.id}
                                        className={`card-glass ${styles.iterationCard}`}
                                    >
                                        {/* Заголовок итерации */}
                                        <div className={styles.iterationHeader}>
                                            <div>
                                                <h3 className={styles.iterationTitle}>
                                                    {iteration.name}
                                                </h3>
                                                <p className={styles.detailValue}>
                                                    Завершена: {formatDate(iteration.closedAt)}
                                                </p>
                                            </div>
                                            <div className={styles.iterationStatus}>
                                                ✅ Завершена
                                            </div>
                                        </div>

                                        {/* Победитель */}
                                        <div className={styles.candidateItem}>
                                            {winner ? (
                                                <div>
                                                    <div className={styles.candidateVotes}>
                                                        <div className={styles.winnerBadge}>
                                                            🏆 Победитель
                                                        </div>
                                                        <div className={styles.statValue}>
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
                                                 <div className={styles.emptyStateSmall}>
                                                     <div className={styles.emptyIconSmall}>🤷‍♂️</div>
                                                     <p className={styles.emptyTitleSmall}>
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
            </div>


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