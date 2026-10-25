import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { problemService } from '../services/problemService'

const now = new Date(2026, 9, 25, 12, 0, 0)

describe('revision persistence service', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  afterEach(() => vi.useRealTimers())

  it('migrates marked legacy data once and preserves legacy history independently', async () => {
    localStorage.setItem('devtrack:v1:problems', JSON.stringify([{
      id: 'legacy', title: 'Legacy Graph', difficulty: 'Hard', markedForRevision: true,
      revision: { marked: true, history: [{ date: '2026-10-20', confidence: 'Okay' }] },
    }]))

    const first = await problemService.getAllWithMeta()
    const problemsAfterFirst = localStorage.getItem('devtrack:v1:problems')
    const historyAfterFirst = localStorage.getItem('devtrack:v1:revision_history')
    const second = await problemService.getAllWithMeta()

    expect(first.problems[0].revision).toMatchObject({ marked: true, stage: 0, nextRevisionDate: '2026-10-26' })
    expect(first.revisionHistory).toHaveLength(1)
    expect(first.revisionHistory[0]).toMatchObject({ problemId: 'legacy', snapshotTitle: 'Legacy Graph', previousDueDate: '2026-10-20' })
    expect(second.revisionHistory).toHaveLength(1)
    expect(localStorage.getItem('devtrack:v1:problems')).toBe(problemsAfterFirst)
    expect(localStorage.getItem('devtrack:v1:revision_history')).toBe(historyAfterFirst)
  })

  it('adds exactly one queue entry and schedules tomorrow', async () => {
    const problem = await problemService.create({ id: 'queue', title: 'Queue me' })
    const added = await problemService.setRevisionMarked(problem.id, true, 'High')
    const repeated = await problemService.setRevisionMarked(problem.id, true, 'High')
    expect(added.revision).toMatchObject({ marked: true, priority: 'High', stage: 0, revisionCount: 0, nextRevisionDate: '2026-10-26' })
    expect(repeated).toEqual(added)
    expect((await problemService.getAll()).filter((item) => item.revision.marked)).toHaveLength(1)
  })

  it('guards duplicate completion for the same due cycle', async () => {
    const problem = await problemService.create({ id: 'double', title: 'Double', revision: { marked: true } })
    const cycle = { stage: problem.revision.stage, dueDate: problem.revision.nextRevisionDate }
    const completedAt = new Date(2026, 9, 26, 10, 0, 0)
    const first = await problemService.completeRevision(problem.id, completedAt, cycle)
    const second = await problemService.completeRevision(problem.id, completedAt, cycle)
    const { history } = await problemService.getRevisionHistoryWithMeta()
    expect(first.duplicate).toBe(false)
    expect(first.problem.revision).toMatchObject({ stage: 1, revisionCount: 1, nextRevisionDate: '2026-10-29' })
    expect(second.duplicate).toBe(true)
    expect(history).toHaveLength(1)
  })

  it('reschedules without changing stage, count, or completed history', async () => {
    const problem = await problemService.create({ id: 'reschedule', title: 'Reschedule', revision: { marked: true } })
    const updated = await problemService.rescheduleRevision(problem.id, '2026-11-05', now)
    expect(updated.revision).toMatchObject({ stage: problem.revision.stage, revisionCount: problem.revision.revisionCount, nextRevisionDate: '2026-11-05' })
    expect((await problemService.getRevisionHistoryWithMeta()).history).toEqual([])
    await expect(problemService.rescheduleRevision(problem.id, '2026-10-24', now)).rejects.toThrow(/past/i)
    await expect(problemService.rescheduleRevision(problem.id, 'not-a-date', now)).rejects.toThrow(/valid/i)
  })

  it('keeps snapshot history after queue removal and problem deletion', async () => {
    const problem = await problemService.create({ id: 'deleted', title: 'Keep My Name', revision: { marked: true } })
    await problemService.completeRevision(problem.id, new Date(2026, 9, 26, 9), { stage: 0, dueDate: '2026-10-26' })
    await problemService.setRevisionMarked(problem.id, false)
    expect((await problemService.getRevisionHistoryWithMeta()).history[0].snapshotTitle).toBe('Keep My Name')
    await problemService.remove(problem.id)
    expect(await problemService.getAll()).toEqual([])
    expect((await problemService.getRevisionHistoryWithMeta()).history).toHaveLength(1)
  })

  it('preserves queue metadata when the linked problem is edited', async () => {
    const problem = await problemService.create({ id: 'edit', title: 'Original', topic: 'Arrays', revision: { marked: true, priority: 'High' } })
    const updated = await problemService.update(problem.id, { title: 'Renamed', topics: ['Graphs'] })
    expect(updated).toMatchObject({ title: 'Renamed', topics: ['Graphs'] })
    expect(updated.revision).toMatchObject({ marked: true, priority: 'High', stage: problem.revision.stage, nextRevisionDate: problem.revision.nextRevisionDate })
  })

  it('leaves corrupted history untouched and blocks history-writing actions', async () => {
    await problemService.create({ id: 'safe', title: 'Safe', revision: { marked: true } })
    localStorage.setItem('devtrack:v1:revision_history', '{broken')
    const state = await problemService.getAllWithMeta()
    expect(state.revisionError).toBeInstanceOf(Error)
    expect(localStorage.getItem('devtrack:v1:revision_history')).toBe('{broken')
    await expect(problemService.completeRevision('safe', new Date(2026, 9, 26), { stage: 0, dueDate: '2026-10-26' })).rejects.toThrow(/left it unchanged/i)
    expect(localStorage.getItem('devtrack:v1:revision_history')).toBe('{broken')
  })
})
