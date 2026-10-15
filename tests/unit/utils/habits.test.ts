import type { HabitItem } from '../../../shared/types'
import { describe, expect, it } from 'vitest'
import {
  canMark,
  habitRing,
  habitsProgress,
  habitStartDay,
  habitStats,
  habitStreaks,
  isNewRecord,
  markRate,
  markWindow,
  monthWeeks,
  moveItem,
  orderHabits,
  weekDots,
  weeksOnPlan,
  withMark
} from '../../../app/utils/habits'

const today = '2026-10-15'

function habit(marks: string[], perWeek: number | null = null, created = '2026-06-01', id = 'h-1'): HabitItem {
  return { id, marks, perWeek, sortOrder: 0, createdAt: `${created}T12:00:00.000Z` } as unknown as HabitItem
}

describe('habitStreaks — каждый день', () => {
  it('текущая серия включает сегодня', () => {
    expect(habitStreaks(habit(['2026-10-13', '2026-10-14', '2026-10-15']), today).current).toBe(3)
  })

  it('неотмеченное сегодня серию не рвёт — считаем со вчера', () => {
    expect(habitStreaks(habit(['2026-10-13', '2026-10-14']), today).current).toBe(2)
  })

  it('пропуск обрывает текущую серию, лучшая — самая длинная за историю', () => {
    const marks = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-10-14', '2026-10-15']

    expect(habitStreaks(habit(marks), today)).toEqual({ current: 2, best: 4 })
  })

  it('переходит через границу месяца', () => {
    expect(habitStreaks(habit(['2026-10-30', '2026-10-31', '2026-11-01']), '2026-11-01').current).toBe(3)
  })

  it('без отметок — нули', () => {
    expect(habitStreaks(habit([]), today)).toEqual({ current: 0, best: 0 })
  })
})

