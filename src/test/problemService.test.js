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

  it('normalizes legacy records on read without rewriting stored JSON', async () => {
    const raw = JSON.stringify([{ title: ' Legacy ', difficulty: 'expert', topic: 'Graphs' }])
    localStorage.setItem('devtrack:v1:problems', raw)

    const records = await problemService.getAll()
    expect(records[0]).toMatchObject({
      title: 'Legacy',
      difficulty: 'Unknown',
      topics: ['Graphs'],
    })
    expect(localStorage.getItem('devtrack:v1:problems')).toBe(raw)
    expect(records[0].id).toMatch(/^legacy-/)
  })

  it('reports corrupted storage while preserving the original value', async () => {
    localStorage.setItem('devtrack:v1:problems', '{broken')
    const result = await problemService.getAllWithMeta()
    expect(result.problems).toEqual([])
    expect(result.error).toBeInstanceOf(Error)
    expect(localStorage.getItem('devtrack:v1:problems')).toBe('{broken')
    await expect(problemService.create({ title: 'Would overwrite' })).rejects.toThrow(/left it unchanged/i)
    expect(localStorage.getItem('devtrack:v1:problems')).toBe('{broken')
  })

  it('accepts Day 3 aliases and preserves identity fields during edits', async () => {
    const created = await problemService.create({
      id: 'alias-problem', title: 'Alias', status: 'Solved', dateSolved: '2026-10-20',
      topic: 'Trees', markedForRevision: true,
    })
    expect(created).toMatchObject({
      solvedDate: '2026-10-20', topics: ['Trees'], revision: { marked: true },
    })

    const updated = await problemService.update(created.id, {
      id: 'replacement', createdAt: 'replacement', status: 'Revisit', dateSolved: '2026-10-21',
    })
    expect(updated.id).toBe(created.id)
    expect(updated.createdAt).toBe(created.createdAt)
    expect(updated).toMatchObject({ status: 'Revisit', solvedDate: null })
  })
})
