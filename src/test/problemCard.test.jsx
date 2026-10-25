import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProblemCard } from '../components/problems/ProblemCard'

const problem = {
  id: 'card-1',
  title: 'Two Sum',
  platform: 'LeetCode',
  url: 'https://leetcode.com/problems/two-sum/',
  difficulty: 'Easy',
  topics: ['Arrays', 'Hash Table'],
  status: 'Revisit',
  solvedDate: null,
  notes: 'Review the hash map approach',
  revision: { marked: true },
}

describe('ProblemCard', () => {
  it('renders safe links and forwards every card action', () => {
    const handlers = {
      onToggleSelect: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onStatusCycle: vi.fn(),
      onToggleRevision: vi.fn(),
    }

    render(<ProblemCard problem={problem} selected={false} {...handlers} />)

    const titleLink = screen.getByRole('link', { name: 'Two Sum' })
    expect(titleLink).toHaveAttribute('href', problem.url)
    expect(titleLink).toHaveAttribute('target', '_blank')
    expect(titleLink).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(screen.getByText('Revisit')).toBeInTheDocument()
    expect(screen.getByText('In revision queue')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Two Sum' }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit Two Sum' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete Two Sum' }))
    fireEvent.click(screen.getByRole('button', { name: /change status for two sum/i }))
    fireEvent.click(screen.getByRole('button', { name: /remove two sum from revision/i }))

    expect(handlers.onToggleSelect).toHaveBeenCalledWith('card-1')
    expect(handlers.onEdit).toHaveBeenCalledWith(problem)
    expect(handlers.onDelete).toHaveBeenCalledWith(problem)
    expect(handlers.onStatusCycle).toHaveBeenCalledWith(problem)
    expect(handlers.onToggleRevision).toHaveBeenCalledWith(problem)
  })
})
