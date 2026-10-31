import type { Release } from './types/changelog'

export const changelog: Release[] = [
  {
    version: '2.3.0',
    date: '2026-11-01',
    title: { en: 'Report Day', ru: 'День отчётов' },
    changes: [
      {
        type: 'new',
        text: {
          en: 'Export transactions to CSV from All transactions — the file keeps the selected period and filters and opens in Excel or Google Sheets',
          ru: 'Выгрузка операций в CSV на экране «Все операции» — с выбранным периодом и фильтрами, файл открывается в Excel и Google Таблицах'
        }
      },
      {
        type: 'improved',
        text: {
          en: 'Tap a category in the Finance breakdown to see its transactions; going back brings the full breakdown back',
          ru: 'Тап по категории в разбивке на «Финансах» открывает её операции, а при возврате назад разбивка снова полная'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'The schedule switch in the habit editor has neater rounded corners',
          ru: 'У переключателя расписания в редакторе привычки — аккуратные скругления'
        }
      }
    ]
  },
  {
    version: '2.2.0',
    date: '2026-10-15',
    title: { en: 'Day by Day', ru: 'День за днём' },
    changes: [
      {
        type: 'new',
        text: {
          en: 'Habits: daily or a few times a week — mark them with one tap on Today, follow your streak in a calendar and catch up on any of the last 7 days',
          ru: 'Привычки: каждый день или несколько раз в неделю — отмечай одним тапом на «Сегодня», следи за серией в календаре, а забытую отметку ставь за любой из последних 7 дней'
        }
      },
      {
        type: 'improved',
        text: {
          en: 'The streak card on Today now says “task streak”, so it isn’t mixed up with habit streaks',
          ru: 'Карточка серии на «Сегодня» подписана «серия задач», чтобы не путать её с сериями привычек'
        }
      }
    ]
  },
  {
    version: '2.1.0',
    date: '2026-10-15',
    title: { en: 'Offline Day', ru: 'День без сети' },
    changes: [
      {
        type: 'new',
        text: {
          en: 'Add expenses and income without internet — they\'re sent on their own once you\'re back online, and never twice',
          ru: 'Траты и доходы можно записывать без интернета — они отправятся сами, когда появится связь, и не задвоятся'
        }
      },
      {
        type: 'improved',
        text: {
          en: 'No internet no longer sends you back to the sign-in screen',
          ru: 'Без интернета приложение больше не выкидывает на экран входа'
        }
      },
      {
        type: 'improved',
        text: {
          en: 'Finances can be filtered by any family member, not only by your own records',
          ru: 'Финансы можно отфильтровать по любому участнику семьи, а не только по своим записям'
        }
      },
      {
        type: 'improved',
        text: {
          en: 'The task list opens on open tasks, so finished ones stay out of the way',
          ru: 'Список задач открывается на активных — выполненные не мешают'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'The filter reset button no longer slides off the screen when many filters are selected',
          ru: 'Кнопка сброса фильтров больше не уезжает за край, когда выбрано много фильтров'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'Buttons in the category and tag filters stay at the bottom of the sheet',
          ru: 'Кнопки в фильтрах по категориям и тегам всегда внизу шторки'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'Joining and leaving a family is more reliable when there are many records',
          ru: 'Вступление в семью и выход из неё надёжнее, когда записей много'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'The icon in notifications is properly centered',
          ru: 'Иконка в уведомлениях стоит ровно по центру'
        }
      }
    ]
  },
  {
    version: '2.0.1',
    date: '2026-10-14',
    title: { en: 'Cleanup Day', ru: 'День уборки' },
    changes: [
      {
        type: 'new',
        text: {
          en: 'When you leave a family, you can take your records with you — the others won\'t see them anymore',
          ru: 'При выходе из семьи можно забрать свои записи — остальные их больше не увидят'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'Authorization no longer has a critical vulnerability, and your data is better protected',
          ru: 'В авторизации больше нет критической уязвимости, а данные защищены надёжнее'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'Signing out is more reliable',
          ru: 'Выход из аккаунта стал надёжнее'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'Records of someone who left the family are marked as a former member\'s, even if you\'re the only one left',
          ru: 'Записи ушедшего из семьи помечены как записи бывшего участника, даже если ты остался один'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'After leaving a family, the app takes you back to Settings',
          ru: 'После выхода из семьи приложение возвращает в настройки'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'Notes and names have a length limit, so very long text no longer ends in an error',
          ru: 'У заметок и названий появился предел длины — слишком длинный текст больше не приводит к ошибке'
        }
      }
    ]
  },
  {
    version: '2.0.0',
    date: '2026-10-14',
    title: { en: 'A Day with Family', ru: 'День с семьёй' },
    changes: [
      {
        type: 'new',
        text: {
          en: 'Family: invite someone close with a link and keep one budget together — you see who added each transaction, choose shared or separate savings and can leave anytime with a copy of your records, while tasks stay yours',
          ru: 'Семья: позови близкого по ссылке и ведите общий бюджет — видно, кто добавил операцию, копилка общая или у каждого своя, а выйти можно в любой момент с копией своих записей; задачи остаются твоими'
        }
      },
      {
        type: 'new',
        text: {
          en: 'Tags on transactions: mark spending with tags like #vacation and filter by them — the whole family shares them',
          ru: 'Теги у операций: отмечай траты тегами вроде #отпуск и фильтруй по ним — теги общие для всей семьи'
        }
      },
      {
        type: 'new',
        text: {
          en: 'Savings goals: set an amount and a deadline, put money towards a goal and see how much to save each month',
          ru: 'Цели накоплений: задай сумму и срок, пополняй копилку под конкретную цель и смотри, сколько откладывать в месяц'
        }
      },
      {
        type: 'new',
        text: {
          en: 'Privacy mode: tap your balance to hide every amount, tap again to bring them back',
          ru: 'Режим приватности: нажми на баланс — и все суммы скроются, нажми ещё раз — вернутся'
        }
      },
      {
        type: 'improved',
        text: {
          en: 'Settings → Tags keeps task tags and transaction tags in separate sections',
          ru: 'В «Настройки → Теги» теги задач и операций лежат в отдельных разделах'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'The PIN screen on iPhone no longer has a dark stripe at the top, and Forgot PIN? is back on screen',
          ru: 'Экран PIN на iPhone больше не обрезан тёмной полосой сверху, а «Забыли PIN?» снова на экране'
        }
      }
    ]
  },
  {
    version: '1.2.0',
    date: '2026-10-09',
    title: { en: 'No-Loss Day', ru: 'День без потерь' },
    changes: [
      {
        type: 'new',
        text: {
          en: 'Deleted tasks, transactions and savings entries go to Recently deleted in Settings, where you can restore them within 30 days',
          ru: 'Удалённые задачи, транзакции и записи о накоплениях попадают в «Недавно удалённые» в настройках, откуда их можно вернуть в течение 30 дней'
        }
      },
      {
        type: 'new',
        text: {
          en: 'Deleted something by mistake? Tap Undo in the notification right away',
          ru: 'Удаление вышло случайным? Нажми «Отменить» прямо в уведомлении'
        }
      },
      {
        type: 'new',
        text: {
          en: 'Tags can be deleted in Settings → Tags',
          ru: 'Теги можно удалять в «Настройки → Теги»'
        }
      },
      {
        type: 'improved',
        text: {
          en: 'Sign-up and sign-in tell you when an email is already registered or there were too many attempts, instead of a generic error',
          ru: 'Регистрация и вход сообщают, что email уже занят или попыток было слишком много, вместо общей ошибки'
        }
      },
      {
        type: 'improved',
        text: {
          en: 'Notifications now pop up at the bottom of the screen, and the + button moves up to make room',
          ru: 'Уведомления теперь появляются внизу экрана, а кнопка «+» поднимается, чтобы их не закрывать'
        }
      },
      {
        type: 'improved',
        text: {
          en: 'Text and date fields no longer blend into the background',
          ru: 'Поля ввода и даты больше не сливаются с фоном'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'Removed the Continue with Google button: it didn\'t work yet',
          ru: 'Убрали кнопку входа через Google: она пока не работала'
        }
      },
      {
        type: 'fixed',
        text: {
          en: 'The date field no longer sticks out of the form on iPhone',
          ru: 'Поле даты больше не вылезает за край формы на iPhone'
        }
      }
    ]
  },
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
    title: { en: 'Moving Day', ru: 'День переезда' },
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
