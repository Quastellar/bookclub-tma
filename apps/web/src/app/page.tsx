'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { tmaLogin } from '@/lib/auth';
import AppBar from './_components/AppBar';
import { useI18n } from './_i18n/I18nProvider';

type TgWebApp = {
    ready?: () => void;
    expand?: () => void;
};

function getTg(): TgWebApp | undefined {
    return (window as unknown as { Telegram?: { WebApp?: TgWebApp } })?.Telegram?.WebApp;
}

export default function HomePage() {
    const [ready, setReady] = useState(false);
    const [user, setUser] = useState<import('@/lib/auth').TmaUser | null>(null);

    useEffect(() => {
        // Telegram WebApp инициализация
        const tg = getTg();
        if (tg) {
            tg.ready?.();
            tg.expand?.();
        }

        // TMA логин
        tmaLogin()
            .then((data) => {
                setUser(data.user);
                setReady(true);
            })
            .catch((e) => {
                console.error('TMA login failed:', e);
                setReady(true);
            });
    }, []);

    if (!ready) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <div className="loading-spinner" />
                    <p className="loading-text">Загрузка Mini App...</p>
                </div>
                
                <style jsx>{`
                    .loading-container {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(135deg, var(--neutral-0) 0%, var(--neutral-50) 100%);
                    }

                    .loading-content {
                        text-align: center;
                        padding: var(--space-4xl);
                    }

                    .loading-spinner {
                        width: 48px;
                        height: 48px;
                        border: 4px solid var(--neutral-200);
                        border-top: 4px solid var(--primary-500);
                        border-radius: var(--radius-full);
                        animation: spin 1s linear infinite;
                        margin: 0 auto var(--space-lg) auto;
                    }

                    .loading-text {
                        color: var(--neutral-600);
                        font-size: var(--text-lg);
                        font-weight: 500;
                        margin: 0;
                    }

                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="home-page">
            <AppBar title="Книжный клуб" withBack={false} />
            
            <main className="home-main">
                <div className="home-hero">
                    <div className="home-hero-icon">📚</div>
                    <h1 className="home-hero-title">Добро пожаловать в книжный клуб!</h1>
                    <p className="home-hero-subtitle">
                        Предлагайте книги, голосуйте за любимые произведения и открывайте новые литературные миры вместе
                    </p>
                </div>

                {user && (
                    <div className="welcome-card">
                        <div className="welcome-avatar">👋</div>
                        <div className="welcome-content">
                            <h3 className="welcome-name">
                                Привет, {user.username || user.name || 'участник'}!
                            </h3>
                            <p className="welcome-text">
                                Готовы к новым литературным приключениям?
                            </p>
                        </div>
                    </div>
                )}

                <div className="home-actions">
                    <Link href="/search" className="action-card action-card-primary">
                        <div className="action-icon">🔍</div>
                        <div className="action-content">
                            <h3 className="action-title">Найти книгу</h3>
                            <p className="action-description">
                                Ищите и предлагайте интересные книги для чтения
                            </p>
                        </div>
                        <div className="action-arrow">→</div>
                    </Link>

                    <Link href="/iteration" className="action-card action-card-secondary">
                        <div className="action-icon">🗳️</div>
                        <div className="action-content">
                            <h3 className="action-title">Голосование</h3>
                            <p className="action-description">
                                Выберите книгу для следующего чтения
                            </p>
                        </div>
                        <div className="action-arrow">→</div>
                    </Link>

                    <Link href="/my" className="action-card action-card-tertiary">
                        <div className="action-icon">📖</div>
                        <div className="action-content">
                            <h3 className="action-title">Мои предложения</h3>
                            <p className="action-description">
                                Управляйте своими предложенными книгами
                            </p>
                        </div>
                        <div className="action-arrow">→</div>
                    </Link>

                    <Link href="/history" className="action-card action-card-quaternary">
                        <div className="action-icon">🏆</div>
                        <div className="action-content">
                            <h3 className="action-title">История</h3>
                            <p className="action-description">
                                Посмотрите результаты прошлых голосований
                            </p>
                        </div>
                        <div className="action-arrow">→</div>
                    </Link>
                </div>

                <div className="home-tips">
                    <h3 className="tips-title">💡 Как это работает?</h3>
                    <ul className="tips-list">
                        <li>Найдите и предложите интересную книгу</li>
                        <li>Участвуйте в голосовании за следующую книгу</li>
                        <li>Читайте и обсуждайте выбранные произведения</li>
                        <li>Открывайте новых авторов и жанры</li>
                    </ul>
                </div>
            </main>

            <style jsx>{`
                .home-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, var(--neutral-0) 0%, var(--neutral-50) 100%);
                    padding-bottom: 80px; /* Space for bottom nav */
                }

                .home-main {
                    padding: var(--space-xl) var(--space-lg);
                    max-width: 600px;
                    margin: 0 auto;
                }

                .home-hero {
                    text-align: center;
                    margin-bottom: var(--space-4xl);
                    padding: var(--space-3xl) 0;
                }

                .home-hero-icon {
                    font-size: 4rem;
                    margin-bottom: var(--space-lg);
                    animation: fadeIn var(--duration-slow) var(--ease-in-out-smooth);
                }

                .home-hero-title {
                    font-size: var(--text-3xl);
                    font-weight: 700;
                    color: var(--neutral-900);
                    margin: 0 0 var(--space-lg) 0;
                    line-height: var(--line-height-tight);
                    animation: fadeIn var(--duration-slow) var(--ease-in-out-smooth) 200ms both;
                }

                .home-hero-subtitle {
                    font-size: var(--text-lg);
                    color: var(--neutral-600);
                    line-height: var(--line-height-relaxed);
                    margin: 0;
                    animation: fadeIn var(--duration-slow) var(--ease-in-out-smooth) 400ms both;
                }

                .welcome-card {
                    display: flex;
                    align-items: center;
                    gap: var(--space-lg);
                    padding: var(--space-xl);
                    background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
                    border: 1px solid var(--primary-200);
                    border-radius: var(--radius-2xl);
                    margin-bottom: var(--space-3xl);
                    box-shadow: var(--shadow-sm);
                    animation: slideIn var(--duration-normal) var(--ease-in-out-smooth) 600ms both;
                }

                .welcome-avatar {
                    font-size: 2.5rem;
                    flex-shrink: 0;
                }

                .welcome-content {
                    flex: 1;
                }

                .welcome-name {
                    font-size: var(--text-xl);
                    font-weight: 600;
                    color: var(--primary-800);
                    margin: 0 0 var(--space-xs) 0;
                }

                .welcome-text {
                    font-size: var(--text-base);
                    color: var(--primary-700);
                    margin: 0;
                }

                .home-actions {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-lg);
                    margin-bottom: var(--space-4xl);
                }

                .action-card {
                    display: flex;
                    align-items: center;
                    gap: var(--space-lg);
                    padding: var(--space-xl);
                    border-radius: var(--radius-xl);
                    text-decoration: none;
                    color: inherit;
                    transition: all var(--duration-normal) var(--ease-in-out-smooth);
                    border: 1px solid var(--neutral-200);
                    background: var(--neutral-0);
                    box-shadow: var(--shadow-xs);
                    animation: slideIn var(--duration-normal) var(--ease-in-out-smooth);
                }

                .action-card:nth-child(1) { animation-delay: 800ms; }
                .action-card:nth-child(2) { animation-delay: 900ms; }
                .action-card:nth-child(3) { animation-delay: 1000ms; }
                .action-card:nth-child(4) { animation-delay: 1100ms; }

                .action-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--neutral-300);
                }

                .action-card-primary:hover {
                    background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
                    border-color: var(--primary-300);
                }

                .action-card-secondary:hover {
                    background: linear-gradient(135deg, var(--success-50) 0%, #f0fdf9 100%);
                    border-color: var(--success-300, #86efac);
                }

                .action-card-tertiary:hover {
                    background: linear-gradient(135deg, var(--warning-50) 0%, #fffaeb 100%);
                    border-color: var(--warning-300, #fcd34d);
                }

                .action-card-quaternary:hover {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    border-color: #cbd5e1;
                }

                .action-icon {
                    font-size: 2rem;
                    flex-shrink: 0;
                }

                .action-content {
                    flex: 1;
                }

                .action-title {
                    font-size: var(--text-lg);
                    font-weight: 600;
                    color: var(--neutral-900);
                    margin: 0 0 var(--space-xs) 0;
                }

                .action-description {
                    font-size: var(--text-sm);
                    color: var(--neutral-600);
                    margin: 0;
                    line-height: var(--line-height-normal);
                }

                .action-arrow {
                    font-size: var(--text-xl);
                    color: var(--neutral-400);
                    transition: transform var(--duration-fast) var(--ease-in-out-smooth);
                }

                .action-card:hover .action-arrow {
                    transform: translateX(4px);
                    color: var(--neutral-600);
                }

                .home-tips {
                    background: var(--neutral-0);
                    border: 1px solid var(--neutral-200);
                    border-radius: var(--radius-xl);
                    padding: var(--space-xl);
                    box-shadow: var(--shadow-xs);
                    animation: fadeIn var(--duration-slow) var(--ease-in-out-smooth) 1200ms both;
                }

                .tips-title {
                    font-size: var(--text-xl);
                    font-weight: 600;
                    color: var(--neutral-900);
                    margin: 0 0 var(--space-lg) 0;
                }

                .tips-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .tips-list li {
                    padding: var(--space-sm) 0;
                    color: var(--neutral-700);
                    position: relative;
                    padding-left: var(--space-xl);
                }

                .tips-list li::before {
                    content: '✓';
                    position: absolute;
                    left: 0;
                    color: var(--primary-500);
                    font-weight: 600;
                }

                @media (max-width: 480px) {
                    .home-main {
                        padding: var(--space-lg) var(--space-md);
                    }

                    .home-hero-title {
                        font-size: var(--text-2xl);
                    }

                    .home-hero-subtitle {
                        font-size: var(--text-base);
                    }

                    .action-card {
                        padding: var(--space-lg);
                        gap: var(--space-md);
                    }

                    .action-icon {
                        font-size: 1.5rem;
                    }

                    .welcome-card {
                        padding: var(--space-lg);
                    }
                }
            `}</style>
        </div>
    );
}