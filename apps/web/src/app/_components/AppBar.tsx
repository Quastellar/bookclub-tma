'use client';

import Link from 'next/link';
import { useI18n } from '../_i18n/I18nProvider';

type TgWebApp = {
    BackButton?: { show?: () => void; hide?: () => void; onClick?: (fn: () => void) => void };
    ready?: () => void;
    expand?: () => void;
};

function getTg(): TgWebApp | undefined {
    return (window as unknown as { Telegram?: { WebApp?: TgWebApp } })?.Telegram?.WebApp;
}

interface AppBarProps {
  title: string;
  right?: React.ReactNode;
  withBack?: boolean;
  subtitle?: string;
}

export default function AppBar({ title, right, withBack = false, subtitle }: AppBarProps) {
  const { lang, setLang } = useI18n();
  const tg = getTg();

  const handleBack = () => {
    if (tg?.BackButton) {
      tg.BackButton.hide();
    }
    window.history.back();
  };

  return (
    <header className="app-bar">
      <div className="app-bar-content">
        <div className="app-bar-left">
          {withBack && (
            <button 
              className="app-bar-back-btn" 
              onClick={tg ? handleBack : undefined}
              aria-label="Назад"
            >
              {tg ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              ) : (
                <Link href="/" className="app-bar-back-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </Link>
              )}
            </button>
          )}
          <div className="app-bar-title-section">
            <h1 className="app-bar-title">{title}</h1>
            {subtitle && <p className="app-bar-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="app-bar-right">
          {right}
          <button
            className="app-bar-lang-btn"
            onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
            aria-label={`Переключить на ${lang === 'ru' ? 'English' : 'Русский'}`}
          >
            <span className="app-bar-lang-text">
              {lang.toUpperCase()}
            </span>
            <div className="app-bar-lang-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="m1 12c0-9 3-18 9-18s9 9 9 18-3 18-9 18-9-9-9-18"/>
              </svg>
            </div>
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .app-bar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--neutral-200);
          box-shadow: var(--shadow-xs);
          transition: all var(--duration-normal) var(--ease-in-out-smooth);
        }

        .app-bar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) var(--space-xl);
          max-width: 100%;
          margin: 0 auto;
          min-height: 56px;
        }

        .app-bar-left {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex: 1;
          min-width: 0;
        }

        .app-bar-right {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          flex-shrink: 0;
        }

        .app-bar-back-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background: var(--neutral-100);
          color: var(--neutral-700);
          border: none;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-in-out-smooth);
          flex-shrink: 0;
        }

        .app-bar-back-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: inherit;
          text-decoration: none;
        }

        .app-bar-back-btn:hover {
          background: var(--neutral-200);
          color: var(--neutral-800);
          transform: translateX(-2px);
        }

        .app-bar-back-btn:active {
          transform: translateX(-2px) scale(0.95);
        }

        .app-bar-title-section {
          min-width: 0;
          flex: 1;
        }

        .app-bar-title {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--neutral-900);
          margin: 0;
          line-height: var(--line-height-tight);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .app-bar-subtitle {
          font-size: var(--text-sm);
          color: var(--neutral-600);
          margin: 2px 0 0 0;
          line-height: var(--line-height-normal);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .app-bar-lang-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-full);
          background: var(--primary-50);
          color: var(--primary-700);
          border: 1px solid var(--primary-200);
          cursor: pointer;
          transition: all var(--duration-normal) var(--ease-in-out-smooth);
          font-weight: 500;
          font-size: var(--text-sm);
          flex-shrink: 0;
        }

        .app-bar-lang-btn:hover {
          background: var(--primary-100);
          border-color: var(--primary-300);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .app-bar-lang-btn:active {
          transform: translateY(0);
          box-shadow: var(--shadow-xs);
        }

        .app-bar-lang-text {
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .app-bar-lang-icon {
          display: inline-flex;
          opacity: 0.7;
          transition: opacity var(--duration-fast) var(--ease-in-out-smooth);
        }

        .app-bar-lang-btn:hover .app-bar-lang-icon {
          opacity: 1;
        }

        @media (max-width: 480px) {
          .app-bar-content {
            padding: var(--space-sm) var(--space-lg);
            min-height: 48px;
          }

          .app-bar-title {
            font-size: var(--text-lg);
          }

          .app-bar-subtitle {
            font-size: var(--text-xs);
          }

          .app-bar-back-btn {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </header>
  );
}