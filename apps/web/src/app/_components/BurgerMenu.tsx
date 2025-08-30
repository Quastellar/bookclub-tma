'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser } from '@/lib/auth';

const menuItems = [
  {
    href: '/history',
    label: 'История итераций',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    adminOnly: true
  }
];

export function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ roles?: string[] } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Закрываем меню при изменении маршрута
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isAdmin = user?.roles?.includes('admin') ?? false;

  // Фильтруем пункты меню на основе прав пользователя
  const visibleItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  // Если нет доступных пунктов, не показываем бургер
  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Кнопка бургера */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Меню"
        aria-expanded={isOpen}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform var(--duration-normal) var(--ease-out)'
          }}
        >
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '200px',
            background: 'var(--color-bg-glass)',
            backdropFilter: 'blur(24px)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-soft)',
            padding: 'var(--space-xs)',
            zIndex: 1001,
            animation: 'slideInDown 0.2s ease-out',
          }}
        >
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
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
                  color: isActive ? 'var(--color-accent-warm)' : 'var(--color-text-primary)',
                  background: isActive ? 'rgba(240, 179, 90, 0.1)' : 'transparent',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: isActive ? '600' : '500',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--color-border-soft)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  opacity: isActive ? 1 : 0.7 
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
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
