import { describe, it, expect } from 'vitest'
import { filterProblems, parseFilterParams, serializeFilterParams } from '../utils/filters'
import { sortProblems } from '../utils/sorting'

describe('Filtering and Sorting', () => {
  const problems = [
    {
      id: '1',
      title: 'Two Sum',
      platform: 'LeetCode',
      difficulty: 'Easy',
      topics: ['Arrays', 'Hash Table'],
      status: 'Solved',
      solvedDate: '2026-10-18',
      timeTakenMinutes: 15,
      revision: { marked: false },
    },
    {
      id: '2',
      title: 'Binary Tree Inorder Traversal',
      platform: 'LeetCode',
      difficulty: 'Medium',
      topics: ['Trees'],
      status: 'Solved',
      solvedDate: '2026-10-19',
      timeTakenMinutes: 30,
      revision: { marked: true },
    },
    {
      id: '3',
      title: 'Graph Valid Tree',
      platform: 'GeeksforGeeks',
      difficulty: 'Hard',
      topics: ['Graphs', 'Trees'],
      status: 'Attempted',
      solvedDate: null,
      timeTakenMinutes: 45,
      revision: { marked: true },
    },
  ]

  it('filters by search term across title and topic', () => {
    const res = filterProblems(problems, { search: 'tree' })
    expect(res.length).toBe(2)
    expect(res.map((p) => p.id)).toEqual(['2', '3'])
  })

  it('filters by difficulty and status', () => {
    const res = filterProblems(problems, {
      difficulties: ['Medium', 'Hard'],
      status: 'Solved',
    })
    expect(res.length).toBe(1)
    expect(res[0].id).toBe('2')
  })

  it('filters by revision flag', () => {
    const res = filterProblems(problems, { revisionOnly: true })
    expect(res.length).toBe(2)
  })

  it('round trips non-default filters through URL search params', () => {
    const filters = {
      search: 'binary tree',
      difficulties: ['Medium', 'Hard'],
      topics: ['Trees', 'Graphs'],
      platforms: ['LeetCode'],
      status: 'Solved',
      revisionOnly: true,
      sort: 'title-asc',
    }

    const params = serializeFilterParams(filters)
    expect(parseFilterParams(params)).toEqual(filters)
  })

  it('omits default filter values from the URL', () => {
    const params = serializeFilterParams({ status: 'all', sort: 'newest' })
    expect(params.toString()).toBe('')
    expect(parseFilterParams(params)).toMatchObject({
      status: 'all',
      sort: 'newest',
      revisionOnly: false,
    })
  })

  it('sorts correctly by difficulty ascending and descending', () => {
    const asc = sortProblems(problems, 'difficulty-asc')
    expect(asc.map((p) => p.difficulty)).toEqual(['Easy', 'Medium', 'Hard'])

    const desc = sortProblems(problems, 'difficulty-desc')
    expect(desc.map((p) => p.difficulty)).toEqual(['Hard', 'Medium', 'Easy'])
  })

  it('sorts titles and times without mutating the source array', () => {
    const originalOrder = problems.map((problem) => problem.id)

    expect(sortProblems(problems, 'title-asc').map((problem) => problem.id)).toEqual([
      '2',
      '3',
      '1',
    ])
    expect(sortProblems(problems, 'time-desc').map((problem) => problem.id)).toEqual([
      '3',
      '2',
      '1',
    ])
    expect(problems.map((problem) => problem.id)).toEqual(originalOrder)
  })

  it('places missing times after real values in ascending order', () => {
    const withMissingTime = [...problems, { id: '4', title: 'Untimed' }]
    expect(sortProblems(withMissingTime, 'time-asc').at(-1).id).toBe('4')
  })
})
