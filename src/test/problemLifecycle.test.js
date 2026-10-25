import { beforeEach, describe, expect, it } from 'vitest'
import { problemService } from '../services/problemService'
import { getTotalSolved, getWeeklyProgress } from '../utils/dashboardMetrics'
import { getLocalDateString } from '../utils/dates'

describe('problem lifecycle metrics', () => {
  beforeEach(() => localStorage.clear())

  it('adds and removes dashboard activity as a problem changes status', async () => {
    const today = getLocalDateString()
    const solved = await problemService.create({
      id: 'lifecycle-1',
      title: 'Lifecycle problem',
      status: 'Solved',
      solvedDate: today,
    })

    expect(getTotalSolved([solved])).toBe(1)
    expect(getWeeklyProgress([solved]).at(-1).count).toBe(1)

    const revisit = await problemService.update(solved.id, { status: 'Revisit' })
    expect(revisit.solvedDate).toBeNull()
    expect(getTotalSolved([revisit])).toBe(0)
    expect(getWeeklyProgress([revisit]).at(-1).count).toBe(0)

    const solvedAgain = await problemService.update(solved.id, { status: 'Solved' })
    expect(solvedAgain.solvedDate).toBe(today)
    expect(getTotalSolved([solvedAgain])).toBe(1)

    await problemService.remove(solved.id)
    expect(await problemService.getAll()).toEqual([])
  })
})
