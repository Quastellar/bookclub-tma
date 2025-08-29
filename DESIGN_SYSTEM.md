# Paper & Glass Design System

## Обзор

BookClub TMA использует дизайн-систему **Paper & Glass** — современный подход, сочетающий тёплую бумажную текстуру фона с элегантными стеклянными поверхностями. Дизайн создаёт атмосферу уютного антикафе с технологичными элементами.

## Философия дизайна

### Ключевые принципы
- **Тёплое антикафе** — создание ощущения уютного пространства для чтения
- **Стеклянная современность** — технологичные элементы с эффектом blur
- **Дружелюбная доступность** — понятные интерфейсы с крупными зонами касания
- **Нативность Telegram** — интеграция с возможностями Mini App

### Визуальное направление
- Бумажные фактуры фона создают тепло и уют
- Стеклянные поверхности добавляют современность
- Мягкая глубина через тени и градиенты
- Пастельные тона с тёплыми акцентами

## Цветовая палитра

### Базовые цвета
```css
--color-bg-base: #F7F3EA;           /* Parchment 1 - основной фон */
--color-bg-layer: #EFE8DA;          /* Parchment 2 - слои */
--color-bg-glass: rgba(255, 255, 255, 0.7); /* Стеклянные поверхности */
```

### Акцентные цвета
```css
--color-accent-warm: #F0B35A;        /* Amber Tea - основной акцент */
--color-accent-warm-alt: #D18A3B;    /* Burnt Honey - тёмный акцент */
--color-accent-fresh: #7EC8A5;       /* Sage Mint - свежий акцент */
--color-accent-fresh-alt: #A6D7BE;   /* Pistachio - светлый свежий */
```

### Текстовые цвета
```css
--color-text-primary: #2B2B2E;      /* Основной текст */
--color-text-secondary: #4A4D52;    /* Вторичный текст */
--color-text-muted: #6F7276;        /* Приглушённый текст */
--color-text-on-accent: #FFFFFF;    /* Текст на акцентах */
```

### Границы
```css
--color-border-subtle: rgba(42, 44, 46, 0.12); /* Тонкие границы */
--color-border-soft: rgba(42, 44, 46, 0.08);   /* Мягкие границы */
--color-border-accent: rgba(240, 179, 90, 0.3); /* Акцентные границы */
```

## Градиенты

### Заголовки
```css
--header-gradient: linear-gradient(28deg, #F0B35A, #A6D7BE);
--header-gradient-dark: linear-gradient(28deg, #3A3F58, #254A5A);
```

### Карточки
```css
--card-gradient: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
```

## Типографика

### Семейство шрифтов
```css
--font-family-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Размеры шрифтов
```css
--font-size-caption: 0.75rem;    /* 12px - подписи */
--font-size-body: 0.875rem;      /* 14px - основной текст */
--font-size-body-lg: 0.9375rem;  /* 15px - крупный текст */
--font-size-h2: 1rem;            /* 16px - заголовки 3 уровня */
--font-size-h1: 1.125rem;        /* 18px - заголовки 2 уровня */
--font-size-title: 1.375rem;     /* 22px - главные заголовки */
```

### Высота строк
```css
--line-height-tight: 1.35;       /* Плотные заголовки */
--line-height-normal: 1.4;       /* Обычный текст */
--line-height-relaxed: 1.45;     /* Комфортное чтение */
```

### Насыщенность
```css
--font-weight-normal: 400;       /* Обычный */
--font-weight-medium: 500;       /* Средний */
--font-weight-semibold: 600;     /* Полужирный */
--font-weight-bold: 700;         /* Жирный */
```

## Размеры и отступы

### Сетка отступов
```css
--space-xs: 0.5rem;      /* 8px - минимальные */
--space-s: 0.75rem;      /* 12px - малые */
--space-m: 1rem;         /* 16px - базовые */
--space-l: 1.5rem;       /* 24px - крупные */
--space-xl: 2rem;        /* 32px - очень крупные */
--space-2xl: 3rem;       /* 48px - максимальные */
```

### Радиусы скругления
```css
--radius-chip: 0.375rem;   /* 6px - чипы, теги */
--radius-button: 0.5rem;   /* 8px - кнопки */
--radius-card: 0.75rem;    /* 12px - карточки */
--radius-large: 1rem;      /* 16px - крупные элементы */
--radius-xl: 1.5rem;       /* 24px - контейнеры */
```

## Тени и эффекты

### Тени
```css
--shadow-soft: 0 2px 8px 0 rgba(0, 0, 0, 0.04);        /* Мягкие */
--shadow-elev1: 0 8px 24px 0 rgba(0, 0, 0, 0.08);      /* Приподнятые */
--shadow-glass-inset: inset 0 1px 0 rgba(255, 255, 255, 0.6); /* Стекло */
--shadow-warm: 0 4px 16px 0 rgba(240, 179, 90, 0.15);  /* Тёплые акценты */
--shadow-card: 0 2px 12px 0 rgba(42, 44, 46, 0.06);    /* Карточки */
```

### Стеклянные поверхности
```css
.glass-surface {
  backdrop-filter: blur(24px);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-bg-glass-outline);
  box-shadow: var(--shadow-glass-inset);
}
```

## Анимация

### Временные интервалы
```css
--duration-fast: 140ms;          /* Быстрые переходы */
--duration-normal: 200ms;        /* Обычные анимации */
--duration-slow: 300ms;          /* Медленные эффекты */
--duration-theme: 180ms;         /* Смена темы */
```

### Кривые анимации
```css
--ease-out: cubic-bezier(0, 0, 0.2, 1);           /* Плавный выход */
--ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1); /* Пружинный эффект */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);     /* Плавный вход/выход */
```

### Ключевые анимации
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes spring {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

## Компоненты

### Кнопки

#### Основная кнопка
```css
.btn-primary {
  background: linear-gradient(135deg, var(--color-accent-warm), var(--color-accent-warm-alt));
  color: var(--color-text-on-accent);
  box-shadow: var(--shadow-warm);
  min-height: var(--touch-target-min);
  padding: 0 var(--space-m);
  border-radius: var(--radius-button);
}
```

#### Вторичная кнопка
```css
.btn-secondary {
  background: var(--color-bg-glass);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-subtle);
  backdrop-filter: blur(24px);
}
```

### Карточки

#### Стеклянная карточка
```css
.card-glass {
  backdrop-filter: blur(12px);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-glass-inset), var(--shadow-card);
}
```

#### Градиентная карточка
```css
.card {
  background: var(--card-gradient);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-card);
}
```

### Чипы
```css
.chip {
  padding: var(--space-xs) var(--space-s);
  border-radius: var(--radius-chip);
  font-size: var(--font-size-caption);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border-subtle);
  backdrop-filter: blur(12px);
}

