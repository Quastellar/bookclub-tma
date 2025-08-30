'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser } from '@/lib/auth';

const navItems = [
  {
    href: '/',
    label: 'Главная',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Поиск',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    href: '/iteration',
    label: 'Голос',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4l6.29 6.29c.94.94 2.48.94 3.42 0s.94-2.48 0-3.42L12 14v-3c0-1.1-.9-2-2-2z"/>
        <path d="m17 10 2-2v4l-2-2"/>
      </svg>
    ),
  },
  {
    href: '/my',
    label: 'Мои предложения',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="m22 21-3-3"/>
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'Прошлые итерации',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v5h5"/>
        <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
        <path d="M12 7v5l4 2"/>
      </svg>
    ),
  },
];

export default function Nav() {
  const pathname = usePathname();
  const user = typeof window !== 'undefined' ? getUser() : null;
  const isAdmin = user?.roles?.includes('admin') ?? false;

  const isActive = (href: string) => pathname === href;

  const items = [...navItems];
  if (isAdmin) {
    items.splice(-1, 0, {
      href: '/admin',
      label: 'Управление',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      ),
    });
  }

  return (
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
        {items.map((item) => {
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
                padding: '8px 4px',
                width: '70px',
                height: '56px',
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
                fontSize: '11px',
                fontWeight: '500',
                lineHeight: '12px',
                textAlign: 'center',
                width: '100%',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                wordBreak: 'break-word',
                hyphens: 'auto'
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}