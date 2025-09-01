'use client';

import { useEffect, useState, useCallback } from 'react';
import { getUser, getToken, ensureAuth } from '@/lib/auth';
import { useI18n } from '../_i18n/I18nProvider';
import { apiFetch } from '@/lib/api';
import { useTelegramTheme } from '../_providers/TelegramThemeProvider';
import { useSharedState } from '../_providers/SharedStateProvider';
import { GlassHeader } from '../_components/GlassHeader';
import BookCard from '../_components/BookCard';
import styles from './iteration-page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL!;

type CandidateDto = {
    id: string;
    Book?: { 
        titleNorm?: string; 
        authorsNorm?: string[];
        year?: number;
        coverUrl?: string;
        isbn13?: string;
    };
    AddedBy?: { 
        id: string; 
        username?: string; 
        name?: string; 
        tgUserId?: string;
    };
    reason?: string;
};

type IterationDto = {
    id: string;
    name: string;
    status: 'PLANNED' | 'OPEN' | 'CLOSED';
    meetingDate?: string | null;
    closedAt?: string | null;
    Candidates?: CandidateDto[];
    voteCounts?: Record<string, number>;
    myVoteCandidateId?: string | null;
    winnerCandidateId?: string | null;
};

export default function IterationPage() {
    const { tg, isReady } = useTelegramTheme();
    const { state, updateIterationsCache, isCacheValid } = useSharedState();
    
    const [iter, setIter] = useState<IterationDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
    const [showThankYou, setShowThankYou] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Инициализация Telegram WebApp
    useEffect(() => {
        if (isReady && tg && isClient) {
            tg.ready();
            tg.expand();
            tg.BackButton?.hide();
        }
    }, [isReady, tg, isClient]);

    // Загрузка данных итерации
    const loadIteration = useCallback(async (forceRefresh = false) => {
        // Проверяем кэш (5 минут)
        if (!forceRefresh && isCacheValid('iterationsCache', 5 * 60 * 1000) && state.iterationsCache.current) {
            console.log('[ITERATION] Using cached data');
            setIter(state.iterationsCache.current as IterationDto);
            if (state.iterationsCache.current.myVoteCandidateId) {
                setSelectedCandidateIds(new Set([state.iterationsCache.current.myVoteCandidateId as string]));
            }
            setLoading(false);
            return;
        }

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
                throw new Error(`Ошибка загрузки: ${res.status}`);
            }
            
            const data = await res.json();
            setIter(data);
            
            // Кэшируем данные
            updateIterationsCache(data, 'current');
            
            // Если уже проголосовал, устанавливаем выбранную книгу
            if (data.myVoteCandidateId) {
                setSelectedCandidateIds(new Set([data.myVoteCandidateId]));
            }
            
        } catch (e) {
            console.error('[ITERATION] Load failed:', e);
            setError(e instanceof Error ? e.message : 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    }, [isCacheValid, updateIterationsCache]);

    useEffect(() => {
        if (isClient) {
            loadIteration();
        }
    }, [isClient, loadIteration]);

    // Функция голосования
    const submitVote = useCallback(async () => {
        if (selectedCandidateIds.size === 0 || !iter || voting) return;

        setVoting(true);
        
        try {
            const token = await ensureAuth();
            if (!token) {
                throw new Error('Требуется авторизация');
            }

            // Показать прогресс в MainButton
            if (tg?.MainButton) {
                tg.MainButton.showProgress();
            }

            // Haptic feedback
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }

            // Отправляем голоса за все выбранные книги
            const candidateIds = Array.from(selectedCandidateIds);
            
            // Пока API принимает только один голос, отправляем первый выбранный
            // TODO: В будущем можно обновить API для поддержки множественного голосования
            const res = await apiFetch(`${API}/votes`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ candidateId: candidateIds[0] }),
                label: 'votes.create'
            });

            if (!res.ok) {
                throw new Error('Не удалось проголосовать');
            }

            // Успешное голосование
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('success');
            }

            if (tg?.MainButton) {
                tg.MainButton.hideProgress();
                tg.MainButton.hide();
            }

            // Показать анимацию благодарности
            setShowThankYou(true);
            
            // Перезагрузить данные с принудительным обновлением
            setTimeout(() => {
                loadIteration(true);
                setShowThankYou(false);
            }, 2000);

        } catch (error) {
            console.error('[VOTING] Error:', error);
            
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('error');
            }

            if (tg?.MainButton) {
                tg.MainButton.hideProgress();
            }

            const msg = error instanceof Error ? error.message : 'Произошла ошибка';
            if (tg?.showAlert) {
                tg.showAlert(`Ошибка: ${msg}`);
            }
        } finally {
            setVoting(false);
        }
    }, [selectedCandidateIds, iter, voting, tg, loadIteration]);

    // Обновление MainButton
    useEffect(() => {
        if (!isReady || !tg || !isClient) return;

        const canVote = iter?.status === 'OPEN' && 
                       selectedCandidateIds.size > 0 && 
                       !iter?.myVoteCandidateId; // Нельзя голосовать повторно
        
        if (canVote) {
            const buttonText = selectedCandidateIds.size === 1 
                ? 'Проголосовать' 
                : `Проголосовать (${selectedCandidateIds.size})`;
            
            tg.MainButton.setText(buttonText);
            tg.MainButton.show();
            
            const handleVote = () => submitVote();
            tg.MainButton.onClick(handleVote);
            
            return () => {
                tg.MainButton.offClick(handleVote);
            };
        } else {
            tg.MainButton.hide();
        }
    }, [iter, selectedCandidateIds, isReady, tg, isClient, submitVote]);

    const getVotePercentage = (candidateId: string): number => {
        if (!iter?.voteCounts) return 0;
        
        const totalVotes = Object.values(iter.voteCounts).reduce((sum, count) => sum + count, 0);
        if (totalVotes === 0) return 0;
        
        const candidateVotes = iter.voteCounts[candidateId] || 0;
        return Math.round((candidateVotes / totalVotes) * 100);
    };

    const renderIterationStatus = () => {
        if (!iter) return null;

        const statusConfig = {
            PLANNED: { 
                emoji: '🟡', 
                text: 'Планируется', 
                color: 'var(--color-warning)', 
                bgColor: 'var(--color-warning-bg)' 
            },
            OPEN: { 
                emoji: '🟢', 
                text: 'Открыто голосование', 
                color: 'var(--color-success)', 
                bgColor: 'var(--color-success-bg)' 
            },
            CLOSED: { 
                emoji: '⚫', 
                text: 'Завершено', 
                color: 'var(--color-text-muted)', 
                bgColor: 'var(--color-bg-layer)' 
            },
        };

        const config = statusConfig[iter.status];

                 return (
             <div className={styles.iterationStatus} data-status={iter.status}>
                 <span className={styles.statusEmoji}>{config.emoji}</span>
                 <span className={styles.statusText}>
                     {config.text}
                 </span>
                 
                 {iter.meetingDate && (
                     <>
                         <span className={styles.statusSeparator}>•</span>
                         <span className={styles.meetingDate}>
                             {new Date(iter.meetingDate).toLocaleDateString('ru-RU', { timeZone: 'UTC' })}
                         </span>
                     </>
                 )}
             </div>
         );
    };

         const renderThankYou = () => (
         <div className={styles.thankYouOverlay}>
             <div className={styles.thankYouContent}>
                 <div className={styles.thankYouIcon}>
                     ✨
                 </div>
                 <h2 className={styles.thankYouTitle}>
                     Спасибо за голос!
                 </h2>
                 <p className={styles.thankYouText}>
                     Ваш выбор учтён
                 </p>
             </div>
         </div>
     );

         if (!isClient) {
         return (
             <div className={styles.pageContainer}>
                 <div className={`skeleton ${styles.skeletonHeader}`} />
             </div>
         );
     }

         if (loading) {
         return (
             <div className={styles.pageContainer}>
                 <GlassHeader title="Голосование" />
                 <div className="container">
                     <div className={`skeleton ${styles.skeletonStatus}`} />
                     <div className={styles.skeletonList}>
                         {Array.from({ length: 3 }).map((_, i) => (
                             <div key={i} className={`skeleton ${styles.skeletonCard}`} />
                         ))}
                     </div>
                 </div>
             </div>
         );
     }

         if (error) {
         return (
             <div className={styles.pageContainer}>
                 <GlassHeader title="Голосование" />
                 <div className="container">
                     <div className={styles.errorContainer}>
                         <div className={styles.errorIcon}>⚠️</div>
                         <h3 className={styles.errorTitle}>
                             Ошибка загрузки
                         </h3>
                         <p className={styles.errorText}>
                             {error}
                         </p>
                         <button className="btn btn-primary" onClick={() => loadIteration()}>
                             Попробовать снова
                         </button>
                     </div>
                 </div>
             </div>
         );
     }

         if (!iter) {
         return (
             <div className={styles.pageContainer}>
                 <GlassHeader title="Голосование" />
                 <div className="container">
                     <div className={styles.emptyState}>
                         <div className={styles.emptyIcon}>📚</div>
                         <h3 className={styles.emptyTitle}>
                             Нет активной итерации
                         </h3>
                         <p className={styles.emptyText}>
                             В настоящее время нет открытых итераций для голосования. 
                             Следите за анонсами в канале!
                         </p>
                     </div>
                 </div>
             </div>
         );
     }

    // Получаем ID текущего пользователя
    const currentUser = isClient ? getUser() : null;
    const currentUserId = currentUser?.id;
    
    // Фильтруем кандидатов - убираем книги, добавленные текущим пользователем
    const candidates = (iter.Candidates || []).filter(candidate => 
        candidate.AddedBy?.id !== currentUserId
    );
    const totalVotes = Object.values(iter.voteCounts || {}).reduce((sum, count) => sum + count, 0);

         return (
         <div className={styles.pageContainer}>
            {showThankYou && renderThankYou()}
            
            <GlassHeader 
                title={iter.name}
                subtitle={`${candidates.length} ${candidates.length === 1 ? 'книга' : candidates.length < 5 ? 'книги' : 'книг'} • ${totalVotes} ${totalVotes === 1 ? 'голос' : totalVotes < 5 ? 'голоса' : 'голосов'}`}
            />
            
            <div className="container">
                {renderIterationStatus()}

                                 {/* Voting Instructions */}
                 {iter.status === 'OPEN' && (
                     <div className={styles.votingInstructions}>
                         <h3 className={styles.votingTitle}>
                             🗳️ Выберите книгу для чтения
                         </h3>
                         <p className={styles.votingText}>
                             Нажмите на карточку книги, которую хотите прочитать, и подтвердите выбор
                         </p>
                     </div>
                 )}

                {/* Candidates List */}
                                 <div className={`stagger-children ${styles.candidatesList}`}>
                    {candidates.map((candidate, index) => {
                        const isSelected = selectedCandidateIds.has(candidate.id);
                        const isMyVote = iter.myVoteCandidateId === candidate.id;
                        const voteCount = iter.voteCounts?.[candidate.id] || 0;
                        const percentage = getVotePercentage(candidate.id);
                        const isWinner = iter.status === 'CLOSED' && iter.winnerCandidateId === candidate.id;

                        return (
                                                         <div
                                 key={candidate.id}
                                 className={styles.candidateItem}
                                 style={{ animationDelay: `${index * 30}ms` }}
                             >
                                <BookCard
                                    title={candidate.Book?.titleNorm || 'Неизвестная книга'}
                                    authors={candidate.Book?.authorsNorm || ['Неизвестный автор']}
                                    year={candidate.Book?.year}
                                    coverUrl={candidate.Book?.coverUrl}
                                    variant="voting"
                                    isSelected={isSelected || isMyVote}
                                    isInteractive={iter.status === 'OPEN'}
                                    onClick={iter.status === 'OPEN' && !iter.myVoteCandidateId ? () => {
                                        setSelectedCandidateIds(prev => {
                                            const newSet = new Set(prev);
                                            if (newSet.has(candidate.id)) {
                                                newSet.delete(candidate.id);
                                            } else {
                                                // Пока ограничиваем выбор одной книгой
                                                // TODO: В будущем можно разрешить множественный выбор
                                                return new Set([candidate.id]);
                                            }
                                            return newSet;
                                        });
                                    } : undefined}
                                    badges={[
                                        ...(isMyVote ? ['Ваш голос'] : []),
                                        ...(isWinner ? ['🏆 Победитель'] : []),
                                    ]}
                                                                         footer={
                                         <div className={styles.cardFooter}>
                                             {/* Vote progress bar */}
                                             {(iter.status === 'CLOSED' || voteCount > 0) && (
                                                 <div className={styles.voteProgress}>
                                                     <span className={styles.voteCount}>
                                                         {voteCount} {voteCount === 1 ? 'голос' : voteCount < 5 ? 'голоса' : 'голосов'}
                                                     </span>
                                                     <span className={styles.votePercentage}>
                                                         {percentage}%
                                                     </span>
                                                 </div>
                                             )}
                                             
                                             {(iter.status === 'CLOSED' || voteCount > 0) && (
                                                 <div className={styles.progressBar}>
                                                     <div 
                                                         className={`${styles.progressFill} ${isWinner ? styles.winnerProgress : ''}`}
                                                         style={{ width: `${percentage}%` }}
                                                     />
                                                 </div>
                                             )}

                                             {/* Added by info */}
                                             {candidate.AddedBy && (
                                                 <div className={styles.addedByInfo}>
                                                     <span className={styles.addedByLabel}>
                                                         Предложил:
                                                     </span>
                                                     <span className={styles.addedByName}>
                                                         {candidate.AddedBy.name || candidate.AddedBy.username || 'Аноним'}
                                                     </span>
                                                 </div>
                                             )}
                                         </div>
                                     }
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}