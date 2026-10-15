import { describe, expect, it } from 'vitest'
import { dayNumber, fromDayNumber, shiftDay, weekdayIndex, weekStart } from '../../../shared/calendarDay'

describe('calendarDay', () => {
  it('номер дня и обратно дают ту же дату', () => {
    expect(fromDayNumber(dayNumber('2026-10-15'))).toBe('2026-10-15')
    expect(dayNumber('1970-01-02')).toBe(1)
  })

  it('сдвигает через границы месяца, года и високосный февраль', () => {
    expect(shiftDay('2026-10-31', 1)).toBe('2026-11-01')
    expect(shiftDay('2027-01-01', -1)).toBe('2026-12-31')
    expect(shiftDay('2028-02-28', 1)).toBe('2028-02-29')
  })

  it('понедельник — нулевой день недели, воскресенье — шестой', () => {
    expect(weekdayIndex('2026-10-12')).toBe(0)
    expect(weekdayIndex('2026-10-15')).toBe(3)
    expect(weekdayIndex('2026-10-18')).toBe(6)
  })

  it('начало недели — понедельник, в том числе для самого понедельника и воскресенья', () => {
    expect(weekStart('2026-10-15')).toBe('2026-10-12')
    expect(weekStart('2026-10-12')).toBe('2026-10-12')
    expect(weekStart('2026-10-18')).toBe('2026-10-12')
    expect(weekStart('2026-11-01')).toBe('2026-10-26')
  })

  it('дни до 1970 с отрицательным номером тоже попадают в свою неделю', () => {
    expect(weekStart('1969-12-31')).toBe('1969-12-29')
  })
})
