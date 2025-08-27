export function hapticSuccess() {
  try {
    const tg = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { notificationOccurred?: (t: 'success'|'error'|'warning') => void; impactOccurred?: (s: 'light'|'medium'|'heavy') => void } } } }).Telegram?.WebApp;
    tg?.HapticFeedback?.notificationOccurred?.('success');
  } catch {}
}

export function hapticError() {
  try {
    const tg = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { notificationOccurred?: (t: 'success'|'error'|'warning') => void; impactOccurred?: (s: 'light'|'medium'|'heavy') => void } } } }).Telegram?.WebApp;
    tg?.HapticFeedback?.notificationOccurred?.('error');
  } catch {}
}

export function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    const tg = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { notificationOccurred?: (t: 'success'|'error'|'warning') => void; impactOccurred?: (s: 'light'|'medium'|'heavy') => void } } } }).Telegram?.WebApp;
    tg?.HapticFeedback?.impactOccurred?.(style);
  } catch {}
}


