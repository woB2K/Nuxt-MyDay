import { MAX_AMOUNT, MAX_NAME_LENGTH, MAX_NOTES_LENGTH, MAX_TAG_NAME_LENGTH, MAX_TRANSACTION_TAGS } from '~~/shared/schemas/finance'

export type ImportSource = 'myday' | 'zenmoney' | 'coinkeeper'

export type ImportSkipReason = 'transfer' | 'date' | 'amount' | 'type'

export interface ImportRow {
  line: number
  date: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  category: string
  notes: string
  tags: string[]
  currency: string | null
  fingerprint: string
}

export interface ImportSkip {
  line: number
  reason: ImportSkipReason
}

export interface ParsedImport {
  source: ImportSource
  rows: ImportRow[]
  skipped: ImportSkip[]
}

const DELIMITERS = [',', ';', '\t']

export function decodeCsv(buffer: ArrayBuffer): string {
  const utf8 = new TextDecoder('utf-8').decode(buffer)
  const text = utf8.includes('�') ? new TextDecoder('windows-1251').decode(buffer) : utf8

  return text.replace(/^\uFEFF/, '')
}

function detectDelimiter(firstLine: string): string {
  return DELIMITERS
    .map(delimiter => ({ delimiter, count: firstLine.split(delimiter).length }))
    .sort((a, b) => b.count - a.count)[0]!
    .delimiter
}

export function parseCsv(text: string): string[][] {
  const delimiter = detectDelimiter(text.split(/\r?\n/, 1)[0] ?? '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index++) {
    const char = text[index]!

    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"'
        index++
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
    } else if (char === '"' && field === '') {
      quoted = true
    } else if (char === delimiter) {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter(cells => cells.some(cell => cell.trim() !== ''))
}

function normalizeHeader(cell: string): string {
  return cell.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, '').replace(/[^\d.,\-+]/g, '')
  if (!/\d/.test(cleaned)) return null

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  let normalized = cleaned

  if (lastComma !== -1 && lastDot !== -1) {
    normalized = lastComma > lastDot
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned.replace(/,/g, '')
  } else if (lastComma !== -1) {
    const decimals = cleaned.length - lastComma - 1
    normalized = decimals <= 2 && cleaned.indexOf(',') === lastComma
      ? cleaned.replace(',', '.')
      : cleaned.replace(/,/g, '')
  }

  const value = Number(normalized)

  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null
}

export function parseDate(raw: string): string | null {
  const value = raw.trim()
  let match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(value)
  let year: number, month: number, day: number

  if (match) {
    year = Number(match[1])
    month = Number(match[2])
    day = Number(match[3])
  } else {
    match = /^(\d{1,2})[./](\d{1,2})[./](\d{2,4})/.exec(value)
    if (!match) return null
    day = Number(match[1])
    month = Number(match[2])
    year = Number(match[3])
    if (year < 100) year += 2000
  }

  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null

  return date.toISOString().slice(0, 10)
}

function parseType(raw: string): 'INCOME' | 'EXPENSE' | 'TRANSFER' | null {
  const value = raw.trim().toLowerCase()

  if (['income', 'доход', 'приход', '+'].includes(value)) return 'INCOME'
  if (['expense', 'расход', 'трата', '-'].includes(value)) return 'EXPENSE'
  if (['transfer', 'перевод'].includes(value)) return 'TRANSFER'

  return null
}

function splitTags(raw: string): string[] {
  return [...new Set(raw.split(/[,|]/).map(tag => tag.trim().slice(0, MAX_TAG_NAME_LENGTH)).filter(Boolean))].slice(0, MAX_TRANSACTION_TAGS)
}

interface Draft {
  line: number
  date: string | null
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | null
  amount: number | null
  category: string
  notes: string
  tags: string[]
  currency: string | null
}

type Columns = Record<string, number>

function columns(header: string[], aliases: Record<string, string[]>): Columns {
  const normalized = header.map(normalizeHeader)
  const found: Columns = {}

  for (const [name, names] of Object.entries(aliases)) {
    const index = normalized.findIndex(cell => names.includes(cell))
    if (index !== -1) found[name] = index
  }

  return found
}

const MYDAY_COLUMNS = {
  date: ['date', 'дата'],
  type: ['type', 'тип'],
  amount: ['amount', 'сумма'],
  currency: ['currency', 'валюта'],
  category: ['category', 'категория'],
  tags: ['tags', 'теги', 'метки'],
  notes: ['notes', 'note', 'comment', 'заметка', 'комментарий']
}

const ZENMONEY_COLUMNS = {
  date: ['date'],
  category: ['categoryname'],
  payee: ['payee'],
  comment: ['comment'],
  outcomeAccount: ['outcomeaccountname'],
  outcome: ['outcome'],
  outcomeCurrency: ['outcomecurrencyshorttitle'],
  incomeAccount: ['incomeaccountname'],
  income: ['income'],
  incomeCurrency: ['incomecurrencyshorttitle']
}

