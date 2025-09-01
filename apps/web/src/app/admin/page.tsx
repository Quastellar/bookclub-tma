'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '../_i18n/I18nProvider';
import { ensureAuth, getUser } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import { hapticError, hapticSuccess } from '@/lib/tg';
import { useTelegramTheme } from '../_providers/TelegramThemeProvider';
import { GlassHeader } from '../_components/GlassHeader';
import styles from './admin-page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL!;

type Iteration = {
    id: string;
    name: string;
    status: 'PLANNED' | 'OPEN' | 'CLOSED';
    meetingDate?: string | null;
    openedAt?: string | null;
    closedAt?: string | null;
    Candidates?: Array<{ id: string; Book?: { titleNorm?: string; authorsNorm?: string[] } }>;
};

export default function AdminPage() {
    const { t } = useI18n();
    const { tg, isReady } = useTelegramTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentIter, setCurrentIter] = useState<Iteration | null>(null);
    const [newIterName, setNewIterName] = useState('');
    const [newDeadline, setNewDeadline] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const user = isClient ? getUser() : null;

    // Проверяем права админа
    const isAdmin = user?.roles?.includes('admin') ?? false;

    useEffect(() => {
        setIsClient(true);
    }, []);

    const loadCurrent = async () => {
        try {
            const token = await ensureAuth();
            if (!token) {
                setCurrentIter(null);
                return;
            }
            
            const res = await apiFetch(`${API}/iterations/current/admin`, { 
                headers: { Authorization: `Bearer ${token}` },
                label: 'admin.current' 
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentIter(data);
                console.log('[ADMIN] Loaded current iteration:', data);
            } else {
                setCurrentIter(null);
            }
        } catch (e) {
            console.error('[ADMIN] Error loading current iteration:', e);
            setCurrentIter(null);
        }
    };

    useEffect(() => {
        if (isClient) {
            loadCurrent();
        }
    }, [isClient]);

    const createIteration = async () => {
        if (!newIterName.trim()) {
            hapticError();
            alert('Введите название итерации');
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const token = await ensureAuth();
            if (!token) throw new Error('Не авторизован');

            const res = await apiFetch(`${API}/iterations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ 
                    name: newIterName.trim(),
                    meetingDate: newDeadline ? newDeadline : undefined 
                }),
                label: 'admin.create'
            });

            if (!res.ok) throw new Error(await res.text());
            
            hapticSuccess();
            setNewIterName('');
            setNewDeadline('');
            await loadCurrent();
        } catch (e) {
            hapticError();
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const openIteration = async (id: string) => {
        const confirmed = window.confirm('Открыть итерацию для голосования?');
        if (!confirmed) return;
        
        setActionLoading('open');
        try {
            const token = await ensureAuth();
            if (!token) throw new Error('Не авторизован');

            const res = await apiFetch(`${API}/iterations/${id}/open`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                label: 'admin.open'
            });

            if (!res.ok) throw new Error(await res.text());
            
            hapticSuccess();
            await loadCurrent();
        } catch (e) {
            hapticError();
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        } finally {
            setActionLoading(null);
        }
    };

    const closeIteration = async (id: string) => {
        const confirmed = window.confirm('Закрыть итерацию и объявить результаты?');
        if (!confirmed) return;
        
        setActionLoading('close');
        try {
            const token = await ensureAuth();
            if (!token) throw new Error('Не авторизован');

            const res = await apiFetch(`${API}/iterations/${id}/close`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                label: 'admin.close'
            });

            if (!res.ok) throw new Error(await res.text());
            
            hapticSuccess();
            alert('Итерация закрыта! Результаты отправлены в канал.');
            await loadCurrent();
        } catch (e) {
            hapticError();
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        } finally {
            setActionLoading(null);
        }
    };

    const setDeadline = async (id: string) => {
        if (!newDeadline) {
            hapticError();
            alert('Выберите дату и время');
            return;
        }
        
        setActionLoading('deadline');
        try {
            const token = await ensureAuth();
            if (!token) throw new Error('Не авторизован');

            const res = await apiFetch(`${API}/iterations/${id}/deadline`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ meetingDate: newDeadline }),
                label: 'admin.deadline'
            });

            if (!res.ok) throw new Error(await res.text());
            
            hapticSuccess();
            setNewDeadline('');
            await loadCurrent();
        } catch (e) {
            hapticError();
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        } finally {
            setActionLoading(null);
        }
    };

    if (!isClient) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner} />
                    <p className={styles.loadingText}>Загрузка...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className={styles.pageContainer}>
                <GlassHeader title="Администрирование" subtitle="Управление итерациями книжного клуба" />
                
                <div className="container">
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIcon}>🔒</div>
                        <h3 className={styles.errorTitle}>Доступ запрещён</h3>
                        <p className={styles.errorText}>
                            Требуются права администратора
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <GlassHeader title="Администрирование" subtitle="Управление итерациями книжного клуба" />
            
            <div className="container">
                {/* Ошибки */}
                {error && (
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <h3 className={styles.errorTitle}>Ошибка</h3>
                        <p className={styles.errorText}>{error}</p>
                    </div>
                )}

                {/* Заголовок */}
                <div className={`card-glass ${styles.headerCard}`}>
                    <h1 className={styles.headerTitle}>
                        ⚙️ Панель администратора
                    </h1>
                    <p className={styles.headerSubtitle}>
                        Управление итерациями книжного клуба
                    </p>
                </div>

                {/* Текущая итерация */}
                <div className={`card-glass ${styles.currentIterationCard}`}>
                    <h2 className={styles.currentIterationTitle}>
                        Текущая итерация
                    </h2>

                    {currentIter ? (
                        <div>
                            {/* Информация об итерации */}
                            <div className={styles.iterationInfo}>
                                <h3 className={styles.currentIterationTitle}>
                                    {currentIter.name}
                                </h3>
                                
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Статус:</span>
                                    <span className={`${styles.statusIndicator} ${styles.statusIndicator[currentIter.status.toLowerCase() as keyof typeof styles.statusIndicator]}`}>
                                        {currentIter.status === 'OPEN' ? '🟢 Открыта' : 
                                         currentIter.status === 'CLOSED' ? '⚫ Закрыта' : '🟡 Планируется'}
                                    </span>
                                </div>

                                {currentIter.meetingDate && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Дедлайн:</span>
                                        <span className={styles.infoValue}>
                                            {new Date(currentIter.meetingDate).toLocaleString('ru-RU', {
                                                timeZone: 'UTC',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                )}

                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Кандидатов:</span>
                                    <span className={styles.infoValue}>
                                        {(currentIter.Candidates || []).length}
                                    </span>
                                </div>
                            </div>

                            {/* Действия */}
                            <div className={styles.actionButtons}>
                                {currentIter.status === 'PLANNED' && (
                                    <button 
                                        onClick={() => openIteration(currentIter.id)}
                                        disabled={actionLoading === 'open'}
                                        className={`${styles.openButton} ${actionLoading === 'open' ? styles.openButtonDisabled : ''}`}
                                    >
                                        {actionLoading === 'open' ? (
                                            <>
                                                <div className={styles.spinner} />
                                                Открываем...
                                            </>
                                        ) : (
                                            <>
                                                🟢 Открыть голосование
                                            </>
                                        )}
                                    </button>
                                )}
                                
                                {currentIter.status === 'OPEN' && (
                                    <button 
                                        onClick={() => closeIteration(currentIter.id)}
                                        disabled={actionLoading === 'close'}
                                        className={`${styles.closeButton} ${actionLoading === 'close' ? styles.closeButtonDisabled : ''}`}
                                    >
                                        {actionLoading === 'close' ? (
                                            <>
                                                <div className={styles.spinner} />
                                                Закрываем...
                                            </>
                                        ) : (
                                            <>
                                                ⚫ Закрыть и объявить результаты
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* Установка дедлайна */}
                                {currentIter.status !== 'CLOSED' && (
                                    <div className={styles.changeDeadlineCard}>
                                        <h4 className={styles.changeDeadlineTitle}>
                                            Изменить дедлайн
                                        </h4>
                                                                                 <div className={styles.formContainer}>
                                             <div style={{ flex: '1', minWidth: '200px' }}>
                                                <input
                                                    type="datetime-local"
                                                    value={newDeadline}
                                                    onChange={e => setNewDeadline(e.target.value)}
                                                    className={styles.dateInput}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => setDeadline(currentIter.id)}
                                                disabled={actionLoading === 'deadline' || !newDeadline}
                                                className={`${styles.setButton} ${actionLoading === 'deadline' || !newDeadline ? styles.setButtonDisabled : ''}`}
                                            >
                                                                                                 {actionLoading === 'deadline' ? (
                                                     <>
                                                         <div className={styles.smallSpinner} />
                                                         Устанавливаем...
                                                     </>
                                                 ) : (
                                                    <>
                                                        ⏰ Установить
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                                                 <div className={styles.emptyState}>
                             <div className={styles.emptyIcon}>📋</div>
                             <p className={styles.emptyText}>
                                 Нет активной итерации
                             </p>
                         </div>
                    )}
                </div>

                {/* Создание новой итерации */}
                <div className={`card-glass ${styles.createIterationCard}`}>
                    <h2 className={styles.createIterationTitle}>
                        Создать новую итерацию
                    </h2>

                                         <div className={styles.formContainer}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Название итерации
                            </label>
                            <input
                                type="text"
                                placeholder="Например: Ноябрь 2024"
                                value={newIterName}
                                onChange={e => setNewIterName(e.target.value)}
                                className={styles.formInput}
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Дедлайн (необязательно)
                            </label>
                            <input
                                type="datetime-local"
                                value={newDeadline}
                                onChange={e => setNewDeadline(e.target.value)}
                                className={styles.formInput}
                            />
                        </div>
                        
                        <button 
                            onClick={createIteration}
                            disabled={loading || !newIterName.trim()}
                            className={`${styles.createButton} ${loading || !newIterName.trim() ? styles.createButtonDisabled : ''}`}
                        >
                                                         {loading ? (
                                 <>
                                     <div className={styles.spinner} />
                                     Создание...
                                 </>
                             ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                    Создать итерацию
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            
        </div>
    );
}