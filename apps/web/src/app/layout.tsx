import type { Metadata } from 'next'
import Script from 'next/script'
import Nav from './_components/Nav'
import ToastProvider from './_components/ToastProvider'
import I18nProvider from './_i18n/I18nProvider'
import { TelegramThemeProvider } from './_providers/TelegramThemeProvider'
import './globals.css'

export const metadata: Metadata = {
    title: 'Книжный клуб | BookClub TMA',
    description: 'Telegram Mini App для выбора книг в книжном клубе',
    viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
    themeColor: '#F0B35A',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <head>
                <Script 
                    src="https://telegram.org/js/telegram-web-app.js" 
                    strategy="beforeInteractive" 
                />
                <meta 
                    name="viewport" 
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" 
                />
                <meta name="theme-color" content="#F0B35A" />
                <meta name="color-scheme" content="light dark" />
            </head>
            <body>
                <TelegramThemeProvider>
                    <I18nProvider>
                        <ToastProvider>
                            <div style={{
                                minHeight: '100vh',
                                background: 'var(--color-bg-base)',
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-family-ui)',
                                fontSize: 'var(--font-size-body)',
                                lineHeight: 'var(--line-height-normal)',
                                paddingBottom: '80px', // под нижнюю навигацию
                                transition: 'background-color var(--duration-theme) var(--ease-in-out), color var(--duration-theme) var(--ease-in-out)',
                            }}>
                                {children}
                            </div>
                            <Nav />
                        </ToastProvider>
                    </I18nProvider>
                </TelegramThemeProvider>
            </body>
        </html>
    )
}
