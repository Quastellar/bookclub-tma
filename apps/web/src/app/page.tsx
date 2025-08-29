'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { tmaLogin } from '@/lib/auth';

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
            <div style={{ padding: 20, textAlign: 'center' }}>
                <div>Загрузка Mini App...</div>
            </div>
        );
    }

    return (
        <div style={{
            padding: 20,
            minHeight: '100vh',
            background: 'var(--tg-theme-bg-color, #ffffff)',
            color: 'var(--tg-theme-text-color, #000000)'
        }}>
            <h1 style={{ marginBottom: 30, textAlign: 'center' }}>📚 Книжный клуб</h1>

            {user && (
                <div style={{
                    background: 'var(--tg-theme-secondary-bg-color, #f1f1f1)',
                    padding: 15,
                    borderRadius: 8,
                    marginBottom: 30,
                    textAlign: 'center'
                }}>
                    Привет, {user.username || user.name || 'участник'}! 👋
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                <Link href="/search" style={{
                    display: 'block',
                    padding: '15px 20px',
                    background: 'var(--tg-theme-button-color, #007AFF)',
                    color: 'var(--tg-theme-button-text-color, white)',
                    textDecoration: 'none',
                    borderRadius: 8,
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: 'bold'
                }}>
                    🔍 Найти и предложить книгу
                </Link>

                <Link href="/iteration" style={{
                    display: 'block',
                    padding: '15px 20px',
                    background: 'var(--tg-theme-button-color, #007AFF)',
                    color: 'var(--tg-theme-button-text-color, white)',
                    textDecoration: 'none',
                    borderRadius: 8,
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: 'bold'
                }}>
                    🗳️ Голосовать за книги
                </Link>
            </div>

            <div style={{
                marginTop: 40,
                padding: 15,
                background: 'var(--tg-theme-secondary-bg-color, #f1f1f1)',
                borderRadius: 8,
                fontSize: 14,
                color: 'var(--tg-theme-hint-color, #999999)'
            }}>
                Выберите действие выше для работы с приложением
            </div>
        </div>
    );
}
