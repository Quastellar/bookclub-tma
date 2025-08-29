"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'ru' | 'en';

type Dict = Record<string, string>;

const RU: Dict = {
  'app.title': 'Книжный клуб',

  'nav.home': 'Главная',
  'nav.search': 'Поиск',
  'nav.vote': 'Голос',
  'nav.my': 'Мои',
  'nav.history': 'История',

  'common.loading': 'Загрузка…',
  'common.entering': 'Входим…',
  'common.user': 'Пользователь',
  'common.add': 'Добавить',
  'common.error': 'Ошибка',

  'search.title': 'Поиск книг',
  'search.placeholder': 'Введите название книги или автора',
  'search.noCover': 'нет обложки',
  'search.isbn': 'ISBN',
  'search.propose': 'Предложить эту книгу',

  'iteration.title': 'Текущая итерация',
  'iteration.addBook': 'Добавить',
  'iteration.noIteration': 'Нет активной итерации',
  'iteration.addedBy': 'Добавил',
  'iteration.votes': 'Голосов',
  'iteration.yourChoice': 'ваш выбор',
  'iteration.vote': 'Голосовать',
  'iteration.voted': 'Вы выбрали',
  'iteration.cannotSelf': 'Нельзя голосовать за своё',
  'iteration.status': 'Статус',
  'iteration.meeting': 'встреча',
  'iteration.in': 'через',
  'iteration.running': 'идёт/прошла',

  'my.title': 'Мои предложения',
  'my.none': 'Нет предложенных книг',
  'my.delete': 'Удалить',
  'my.confirmDelete': 'Удалить кандидата?',

  'history.title': 'История итераций',
  'history.closedAt': 'Закрыта',
  'history.winner': 'Победитель',
  'history.noWinner': 'Нет данных о победителе',

  'admin.title': 'Администрирование',
  'admin.accessDenied': 'Доступ запрещён. Требуются права администратора.',
  'admin.currentIteration': 'Текущая итерация',
  'admin.noActiveIteration': 'Нет активной итерации',
  'admin.status': 'Статус',
  'admin.deadline': 'Дедлайн',
  'admin.candidates': 'Кандидатов',
  'admin.openVoting': 'Открыть голосование',
  'admin.closeAndAnnounce': 'Закрыть и объявить результаты',
  'admin.setDeadline': 'Изменить дедлайн',
  'admin.setDeadlineButton': 'Установить',
  'admin.createNew': 'Создать новую итерацию',
  'admin.iterationName': 'Название итерации (например: Ноябрь 2024)',
  'admin.deadlineOptional': 'Дедлайн (необязательно)',
  'admin.createButton': 'Создать итерацию',
  'admin.creating': 'Создание...',
  'admin.confirmOpen': 'Открыть итерацию для голосования?',
  'admin.confirmClose': 'Закрыть итерацию и объявить результаты?',
  'admin.enterName': 'Введите название итерации',
  'admin.selectDateTime': 'Выберите дату и время',
  'admin.iterationClosed': 'Итерация закрыта! Результаты отправлены в канал.',
};

const EN: Dict = {
  'app.title': 'Book Club',

  'nav.home': 'Home',
  'nav.search': 'Search',
  'nav.vote': 'Vote',
  'nav.my': 'Mine',
  'nav.history': 'History',

  'common.loading': 'Loading…',
  'common.entering': 'Signing in…',
  'common.user': 'User',
  'common.add': 'Add',
  'common.error': 'Error',

  'search.title': 'Book Search',
  'search.placeholder': 'Enter a title or author',
  'search.noCover': 'no cover',
  'search.isbn': 'ISBN',
  'search.propose': 'Propose this book',

  'iteration.title': 'Current iteration',
  'iteration.addBook': 'Add',
  'iteration.noIteration': 'No active iteration',
  'iteration.addedBy': 'Added by',
  'iteration.votes': 'Votes',
  'iteration.yourChoice': 'your choice',
  'iteration.vote': 'Vote',
  'iteration.voted': 'You chose',
  'iteration.cannotSelf': "Can't vote for your own",
  'iteration.status': 'Status',
  'iteration.meeting': 'meeting',
  'iteration.in': 'in',
  'iteration.running': 'ongoing/past',

  'my.title': 'My proposals',
  'my.none': 'No proposed books',
  'my.delete': 'Delete',
  'my.confirmDelete': 'Delete candidate?',

  'history.title': 'Iterations history',
  'history.closedAt': 'Closed at',
  'history.winner': 'Winner',
  'history.noWinner': 'No winner data',

  'admin.title': 'Administration',
  'admin.accessDenied': 'Access denied. Admin rights required.',
  'admin.currentIteration': 'Current iteration',
  'admin.noActiveIteration': 'No active iteration',
  'admin.status': 'Status',
  'admin.deadline': 'Deadline',
  'admin.candidates': 'Candidates',
  'admin.openVoting': 'Open voting',
  'admin.closeAndAnnounce': 'Close and announce results',
  'admin.setDeadline': 'Change deadline',
  'admin.setDeadlineButton': 'Set',
  'admin.createNew': 'Create new iteration',
  'admin.iterationName': 'Iteration name (e.g., November 2024)',
  'admin.deadlineOptional': 'Deadline (optional)',
  'admin.createButton': 'Create iteration',
  'admin.creating': 'Creating...',
  'admin.confirmOpen': 'Open iteration for voting?',
  'admin.confirmClose': 'Close iteration and announce results?',
  'admin.enterName': 'Enter iteration name',
  'admin.selectDateTime': 'Select date and time',
  'admin.iterationClosed': 'Iteration closed! Results sent to channel.',
};

const dicts: Record<Lang, Dict> = { ru: RU, en: EN };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const I18nCtx = createContext<Ctx | null>(null);

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error('I18nProvider missing');
  return ctx;
}

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('ru');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'ru' || saved === 'en') setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('lang', lang); } catch {}
  }, [lang]);

  const t = useMemo(() => (key: string) => dicts[lang][key] ?? key, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}


