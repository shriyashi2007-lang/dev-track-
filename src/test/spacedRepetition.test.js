import { describe, expect, it } from 'vitest'
import {
  REVISION_INTERVALS,
  advanceRevision,
  createInitialRevision,
  deriveRevisionStats,
  filterRevisionQueue,
  getRevisionDueState,
  getRevisionRelativeText,
  normalizeRevisionState,
  sortRevisionQueue,
} from '../utils/spacedRepetition'

const localDate = (year, monthIndex, day, hour = 12) => new Date(year, monthIndex, day, hour, 0, 0)

describe('smart revision scheduler', () => {
  it('starts tomorrow at stage zero across a month boundary', () => {
    const revision = createInitialRevision(localDate(2026, 9, 31, 23))
    expect(revision).toMatchObject({ stage: 0, nextRevisionDate: '2026-11-01', revisionCount: 0 })
  })

  it('advances through 1, 3, 7, 14, and 30 day stages from the actual completion day', () => {
    const completion = localDate(2026, 0, 30)
    const expected = [
      { completedStage: 0, nextStage: 1, daysAdded: 3, nextRevisionDate: '2026-02-02' },
      { completedStage: 1, nextStage: 2, daysAdded: 7, nextRevisionDate: '2026-02-06' },
      { completedStage: 2, nextStage: 3, daysAdded: 14, nextRevisionDate: '2026-02-13' },
      { completedStage: 3, nextStage: 4, daysAdded: 30, nextRevisionDate: '2026-03-01' },
    ]
    expected.forEach((value, stage) => expect(advanceRevision({ marked: true, stage, revisionCount: stage, nextRevisionDate: '2026-01-01' }, completion)).toMatchObject(value))
    expect(REVISION_INTERVALS).toEqual([1, 3, 7, 14, 30])
  })

  it('keeps the final stage on recurring 30-day maintenance', () => {
    expect(advanceRevision({ marked: true, stage: 4, revisionCount: 9, nextRevisionDate: '2026-10-01' }, localDate(2026, 9, 25))).toMatchObject({
      completedStage: 4,
      nextStage: 4,
      daysAdded: 30,
      nextRevisionDate: '2026-11-24',
      nextCount: 10,
      maintenance: true,
    })
  })

  it('classifies and describes overdue, today, and upcoming local dates', () => {
    const reference = localDate(2026, 9, 25, 0)
    expect(getRevisionDueState({ nextRevisionDate: '2026-10-24' }, reference)).toBe('overdue')
    expect(getRevisionDueState({ nextRevisionDate: '2026-10-25' }, reference)).toBe('today')
    expect(getRevisionDueState({ nextRevisionDate: '2026-10-28' }, reference)).toBe('upcoming')
    expect(getRevisionRelativeText('2026-10-23', reference)).toBe('Overdue by 2 days')
    expect(getRevisionRelativeText('2026-10-25', reference)).toBe('Today')
    expect(getRevisionRelativeText('2026-10-28', reference)).toBe('In 3 days')
  })

  it('repairs invalid marked schedules and leaves unmarked entries unscheduled', () => {
    const reference = localDate(2026, 11, 31, 23)
    expect(normalizeRevisionState({ marked: true, nextRevisionDate: 'invalid' }, reference)).toMatchObject({ nextRevisionDate: '2027-01-01', scheduleRepaired: true })
    expect(normalizeRevisionState({ marked: false, nextRevisionDate: '2026-01-01' }, reference).nextRevisionDate).toBeNull()
  })

  it('sorts overdue first and preserves all same-day entries with priority and title tie breaks', () => {
    const reference = localDate(2026, 9, 25)
    const items = [
      { id: 'today', title: 'Today', revision: { marked: true, priority: 'Low', nextRevisionDate: '2026-10-25' } },
      { id: 'beta', title: 'Beta', revision: { marked: true, priority: 'High', nextRevisionDate: '2026-10-24' } },
      { id: 'alpha', title: 'Alpha', revision: { marked: true, priority: 'High', nextRevisionDate: '2026-10-24' } },
      { id: 'upcoming', title: 'Upcoming', revision: { marked: true, priority: 'Medium', nextRevisionDate: '2026-10-26' } },
    ]
    expect(sortRevisionQueue(items, reference).map((item) => item.id)).toEqual(['alpha', 'beta', 'today', 'upcoming'])
  })

  it('combines filters with AND logic and derives queue/history statistics', () => {
    const reference = localDate(2026, 9, 25)
    const problems = [
      { id: '1', title: 'Graph Paths', difficulty: 'Hard', topics: ['Graphs'], revision: { marked: true, priority: 'High', nextRevisionDate: '2026-10-24' } },
      { id: '2', title: 'Graph Easy', difficulty: 'Easy', topics: ['Graphs'], revision: { marked: true, priority: 'Low', nextRevisionDate: '2026-10-25' } },
      { id: '3', title: 'Arrays', difficulty: 'Hard', topics: ['Arrays'], revision: { marked: true, priority: 'High', nextRevisionDate: '2026-10-27' } },
    ]
    expect(filterRevisionQueue(problems, { search: ' graph ', topic: 'Graphs', difficulty: 'Hard', priority: 'High', dueState: 'overdue' }, reference).map((item) => item.id)).toEqual(['1'])
    expect(deriveRevisionStats(problems, [{ id: 'h1' }, { id: 'h2' }], reference)).toEqual({ total: 3, overdue: 1, today: 1, upcoming: 1, completed: 2 })
  })
})
