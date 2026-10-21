import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { problemService } from '../services/problemService'

describe('problem service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates, updates, finds, and removes a problem', async () => {
    const created = await problemService.create({
      id: 'problem-1',
      title: '  Two Sum  ',
      status: 'Todo',
    })

    expect(created).toMatchObject({
      id: 'problem-1',
      title: 'Two Sum',
      status: 'Todo',
      solvedDate: null,
    })
    expect(await problemService.getById('problem-1')).toEqual(created)

    const updated = await problemService.update('problem-1', { status: 'Solved' })
    expect(updated.status).toBe('Solved')
    expect(updated.solvedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)

    expect(await problemService.remove('problem-1')).toEqual(updated)
    expect(await problemService.getAll()).toEqual([])
  })

  it('assigns a fresh ID when a merged import collides', async () => {
    await problemService.create({ id: 'duplicate', title: 'Original' })
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'replacement-id') })

    const merged = await problemService.importProblems([
      { id: 'duplicate', title: 'Imported' },
    ])

    expect(merged.map((problem) => problem.id)).toEqual([
      'replacement-id',
      'duplicate',
    ])
  })

  it('rejects updates for an unknown problem', async () => {
    await expect(problemService.update('missing', { title: 'Nope' })).rejects.toThrow(
      'Problem with ID missing not found'
    )
  })
})
