import { russianPlural } from '~~/i18n/pluralRules'
import { pushMessages } from '~~/i18n/push'
import { formatMoney } from '~~/shared/money'

export type PushLang = 'en' | 'ru'

export interface PushPayload {
  title: string
  body: string
  url: string
  tag: string
}

export type PushContent
  = | { kind: 'finance', count: number, expense: number }
    | { kind: 'tasks', count: number, overdue: number, first: string | null }
    | { kind: 'habits', names: string[] }
    | { kind: 'test' }

export const pushUrls = {
  finance: '/finance?new=transaction',
  tasks: '/today',
  habits: '/habits',
  test: '/settings/notifications'
} as const

export function toPushLang(value: string): PushLang {
  return value === 'ru' ? 'ru' : 'en'
}

function fill(message: string, params: Record<string, string | number>): string {
  return message.replace(/\{(\w+)\}/g, (match, name: string) => name in params ? String(params[name]) : match)
}

function plural(message: string, count: number, lang: PushLang): string {
  const forms = message.split(' | ')
  const index = lang === 'ru' ? russianPlural(count) : (count === 1 ? 0 : 1)

  return fill(forms[Math.min(index, forms.length - 1)]!, { count })
}

export function pushMessage(content: PushContent, lang: PushLang, hideAmounts: boolean): PushPayload {
  const m = pushMessages[lang]

  switch (content.kind) {
    case 'finance': {
      const ops = plural(m.finance.ops, content.count, lang)
      let body = m.finance.empty

      if (content.count > 0) {
        body = hideAmounts
          ? fill(m.finance.someHidden, { ops })
          : fill(m.finance.some, { ops, amount: formatMoney(content.expense) })
      }

      return { title: m.finance.title, body, url: pushUrls.finance, tag: 'finance' }
    }

    case 'tasks': {
      if (content.count === 0 || !content.first)
        return { title: m.tasks.title, body: m.tasks.empty, url: pushUrls.tasks, tag: 'tasks' }

      const overdue = content.overdue > 0 ? plural(m.tasks.overdue, content.overdue, lang) : ''
      const body = fill(m.tasks.some, { tasks: plural(m.tasks.count, content.count, lang), overdue, first: content.first })

      return { title: m.tasks.title, body, url: pushUrls.tasks, tag: 'tasks' }
    }

    case 'habits': {
      const [single] = content.names

      if (content.names.length === 1 && single)
        return { title: fill(m.habits.oneTitle, { name: single }), body: m.habits.oneBody, url: pushUrls.habits, tag: 'habits' }

      return { title: m.habits.manyTitle, body: fill(m.habits.manyBody, { names: content.names.join(', ') }), url: pushUrls.habits, tag: 'habits' }
    }

    case 'test':
      return { title: m.test.title, body: m.test.body, url: pushUrls.test, tag: 'test' }
  }
}
