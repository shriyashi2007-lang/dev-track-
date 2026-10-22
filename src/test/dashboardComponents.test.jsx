import { useState } from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ActivityChart } from '../components/dashboard/ActivityChart'
import { ContributionHeatmap } from '../components/dashboard/ContributionHeatmap'
import { RecentSolvedList } from '../components/dashboard/RecentSolvedList'
import { StatCards } from '../components/dashboard/StatCards'
import { formatDate, getLocalDateString } from '../utils/dates'

function RecentHarness() {
  const [problems, setProblems] = useState([
    { id: 'recent', title: 'Recent problem', status: 'Solved', difficulty: 'Easy', solvedDate: getLocalDateString(), topics: ['Arrays'], platform: 'LeetCode', revision: {} },
  ])
  return <RecentSolvedList problems={problems} onEdit={() => {}} onToggleRevision={() => {}} onDelete={(id) => setProblems((items) => items.filter((item) => item.id !== id))} />
}

describe('dashboard components', () => {
  it('renders the six required stat cards', () => {
    render(
      <MemoryRouter>
        <StatCards
          stats={{ solved: 8, todo: 2, attempted: 1, easy: 3, medium: 3, hard: 2, unknown: 0 }}
          streaks={{ currentStreak: 4, longestStreak: 9, isStreakAtRisk: false }}
        />
      </MemoryRouter>
    )
    expect(screen.getAllByRole('button')).toHaveLength(4)
    ;['Total solved', 'Easy', 'Medium', 'Hard', 'Current streak', 'Longest streak'].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument())
  })

  it('provides an actionable weekly empty state and accessible fallback table', () => {
    const onAdd = vi.fn()
    render(<ActivityChart problems={[]} onAddProblem={onAdd} />)
    expect(screen.getByText('No solved problems this week')).toBeInTheDocument()
    expect(screen.getByRole('table', { name: /last seven days/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add problem' }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('labels heatmap cells and supports arrow-key focus movement', () => {
    const today = getLocalDateString()
    render(<ContributionHeatmap problems={[{ id: 'today', title: 'Today', solvedDate: today, difficulty: 'Easy' }]} />)
    const fullDate = formatDate(today, 'MMMM d, yyyy')
    const todayCell = screen.getByRole('gridcell', { name: `1 problem solved on ${fullDate}` })
    fireEvent.focus(todayCell)
    fireEvent.keyDown(todayCell, { key: 'ArrowUp' })
    expect(document.activeElement).not.toBe(todayCell)
    expect(screen.getByRole('status')).toHaveTextContent(/problem.*solved on/i)
  })

  it('removes a recent item immediately and reveals its empty state', async () => {
    render(<MemoryRouter><RecentHarness /></MemoryRouter>)
    const article = screen.getByRole('article')
    expect(within(article).getByText('Recent problem')).toBeInTheDocument()
    fireEvent.click(within(article).getByRole('button', { name: 'Delete Recent problem' }))
    await waitFor(() => expect(screen.queryByText('Recent problem')).not.toBeInTheDocument())
    expect(screen.getByText('No dated solves yet')).toBeInTheDocument()
  })
})
