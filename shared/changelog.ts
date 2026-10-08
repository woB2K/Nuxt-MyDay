import type { Release } from './types/changelog'

export const changelog: Release[] = [
  {
    version: '1.0.0',
    date: '2026-10-02',
    title: { en: 'Day One', ru: 'Первый день' },
    changes: [
      {
        type: 'new',
        text: {
          en: 'Today screen: your tasks for the day and a quick look at your money',
          ru: 'Экран «Сегодня»: задачи на день и короткая сводка по деньгам'
        }
      },
      {
        type: 'new',
        text: {
          en: 'Tasks with priorities, tags, due dates, search and reusable templates',
          ru: 'Задачи с приоритетами, тегами, сроками, поиском и шаблонами'
        }
      },
      {
        type: 'new',
        text: {
          en: 'Income and expenses by category, with filters and any period you choose',
          ru: 'Доходы и расходы по категориям, с фильтрами и за любой период'
        }
      },
      {
        type: 'new',
        text: {
          en: 'Savings: deposits, withdrawals and the full history',
          ru: 'Накопления: пополнения, снятия и вся история'
        }
      },
      {
        type: 'new',
        text: {
          en: 'PIN lock, light and dark themes, five accent colors, English and Russian',
          ru: 'PIN-код, светлая и тёмная тема, пять акцентных цветов, русский и английский'
        }
      },
      {
        type: 'new',
        text: {
          en: 'Works as an app from the Home Screen and opens without a connection',
          ru: 'Работает как приложение с экрана «Домой» и открывается без интернета'
        }
      }
    ]
  }
]
