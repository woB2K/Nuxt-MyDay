import { describe, expect, it } from 'vitest'
import { decodeCsv, detectSource, parseAmount, parseCsv, parseDate, parseImport } from '../../../app/utils/csvImport'

describe('parseCsv', () => {
  it('понимает кавычки, экранированные кавычки и переносы внутри поля', () => {
    expect(parseCsv('a,b\n"x, y","say ""hi""\nthere"\r\n')).toEqual([['a', 'b'], ['x, y', 'say "hi"\nthere']])
  })

  it('сам находит разделитель и пропускает пустые строки', () => {
    expect(parseCsv('a;b;c\n1;2;3\n\n')).toEqual([['a', 'b', 'c'], ['1', '2', '3']])
    expect(parseCsv('a\tb\n1\t2')).toEqual([['a', 'b'], ['1', '2']])
  })
})

describe('decodeCsv', () => {
  it('снимает BOM и читает cp1251, если это не UTF-8', () => {
    const utf8 = new TextEncoder().encode('﻿Дата,Сумма')
    const cp1251 = new Uint8Array([0xC4, 0xE0, 0xF2, 0xE0])

    expect(decodeCsv(utf8.buffer)).toBe('Дата,Сумма')
    expect(decodeCsv(cp1251.buffer)).toBe('Дата')
  })
})

describe('parseAmount', () => {
  it('понимает русскую и английскую запись, пробелы в разрядах и знак', () => {
    expect(parseAmount('1 234,56')).toBe(1234.56)
    expect(parseAmount('1,234.56')).toBe(1234.56)
    expect(parseAmount('1.234,56')).toBe(1234.56)
    expect(parseAmount('-350')).toBe(-350)
    expect(parseAmount('12,5')).toBe(12.5)
    expect(parseAmount('1,234')).toBe(1234)
    expect(parseAmount('350 ₽')).toBe(350)
    expect(parseAmount('')).toBeNull()
  })
})

describe('parseDate', () => {
  it('понимает ISO, день.месяц.год и дату со временем', () => {
    expect(parseDate('2026-10-05')).toBe('2026-10-05')
    expect(parseDate('2026-10-05 14:30:00')).toBe('2026-10-05')
    expect(parseDate('05.10.2026')).toBe('2026-10-05')
    expect(parseDate('5/10/26')).toBe('2026-10-05')
  })

  it('читает месяц первым, когда его попросили', () => {
    expect(parseDate('10/5/2026', true)).toBe('2026-10-05')
  })

  it('отклоняет несуществующие даты', () => {
    expect(parseDate('31.02.2026')).toBeNull()
    expect(parseDate('вчера')).toBeNull()
  })
})

describe('detectSource', () => {
  it('узнаёт формат по заголовкам', () => {
    expect(detectSource(['date', 'categoryName', 'payee', 'comment', 'outcomeAccountName', 'outcome', 'outcomeCurrencyShortTitle', 'incomeAccountName', 'income', 'incomeCurrencyShortTitle'])).toBe('zenmoney')
    expect(detectSource(['Дата', 'Тип', 'Из', 'В', 'Метки', 'Сумма', 'Валюта', 'Примечание'])).toBe('coinkeeper')
    expect(detectSource(['Date', 'Type', 'Amount', 'Category'])).toBe('myday')
    expect(detectSource(['foo', 'bar'])).toBeNull()
  })
})

