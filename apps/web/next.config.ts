// apps/web/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Включаем styled-jsx
    compiler: {
        styledJsx: true,
    },
    
    // Переменные окружения
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://bookclub-tma.onrender.com',
    },
    
    // Разрешаем отдачу dev-ресурсов со страницы, открытой по домену туннеля (исправляет dev-предупреждение)
    // Замените на ваш фактический фронтовый URL из Cloudflare Tunnel
    allowedDevOrigins: [
        'https://cricket-historical-exam-screen.trycloudflare.com',
    ],

    images: {
        // Разрешаем внешние картинки с типичных доменов Google Books/Googleusercontent
        remotePatterns: [
            // Классические превью Google Books
            { protocol: 'https', hostname: 'books.google.com', pathname: '/books/**' },
            { protocol: 'https', hostname: 'books.googleusercontent.com', pathname: '/**' },

            // Часто миниатюры идут с lh*.googleusercontent.com
            { protocol: 'https', hostname: 'lh1.googleusercontent.com', pathname: '/**' },
            { protocol: 'https', hostname: 'lh2.googleusercontent.com', pathname: '/**' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
            { protocol: 'https', hostname: 'lh4.googleusercontent.com', pathname: '/**' },
            { protocol: 'https', hostname: 'lh5.googleusercontent.com', pathname: '/**' },
            { protocol: 'https', hostname: 'lh6.googleusercontent.com', pathname: '/**' },

            // Если попадаются bks*.books.google.com — добавьте нужные хосты по мере встречаемости
            // { protocol: 'https', hostname: 'bks0.books.google.com', pathname: '/**' },
            // { protocol: 'https', hostname: 'bks1.books.google.com', pathname: '/**' },
        ],
    },
};

module.exports = nextConfig;
