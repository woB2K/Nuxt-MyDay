import type { Release } from './types/changelog'

export const changelog: Release[] = [
  {
    version: '1.1.1',
    date: '2026-10-09',
    changes: [
      {
        type: 'improved',
        text: {
          en: 'Savings entries can be edited: tap an entry to change its amount or note',
          ru: 'Записи о накоплениях можно редактировать: нажми на запись, чтобы поменять сумму или заметку'
        }
      }
    ]
  },
  {
    version: '1.1.0',
    date: '2026-10-08',
    changes: [
      {
        type: 'new',
        text: {
          en: 'Opening balance in Savings: money you already had no longer counts as a deposit',
          ru: 'Начальный остаток в накоплениях: деньги, которые уже были, больше не считаются пополнением'
        }
      },
      {
        type: 'new',
        text: {
          en: 'A step-by-step guide to adding MyDay to your Home Screen',
          ru: 'Пошаговый гайд, как добавить MyDay на экран «Домой»'
        }
      },
      {
        type: 'new',
        text: {
          en: 'What\'s new in Settings: see what changed in each version',
          ru: '«Что нового» в настройках: что поменялось в каждой версии'
        }
      },
      {
        type: 'improved',
        text: {
          en: 'Savings entries can be deleted with a swipe, just like transactions',
          ru: 'Записи о накоплениях удаляются свайпом, как и транзакции'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'Amounts are split into thousands as you type, and decimals can be entered with a comma',
          ru: 'Суммы разбиваются на разряды прямо при вводе, а копейки можно ввести через запятую'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'The app no longer locks itself five minutes after you enter your PIN while you are using it',
          ru: 'Приложение больше не блокируется через пять минут после ввода PIN, пока ты им пользуешься'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'The Income tab shows income by category instead of "No data for this period"',
          ru: 'На вкладке «Доходы» видны доходы по категориям, а не «Нет данных за этот период»'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'The savings balance no longer wraps onto a second line',
          ru: 'Сумма накоплений больше не переносится на вторую строку'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'On a computer, the calendar opens when you click anywhere in a date field',
          ru: 'На компьютере календарь открывается по клику в любом месте поля с датой'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'A rare sign-in error right after registering',
          ru: 'Редкая ошибка входа сразу после регистрации'
        }
      }
    ]
  },
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
