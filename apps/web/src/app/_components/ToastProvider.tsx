"use client";

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = { id: number; title: string; type?: 'success' | 'error' | 'info' };

const ToastCtx = createContext<{
  show: (title: string, type?: Toast['type']) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('ToastProvider is missing');
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const show = useCallback((title: string, type?: Toast['type']) => {
    const id = Date.now() + Math.random();
    setItems(prev => [...prev, { id, title, type }]);
    setTimeout(() => setItems(prev => prev.filter(x => x.id !== id)), 2500);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: 64,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
        zIndex: 1001,
      }}>
        {items.map(t => (
          <div key={t.id} style={{
            pointerEvents: 'auto',
            padding: '10px 14px',
            borderRadius: 10,
            color: 'var(--tg-theme-button-text-color, #fff)',
            background: t.type === 'error'
              ? '#E5484D'
              : t.type === 'success'
                ? 'var(--tg-theme-button-color, #007AFF)'
                : 'rgba(0,0,0,0.7)',
            maxWidth: '90%',
            textAlign: 'center',
            fontWeight: 700,
          }}>{t.title}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}


