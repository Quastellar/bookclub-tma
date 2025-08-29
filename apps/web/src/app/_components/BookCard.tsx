'use client';

import BookCover from './BookCover';

interface BookCardProps {
  title: string;
  authors: string[];
  year?: number | null;
  isbn?: string | null;
  coverUrl?: string | null;
  genre?: string;
  footer?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'voting';
  className?: string;
  isSelected?: boolean;
  isInteractive?: boolean;
  badges?: string[];
}

export default function BookCard({
  title,
  authors,
  year,
  isbn,
  coverUrl,
  genre,
  footer,
  onClick,
  variant = 'default',
  className = '',
  isSelected = false,
  isInteractive = false,
  badges = [],
}: BookCardProps) {
  const isClickable = !!onClick || isInteractive;
  
  const getCoverSize = () => {
    switch (variant) {
      case 'compact':
        return { width: 48, height: 72 };
      case 'voting':
        return { width: 80, height: 120 };
      default:
        return { width: 72, height: 108 };
    }
  };

  const coverSize = getCoverSize();

  const cardStyle = {
    display: 'flex',
    gap: variant === 'compact' ? 'var(--space-s)' : 'var(--space-m)',
    padding: variant === 'compact' ? 'var(--space-s)' : 'var(--space-m)',
    background: isSelected 
      ? 'linear-gradient(145deg, rgba(240,179,90,0.15), rgba(126,200,165,0.05))'
      : 'var(--card-gradient)',
    backdropFilter: 'blur(12px)',
    borderRadius: 'var(--radius-card)',
    border: isSelected 
      ? '2px solid var(--color-accent-warm)'
      : '1px solid var(--color-border-subtle)',
    boxShadow: isSelected 
      ? 'var(--shadow-warm), var(--shadow-elev1)'
      : 'var(--shadow-card)',
    transition: 'all var(--duration-normal) var(--ease-out)',
    cursor: isClickable ? 'pointer' : 'default',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };

  const handleInteraction = (e: React.MouseEvent, type: 'enter' | 'leave' | 'down' | 'up') => {
    if (!isClickable) return;
    
    const target = e.currentTarget as HTMLElement;
    
    switch (type) {
      case 'enter':
        target.style.transform = 'translateY(-2px)';
        target.style.boxShadow = 'var(--shadow-elev1)';
        target.style.borderColor = 'var(--color-accent-warm)';
        break;
      case 'leave':
        target.style.transform = 'translateY(0)';
        target.style.boxShadow = isSelected ? 'var(--shadow-warm), var(--shadow-elev1)' : 'var(--shadow-card)';
        target.style.borderColor = isSelected ? 'var(--color-accent-warm)' : 'var(--color-border-subtle)';
        break;
      case 'down':
        target.style.transform = 'translateY(0) scale(0.98)';
        break;
      case 'up':
        target.style.transform = 'translateY(-2px) scale(1)';
        break;
    }
  };

  return (
    <div 
      className={`card-glass ${className}`}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => handleInteraction(e, 'enter')}
      onMouseLeave={(e) => handleInteraction(e, 'leave')}
      onMouseDown={(e) => handleInteraction(e, 'down')}
      onMouseUp={(e) => handleInteraction(e, 'up')}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Selection indicator overlay */}
      {isSelected && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(240,179,90,0.08), rgba(126,200,165,0.02))',
            backdropFilter: 'blur(2px)',
            borderRadius: 'var(--radius-card)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Book cover */}
      <div style={{ 
        flexShrink: 0, 
        position: 'relative',
        zIndex: 1,
      }}>
        <BookCover
          src={coverUrl ?? null}
          alt={title}
          width={coverSize.width}
          height={coverSize.height}
          fallbackText="📚"
        />
        
        {/* Selection checkmark */}
        {isSelected && (
          <div 
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              width: '24px',
              height: '24px',
              background: 'var(--color-accent-warm)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(240,179,90,0.4)',
              border: '2px solid var(--color-bg-base)',
              animation: 'scaleIn var(--duration-normal) var(--ease-out-back)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div style={{ 
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xs)',
        minWidth: 0,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Title */}
        <h3 style={{ 
          fontSize: variant === 'compact' ? 'var(--font-size-body)' : 
                   variant === 'voting' ? 'var(--font-size-h1)' : 'var(--font-size-h2)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          margin: 0,
          lineHeight: 'var(--line-height-tight)',
          wordBreak: 'break-word',
          display: '-webkit-box',
          WebkitLineClamp: variant === 'compact' ? 1 : 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {title}
          {year && variant !== 'compact' && (
            <span style={{
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-normal)',
              marginLeft: 'var(--space-xs)',
            }}>
              ({year})
            </span>
          )}
        </h3>
        
        {/* Authors */}
        {authors && authors.length > 0 && (
          <p style={{ 
            fontSize: variant === 'compact' ? 'var(--font-size-caption)' : 'var(--font-size-body)',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: 'var(--line-height-normal)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {authors.join(', ')}
          </p>
        )}
        
        {/* Meta info: genre, year for compact, isbn */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-xs)',
          flexWrap: 'wrap',
        }}>
          {variant === 'compact' && year && (
            <span className="chip" style={{
              fontSize: 'var(--font-size-caption)',
              padding: '2px var(--space-xs)',
              background: 'var(--color-bg-layer)',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border-soft)',
              cursor: 'default',
            }}>
              {year}
            </span>
          )}
          
          {genre && (
            <span className="chip active" style={{
              fontSize: 'var(--font-size-caption)',
              padding: '2px var(--space-xs)',
              background: 'rgba(240,179,90,0.15)',
              color: 'var(--color-accent-warm-alt)',
              border: '1px solid rgba(240,179,90,0.3)',
              cursor: 'default',
            }}>
              {genre}
            </span>
          )}

          {isbn && variant !== 'compact' && (
            <span style={{
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-text-muted)',
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
            }}>
              {isbn}
            </span>
          )}
        </div>
        
        {/* Badges */}
        {badges.length > 0 && (
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-xs)',
            flexWrap: 'wrap',
          }}>
            {badges.map((badge, index) => (
              <span 
                key={index}
                className="chip"
                style={{
                  fontSize: 'var(--font-size-caption)',
                  padding: '2px var(--space-xs)',
                  background: 'var(--color-accent-fresh)',
                  color: 'var(--color-text-on-accent)',
                  border: 'none',
                  cursor: 'default',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
        
        {/* Footer */}
        {footer && (
          <div style={{
            marginTop: 'auto',
            paddingTop: 'var(--space-s)',
            borderTop: `1px solid var(--color-border-soft)`,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}