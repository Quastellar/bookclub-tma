'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Telegram WebApp типы
interface TelegramThemeParams {
  bg_color?: string;
  secondary_bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  themeParams: TelegramThemeParams;
  colorScheme: 'light' | 'dark';
  onEvent: (eventType: string, eventHandler: () => void) => void;
  offEvent: (eventType: string, eventHandler: () => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showPopup: (params: { title?: string; message: string; buttons?: Array<{id?: string; type?: string; text: string}>}, callback?: (buttonId: string) => void) => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  isReady: boolean;
  tg: TelegramWebApp | null;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  themeParams: {},
  isReady: false,
  tg: null,
});

export const useTelegramTheme = () => useContext(ThemeContext);

interface TelegramThemeProviderProps {
  children: ReactNode;
}

export function TelegramThemeProvider({ children }: TelegramThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [themeParams, setThemeParams] = useState<TelegramThemeParams>({});
  const [isReady, setIsReady] = useState(false);
  const [tg, setTg] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const telegram = window.Telegram?.WebApp;
    
    if (telegram) {
      setTg(telegram);
      
      // Инициализация Telegram WebApp
      telegram.ready();
      telegram.expand();
      
      // Установка начальной темы
      const initialTheme = telegram.colorScheme || 'light';
      const initialParams = telegram.themeParams || {};
      
      setTheme(initialTheme);
      setThemeParams(initialParams);
      applyThemeToDocument(initialTheme, initialParams);
      
      // Обработчик изменения темы
      const handleThemeChanged = () => {
        const newTheme = telegram.colorScheme || 'light';
        const newParams = telegram.themeParams || {};
        
        console.log('[Theme] Theme changed:', newTheme, newParams);
        
        setTheme(newTheme);
        setThemeParams(newParams);
        applyThemeToDocument(newTheme, newParams);
      };

      telegram.onEvent('themeChanged', handleThemeChanged);
      
      setIsReady(true);
      
      return () => {
        telegram.offEvent('themeChanged', handleThemeChanged);
      };
    } else {
      // Fallback для разработки вне Telegram
      console.warn('[Theme] Telegram WebApp not available, using fallback');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const fallbackTheme = prefersDark ? 'dark' : 'light';
      
      setTheme(fallbackTheme);
      applyThemeToDocument(fallbackTheme, {});
      setIsReady(true);
      
      // Слушаем изменения системной темы
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        applyThemeToDocument(newTheme, {});
      };
      
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, []);

  const applyThemeToDocument = (currentTheme: 'light' | 'dark', params: TelegramThemeParams) => {
    const root = document.documentElement;
    
    // Добавляем класс темы для transition
    root.classList.add('theme-transition');
    
    // Устанавливаем data-theme атрибут
    root.setAttribute('data-theme', currentTheme);
    
    // Применяем CSS переменные от Telegram, если доступны
    if (params.bg_color) {
      root.style.setProperty('--tg-theme-bg-color', params.bg_color);
    }
    if (params.secondary_bg_color) {
      root.style.setProperty('--tg-theme-secondary-bg-color', params.secondary_bg_color);
    }
    if (params.text_color) {
      root.style.setProperty('--tg-theme-text-color', params.text_color);
    }
    if (params.hint_color) {
      root.style.setProperty('--tg-theme-hint-color', params.hint_color);
    }
    if (params.button_color) {
      root.style.setProperty('--tg-theme-button-color', params.button_color);
    }
    if (params.button_text_color) {
      root.style.setProperty('--tg-theme-button-text-color', params.button_text_color);
    }
    
    // Убираем класс transition через некоторое время
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 200);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeParams, isReady, tg }}>
      {children}
    </ThemeContext.Provider>
  );
}
