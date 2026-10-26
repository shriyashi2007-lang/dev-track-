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

  it('rejects blank titles while allowing a trimmed single-character title', () => {
    const res = validateProblem({
      title: '   ',
      platform: 'LeetCode',
      difficulty: 'Easy',
      topics: ['Arrays'],
      status: 'Todo',
    })
    expect(res.isValid).toBe(false)
    expect(res.errors.title).toBeDefined()
    expect(validateProblem({
      title: ' A ', platform: 'LeetCode', difficulty: 'Easy', topics: ['Arrays'], status: 'Todo',
    }).isValid).toBe(true)
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

  it('whitelists legacy problem imports and drops unknown fields', () => {
    const result = validateImportData([{
      id: 'safe', title: 'Safe import', platform: 'LeetCode', difficulty: 'Easy',
      topics: ['Arrays'], status: 'Todo', unknown: 'drop me',
      revision: { marked: false, priority: 'Medium', unknown: 'drop me too' },
    }])
    expect(result.isValid).toBe(true)
    expect(result.validItems[0]).not.toHaveProperty('unknown')
    expect(result.validItems[0].revision).not.toHaveProperty('unknown')
  })

  it('returns useful metadata when an import contains no valid entries', () => {
    const result = validateImportData([null, 'bad', { title: '' }])

    expect(result).toMatchObject({
      isValid: false,
      validItems: [],
      rejectedCount: 3,
      totalCount: 3,
      error: 'No valid problem entries found in the file',
    })
  })

  it('rejects non-array import payloads before reading entries', () => {
    expect(validateImportData({ problems: [] })).toEqual({
      isValid: false,
      validItems: [],
      error: 'Import file must be a JSON array of problems',
    })
  })

  it('reports invalid revision priorities on marked problems', () => {
    const result = validateProblem({
      title: 'Priority check',
      platform: 'LeetCode',
      difficulty: 'Easy',
      topics: ['Arrays'],
      status: 'Todo',
      revision: { marked: true, priority: 'Urgent' },
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.priority).toBe('Priority must be High, Medium, or Low')
  })
})
