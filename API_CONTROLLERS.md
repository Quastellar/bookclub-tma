# API Controllers Documentation

## Обзор

BookClub TMA API построен на NestJS и содержит контроллеры для управления книжным клубом в Telegram Mini App.

## Контроллеры

### 1. AppController (`/`)

**Описание:** Главный контроллер приложения для проверки работоспособности.

**Эндпоинты:**
- `GET /test-app` - Проверка работы приложения

**Аутентификация:** Не требуется

---

### 2. AuthController (`/auth/telegram`)

**Описание:** Аутентификация пользователей через Telegram Mini App.

**Эндпоинты:**
- `POST /auth/telegram/init` - Инициализация пользователя через initData от Telegram

**Параметры:**
```typescript
{
  initData: string // Telegram initData строка
}
```

**Ответ:**
```typescript
{
  token: string,     // JWT токен
  user: {
    id: string,
    tgUserId: string,
    username?: string,
    name?: string,
    roles: string[],
    createdAt: Date
  }
}
```

**Аутентификация:** Не требуется (создает токен)

---

### 3. BooksController (`/books`)

**Описание:** Поиск книг через Google Books API с кешированием в Redis.

**Эндпоинты:**
- `GET /books/search?q=query` - Поиск книг по названию/автору
- `GET /books/lookup?q=query` - Алиас для search (совместимость)
- `GET /books/test` - Проверка работы контроллера
- `GET /books/clear-cache` - Очистка кеша поиска

**Параметры:**
- `q` (query) - Поисковый запрос (минимум 2 символа)

**Ответ:**
```typescript
Array<{
  sourceId?: string,
  title: string,
  authors: string[],
  year?: number,
  isbn13?: string,
  isbn10?: string,
  coverUrl?: string,
  source: string,
  meta?: Record<string, unknown>
}>
```

**Особенности:**
- Автоматическая дедупликация по ISBN13 или title+authors
- Кеширование результатов в Redis на 24 часа
- Поиск работает через Google Books API

**Аутентификация:** Не требуется

---

### 4. IterationsController (`/iterations`)

**Описание:** Управление итерациями книжного клуба (только для администраторов).

**Эндпоинты:**
- `POST /iterations` - Создание новой итерации
- `PATCH /iterations/:id/open` - Открытие итерации для голосования
- `PATCH /iterations/:id/close` - Закрытие итерации и объявление результатов
- `PATCH /iterations/:id/deadline` - Установка дедлайна итерации
- `GET /iterations/current` - Получение текущей открытой итерации
- `GET /iterations/current/admin` - Получение последней итерации для админки
- `GET /iterations/current/full` - Получение итерации с голосами пользователя
- `GET /iterations/history` - История закрытых итераций

**Параметры создания:**
```typescript
{
  name: string,
  isPublicVotes?: boolean,
  meetingDate?: string // ISO date
}
```

**Статусы итераций:**
- `PLANNED` - Планируется (создана, но не открыта)
- `OPEN` - Открыта для добавления книг и голосования
- `CLOSED` - Закрыта, результаты объявлены

**Аутентификация:** JWT (admin роль для POST/PATCH)

---

### 5. CandidatesController (`/candidates`)

**Описание:** Управление книгами-кандидатами в итерациях.

**Эндпоинты:**
- `POST /candidates` - Добавление книги в текущую итерацию
- `DELETE /candidates/:id` - Удаление книги-кандидата

**Параметры добавления:**
```typescript
{
  book: {
    titleNorm: string,
    authorsNorm: string[],
    year?: number,
    isbn10?: string | null,
    isbn13?: string | null,
    coverUrl?: string | null,
    source?: string | null,
    meta?: any
  },
  reason?: string
}
```

**Аутентификация:** JWT (требуется)

---

### 6. VotesController (`/votes`)

**Описание:** Система голосования за книги.

**Эндпоинты:**
- `POST /votes` - Голосование за книгу-кандидата

**Параметры:**
```typescript
{
  candidateId: string
}
```

**Особенности:**
- Один голос от пользователя на итерацию
- Повторное голосование перезаписывает предыдущий выбор

**Аутентификация:** JWT (требуется)

---

### 7. UsersController (`/users`)

**Описание:** Управление пользователями (внутренний сервис).

**Эндпоинты:**
- `POST /users` - Создание пользователя

**Параметры:**
```typescript
{
  tgUserId: string,
  name?: string,
  username?: string,
  roles?: string[]
}
```

**Аутентификация:** Не требуется (внутренний)

---

### 8. AnnController (`/ann`)

**Описание:** Отправка анонсов в Telegram каналы.

**Эндпоинты:**
- `POST /ann/preview` - Предварительный просмотр сообщения
- `POST /ann/publish` - Публикация в канал

**Параметры preview:**
```typescript
{
  chatId: string,
  text: string,
  parseMode?: 'Markdown' | 'HTML',
  buttons?: Array<Array<{
    text: string,
    url?: string,
    cb?: string
  }>>
}
```

**Параметры publish:**
```typescript
{
  channelUsername: string,
  text: string,
  parseMode?: 'Markdown' | 'HTML',
  buttons?: Array<Array<{
    text: string,
    url?: string
  }>>
}
```

**Аутентификация:** Не требуется (внутренний)

---

## Аутентификация

### JWT Guard
Большинство эндпоинтов защищены JWT аутентификацией:

1. Получение токена: `POST /auth/telegram/init`
2. Использование: `Authorization: Bearer <token>`
3. Токен содержит: `{ uid, tg, r }` (user id, telegram id, roles)

### Роли
- `admin` - Полный доступ к управлению итерациями
- Обычные пользователи - Добавление книг и голосование

## Переменные окружения

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHANNEL_ID=@channel
JWT_SECRET=xxx
PORT=3000
```

## Логирование

Все контроллеры содержат подробное логирование:
- Входящие запросы
- Ошибки и их детали
- Важные операции (создание итераций, голосование)

## Обработка ошибок

- `400` - Неверные параметры
- `401` - Не авторизован  
- `403` - Недостаточно прав
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера
