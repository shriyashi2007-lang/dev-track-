import { describe, expect, it } from 'vitest'
import {
  addDays,
  formatDate,
  getDaysDifference,
  getLocalDateString,
  subDays,
  toDate,
} from '../utils/dates'

describe('date utilities', () => {
  const reference = new Date(2026, 9, 21, 12)

  it('normalizes supported values and rejects invalid input', () => {
    expect(toDate(reference)).toBe(reference)
    expect(toDate('2026-10-21')).toBeInstanceOf(Date)
    expect(toDate('not-a-date')).toBeNull()
    expect(toDate(null)).toBeNull()
  })

  it('formats local dates without a timezone shift', () => {
    expect(getLocalDateString(reference)).toBe('2026-10-21')
    expect(formatDate(reference, 'yyyy/MM/dd')).toBe('2026/10/21')
    expect(formatDate('invalid')).toBe('—')
  })

  it('adds, subtracts, and compares calendar days', () => {
    expect(getLocalDateString(addDays(reference, 2))).toBe('2026-10-23')
    expect(getLocalDateString(subDays(reference, 2))).toBe('2026-10-19')
    expect(getDaysDifference(addDays(reference, 3), reference)).toBe(3)
    expect(getDaysDifference('invalid', reference)).toBe(0)
  })
})
