"use client";

import Link from 'next/link';
import { useI18n } from '../_i18n/I18nProvider';

export default function AppBar({ title, right, withBack }: { title: string; right?: React.ReactNode; withBack?: boolean }) {
  const { lang, setLang } = useI18n();
  const isTg = typeof window !== 'undefined' && (window as any).Telegram?.WebApp;

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 48,
      padding: '0 12px',
      background: 'var(--tg-theme-secondary-bg-color, rgba(0,0,0,0.03))',
      borderBottom: '1px solid var(--tg-theme-hint-color, rgba(0,0,0,0.08))',
      backdropFilter: 'saturate(180%) blur(8px)'
    }}>
      <div style={{ width: 80 }}>
        {!isTg && withBack && (
          <Link href="/" style={{ color: 'var(--tg-theme-link-color, #007AFF)', textDecoration: 'none' }}>← Назад</Link>
        )}
      </div>
      <div style={{ fontWeight: 800, fontSize: 16, textAlign: 'center' }}>{title}</div>
      <div style={{ width: 80, textAlign: 'right' }}>
        {right}
        <button onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')} style={{ marginLeft: 8, border: 'none', background: 'transparent', color: 'var(--tg-theme-link-color, #007AFF)', fontWeight: 700 }}>
          {lang.toUpperCase()}
        </button>
      </div>
    </div>
  );
}


