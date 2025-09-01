'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Типы для общего состояния
interface SharedState {
  // Кэш для итераций
  iterationsCache: {
    current?: Record<string, unknown>;
    history?: Record<string, unknown>[];
    lastFetched: number;
  };
  
  // Кэш для пользователя
  userCache: {
    data?: Record<string, unknown>;
    lastFetched: number;
  };
  
  // Кэш для кандидатов
  candidatesCache: {
    data?: Record<string, unknown>[];
    lastFetched: number;
  };
  
  // Общие настройки
  settings: {
    theme: 'light' | 'dark';
    language: 'ru';
  };
}

interface SharedStateContextType {
  state: SharedState;
  updateIterationsCache: (data: Record<string, unknown>, type: 'current' | 'history') => void;
  updateUserCache: (data: Record<string, unknown>) => void;
  updateCandidatesCache: (data: Record<string, unknown>[]) => void;
  clearCache: () => void;
  isCacheValid: (type: keyof SharedState, maxAge: number) => boolean;
}

const initialState: SharedState = {
  iterationsCache: {
    lastFetched: 0,
  },
  userCache: {
    lastFetched: 0,
  },
  candidatesCache: {
    lastFetched: 0,
  },
  settings: {
    theme: 'light',
    language: 'ru',
  },
};

const SharedStateContext = createContext<SharedStateContextType | undefined>(undefined);

export function SharedStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SharedState>(initialState);

  // Обновляем кэш итераций
  const updateIterationsCache = useCallback((data: Record<string, unknown>, type: 'current' | 'history') => {
    setState(prev => ({
      ...prev,
      iterationsCache: {
        ...prev.iterationsCache,
        [type]: data,
        lastFetched: Date.now(),
      },
    }));
  }, []);

  // Обновляем кэш пользователя
  const updateUserCache = useCallback((data: Record<string, unknown>) => {
    setState(prev => ({
      ...prev,
      userCache: {
        data,
        lastFetched: Date.now(),
      },
    }));
  }, []);

  // Обновляем кэш кандидатов
  const updateCandidatesCache = useCallback((data: Record<string, unknown>[]) => {
    setState(prev => ({
      ...prev,
      candidatesCache: {
        data,
        lastFetched: Date.now(),
      },
    }));
  }, []);

  // Очищаем весь кэш
  const clearCache = useCallback(() => {
    setState(prev => ({
      ...prev,
      iterationsCache: { lastFetched: 0 },
      userCache: { lastFetched: 0 },
      candidatesCache: { lastFetched: 0 },
    }));
  }, []);

  // Проверяем валидность кэша
  const isCacheValid = useCallback((type: keyof SharedState, maxAge: number) => {
    const cache = state[type] as { lastFetched?: number };
    if (!cache || !cache.lastFetched) return false;
    
    const age = Date.now() - cache.lastFetched;
    return age < maxAge;
  }, [state]);

  const value: SharedStateContextType = {
    state,
    updateIterationsCache,
    updateUserCache,
    updateCandidatesCache,
    clearCache,
    isCacheValid,
  };

  return (
    <SharedStateContext.Provider value={value}>
      {children}
    </SharedStateContext.Provider>
  );
}

export function useSharedState() {
  const context = useContext(SharedStateContext);
  if (context === undefined) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
}
