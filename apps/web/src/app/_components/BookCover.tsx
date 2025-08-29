'use client';

import Image from 'next/image';
import { useState } from 'react';

interface BookCoverProps {
    src: string | null;
    alt: string;
    width: number;
    height: number;
    fallbackText?: string;
}

export default function BookCover({ src, alt, width, height, fallbackText = 'no cover' }: BookCoverProps) {
    const [loading, setLoading] = useState(!!src);
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div style={{
                width,
                height,
                background: 'var(--tg-theme-secondary-bg-color, #eee)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--tg-theme-hint-color, #999)',
                fontSize: 12,
                textAlign: 'center',
                padding: 4,
            }}>
                {fallbackText}
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width, height }}>
            {/* Скелетон во время загрузки */}
            {loading && (
                <div 
                    className="book-cover-skeleton"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: 6,
                        zIndex: 1,
                    }} 
                />
            )}
            
            {/* Изображение */}
            <Image
                src={src}
                alt={alt}
                fill
                sizes={`${width}px`}
                style={{ 
                    objectFit: 'cover', 
                    borderRadius: 6,
                    opacity: loading ? 0 : 1,
                    transition: 'opacity 0.3s ease',
                }}
                unoptimized
                onLoad={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setError(true);
                }}
            />
        </div>
    );
}
