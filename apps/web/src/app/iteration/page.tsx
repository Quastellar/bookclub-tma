'use client';

import { useEffect, useState, useCallback } from 'react';
import { getUser, getToken, ensureAuth } from '@/lib/auth';
import { useI18n } from '../_i18n/I18nProvider';
import { apiFetch } from '@/lib/api';
import { useTelegramTheme } from '../_providers/TelegramThemeProvider';
import { GlassHeader } from '../_components/GlassHeader';
import { BurgerMenu } from '../_components/BurgerMenu';
import BookCard from '../_components/BookCard';

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
    const loadIteration = useCallback(async () => {
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
    }, []);

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
            
            // Перезагрузить данные
            setTimeout(() => {
                loadIteration();
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
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-s)',
                padding: 'var(--space-s) var(--space-m)',
                background: config.bgColor,
                borderRadius: 'var(--radius-button)',
                border: `1px solid ${config.color}`,
                marginBottom: 'var(--space-l)',
            }}>
                <span style={{ fontSize: '1.2em' }}>{config.emoji}</span>
                <span style={{
                    fontSize: 'var(--font-size-body)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: config.color,
                }}>
                    {config.text}
                </span>
                
                {iter.meetingDate && (
                    <>
                        <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                        <span style={{
                            fontSize: 'var(--font-size-body)',
                            color: 'var(--color-text-secondary)',
                        }}>
                            {new Date(iter.meetingDate).toLocaleDateString('ru-RU', { timeZone: 'UTC' })}
                        </span>
                    </>
                )}
            </div>
        );
    };

    const renderThankYou = () => (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(247, 243, 234, 0.95)',
                backdropFilter: 'blur(24px)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-l)',
                animation: 'fadeIn var(--duration-slow) var(--ease-out)',
            }}
        >
            <div style={{
                textAlign: 'center',
                animation: 'scaleIn var(--duration-normal) var(--ease-out-back)',
            }}>
                <div style={{ 
                    fontSize: '4rem', 
                    marginBottom: 'var(--space-l)',
                    animation: 'spring var(--duration-slow) var(--ease-out-back)',
                }}>
                    ✨
                </div>
                <h2 style={{
                    fontSize: 'var(--font-size-title)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    margin: '0 0 var(--space-s) 0',
                }}>
                    Спасибо за голос!
                </h2>
                <p style={{
                    fontSize: 'var(--font-size-body)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                }}>
                    Ваш выбор учтён
                </p>
            </div>
        </div>
    );

    if (!isClient) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
                <div className="skeleton" style={{ height: '100px', margin: 'var(--space-m)' }} />
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
                <GlassHeader title="Голосование" action={<BurgerMenu />} />
                <div className="container">
                    <div className="skeleton" style={{ height: '60px', marginBottom: 'var(--space-l)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-m)' }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: '150px' }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
                <GlassHeader title="Голосование" action={<BurgerMenu />} />
                <div className="container">
                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-2xl)',
                        background: 'var(--color-error-bg)',
                        borderRadius: 'var(--radius-large)',
                        border: '1px solid var(--color-error)',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-m)' }}>⚠️</div>
                        <h3 style={{ 
                            color: 'var(--color-error)', 
                            marginBottom: 'var(--space-s)' 
                        }}>
                            Ошибка загрузки
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-l)' }}>
                            {error}
                        </p>
                        <button className="btn btn-primary" onClick={loadIteration}>
                            Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!iter) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
                <GlassHeader title="Голосование" action={<BurgerMenu />} />
                <div className="container">
                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-2xl)',
                        background: 'var(--card-gradient)',
                        borderRadius: 'var(--radius-large)',
                        border: '1px solid var(--color-border-subtle)',
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-l)' }}>📚</div>
                        <h3 style={{ 
                            fontSize: 'var(--font-size-h1)',
                            color: 'var(--color-text-primary)', 
                            marginBottom: 'var(--space-s)' 
                        }}>
                            Нет активной итерации
                        </h3>
                        <p style={{ 
                            color: 'var(--color-text-secondary)', 
                            marginBottom: 'var(--space-l)',
                            lineHeight: 'var(--line-height-relaxed)',
                        }}>
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
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg-base)',
            paddingBottom: '100px',
        }}>
            {showThankYou && renderThankYou()}
            
            <GlassHeader 
                title={iter.name}
                subtitle={`${candidates.length} ${candidates.length === 1 ? 'книга' : candidates.length < 5 ? 'книги' : 'книг'} • ${totalVotes} ${totalVotes === 1 ? 'голос' : totalVotes < 5 ? 'голоса' : 'голосов'}`}
                action={<BurgerMenu />}
            />
            
            <div className="container">
                {renderIterationStatus()}

                {/* Voting Instructions */}
                {iter.status === 'OPEN' && (
                    <div style={{
                        padding: 'var(--space-m)',
                        background: 'linear-gradient(135deg, rgba(126,200,165,0.1), rgba(240,179,90,0.05))',
                        borderRadius: 'var(--radius-card)',
                        border: '1px solid rgba(126,200,165,0.2)',
                        marginBottom: 'var(--space-l)',
                    }}>
                        <h3 style={{
                            fontSize: 'var(--font-size-h2)',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-text-primary)',
                            margin: '0 0 var(--space-xs) 0',
                        }}>
                            🗳️ Выберите книгу для чтения
                        </h3>
                        <p style={{
                            fontSize: 'var(--font-size-body)',
                            color: 'var(--color-text-secondary)',
                            margin: 0,
                            lineHeight: 'var(--line-height-relaxed)',
                        }}>
                            Нажмите на карточку книги, которую хотите прочитать, и подтвердите выбор
                        </p>
                    </div>
                )}

                {/* Candidates List */}
                <div 
                    className="stagger-children"
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 'var(--space-m)' 
                    }}
                >
                    {candidates.map((candidate, index) => {
                        const isSelected = selectedCandidateIds.has(candidate.id);
                        const isMyVote = iter.myVoteCandidateId === candidate.id;
                        const voteCount = iter.voteCounts?.[candidate.id] || 0;
                        const percentage = getVotePercentage(candidate.id);
                        const isWinner = iter.status === 'CLOSED' && iter.winnerCandidateId === candidate.id;

                        return (
                            <div
                                key={candidate.id}
                                style={{
                                    position: 'relative',
                                    animationDelay: `${index * 30}ms`,
                                }}
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
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                                            {/* Vote progress bar */}
                                            {(iter.status === 'CLOSED' || voteCount > 0) && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 'var(--space-xs)',
                                                }}>
                                                    <span style={{
                                                        fontSize: 'var(--font-size-caption)',
                                                        color: 'var(--color-text-secondary)',
                                                    }}>
                                                        {voteCount} {voteCount === 1 ? 'голос' : voteCount < 5 ? 'голоса' : 'голосов'}
                                                    </span>
                                                    <span style={{
                                                        fontSize: 'var(--font-size-caption)',
                                                        fontWeight: 'var(--font-weight-semibold)',
                                                        color: 'var(--color-accent-warm)',
                                                    }}>
                                                        {percentage}%
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {(iter.status === 'CLOSED' || voteCount > 0) && (
                                                <div style={{
                                                    height: '6px',
                                                    background: 'var(--color-bg-layer)',
                                                    borderRadius: '3px',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${percentage}%`,
                                                        background: isWinner 
                                                            ? 'linear-gradient(90deg, var(--color-accent-warm), var(--color-accent-fresh))'
                                                            : 'var(--color-accent-warm)',
                                                        borderRadius: '3px',
                                                        transition: 'width var(--duration-slow) var(--ease-out)',
                                                    }} />
                                                </div>
                                            )}

                                            {/* Added by info */}
                                            {candidate.AddedBy && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--space-xs)',
                                                    paddingTop: 'var(--space-xs)',
                                                    borderTop: '1px solid var(--color-border-soft)',
                                                }}>
                                                    <span style={{
                                                        fontSize: 'var(--font-size-caption)',
                                                        color: 'var(--color-text-muted)',
                                                    }}>
                                                        Предложил:
                                                    </span>
                                                    <span style={{
                                                        fontSize: 'var(--font-size-caption)',
                                                        color: 'var(--color-text-secondary)',
                                                        fontWeight: 'var(--font-weight-medium)',
                                                    }}>
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