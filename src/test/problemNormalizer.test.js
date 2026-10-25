import { describe, expect, it } from 'vitest'
import {
  isSafeExternalUrl,
  normalizeDifficulty,
  normalizeProblem,
  normalizeProblems,
  normalizeSolvedDate,
} from '../utils/problemNormalizer'

describe('problem normalizer', () => {
  it('provides deterministic defaults for sparse and malformed records', () => {
    expect(normalizeProblem(null, 3)).toMatchObject({
      title: 'Untitled problem',
      platform: 'Other',
      difficulty: 'Unknown',
      topics: ['Uncategorized'],
      status: 'Todo',
      solvedDate: null,
    })
    expect(normalizeProblem(null, 3).id).toMatch(/^legacy-/)
    expect(normalizeProblems('not-an-array')).toEqual([])
  })

  it('keeps missing IDs stable when unrelated records are prepended', () => {
    const legacy = { title: 'Legacy graph', platform: 'Other', solvedDate: '2026-10-01' }
    const originalId = normalizeProblems([legacy])[0].id
    const shiftedId = normalizeProblems([{ id: 'new', title: 'New' }, legacy])[1].id
    expect(shiftedId).toBe(originalId)
  })

  it('canonicalizes difficulty, topics, statuses, and ISO timestamps', () => {
    const iso = '2026-10-20T23:30:00Z'
    const result = normalizeProblem({
      id: 42,
      title: '  Two Sum ',
      difficulty: ' expert ',
      topic: ' Arrays ',
      status: 'in progress',
      solvedDate: iso,
    })

    expect(result).toMatchObject({
      id: '42',
      title: 'Two Sum',
      difficulty: 'Unknown',
      topics: ['Arrays'],
      status: 'Attempted',
      solvedDate: null,
    })
    expect(normalizeDifficulty(' HARD ')).toBe('Hard')
    expect(normalizeSolvedDate('not-a-date')).toBeNull()
  })

  it('supports Day 3 aliases and clears dates for non-solved records', () => {
    expect(normalizeProblem({ status: 'Solved', dateSolved: '2026-10-20', topic: 'Trees', markedForRevision: true })).toMatchObject({
      status: 'Solved', solvedDate: '2026-10-20', topics: ['Trees'], revision: { marked: true },
    })
    expect(normalizeProblem({ status: 'Revisit', solvedDate: '2026-10-20' })).toMatchObject({
      status: 'Revisit', solvedDate: null,
    })
  })

  it('allows only http and https external URLs', () => {
    expect(isSafeExternalUrl('https://leetcode.com/problems/two-sum')).toBe(true)
    expect(isSafeExternalUrl('http://example.test/problem')).toBe(true)
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeExternalUrl('not a url')).toBe(false)
  })
})
