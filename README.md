# 📚 BookClub TMA

Telegram Mini App для управления книжным клубом с системой голосования.

## ✨ Возможности

- 🔍 **Поиск книг** через Google Books API
- 📝 **Предложение книг** для чтения в клубе  
- 🗳️ **Голосование** за любимые книги
- 👑 **Административная панель** для управления итерациями
- 📢 **Автоматические анонсы** результатов в Telegram канал
- 🌍 **Мультиязычность** (Русский/English)

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (Next.js)     │────│   (NestJS)      │────│   Services      │
│                 │    │                 │    │                 │
│ • React/TS      │    │ • PostgreSQL    │    │ • Google Books  │
│ • TMA SDK       │    │ • Redis Cache   │    │ • Telegram Bot  │
│ • CSS-in-JS     │    │ • Prisma ORM    │    │ • Render Host   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- PostgreSQL
- Redis  
- Telegram Bot Token

### Установка

1. **Клонирование репозитория:**
```bash
git clone https://github.com/yourusername/bookclub-tma.git
cd bookclub-tma
```

2. **Установка зависимостей:**
```bash
# Backend
cd apps/api
npm install

# Frontend  
cd ../web
npm install
```

3. **Настройка переменных окружения:**

**Backend (`apps/api/.env`):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/bookclub"
REDIS_URL="redis://localhost:6379"
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_CHANNEL_ID="@your_channel"
JWT_SECRET="your_jwt_secret"
PORT=3000
```

**Frontend (`apps/web/.env.local`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

4. **Настройка базы данных:**
```bash
cd apps/api
npx prisma migrate deploy
npx prisma generate
```

5. **Запуск в режиме разработки:**
```bash
# Backend
cd apps/api
npm run start:dev

# Frontend (в новом терминале)
cd apps/web  
npm run dev
```

## 📱 Использование

### Для пользователей

1. **Поиск книг:** Введите название или автора
2. **Добавление:** Выберите книгу из результатов поиска
3. **Голосование:** Выберите понравившуюся книгу в текущей итерации
4. **История:** Просмотрите результаты прошлых итераций

### Для администраторов

1. **Создание итерации:** Укажите название и дедлайн
2. **Открытие:** Разрешите пользователям добавлять книги
3. **Управление:** Отслеживайте процесс через админ панель
4. **Закрытие:** Завершите итерацию и объявите результаты

## 🛠️ API

### Основные эндпоинты

```http
# Аутентификация
POST /auth/telegram/init

# Поиск книг  
GET /books/search?q=query

# Управление кандидатами
POST /candidates
DELETE /candidates/:id

# Голосование
POST /votes

# Итерации (админ)
POST /iterations
PATCH /iterations/:id/open
PATCH /iterations/:id/close
```

Подробная документация: [API_CONTROLLERS.md](./API_CONTROLLERS.md)

## 🎯 Жизненный цикл итерации

```mermaid
stateDiagram-v2
    [*] --> PLANNED : Админ создает
    PLANNED --> OPEN : Админ открывает
    OPEN --> CLOSED : Закрытие/дедлайн
    CLOSED --> [*] : Анонс результатов
```

1. **PLANNED** - Итерация создана, добавление книг запрещено
2. **OPEN** - Пользователи могут добавлять книги и голосовать  
3. **CLOSED** - Итерация завершена, результаты объявлены

## 🔧 Разработка

### Структура проекта

```
bookclub-tma/
├── apps/
│   ├── api/           # NestJS Backend
│   │   ├── src/
│   │   ├── prisma/
│   │   └── package.json
│   └── web/           # Next.js Frontend
│       ├── src/
│       ├── public/
│       └── package.json
├── packages/
│   └── shared/        # Общие типы
└── docs/              # Документация
```

### Команды разработки

```bash
# Backend
npm run start:dev      # Разработка
npm run build         # Сборка
npm run test          # Тесты

# Frontend  
npm run dev           # Разработка
npm run build         # Сборка
npm run lint          # Линтер
```

### База данных

```bash
# Миграции
npx prisma migrate dev
npx prisma migrate deploy

# Генерация клиента
npx prisma generate

# Студия для просмотра данных
npx prisma studio
```

## 🚀 Деплоймент

### Render.com

1. **Создайте сервис** на Render
2. **Подключите GitHub** репозиторий
3. **Настройте переменные окружения**
4. **Деплой происходит автоматически** по коммиту

### Build команды:

**Backend:**
```bash
cd apps/api && npm install && npm run build
```

**Start команда:**
```bash  
cd apps/api && npm run start:prod
```

**Frontend:**
```bash
cd apps/web && npm install && npm run build
```

## 📖 Документация

- [API Controllers](./API_CONTROLLERS.md) - Документация API
- [Architecture](./ARCHITECTURE.md) - Техническая архитектура  
- [Admin Setup](./ADMIN_SETUP.md) - Настройка прав администратора

## 🤝 Вклад в проект

1. Форк репозитория
2. Создайте feature ветку (`git checkout -b feature/AmazingFeature`)
3. Коммит изменений (`git commit -m 'Add AmazingFeature'`)  
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект использует MIT лицензию. См. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

- 📧 Email: your.email@example.com
- 💬 Telegram: @yourusername
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/bookclub-tma/issues)

## 🙏 Благодарности

- [Telegram Mini Apps](https://core.telegram.org/bots/webapps) за платформу
- [Google Books API](https://developers.google.com/books) за данные о книгах
- [NestJS](https://nestjs.com/) и [Next.js](https://nextjs.org/) команды за отличные фреймворки
