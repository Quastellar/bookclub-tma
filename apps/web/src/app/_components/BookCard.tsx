'use client';

import BookCover from './BookCover';

interface BookCardProps {
  title: string;
  authors: string[];
  year?: number;
  isbn?: string | null;
  coverUrl?: string | null;
  footer?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export default function BookCard({
  title,
  authors,
  year,
  isbn,
  coverUrl,
  footer,
  onClick,
  variant = 'default',
  className = '',
}: BookCardProps) {
  const isClickable = !!onClick;
  const coverSize = variant === 'compact' ? { width: 48, height: 72 } : 
                   variant === 'featured' ? { width: 80, height: 120 } : 
                   { width: 64, height: 96 };

  return (
    <div 
      className={`book-card book-card-${variant} ${isClickable ? 'book-card-clickable' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="book-card-cover">
        <BookCover
          src={coverUrl ?? null}
          alt={title}
          width={coverSize.width}
          height={coverSize.height}
          fallbackText="📚"
        />
      </div>
      
      <div className="book-card-content">
        <div className="book-card-header">
          <h3 className="book-card-title">
            {title}
            {year && <span className="book-card-year">({year})</span>}
          </h3>
          {authors && authors.length > 0 && (
            <p className="book-card-authors">
              {authors.join(', ')}
            </p>
          )}
          {isbn && variant !== 'compact' && (
            <p className="book-card-isbn">{isbn}</p>
          )}
        </div>
        
        {footer && (
          <div className="book-card-footer">
            {footer}
          </div>
        )}
      </div>

      <style jsx>{`
        .book-card {
          display: flex;
          gap: var(--space-lg);
          padding: var(--space-lg);
          background: var(--neutral-0);
          border-radius: var(--radius-xl);
          border: 1px solid var(--neutral-200);
          box-shadow: var(--shadow-xs);
          transition: all var(--duration-normal) var(--ease-in-out-smooth);
          position: relative;
          overflow: hidden;
        }

        .book-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--primary-400), var(--primary-500), var(--primary-600));
          opacity: 0;
          transition: opacity var(--duration-normal) var(--ease-in-out-smooth);
        }

        .book-card:hover::before {
          opacity: 1;
        }

        .book-card:hover {
          border-color: var(--neutral-300);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .book-card-clickable {
          cursor: pointer;
        }

        .book-card-clickable:active {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .book-card-compact {
          gap: var(--space-md);
          padding: var(--space-md);
          border-radius: var(--radius-lg);
        }

        .book-card-featured {
          gap: var(--space-xl);
          padding: var(--space-xl);
          border-radius: var(--radius-2xl);
          background: linear-gradient(135deg, var(--neutral-0) 0%, var(--primary-50) 100%);
          border-color: var(--primary-200);
        }

        .book-card-cover {
          flex-shrink: 0;
          position: relative;
        }

        .book-card-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .book-card-header {
          flex: 1;
        }

        .book-card-title {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--neutral-900);
          line-height: var(--line-height-tight);
          margin: 0 0 var(--space-xs) 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .book-card-featured .book-card-title {
          font-size: var(--text-lg);
          font-weight: 700;
        }

        .book-card-compact .book-card-title {
          font-size: var(--text-sm);
          -webkit-line-clamp: 1;
        }

        .book-card-year {
          color: var(--neutral-600);
          font-weight: 400;
          margin-left: var(--space-xs);
        }

        .book-card-authors {
          font-size: var(--text-sm);
          color: var(--neutral-600);
          line-height: var(--line-height-normal);
          margin: var(--space-xs) 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .book-card-compact .book-card-authors {
          font-size: var(--text-xs);
        }

        .book-card-featured .book-card-authors {
          font-size: var(--text-base);
          color: var(--neutral-700);
        }

        .book-card-isbn {
          font-size: var(--text-xs);
          color: var(--neutral-500);
          margin: var(--space-xs) 0 0 0;
          font-family: monospace;
          letter-spacing: 0.5px;
        }

        .book-card-footer {
          margin-top: var(--space-md);
          padding-top: var(--space-sm);
          border-top: 1px solid var(--neutral-200);
        }

        .book-card-compact .book-card-footer {
          margin-top: var(--space-sm);
          padding-top: var(--space-xs);
        }

        .book-card-featured .book-card-footer {
          margin-top: var(--space-lg);
          padding-top: var(--space-md);
          border-top: 1px solid var(--primary-200);
        }

        @media (max-width: 480px) {
          .book-card {
            gap: var(--space-md);
            padding: var(--space-md);
          }

          .book-card-featured {
            gap: var(--space-lg);
            padding: var(--space-lg);
          }

          .book-card-title {
            font-size: var(--text-sm);
          }

          .book-card-featured .book-card-title {
            font-size: var(--text-base);
          }
        }
      `}</style>
    </div>
  );
}