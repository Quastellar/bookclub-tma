'use client';

interface BookListSkeletonProps {
    count?: number;
}

export default function BookListSkeleton({ count = 3 }: BookListSkeletonProps) {
    return (
        <div className="book-list-skeleton">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="book-skeleton-item" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="book-skeleton-cover" />
                    <div className="book-skeleton-content">
                        <div className="book-skeleton-title" />
                        <div className="book-skeleton-author" />
                        <div className="book-skeleton-meta" />
                        <div className="book-skeleton-button" />
                    </div>
                </div>
            ))}
            
            <style jsx>{`
                .book-list-skeleton {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-md);
                }

                .book-skeleton-item {
                    display: flex;
                    gap: var(--space-lg);
                    padding: var(--space-lg);
                    background: var(--neutral-0);
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--neutral-200);
                    box-shadow: var(--shadow-xs);
                    animation: fadeIn var(--duration-slow) var(--ease-in-out-smooth) forwards;
                    opacity: 0;
                }

                .book-skeleton-cover {
                    width: 64px;
                    height: 96px;
                    flex-shrink: 0;
                    border-radius: var(--radius-sm);
                    background: linear-gradient(
                        90deg,
                        var(--neutral-100) 0%,
                        var(--neutral-50) 50%,
                        var(--neutral-100) 100%
                    );
                    background-size: 200% 100%;
                    animation: shimmer var(--duration-slow) ease-in-out infinite;
                    position: relative;
                    overflow: hidden;
                    box-shadow: var(--shadow-xs);
                }

                .book-skeleton-cover::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        110deg,
                        transparent 25%,
                        rgba(255, 255, 255, 0.4) 50%,
                        transparent 75%
                    );
                    animation: skeleton-shine 2.5s var(--ease-in-out-smooth) infinite;
                    transform: translateX(-100%) skewX(-25deg);
                }

                .book-skeleton-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-sm);
                }

                .book-skeleton-title,
                .book-skeleton-author,
                .book-skeleton-meta,
                .book-skeleton-button {
                    border-radius: var(--radius-xs);
                    background: linear-gradient(
                        90deg,
                        var(--neutral-100) 0%,
                        var(--neutral-50) 50%,
                        var(--neutral-100) 100%
                    );
                    background-size: 200% 100%;
                    animation: shimmer var(--duration-slow) ease-in-out infinite;
                }

                .book-skeleton-title {
                    height: 20px;
                    width: 85%;
                    animation-delay: 200ms;
                }

                .book-skeleton-author {
                    height: 16px;
                    width: 65%;
                    animation-delay: 400ms;
                }

                .book-skeleton-meta {
                    height: 12px;
                    width: 45%;
                    animation-delay: 600ms;
                    margin-bottom: var(--space-xs);
                }

                .book-skeleton-button {
                    height: 32px;
                    width: 120px;
                    border-radius: var(--radius-md);
                    animation-delay: 800ms;
                }

                @media (max-width: 480px) {
                    .book-skeleton-item {
                        gap: var(--space-md);
                        padding: var(--space-md);
                    }

                    .book-skeleton-cover {
                        width: 48px;
                        height: 72px;
                    }

                    .book-skeleton-button {
                        width: 100px;
                        height: 28px;
                    }
                }
            `}</style>
        </div>
    );
}