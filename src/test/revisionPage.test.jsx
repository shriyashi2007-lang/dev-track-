import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProblems } from '../context/ProblemsContext'
import Revision from '../pages/Revision'
import { getLocalDateString } from '../utils/dates'

vi.mock('../context/ProblemsContext', () => ({ useProblems: vi.fn() }))

const problems = [
  { id: 'overdue', title: 'Overdue Graph', difficulty: 'Hard', topics: ['Graphs'], status: 'Solved', revision: { marked: true, priority: 'High', stage: 1, revisionCount: 1, nextRevisionDate: '2020-01-01' } },
  { id: 'today', title: 'Today Array', difficulty: 'Easy', topics: ['Arrays'], status: 'Solved', revision: { marked: true, priority: 'Medium', stage: 0, revisionCount: 0, nextRevisionDate: getLocalDateString() } },
  { id: 'upcoming', title: 'Upcoming Tree', difficulty: 'Medium', topics: ['Trees'], status: 'Attempted', revision: { marked: true, priority: 'Low', stage: 2, revisionCount: 2, nextRevisionDate: '2099-01-01' } },
]

describe('Revision page', () => {
  beforeEach(() => {
    useProblems.mockReturnValue({
      problems,
      revisionHistory: [{ id: 'history-1', problemId: 'deleted', snapshotTitle: 'Deleted Snapshot', revisedAt: '2026-10-20T10:00:00.000Z', previousDueDate: '2026-10-20', nextScheduledDate: '2026-10-23', stage: 0 }],
      revisionRepairCount: 0,
      completeProblemRevision: vi.fn(),
      rescheduleProblemRevision: vi.fn(),
      changeRevisionPriority: vi.fn(),
      setProblemRevision: vi.fn(),
    })
  })

  it('keeps summary cards, queue filtering, and durable history in agreement', () => {
    render(<MemoryRouter><Revision /></MemoryRouter>)

    expect(screen.getByRole('button', { name: /scheduled/i })).toHaveTextContent('3')
    expect(screen.getByRole('button', { name: /completed sessions/i })).toHaveTextContent('1')
    expect(screen.getByText('Showing 3 of 3 scheduled problems')).toBeInTheDocument()

    fireEvent.click(within(screen.getByRole('region', { name: 'Revision summary' })).getByRole('button', { name: /overdue/i }))
    expect(screen.getByText('Showing 1 of 3 scheduled problems')).toBeInTheDocument()
    expect(screen.getAllByText('Overdue Graph').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('tab', { name: /history/i }))
    expect(screen.getAllByText('Deleted Snapshot').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Problem deleted').length).toBeGreaterThan(0)
  }, 15000)
})
