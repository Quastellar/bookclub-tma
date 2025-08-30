'use client';

import Link from 'next/link';

type TgWebApp = {
    BackButton?: { show?: () => void; hide?: () => void; onClick?: (fn: () => void) => void };
    ready?: () => void;
    expand?: () => void;
};

function getTg(): TgWebApp | undefined {
    if (typeof window === 'undefined') return undefined;
    return (window as unknown as { Telegram?: { WebApp?: TgWebApp } })?.Telegram?.WebApp;
}

interface AppBarProps {
  title: string;
  right?: React.ReactNode;
  withBack?: boolean;
  subtitle?: string;
}

export default function AppBar({ title, right, withBack = false, subtitle }: AppBarProps) {
  const tg = getTg();

  const handleBack = () => {
    if (tg?.BackButton?.hide) {
      tg.BackButton.hide();
    }
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      transition: 'all 0.25s ease'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        maxWidth: '100%',
        margin: '0 auto',
        minHeight: '56px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: 1,
          minWidth: 0
        }}>
          {withBack && (
            <button 
              onClick={tg ? handleBack : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
                e.currentTarget.style.color = '#1f2937';
                e.currentTarget.style.transform = 'translateX(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
              aria-label="Назад"
            >
              {tg ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              ) : (
                <Link href="/" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  color: 'inherit',
                  textDecoration: 'none'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </Link>
              )}
            </button>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0',
              lineHeight: '1.25',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '2px 0 0 0',
                lineHeight: '1.5',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {right && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}>
            {right}
          </div>
        )}
      </div>
    </header>
  );
}