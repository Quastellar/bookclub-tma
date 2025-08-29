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
    label: 'Мои',
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
    label: 'История',
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
  const user = getUser();
  const isAdmin = user?.roles?.includes('admin') ?? false;

  const isActive = (href: string) => pathname === href;

  const items = [...navItems];
  if (isAdmin) {
    items.splice(-1, 0, {
      href: '/admin',
      label: 'Админ',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      ),
    });
  }

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-content">
        {items.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href)}
          />
        ))}
      </div>
      
      <style jsx>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-top: 1px solid var(--neutral-200);
          box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
          padding-bottom: env(safe-area-inset-bottom);
        }

        .bottom-nav-content {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: var(--space-sm) var(--space-xs);
          max-width: 100%;
          margin: 0 auto;
        }

        @media (max-width: 480px) {
          .bottom-nav-content {
            padding: var(--space-xs);
          }
        }
      `}</style>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

function NavLink({ href, label, icon, active = false }: NavLinkProps) {
  return (
    <Link href={href} className={`nav-link ${active ? 'nav-link-active' : ''}`}>
      <div className="nav-link-icon">
        {icon}
      </div>
      <span className="nav-link-label">{label}</span>
      
      <style jsx>{`
        .nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-sm) var(--space-xs);
          min-width: 52px;
          text-decoration: none;
          color: var(--neutral-600);
          transition: all var(--duration-normal) var(--ease-in-out-smooth);
          border-radius: var(--radius-lg);
          position: relative;
          overflow: hidden;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 3px;
          background: var(--primary-500);
          border-radius: 0 0 var(--radius-sm) var(--radius-sm);
          opacity: 0;
          transition: opacity var(--duration-normal) var(--ease-in-out-smooth);
        }

        .nav-link:hover {
          color: var(--neutral-700);
          background: var(--neutral-100);
        }

        .nav-link-active {
          color: var(--primary-600);
          background: var(--primary-50);
        }

        .nav-link-active::before {
          opacity: 1;
        }

        .nav-link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--duration-fast) var(--ease-bounce);
        }

        .nav-link:active .nav-link-icon {
          transform: scale(0.9);
        }

        .nav-link-label {
          font-size: var(--text-xs);
          font-weight: 500;
          line-height: 1;
          text-align: center;
          white-space: nowrap;
          max-width: 60px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 480px) {
          .nav-link {
            padding: var(--space-xs);
            min-width: 48px;
          }

          .nav-link-label {
            font-size: 10px;
            max-width: 48px;
          }
        }
      `}</style>
    </Link>
  );
}