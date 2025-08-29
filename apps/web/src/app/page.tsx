'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { tmaLogin } from '@/lib/auth';
import AppBar from './_components/AppBar';

type TgWebApp = {
    ready?: () => void;
    expand?: () => void;
};

function getTg(): TgWebApp | undefined {
    if (typeof window === 'undefined') return undefined;
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
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                padding: '20px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid #e5e7eb',
                        borderTop: '4px solid #f26419',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px auto'
                    }} />
                    <p style={{
                        color: '#6b7280',
                        fontSize: '18px',
                        fontWeight: '500',
                        margin: '0'
                    }}>Загрузка Mini App...</p>
                </div>
                
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
            <AppBar title="Книжный клуб" withBack={false} />
            
            <main style={{
                padding: '24px 16px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                {/* Hero секция */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '48px',
                    padding: '32px 0'
                }}>
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '16px'
                    }}>📚</div>
                    <h1 style={{
                        fontSize: '30px',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 16px 0',
                        lineHeight: '1.25'
                    }}>Добро пожаловать в книжный клуб!</h1>
                    <p style={{
                        fontSize: '18px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        margin: '0'
                    }}>
                        Предлагайте книги, голосуйте за любимые произведения и открывайте новые литературные миры вместе
                    </p>
                </div>

                {/* Приветствие пользователя */}
                {user && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '20px',
                        background: 'linear-gradient(135deg, #fef7ee 0%, #feebd4 100%)',
                        border: '1px solid #fcd2a9',
                        borderRadius: '20px',
                        marginBottom: '32px',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>👋</div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#792713',
                                margin: '0 0 4px 0'
                            }}>
                                Привет, {user.username || user.name || 'участник'}!
                            </h3>
                            <p style={{
                                fontSize: '16px',
                                color: '#bc350f',
                                margin: '0'
                            }}>
                                Готовы к новым литературным приключениям?
                            </p>
                        </div>
                    </div>
                )}

                {/* Карточки действий */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    marginBottom: '48px'
                }}>
                    <Link href="/search" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '20px',
                        borderRadius: '16px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.25s ease',
                        border: '1px solid #e5e7eb',
                        background: '#ffffff',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }} onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #fef7ee 0%, #feebd4 100%)';
                    }} onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.background = '#ffffff';
                    }}>
                        <div style={{ fontSize: '2rem', flexShrink: 0 }}>🔍</div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#1f2937',
                                margin: '0 0 4px 0'
                            }}>Найти книгу</h3>
                            <p style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                margin: '0',
                                lineHeight: '1.5'
                            }}>
                                Ищите и предлагайте интересные книги для чтения
                            </p>
                        </div>
                        <div style={{
                            fontSize: '20px',
                            color: '#9ca3af',
                            transition: 'transform 0.15s ease'
                        }}>→</div>
                    </Link>

                    <Link href="/iteration" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '20px',
                        borderRadius: '16px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.25s ease',
                        border: '1px solid #e5e7eb',
                        background: '#ffffff',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }} onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f0fdf4 0%, #f0fdf9 100%)';
                    }} onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.background = '#ffffff';
                    }}>
                        <div style={{ fontSize: '2rem', flexShrink: 0 }}>🗳️</div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#1f2937',
                                margin: '0 0 4px 0'
                            }}>Голосование</h3>
                            <p style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                margin: '0',
                                lineHeight: '1.5'
                            }}>
                                Выберите книгу для следующего чтения
                            </p>
                        </div>
                        <div style={{
                            fontSize: '20px',
                            color: '#9ca3af',
                            transition: 'transform 0.15s ease'
                        }}>→</div>
                    </Link>

                    <Link href="/my" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '20px',
                        borderRadius: '16px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.25s ease',
                        border: '1px solid #e5e7eb',
                        background: '#ffffff',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }} onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #fffbeb 0%, #fffaeb 100%)';
                    }} onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.background = '#ffffff';
                    }}>
                        <div style={{ fontSize: '2rem', flexShrink: 0 }}>📖</div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#1f2937',
                                margin: '0 0 4px 0'
                            }}>Мои предложения</h3>
                            <p style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                margin: '0',
                                lineHeight: '1.5'
                            }}>
                                Управляйте своими предложенными книгами
                            </p>
                        </div>
                        <div style={{
                            fontSize: '20px',
                            color: '#9ca3af',
                            transition: 'transform 0.15s ease'
                        }}>→</div>
                    </Link>

                    <Link href="/history" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '20px',
                        borderRadius: '16px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.25s ease',
                        border: '1px solid #e5e7eb',
                        background: '#ffffff',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }} onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                    }} onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.background = '#ffffff';
                    }}>
                        <div style={{ fontSize: '2rem', flexShrink: 0 }}>🏆</div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#1f2937',
                                margin: '0 0 4px 0'
                            }}>История</h3>
                            <p style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                margin: '0',
                                lineHeight: '1.5'
                            }}>
                                Посмотрите результаты прошлых голосований
                            </p>
                        </div>
                        <div style={{
                            fontSize: '20px',
                            color: '#9ca3af',
                            transition: 'transform 0.15s ease'
                        }}>→</div>
                    </Link>
                </div>

                {/* Советы */}
                <div style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                    <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 16px 0'
                    }}>💡 Как это работает?</h3>
                    <ul style={{
                        listStyle: 'none',
                        padding: '0',
                        margin: '0'
                    }}>
                        {[
                            'Найдите и предложите интересную книгу',
                            'Участвуйте в голосовании за следующую книгу',
                            'Читайте и обсуждайте выбранные произведения',
                            'Открывайте новых авторов и жанры'
                        ].map((item, index) => (
                            <li key={index} style={{
                                padding: '8px 0',
                                color: '#374151',
                                position: 'relative',
                                paddingLeft: '20px'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '0',
                                    color: '#f26419',
                                    fontWeight: '600'
                                }}>✓</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
}