const COINKEEPER_COLUMNS = {
  date: ['дата', 'date'],
  type: ['тип', 'type'],
  from: ['из', 'from'],
  to: ['в', 'to'],
  tags: ['метки', 'tags'],
  amount: ['сумма', 'amount'],
  currency: ['валюта', 'currency'],
  notes: ['примечание', 'заметка', 'note', 'notes', 'comment']
}

function has(found: Columns, ...names: string[]): boolean {
  return names.every(name => found[name] !== undefined)
}

export function detectSource(header: string[]): ImportSource | null {
  if (has(columns(header, ZENMONEY_COLUMNS), 'date', 'category', 'outcome', 'income')) return 'zenmoney'
  if (has(columns(header, COINKEEPER_COLUMNS), 'date', 'type', 'from', 'to', 'amount')) return 'coinkeeper'
  if (has(columns(header, MYDAY_COLUMNS), 'date', 'amount')) return 'myday'

  return null
}

function cell(row: string[], found: Columns, name: string): string {
  const index = found[name]

  return index === undefined ? '' : (row[index] ?? '').trim()
}

function mydayDraft(row: string[], found: Columns, line: number): Draft {
  const amount = parseAmount(cell(row, found, 'amount'))
  const rawType = cell(row, found, 'type')
  const signed = amount === null ? null : amount < 0 ? 'EXPENSE' : 'INCOME'

  return {
    line,
    date: parseDate(cell(row, found, 'date')),
    type: rawType ? parseType(rawType) : signed,
    amount: amount === null ? null : Math.abs(amount),
    category: cell(row, found, 'category'),
    notes: cell(row, found, 'notes'),
    tags: splitTags(cell(row, found, 'tags')),
    currency: cell(row, found, 'currency').toUpperCase() || null
  }
}

function zenmoneyDraft(row: string[], found: Columns, line: number): Draft {
  const outcome = parseAmount(cell(row, found, 'outcome')) ?? 0
  const income = parseAmount(cell(row, found, 'income')) ?? 0
  const notes = [cell(row, found, 'payee'), cell(row, found, 'comment')].filter(Boolean).join(' · ')
  const base = { line, date: parseDate(cell(row, found, 'date')), category: cell(row, found, 'category'), notes, tags: [] }

  if (outcome > 0 && income > 0) return { ...base, type: 'TRANSFER', amount: outcome, currency: null }
  if (outcome > 0) return { ...base, type: 'EXPENSE', amount: outcome, currency: cell(row, found, 'outcomeCurrency').toUpperCase() || null }
  if (income > 0) return { ...base, type: 'INCOME', amount: income, currency: cell(row, found, 'incomeCurrency').toUpperCase() || null }

  return { ...base, type: 'EXPENSE', amount: null, currency: null }
}

function coinkeeperDraft(row: string[], found: Columns, line: number): Draft {
  const type = parseType(cell(row, found, 'type'))
  const amount = parseAmount(cell(row, found, 'amount'))

  return {
    line,
    date: parseDate(cell(row, found, 'date')),
    type,
    amount: amount === null ? null : Math.abs(amount),
    category: type === 'INCOME' ? cell(row, found, 'from') : cell(row, found, 'to'),
    notes: cell(row, found, 'notes'),
    tags: splitTags(cell(row, found, 'tags')),
    currency: cell(row, found, 'currency').toUpperCase() || null
  }
}

const DRAFTS: Record<ImportSource, { aliases: Record<string, string[]>, draft: (row: string[], found: Columns, line: number) => Draft }> = {
  myday: { aliases: MYDAY_COLUMNS, draft: mydayDraft },
  zenmoney: { aliases: ZENMONEY_COLUMNS, draft: zenmoneyDraft },
  coinkeeper: { aliases: COINKEEPER_COLUMNS, draft: coinkeeperDraft }
}

export function parseImport(text: string): ParsedImport | null {
  const [header, ...body] = parseCsv(text)
  if (!header) return null

  const source = detectSource(header)
  if (!source) return null

  const { aliases, draft } = DRAFTS[source]
  const found = columns(header, aliases)
  const rows: ImportRow[] = []
  const skipped: ImportSkip[] = []
  const seen = new Map<string, number>()

  body.forEach((cells, index) => {
    const line = index + 2
    const item = draft(cells, found, line)

    if (item.type === 'TRANSFER') return skipped.push({ line, reason: 'transfer' })
    if (!item.date) return skipped.push({ line, reason: 'date' })
    if (!item.type) return skipped.push({ line, reason: 'type' })
    if (!item.amount || item.amount > MAX_AMOUNT) return skipped.push({ line, reason: 'amount' })

    const category = item.category.slice(0, MAX_NAME_LENGTH)
    const notes = item.notes.slice(0, MAX_NOTES_LENGTH)
    const key = [item.date, item.type, item.amount.toFixed(2), category, notes].join('|')
    const occurrence = seen.get(key) ?? 0
    seen.set(key, occurrence + 1)

    rows.push({
      line,
      date: item.date,
      type: item.type,
      amount: item.amount,
      category,
      notes,
      tags: item.tags,
      currency: item.currency,
      fingerprint: `${key}|${occurrence}`
    })
  })

  return { source, rows, skipped }
}
