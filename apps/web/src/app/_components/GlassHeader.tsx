'use client';

import { ReactNode } from 'react';
import { useTelegramTheme } from '../_providers/TelegramThemeProvider';

interface GlassHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export function GlassHeader({ title, subtitle, action, showBack, onBack }: GlassHeaderProps) {
  const { tg } = useTelegramTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined') {
      // Использовать Telegram BackButton если доступен
      if (tg?.BackButton) {
        window.history.back();
      } else {
        window.history.back();
      }
    }
  };

  return (
    <header 
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'var(--header-gradient)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--color-border-subtle)',
        padding: 'var(--space-m) 0',
        marginBottom: 'var(--space-l)',
      }}
    >
      <div className="container">
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px', // Фиксированная высота для всех хедеров
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-s)' }}>
            {showBack && (
              <button
                onClick={handleBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'var(--touch-target-min)',
                  height: 'var(--touch-target-min)',
                  borderRadius: 'var(--radius-button)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateX(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                aria-label="Назад"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
                minWidth: 0, // Позволяет тексту сжиматься
              }}
            >
              <h1 
                style={{
                  fontSize: 'var(--font-size-title)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  lineHeight: subtitle ? '1.2' : '1.4',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p 
                  style={{
                    fontSize: 'var(--font-size-body)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                    opacity: 0.8,
                    lineHeight: '1.3',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {action && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {action}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
