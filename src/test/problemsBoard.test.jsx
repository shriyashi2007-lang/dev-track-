import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProblemsBoard } from '../components/problems/ProblemsBoard'

const problem = {
  id: 'board-1',
  title: 'Review Graph Paths',
  platform: 'Codeforces',
  url: 'https://example.com/graph-paths',
  difficulty: 'Hard',
  topics: ['Graphs'],
  status: 'Revisit',
  revision: { marked: true },
}

describe('ProblemsBoard', () => {
  it('shows the revisit workflow and exposes keyboard-friendly card actions', () => {
    const onUpdateStatus = vi.fn()
    const onDelete = vi.fn()
    render(<ProblemsBoard problems={[problem]} onUpdateStatus={onUpdateStatus} onEdit={vi.fn()} onDelete={onDelete} />)

    expect(screen.getByText('Revisit')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review Graph Paths' })).toHaveAttribute('rel', expect.stringContaining('noopener'))

    fireEvent.click(screen.getByRole('button', { name: 'Options' }))
    fireEvent.click(screen.getByRole('button', { name: /solved & mastered/i }))
    expect(onUpdateStatus).toHaveBeenCalledWith('board-1', 'Solved')

    fireEvent.click(screen.getByRole('button', { name: 'Options' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith(problem)
  })
})
