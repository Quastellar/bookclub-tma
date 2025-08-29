export function hapticSuccess() {
  try {
    if (typeof window === 'undefined') return;
    const tg = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { notificationOccurred?: (t: 'success'|'error'|'warning') => void; impactOccurred?: (s: 'light'|'medium'|'heavy') => void } } } }).Telegram?.WebApp;
    tg?.HapticFeedback?.notificationOccurred?.('success');
  } catch {}
}

export function hapticError() {
  try {
    if (typeof window === 'undefined') return;
    const tg = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { notificationOccurred?: (t: 'success'|'error'|'warning') => void; impactOccurred?: (s: 'light'|'medium'|'heavy') => void } } } }).Telegram?.WebApp;
    tg?.HapticFeedback?.notificationOccurred?.('error');
  } catch {}
}

export function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    if (typeof window === 'undefined') return;
    const tg = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { notificationOccurred?: (t: 'success'|'error'|'warning') => void; impactOccurred?: (s: 'light'|'medium'|'heavy') => void } } } }).Telegram?.WebApp;
    tg?.HapticFeedback?.impactOccurred?.(style);
  } catch {}
}