describe('parseImport', () => {
  it('общий формат: тип словом или знаком суммы, теги через запятую', () => {
    const parsed = parseImport([
      'date,type,amount,currency,category,tags,notes',
      '2026-10-01,expense,350,RUB,Food,"coffee, work",Latte',
      '2026-10-02,,-120.50,RUB,Transport,,',
      '2026-10-03,income,"50 000",RUB,Salary,,'
    ].join('\n'))!

    expect(parsed.source).toBe('myday')
    expect(parsed.rows.map(({ date, type, amount, category, tags, notes }) => ({ date, type, amount, category, tags, notes }))).toEqual([
      { date: '2026-10-01', type: 'EXPENSE', amount: 350, category: 'Food', tags: ['coffee', 'work'], notes: 'Latte' },
      { date: '2026-10-02', type: 'EXPENSE', amount: 120.5, category: 'Transport', tags: [], notes: '' },
      { date: '2026-10-03', type: 'INCOME', amount: 50000, category: 'Salary', tags: [], notes: '' }
    ])
  })

  it('общий формат: американские даты месяц/день узнаёт по всему файлу', () => {
    const parsed = parseImport(['date,amount', '10/5/2026,-100', '10/25/2026,-200'].join('\n'))!

    expect(parsed.rows.map(row => row.date)).toEqual(['2026-10-05', '2026-10-25'])
  })

  it('дзен-мани: расход, доход и перевод между счетами, который пропускаем', () => {
    const parsed = parseImport([
      'date;categoryName;payee;comment;outcomeAccountName;outcome;outcomeCurrencyShortTitle;incomeAccountName;income;incomeCurrencyShortTitle;createdDate;changedDate;qrCode',
      '2026-10-01;Продукты;Пятёрочка;;Карта;1 250,40;RUB;Карта;0;RUB;2026-10-01 10:00:00;2026-10-01 10:00:00;',
      '2026-10-02;Зарплата;;аванс;Карта;0;RUB;Карта;60000;RUB;2026-10-02 10:00:00;2026-10-02 10:00:00;',
      '2026-10-03;;;;Карта;5000;RUB;Наличные;5000;RUB;2026-10-03 10:00:00;2026-10-03 10:00:00;'
    ].join('\n'))!

    expect(parsed.source).toBe('zenmoney')
    expect(parsed.rows).toEqual([
      expect.objectContaining({ type: 'EXPENSE', amount: 1250.4, category: 'Продукты', notes: 'Пятёрочка', currency: 'RUB' }),
      expect.objectContaining({ type: 'INCOME', amount: 60000, category: 'Зарплата', notes: 'аванс' })
    ])
    expect(parsed.skipped).toEqual([{ line: 4, reason: 'transfer' }])
  })

  it('coinkeeper: категория расхода в «В», дохода — в «Из», переводы пропускаем', () => {
    const parsed = parseImport([
      '"Дата","Тип","Из","В","Метки","Сумма","Валюта","Примечание"',
      '"01.10.2026","Расход","Карта","Кафе","обед","450","RUB","бизнес-ланч"',
      '"02.10.2026","Доход","Зарплата","Карта","","80000","RUB",""',
      '"03.10.2026","Перевод","Карта","Накопления","","10000","RUB",""'
    ].join('\n'))!

    expect(parsed.source).toBe('coinkeeper')
    expect(parsed.rows).toEqual([
      expect.objectContaining({ date: '2026-10-01', type: 'EXPENSE', amount: 450, category: 'Кафе', tags: ['обед'], notes: 'бизнес-ланч' }),
      expect.objectContaining({ date: '2026-10-02', type: 'INCOME', amount: 80000, category: 'Зарплата' })
    ])
    expect(parsed.skipped).toEqual([{ line: 4, reason: 'transfer' }])
  })

  it('пропускает строки с битой датой, суммой или типом и говорит, какие', () => {
    const parsed = parseImport('date,type,amount\n2026-13-01,expense,10\n2026-10-01,expense,abc\n2026-10-01,gift,10')!

    expect(parsed.rows).toHaveLength(0)
    expect(parsed.skipped).toEqual([{ line: 2, reason: 'date' }, { line: 3, reason: 'amount' }, { line: 4, reason: 'type' }])
  })

  it('две одинаковые операции в файле получают разные отпечатки, а файл при повторе — те же', () => {
    const csv = 'date,type,amount,category\n2026-10-01,expense,150,Coffee\n2026-10-01,expense,150,Coffee'
    const first = parseImport(csv)!.rows.map(row => row.fingerprint)

    expect(new Set(first).size).toBe(2)
    expect(parseImport(csv)!.rows.map(row => row.fingerprint)).toEqual(first)
  })

  it('не узнанный файл — null', () => {
    expect(parseImport('hello,world\n1,2')).toBeNull()
    expect(parseImport('')).toBeNull()
  })
})
