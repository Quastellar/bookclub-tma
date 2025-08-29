'use client';

interface BookListSkeletonProps {
    count?: number;
}

export default function BookListSkeleton({ count = 3 }: BookListSkeletonProps) {
    return (
        <div>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '72px 1fr',
                        gap: 12,
                        border: '1px solid var(--tg-theme-hint-color, #eee)',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 12,
                        background: 'var(--tg-theme-secondary-bg-color, #f9f9f9)'
                    }}
                >
                    {/* Скелетон обложки */}
                    <div 
                        className="book-cover-skeleton"
                        style={{
                            width: 72,
                            height: 108,
                            borderRadius: 6,
                        }}
                    />
                    
                    {/* Скелетон текста */}
                    <div>
                        {/* Заголовок */}
                        <div 
                            className="book-cover-skeleton"
                            style={{
                                height: 20,
                                width: '80%',
                                marginBottom: 6,
                                borderRadius: 4,
                            }}
                        />
                        
                        {/* Автор */}
                        <div 
                            className="book-cover-skeleton"
                            style={{
                                height: 16,
                                width: '60%',
                                marginBottom: 8,
                                borderRadius: 4,
                            }}
                        />
                        
                        {/* ISBN */}
                        <div 
                            className="book-cover-skeleton"
                            style={{
                                height: 14,
                                width: '40%',
                                marginBottom: 10,
                                borderRadius: 4,
                            }}
                        />
                        
                        {/* Кнопка */}
                        <div 
                            className="book-cover-skeleton"
                            style={{
                                height: 32,
                                width: 120,
                                borderRadius: 6,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
