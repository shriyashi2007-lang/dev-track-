import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { subDays } from 'date-fns'
import Analytics from '../pages/Analytics'
import { getLocalDateString } from '../utils/dates'

const mockState = vi.hoisted(() => ({
  problems: [],
  stats: {},
  streaks: {},
  isLoading: false,
  loadError: null,
  refreshProblems: vi.fn(),
  loadSampleData: vi.fn(),
}))

vi.mock('../context/ProblemsContext', () => ({ useProblems: () => mockState }))
vi.mock('../services/exportService', () => ({ exportAnalyticsSummary: vi.fn() }))

function record(id, day, extra = {}) {
  return { id, title: `Problem ${id}`, status: 'Solved', solvedDate: day, difficulty: 'Medium', topics: ['Arrays'], ...extra }
}

describe('Analytics page', () => {
  beforeEach(() => {
    mockState.problems = []
    mockState.isLoading = false
    mockState.loadError = null
    mockState.refreshProblems.mockClear()
    mockState.loadSampleData.mockClear()
  })

  it('uses the range selector for every range-derived summary', () => {
    const today = new Date()
    mockState.problems = [
      record('1', getLocalDateString(today)),
      record('2', getLocalDateString(subDays(today, 2))),
      record('3', getLocalDateString(subDays(today, 12))),
    ]
    render(<MemoryRouter><Analytics /></MemoryRouter>)
    expect(screen.getByLabelText('Solved in range: 3 problems')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '7 days' }))
    expect(screen.getByLabelText('Solved in range: 2 problems')).toBeInTheDocument()
    expect(screen.getByText('Across 7 local days')).toBeInTheDocument()
  })

  it('recomputes immediately when shared problem records change', () => {
    const today = getLocalDateString(new Date())
    mockState.problems = [record('1', today)]
    const view = render(<MemoryRouter><Analytics /></MemoryRouter>)
    expect(screen.getByLabelText('Solved in range: 1 problem')).toBeInTheDocument()

    mockState.problems = [
      record('1', today, { difficulty: 'Hard', topics: ['Graphs'] }),
      record('2', today, { difficulty: 'Easy', topics: ['Strings'] }),
    ]
    view.rerender(<MemoryRouter><Analytics /></MemoryRouter>)
    expect(screen.getByLabelText('Solved in range: 2 problems')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Graphs: 1/ })).toBeInTheDocument()

    mockState.problems = [record('1', today, { status: 'Attempted' })]
    view.rerender(<MemoryRouter><Analytics /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'No solved problems yet' })).toBeInTheDocument()

    mockState.problems = [record('1', getLocalDateString(subDays(new Date(), 40)))]
    view.rerender(<MemoryRouter><Analytics /></MemoryRouter>)
    expect(screen.getByLabelText('Solved in range: 0 problems')).toBeInTheDocument()

    mockState.problems = [record('1', today)]
    view.rerender(<MemoryRouter><Analytics /></MemoryRouter>)
    expect(screen.getByLabelText('Solved in range: 1 problem')).toBeInTheDocument()
  })

  it('shows a recoverable load error instead of crashing', () => {
    mockState.loadError = new Error('Malformed saved data')
    render(<MemoryRouter><Analytics /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Analytics could not read your saved data' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading' }))
    expect(mockState.refreshProblems).toHaveBeenCalledOnce()
  })
})
