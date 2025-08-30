'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { tmaLogin, TmaUser } from '@/lib/auth';
import { useTelegramTheme } from './_providers/TelegramThemeProvider';
import { GlassHeader } from './_components/GlassHeader';
import { BurgerMenu } from './_components/BurgerMenu';

export default function HomePage() {
    const { tg, isReady } = useTelegramTheme();
    const [ready, setReady] = useState(false);
    const [user, setUser] = useState<TmaUser | null>(null);

    useEffect(() => {
        if (isReady && tg) {
            tg.ready();
            tg.expand();
            
            // Скрыть Telegram кнопки
            tg.BackButton?.hide();
            tg.MainButton?.hide();
        }
    }, [isReady, tg]);

    useEffect(() => {
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
                background: 'var(--color-bg-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-l)',
                }}>
                    <div className="skeleton" style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                    }} />
                    <div className="skeleton" style={{
                        width: '200px',
                        height: '24px',
                    }} />
                    <div className="skeleton" style={{
                        width: '150px',
                        height: '18px',
                    }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg-base)',
        }}>
            <GlassHeader 
                title="Книжный клуб"
                subtitle={user ? `Добро пожаловать, ${user.name || user.username || 'Читатель'}!` : 'Добро пожаловать!'}
                action={<BurgerMenu />}
            />
            
            <div className="container">
                {/* Hero Section */}
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-2xl) var(--space-m)',
                    background: 'var(--header-gradient)',
                    borderRadius: 'var(--radius-xl)',
                    color: 'white',
                    marginBottom: 'var(--space-l)',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: 'var(--radius-xl)',
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ 
                            fontSize: '4rem', 
                            marginBottom: 'var(--space-m)',
                            animation: 'scaleIn var(--duration-slow) var(--ease-out-back)',
                        }}>
                            📚
                        </div>
                        <h1 style={{
                            fontSize: 'var(--font-size-title)',
                            fontWeight: 'var(--font-weight-bold)',
                            margin: '0 0 var(--space-s) 0',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}>
                            Выбираем книги вместе
                        </h1>
                        <p style={{
                            fontSize: 'var(--font-size-body-lg)',
                            opacity: 0.9,
                            margin: 0,
                            lineHeight: 'var(--line-height-relaxed)',
                        }}>
                            Предлагайте, голосуйте и читайте лучшие книги в нашем сообществе
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div 
                    className="stagger-children"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 'var(--space-m)',
                        marginBottom: 'var(--space-l)',
                    }}
                >
                    {/* Current Voting */}
                    <Link href="/iteration" style={{ textDecoration: 'none' }}>
                        <div className="card-glass" style={{
                            padding: 'var(--space-l)',
                            cursor: 'pointer',
                            transition: 'all var(--duration-normal) var(--ease-out)',
                            border: '2px solid var(--color-accent-warm)',
                            background: 'linear-gradient(145deg, rgba(240,179,90,0.15), rgba(126,200,165,0.05))',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-elev1), var(--shadow-warm)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-s)',
                                marginBottom: 'var(--space-m)',
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'var(--color-accent-warm)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    color: 'white',
                                    boxShadow: 'var(--shadow-warm)',
                                }}>
                                    🗳️
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: 'var(--font-size-h1)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        color: 'var(--color-text-primary)',
                                        margin: 0,
                                    }}>
                                        Голосование
                                    </h3>
                                    <p style={{
                                        fontSize: 'var(--font-size-body)',
                                        color: 'var(--color-text-secondary)',
                                        margin: 0,
                                    }}>
                                        Выберите книгу
                                    </p>
                                </div>
                            </div>
                            <p style={{
                                fontSize: 'var(--font-size-body)',
                                color: 'var(--color-text-secondary)',
                                margin: '0 0 var(--space-m) 0',
                                lineHeight: 'var(--line-height-relaxed)',
                            }}>
                                Проголосуйте за книгу, которую хотите прочитать в этом месяце
                            </p>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-xs)',
                                color: 'var(--color-accent-warm)',
                                fontWeight: 'var(--font-weight-medium)',
                                fontSize: 'var(--font-size-body)',
                            }}>
                                Перейти к голосованию
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14" />
                                    <path d="M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>

                    {/* Search Books */}
                    <Link href="/search" style={{ textDecoration: 'none' }}>
                        <div className="card-glass" style={{
                            padding: 'var(--space-l)',
                            cursor: 'pointer',
                            transition: 'all var(--duration-normal) var(--ease-out)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-elev1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-s)',
                                marginBottom: 'var(--space-m)',
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'var(--color-accent-fresh)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    color: 'white',
                                    boxShadow: '0 4px 16px 0 rgba(126, 200, 165, 0.3)',
                                }}>
                                    🔍
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: 'var(--font-size-h1)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        color: 'var(--color-text-primary)',
                                        margin: 0,
                                    }}>
                                        Поиск книг
                                    </h3>
                                    <p style={{
                                        fontSize: 'var(--font-size-body)',
                                        color: 'var(--color-text-secondary)',
                                        margin: 0,
                                    }}>
                                        Найти и предложить
                                    </p>
                                </div>
                            </div>
                            <p style={{
                                fontSize: 'var(--font-size-body)',
                                color: 'var(--color-text-secondary)',
                                margin: '0 0 var(--space-m) 0',
                                lineHeight: 'var(--line-height-relaxed)',
                            }}>
                                Найдите интересную книгу и предложите её для чтения в клубе
                            </p>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-xs)',
                                color: 'var(--color-accent-fresh)',
                                fontWeight: 'var(--font-weight-medium)',
                                fontSize: 'var(--font-size-body)',
                            }}>
                                Найти книгу
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14" />
                                    <path d="M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Secondary Actions */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 'var(--space-s)',
                    marginBottom: 'var(--space-l)',
                    alignItems: 'stretch', // Растягиваем все элементы до одинаковой высоты
                }}>
                    <Link href="/my" style={{ textDecoration: 'none', display: 'flex' }}>
                        <div className="card-glass" style={{
                            padding: 'var(--space-m)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all var(--duration-normal) var(--ease-out)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '120px', // Фиксированная минимальная высота
                            width: '100%',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                            <div style={{ 
                                fontSize: '2rem', 
                                marginBottom: 'var(--space-xs)',
                                flexShrink: 0,
                            }}>📖</div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h4 style={{
                                    fontSize: 'var(--font-size-h2)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    color: 'var(--color-text-primary)',
                                    margin: '0 0 var(--space-xs) 0',
                                    lineHeight: '1.2',
                                }}>
                                    Мои<br/>предложения
                                </h4>
                                <p style={{
                                    fontSize: 'var(--font-size-caption)',
                                    color: 'var(--color-text-muted)',
                                    margin: 0,
                                    flexShrink: 0,
                                }}>
                                    Управление
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/history" style={{ textDecoration: 'none', display: 'flex' }}>
                        <div className="card-glass" style={{
                            padding: 'var(--space-m)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all var(--duration-normal) var(--ease-out)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '120px', // Фиксированная минимальная высота
                            width: '100%',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                            <div style={{ 
                                fontSize: '2rem', 
                                marginBottom: 'var(--space-xs)',
                                flexShrink: 0,
                            }}>📜</div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h4 style={{
                                    fontSize: 'var(--font-size-h2)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    color: 'var(--color-text-primary)',
                                    margin: '0 0 var(--space-xs) 0',
                                    lineHeight: '1.2',
                                }}>
                                    История
                                </h4>
                                <p style={{
                                    fontSize: 'var(--font-size-caption)',
                                    color: 'var(--color-text-muted)',
                                    margin: 0,
                                    flexShrink: 0,
                                }}>
                                    Прошлые итерации
                                </p>
                            </div>
                        </div>
                </Link>

                    {user?.roles?.includes('admin') && (
                        <Link href="/admin" style={{ textDecoration: 'none', display: 'flex' }}>
                            <div className="card-glass" style={{
                                padding: 'var(--space-m)',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all var(--duration-normal) var(--ease-out)',
                                border: '1px solid var(--color-accent-warm)',
                                background: 'rgba(240,179,90,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minHeight: '120px', // Фиксированная минимальная высота
                                width: '100%',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.background = 'rgba(240,179,90,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(240,179,90,0.05)';
                            }}>
                                <div style={{ 
                                    fontSize: '2rem', 
                                    marginBottom: 'var(--space-xs)',
                                    flexShrink: 0,
                                }}>⚙️</div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <h4 style={{
                                        fontSize: 'var(--font-size-h2)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--color-accent-warm)',
                                        margin: '0 0 var(--space-xs) 0',
                                        lineHeight: '1.2',
                                    }}>
                                        Админ
                                    </h4>
                                    <p style={{
                                        fontSize: 'var(--font-size-caption)',
                                        color: 'var(--color-text-muted)',
                                        margin: 0,
                                        flexShrink: 0,
                                    }}>
                                        Управление
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>

                {/* About */}
                <div className="card-glass" style={{
                    padding: 'var(--space-l)',
                    textAlign: 'center',
                }}>
                    <h3 style={{
                        fontSize: 'var(--font-size-h1)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        margin: '0 0 var(--space-s) 0',
                    }}>
                        Как это работает?
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--space-m)',
                        marginTop: 'var(--space-l)',
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                                fontSize: '2.5rem', 
                                marginBottom: 'var(--space-s)',
                                filter: 'grayscale(0.2)',
                            }}>
                                📝
                            </div>
                            <h4 style={{
                                fontSize: 'var(--font-size-h2)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--color-text-primary)',
                                margin: '0 0 var(--space-xs) 0',
                            }}>
                                Предлагайте
                            </h4>
                            <p style={{
                                fontSize: 'var(--font-size-body)',
                                color: 'var(--color-text-secondary)',
                                margin: 0,
                                lineHeight: 'var(--line-height-relaxed)',
                            }}>
                                Найдите интересную книгу и добавьте её в список кандидатов
                            </p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                                fontSize: '2.5rem', 
                                marginBottom: 'var(--space-s)',
                                filter: 'grayscale(0.2)',
                            }}>
                                🗳️
                            </div>
                            <h4 style={{
                                fontSize: 'var(--font-size-h2)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--color-text-primary)',
                                margin: '0 0 var(--space-xs) 0',
                            }}>
                                Голосуйте
                            </h4>
                            <p style={{
                                fontSize: 'var(--font-size-body)',
                                color: 'var(--color-text-secondary)',
                                margin: 0,
                                lineHeight: 'var(--line-height-relaxed)',
                            }}>
                                Выберите книгу, которую хотите прочитать в этом месяце
                            </p>
            </div>

                        <div style={{ textAlign: 'center' }}>
            <div style={{
                                fontSize: '2.5rem', 
                                marginBottom: 'var(--space-s)',
                                filter: 'grayscale(0.2)',
                            }}>
                                📚
                            </div>
                            <h4 style={{
                                fontSize: 'var(--font-size-h2)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--color-text-primary)',
                                margin: '0 0 var(--space-xs) 0',
                            }}>
                                Читайте
                            </h4>
                            <p style={{
                                fontSize: 'var(--font-size-body)',
                                color: 'var(--color-text-secondary)',
                                margin: 0,
                                lineHeight: 'var(--line-height-relaxed)',
                            }}>
                                Наслаждайтесь чтением и обсуждайте книгу с сообществом
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}