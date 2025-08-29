"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser } from '@/lib/auth';

export default function Nav() {
  const pathname = usePathname();
  const user = getUser();
  const isAdmin = user?.roles?.includes('admin') ?? false;

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        background: 'var(--tg-theme-secondary-bg-color, #f1f1f1)',
        borderTop: '1px solid var(--tg-theme-hint-color, #dcdcdc)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 1000,
      }}
    >
      <NavLink href="/" label="Главная" active={isActive('/')} />
      <NavLink href="/search" label="Поиск" active={isActive('/search')} />
      <NavLink href="/iteration" label="Голос" active={isActive('/iteration')} />
      <NavLink href="/my" label="Мои" active={isActive('/my')} />
      {isAdmin && <NavLink href="/admin" label="Админ" active={isActive('/admin')} />}
      <NavLink href="/history" label="История" active={isActive('/history')} />
    </nav>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        color: active ? 'var(--tg-theme-button-text-color, #fff)' : 'var(--tg-theme-text-color, #000)',
        background: active ? 'var(--tg-theme-button-color, #007AFF)' : 'transparent',
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {label}
    </Link>
  );
}


