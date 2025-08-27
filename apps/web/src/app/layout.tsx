import type { Metadata } from 'next'
import Script from 'next/script'
import Nav from './_components/Nav'
import ToastProvider from './_components/ToastProvider'
import I18nProvider from './_i18n/I18nProvider'

export const metadata: Metadata = {
    title: 'Книжный клуб',
    description: 'Mini App для выбора книг',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru">
        <head>
            <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </head>
        <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <I18nProvider>
            <ToastProvider>
                <div style={{
                    minHeight: '100vh',
                    paddingBottom: 72, // под нижнюю навигацию
                    background: 'var(--tg-theme-bg-color, var(--background))',
                    color: 'var(--tg-theme-text-color, var(--foreground))',
                }}>
                    {children}
                </div>
                <Nav />
            </ToastProvider>
        </I18nProvider>
        </body>
        </html>
    )
}
