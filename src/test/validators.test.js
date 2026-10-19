import { describe, it, expect } from 'vitest'
import { validateProblem, validateImportData, isValidUrl } from '../utils/validators'
import { getLocalDateString, addDays } from '../utils/dates'

describe('Validators', () => {
  it('validates URL formats correctly', () => {
    expect(isValidUrl('https://leetcode.com')).toBe(true)
    expect(isValidUrl('http://example.com/test')).toBe(true)
    expect(isValidUrl('')).toBe(true) // optional
    expect(isValidUrl(null)).toBe(true)
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
    expect(isValidUrl('invalid-url')).toBe(false)
  })

  it('rejects problems with short or missing titles', () => {
    const res = validateProblem({
      title: 'A',
      platform: 'LeetCode',
      difficulty: 'Easy',
      topics: ['Arrays'],
      status: 'Todo',
    })
    expect(res.isValid).toBe(false)
    expect(res.errors.title).toBeDefined()
  })

  it('rejects Solved problems without solvedDate or with future dates', () => {
    const futureDate = getLocalDateString(addDays(new Date(), 2))
    const res = validateProblem({
      title: 'Valid Title',
      platform: 'LeetCode',
      difficulty: 'Easy',
      topics: ['Arrays'],
      status: 'Solved',
      solvedDate: futureDate,
    })
    expect(res.isValid).toBe(false)
    expect(res.errors.solvedDate).toBe('Solved date cannot be in the future')
  })

  it('accepts a fully valid problem', () => {
    const res = validateProblem({
      title: 'Valid Problem',
      platform: 'LeetCode',
      difficulty: 'Medium',
      topics: ['Dynamic Programming'],
      status: 'Solved',
      solvedDate: getLocalDateString(new Date()),
      url: 'https://leetcode.com/problems/test',
    })
    expect(res.isValid).toBe(true)
    expect(Object.keys(res.errors).length).toBe(0)
  })

  it('validates import payload', () => {
    const validP = {
      title: 'Import 1',
      platform: 'LeetCode',
      difficulty: 'Easy',
      topics: ['Arrays'],
      status: 'Todo',
    }
    const invalidP = { title: '' }

    const res = validateImportData([validP, invalidP])
    expect(res.isValid).toBe(true)
    expect(res.validItems.length).toBe(1)
    expect(res.rejectedCount).toBe(1)
  })
})
