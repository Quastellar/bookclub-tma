'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { getUser } from '@/lib/auth';

const navItems = [
  {
    href: '/',
    label: 'Главная',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Поиск',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    href: '/iteration',
    label: 'Голосование',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m9 12 2 2 4-4"/>
        <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"/>
        <path d="M3 12v7c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-7"/>
      </svg>
    ),
  },
  {
    href: '/my',
    label: 'Мои книги',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="8.5" cy="7" r="4"/>
        <path d="m22 21-3-3"/>
      </svg>
    ),
  },
];

const menuItems = [
  {
    href: '/history',
    label: 'История итераций',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v5h5"/>
        <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
        <path d="M12 7v5l4 2"/>
      </svg>
    ),
    adminOnly: false
  },
  {
    href: '/admin',
    label: 'Управление',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    adminOnly: true
  }
];

export default function Nav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ roles?: string[] } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Получаем пользователя только на клиенте
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUser(getUser());
    }
  }, []);

  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Закрываем меню при изменении маршрута
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;
  const isAdmin = user?.roles?.includes('admin') ?? false;
  
  // Фильтруем пункты меню на основе прав пользователя
  const visibleMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div ref={menuRef}>
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'var(--color-bg-glass)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-soft)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '6px 4px',
          maxWidth: '100%',
          margin: '0 auto',
          gap: '2px'
        }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '4px',
                  padding: '10px 6px',
                  minWidth: '60px',
                  height: '58px',
                  textDecoration: 'none',
                  color: active ? 'var(--color-accent-warm)' : 'var(--color-text-muted)',
                  transition: 'all 0.25s ease',
                  borderRadius: '12px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.background = 'var(--color-border-soft)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--color-text-muted)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '24px',
                    height: '3px',
                    background: 'var(--color-accent-warm)',
                    borderRadius: '0 0 4px 4px'
                  }} />
                )}
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                }}>
                  {item.icon}
                </div>
                
                <span style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  lineHeight: '1.2',
                  textAlign: 'center',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Бургер-кнопка как 5-я кнопка */}
          {visibleMenuItems.length > 0 && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '4px',
                padding: '10px 6px',
                minWidth: '60px',
                height: '58px',
                background: 'transparent',
                border: 'none',
                color: isMenuOpen ? 'var(--color-accent-warm)' : 'var(--color-text-muted)',
                transition: 'all 0.25s ease',
                borderRadius: '12px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isMenuOpen) {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                  e.currentTarget.style.background = 'var(--color-border-soft)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMenuOpen) {
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              aria-label="Меню"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '24px',
                  height: '3px',
                  background: 'var(--color-accent-warm)',
                  borderRadius: '0 0 4px 4px'
                }} />
              )}
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }}>
                <svg 
                  width="22" 
                  height="22" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{
                    transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease'
                  }}
                >
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </div>
              
              <span style={{
                fontSize: '10px',
                fontWeight: '600',
                lineHeight: '1.2',
                textAlign: 'center',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Еще
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Выпадающее меню */}
      {isMenuOpen && visibleMenuItems.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px', // Над нижней навигацией
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: '200px',
            background: 'var(--color-bg-glass)',
            backdropFilter: 'blur(24px)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-soft)',
            padding: 'var(--space-xs)',
            zIndex: 1001,
            animation: 'slideInUp 0.2s ease-out',
          }}
        >
          {visibleMenuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-s)',
                  padding: 'var(--space-s)',
                  borderRadius: 'var(--radius-button)',
                  textDecoration: 'none',
                  color: active ? 'var(--color-accent-warm)' : 'var(--color-text-primary)',
                  background: active ? 'rgba(240, 179, 90, 0.1)' : 'transparent',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: active ? '600' : '500',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--color-border-soft)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  opacity: active ? 1 : 0.7 
                }}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* CSS для анимации */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}