.chip.active {
  background: var(--color-accent-warm);
  color: var(--color-text-on-accent);
  box-shadow: var(--shadow-warm);
}
```

### Поля ввода
```css
.input {
  min-height: var(--touch-target-min);
  padding: var(--space-s) var(--space-m);
  border-radius: var(--radius-button);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border-subtle);
  backdrop-filter: blur(12px);
}

.input:focus {
  border-color: var(--color-accent-warm);
  box-shadow: 0 0 0 3px rgba(240, 179, 90, 0.1);
}
```

## Доступность

### Размеры касания
```css
--touch-target-min: 2.75rem;     /* 44px - минимум для касания */
--touch-spacing-min: 0.625rem;   /* 10px - минимум между целями */
```

### Контрастность
- Все цветовые пары проверены на соответствие WCAG AA
- Минимальный контраст 4.5:1 для обычного текста
- Минимальный контраст 3:1 для крупного текста

### Состояния фокуса
```css
*:focus-visible {
  outline: 2px solid var(--color-accent-warm);
  outline-offset: 2px;
  border-radius: var(--radius-chip);
}
```

## Поддержка тем

### Светлая тема (по умолчанию)
Использует тёплые пастельные тона с бумажной текстурой

### Тёмная тема
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-base: #1A1B1E;
    --color-bg-layer: #25262A;
    --color-bg-glass: rgba(20, 22, 28, 0.32);
    --color-text-primary: #E8E9EA;
    --color-text-secondary: #B8BABD;
    --color-text-muted: #8B8D91;
  }
}
```

### Telegram тема
```css
[data-theme="dark"] {
  --color-bg-base: var(--tg-theme-bg-color, #1A1B1E);
  --color-text-primary: var(--tg-theme-text-color, #E8E9EA);
  --color-accent-warm: var(--tg-theme-button-color, #F0B35A);
}
```

## Telegram Mini App интеграция

### WebApp API
- `ready()` и `expand()` для инициализации
- `MainButton` для основных действий
- `BackButton` для навигации
- `HapticFeedback` для тактильных откликов
- `themeChanged` для смены тем

### Поддержка Theme Parameters
Автоматическая синхронизация с параметрами темы Telegram через CSS переменные.

## Использование

### Подключение темы
```tsx
import { TelegramThemeProvider } from '@/app/_providers/TelegramThemeProvider';

export default function App() {
  return (
    <TelegramThemeProvider>
      {/* Ваше приложение */}
    </TelegramThemeProvider>
  );
}
```

### Использование компонентов
```tsx
import { GlassHeader } from '@/app/_components/GlassHeader';
import { FilterChips } from '@/app/_components/FilterChips';

export default function Page() {
  return (
    <div>
      <GlassHeader title="Заголовок" subtitle="Подзаголовок" />
      <div className="container">
        <div className="card-glass">
          <h2>Контент</h2>
        </div>
      </div>
    </div>
  );
}
```

### Responsive дизайн
```css
@media (max-width: 480px) {
  :root {
    --content-padding: var(--space-s);
  }
  
  .btn {
    min-height: 48px; /* Большие цели касания на мобильных */
  }
}
```

## Производительность

### Оптимизации
- Используются CSS переменные для быстрой смены тем
- Анимации оптимизированы для 60fps
- Backdrop-filter применяется умеренно
- Поддержка `prefers-reduced-motion`

### Совместимость
- Telegram Mini Apps (iOS, Android, Desktop)
- Современные браузеры с поддержкой CSS backdrop-filter
- Graceful degradation для старых устройств

## Будущие улучшения

- Добавление звуковых эффектов
- Расширенная поддержка haptic feedback
- Дополнительные цветовые схемы
- Improved accessibility для слабовидящих
- High contrast mode
