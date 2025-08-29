'use client';

import { useState, useEffect } from 'react';

interface BookCoverProps {
    src: string | null;
    alt: string;
    width: number;
    height: number;
    fallbackText?: string;
}

export default function BookCover({ src, alt, width, height, fallbackText = '📚' }: BookCoverProps) {
    const [loading, setLoading] = useState(!!src);
    const [error, setError] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    useEffect(() => {
        if (!src) {
            setLoading(false);
            return;
        }

        console.log('[BookCover] Loading image:', src);
        setLoading(true);
        setError(false);
        
        // Проверим доступность изображения
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            console.log('[BookCover] Image loaded successfully:', src);
            setImageSrc(src);
            setLoading(false);
        };
        img.onerror = (e) => {
            console.error('[BookCover] Image failed to load:', src, e);
            setError(true);
            setLoading(false);
        };
        img.src = src;
    }, [src]);

    if (!src || error) {
        return (
            <div 
                style={{
                    width,
                    height,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                    color: '#6b7280',
                    fontSize: width > 60 ? 24 : 16,
                    textAlign: 'center',
                    border: '1px solid #e5e7eb',
                    fontWeight: 500,
                }}
            >
                {fallbackText}
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width, height }}>
            {/* Скелетон во время загрузки */}
            {loading && (
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: 8,
                        background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s ease-in-out infinite',
                        border: '1px solid #e5e7eb',
                        zIndex: 1,
                    }} 
                />
            )}
            
            {/* Изображение */}
            {imageSrc && (
                <img
                    src={imageSrc}
                    alt={alt}
                    style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', 
                        borderRadius: 8,
                        opacity: loading ? 0 : 1,
                        transition: 'opacity 0.3s ease',
                        border: '1px solid #e5e7eb',
                    }}
                />
            )}
        </div>
    );
}
