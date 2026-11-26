const en = {
  finance: {
    title: 'Today\'s spending',
    empty: 'No expenses today yet — don\'t forget to add them',
    ops: '{count} operation | {count} operations',
    some: '{ops} today · {amount} — got everything?',
    someHidden: '{ops} today — got everything?'
  },
  tasks: {
    title: 'Plan for today',
    empty: 'Nothing planned for today — plan your day',
    count: '{count} task for today | {count} tasks for today',
    overdue: ', {count} overdue | , {count} overdue',
    some: '{tasks}{overdue} · first: {first}'
  },
  habits: {
    oneTitle: 'Time for: {name}',
    oneBody: 'Not checked off today yet',
    manyTitle: 'Habits',
    manyBody: 'Not checked off yet: {names}'
  },
  test: {
    title: 'MyDay',
    body: 'Notifications work on this device'
  }
}

export type PushCatalog = typeof en

const ru: PushCatalog = {
  finance: {
    title: 'Траты за сегодня',
    empty: 'Сегодня ни одной траты — не забудь внести',
    ops: '{count} операция | {count} операции | {count} операций',
    some: 'Сегодня {ops} · {amount} — всё учёл?',
    someHidden: 'Сегодня {ops} — всё учёл?'
  },
  tasks: {
    title: 'План на день',
    empty: 'На сегодня пусто — запланируй день',
    count: 'На сегодня {count} задача | На сегодня {count} задачи | На сегодня {count} задач',
    overdue: ', {count} просрочена | , {count} просрочены | , {count} просрочено',
    some: '{tasks}{overdue} · первая: {first}'
  },
  habits: {
    oneTitle: 'Пора: {name}',
    oneBody: 'Сегодня ещё не отмечена',
    manyTitle: 'Привычки',
    manyBody: 'Не отмечены: {names}'
  },
  test: {
    title: 'MyDay',
    body: 'Уведомления на этом устройстве работают'
  }
}

export const pushMessages = { en, ru }