describe('habitStreaks — N раз в неделю', () => {
  it('серия — все отметки недель подряд с выполненным планом, сверх плана тоже', () => {
    const marks = ['2026-09-29', '2026-10-06', '2026-10-08', '2026-10-10', '2026-10-13']

    expect(habitStreaks(habit(marks, 2, '2026-09-28'), today)).toEqual({ current: 5, best: 5 })
  })

  it('неделя создания и текущая неделя серию не рвут', () => {
    const marks = ['2026-10-01', '2026-10-06', '2026-10-07']

    expect(habitStreaks(habit(marks, 2, '2026-09-30'), today).current).toBe(3)
  })

  it('недобранная неделя обнуляет серию, и её отметки в новую не идут', () => {
    const marks = ['2026-09-15', '2026-09-16', '2026-09-22', '2026-09-29', '2026-10-01', '2026-10-06', '2026-10-07', '2026-10-13']

    expect(habitStreaks(habit(marks, 2, '2026-09-14'), today).current).toBe(5)
  })

  it('лучшая серия остаётся после обрыва', () => {
    const marks = ['2026-09-01', '2026-09-02', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-22', '2026-10-06', '2026-10-08']

    expect(habitStreaks(habit(marks, 2, '2026-08-31'), today)).toEqual({ current: 2, best: 5 })
  })
})

describe('habitStats', () => {
  it('ежедневная: серия под угрозой, пока сегодня не отмечено', () => {
    const stats = habitStats(habit(['2026-10-13', '2026-10-14']), today)

    expect(stats).toMatchObject({ doneToday: false, atRisk: true, active: false, broken: false })
  })

  it('серия прервалась: сегодня пусто, текущая ноль, лучшая была', () => {
    expect(habitStats(habit(['2026-10-01', '2026-10-02']), today)).toMatchObject({ current: 0, best: 2, broken: true, atRisk: false })
  })

  it('рекорд — текущая равна лучшей и не меньше трёх', () => {
    expect(habitStats(habit(['2026-10-13', '2026-10-14', '2026-10-15']), today).record).toBe(true)
    expect(habitStats(habit(['2026-10-14', '2026-10-15']), today).record).toBe(false)
  })

  it('недельная: под угрозой, только когда нужно ровно столько, сколько дней осталось', () => {
    const marks = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08']

    expect(habitStats(habit(marks, 4, '2026-10-05'), today)).toMatchObject({ weekCount: 0, need: 4, atRisk: true })
    expect(habitStats(habit(marks, 3, '2026-10-05'), today)).toMatchObject({ need: 3, atRisk: false })
  })

  it('недельная: план выполнен — огонь горит и без отметки сегодня', () => {
    const stats = habitStats(habit(['2026-10-12', '2026-10-13'], 2, '2026-10-01'), today)

    expect(stats).toMatchObject({ planDone: true, doneToday: false, active: true, weekly: true })
  })
})

describe('isNewRecord', () => {
  it('рекорд, только если лучшая серия выросла и до этого была не меньше трёх', () => {
    const before = habit(['2026-10-12', '2026-10-13', '2026-10-14'])
    const short = habit(['2026-10-13', '2026-10-14'])

    expect(isNewRecord(before, withMark(before, today, true), today)).toBe(true)
    expect(isNewRecord(short, withMark(short, today, true), today)).toBe(false)
  })
})

describe('markRate / weeksOnPlan', () => {
  it('доля отмеченных дней за последние 30 дней', () => {
    const marks = Array.from({ length: 15 }, (_, index) => `2026-10-${String(index + 1).padStart(2, '0')}`)

    expect(markRate(habit([...marks, '2026-09-01']), today)).toBe(50)
  })

  it('у привычки моложе 30 дней доля считается от её начала', () => {
    expect(markRate(habit(['2026-10-13', '2026-10-14', '2026-10-15'], null, '2026-10-13'), today)).toBe(100)
    expect(markRate(habit(['2026-10-15'], null, '2026-10-12'), today)).toBe(25)
    expect(markRate(habit([], null, today), today)).toBe(0)
  })

  it('из четырёх закончившихся недель после недели создания — сколько с планом', () => {
    const marks = ['2026-09-22', '2026-09-23', '2026-09-29', '2026-10-06', '2026-10-07']

    expect(weeksOnPlan(habit(marks, 2, '2026-09-01'), today)).toEqual({ ok: 2, total: 4 })
    expect(weeksOnPlan(habit(['2026-10-06', '2026-10-07'], 2, '2026-09-30'), today)).toEqual({ ok: 1, total: 1 })
  })
})

describe('кольцо, мини-история и прогресс дня', () => {
  it('ежедневная — одно кольцо, недельная — по сегменту на отметку плана', () => {
    expect(habitRing(habit([today]), today)).toEqual({ segments: 1, filled: 1, checked: true })
    expect(habitRing(habit(['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15'], 3), today))
      .toEqual({ segments: 3, filled: 3, checked: true })
  })

  it('мини-история — семь дней до сегодня с отметкой понедельника', () => {
    const dots = weekDots(habit(['2026-10-12']), today)

    expect(dots.map(dot => dot.date)).toEqual(markWindow(today))
    expect(dots.find(dot => dot.weekStart)?.date).toBe('2026-10-12')
    expect(dots.at(-1)).toMatchObject({ today: true, marked: false })
    expect(dots.filter(dot => dot.marked)).toHaveLength(1)
  })

  it('прогресс считает только ежедневные, если они есть', () => {
    const habits = [habit([today]), habit([], null, '2026-06-01', 'h-2'), habit([], 3, '2026-06-01', 'h-3')]

    expect(habitsProgress(habits, today)).toEqual({ weekly: false, done: 1, total: 2, all: false })
  })

  it('без ежедневных — сколько недельных выполнили план', () => {
    const habits = [habit(['2026-10-12', '2026-10-13'], 2), habit([], 1, '2026-06-01', 'h-2')]

    expect(habitsProgress(habits, today)).toEqual({ weekly: true, done: 1, total: 2, all: false })
  })

  it('отметить можно сегодня и шесть дней до него', () => {
    expect(canMark('2026-10-09', today)).toBe(true)
    expect(canMark('2026-10-08', today)).toBe(false)
    expect(canMark('2026-10-16', today)).toBe(false)
  })
})

describe('monthWeeks', () => {
  it('неделя с понедельника: октябрь 2026 начинается с трёх пустых клеток', () => {
    const weeks = monthWeeks(habit([]), '2026-10-01', today)

    expect(weeks[0]!.days.slice(0, 4).map(day => day?.day ?? null)).toEqual([null, null, null, 1])
    expect(weeks.every(week => week.days.length === 7)).toBe(true)
  })

  it('отмечено, окно отметки, пропуск, будущее и сегодня', () => {
    const days = monthWeeks(habit(['2026-10-01', '2026-10-14'], null, '2026-09-01'), '2026-10-01', today)
      .flatMap(week => week.days)
      .filter(day => day !== null)
    const state = (date: string) => days.find(day => day.date === date)

    expect(state('2026-10-01')?.state).toBe('done')
    expect(state('2026-10-02')?.state).toBe('missed')
    expect(state('2026-10-09')?.state).toBe('open')
    expect(state('2026-10-14')?.state).toBe('done')
    expect(state('2026-10-15')).toMatchObject({ state: 'open', today: true })
    expect(state('2026-10-16')?.state).toBe('inactive')
  })

  it('дни до создания вне окна неактивны, внутри окна — можно отметить', () => {
    const days = monthWeeks(habit([], null, '2026-10-12'), '2026-10-01', today).flatMap(week => week.days)

    expect(days.find(day => day?.date === '2026-10-05')?.state).toBe('inactive')
    expect(days.find(day => day?.date === '2026-10-10')?.state).toBe('open')
  })

  it('у недельной привычки — итог недели, будущие недели без итога', () => {
    const weeks = monthWeeks(habit(['2026-10-06', '2026-10-07', '2026-10-13'], 2, '2026-09-01'), '2026-10-01', today)

    expect(weeks[1]!.summary).toEqual({ count: 2, ok: true, current: false })
    expect(weeks[2]!.summary).toEqual({ count: 1, ok: false, current: true })
    expect(weeks[3]!.summary).toBeNull()
  })
})

describe('habitStartDay', () => {
  it('начало — день создания или ранняя отметка, если она раньше', () => {
    expect(habitStartDay(habit([], null, '2026-10-12'))).toBe('2026-10-12')
    expect(habitStartDay(habit(['2026-10-10'], null, '2026-10-12'))).toBe('2026-10-10')
  })
})

describe('withMark', () => {
  it('добавляет отметку по порядку без дублей и не мутирует исходник', () => {
    const source = habit(['2026-10-12', '2026-10-15'])

    expect(withMark(source, '2026-10-13', true).marks).toEqual(['2026-10-12', '2026-10-13', '2026-10-15'])
    expect(withMark(source, '2026-10-15', true).marks).toEqual(['2026-10-12', '2026-10-15'])
    expect(withMark(source, '2026-10-15', false).marks).toEqual(['2026-10-12'])
    expect(source.marks).toEqual(['2026-10-12', '2026-10-15'])
  })
})

describe('moveItem / orderHabits', () => {
  it('переставляет элемент, за край не двигает', () => {
    const items = ['a', 'b', 'c']

    expect(moveItem(items, 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveItem(items, 0, -1)).toBe(items)
  })

  it('раскладывает привычки по списку id и перенумеровывает порядок', () => {
    const habits = [habit([], null, '2026-06-01', 'a'), habit([], null, '2026-06-01', 'b')]

    expect(orderHabits(habits, ['b', 'a']).map(el => [el.id, el.sortOrder])).toEqual([['b', 0], ['a', 1]])
  })
})
