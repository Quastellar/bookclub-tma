'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { getUser } from '@/lib/auth';
import styles from './Nav.module.css';

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

  const isActive = (href: string) => {
    // Точное совпадение для главной страницы
    if (href === '/') {
      return pathname === '/';
    }
    // Для остальных страниц проверяем, начинается ли pathname с href
    return pathname.startsWith(href);
  };
  const isAdmin = user?.roles?.includes('admin') ?? false;
  
  // Фильтруем пункты меню на основе прав пользователя
  const visibleMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div ref={menuRef}>
      <nav className={styles.navContainer}>
        <div className={styles.navContent}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`${styles.navItem} ${active ? styles.active : ''}`}
              >
                {active && (
                  <div className={styles.activeIndicator} />
                )}
                
                <div className={styles.iconContainer}>
                  {item.icon}
                </div>
                
                <span className={styles.navLabel}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Бургер-кнопка как 5-я кнопка */}
          {visibleMenuItems.length > 0 && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`${styles.burgerButton} ${isMenuOpen ? styles.active : ''}`}
              aria-label="Меню"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen && (
                <div className={styles.activeIndicator} />
              )}
              
              <div className={styles.iconContainer}>
                <svg 
                  width="22" 
                  height="22" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className={styles.burgerIcon}
                >
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </div>
              
              <span className={styles.navLabel}>
                Еще
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Выпадающее меню */}
      {isMenuOpen && visibleMenuItems.length > 0 && (
        <div className={styles.dropdownMenu}>
          {visibleMenuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`${styles.dropdownItem} ${active ? styles.active : ''}`}
              >
                <div className={styles.dropdownIcon}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}


    </div>
  );
}