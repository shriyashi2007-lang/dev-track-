import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProblemsFilterBar } from '../components/problems/ProblemsFilterBar'

function renderFilterBar(overrides = {}) {
  const props = {
    search: '',
    onSearchChange: vi.fn(),
    difficulties: [],
    onDifficultyToggle: vi.fn(),
    selectedTopics: [],
    onTopicsChange: vi.fn(),
    selectedPlatforms: [],
    onPlatformsChange: vi.fn(),
    status: 'all',
    onStatusChange: vi.fn(),
    revisionOnly: false,
    onRevisionToggle: vi.fn(),
    sort: 'newest',
    onSortChange: vi.fn(),
    onClearFilters: vi.fn(),
    hasActiveFilters: false,
    viewMode: 'table',
    onViewModeChange: vi.fn(),
    onOpenImport: vi.fn(),
    onOpenAdd: vi.fn(),
    totalFilteredCount: 2,
    totalCount: 5,
    ...overrides,
  }
  render(<ProblemsFilterBar {...props} />)
  return props
}

describe('ProblemsFilterBar', () => {
  it('reports result counts and forwards filter controls', () => {
    const props = renderFilterBar({ hasActiveFilters: true })

    expect(screen.getByText('Showing 2 of 5')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('searchbox', { name: /search problems by title/i }), { target: { value: 'tree' } })
    fireEvent.click(screen.getByRole('button', { name: 'Easy' }))
    fireEvent.change(screen.getByLabelText('Topic'), { target: { value: 'Trees' } })
    fireEvent.change(screen.getByLabelText('Platform'), { target: { value: 'Codeforces' } })
    fireEvent.change(screen.getByLabelText('Sort'), { target: { value: 'title-asc' } })
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Revisit' } })
    fireEvent.click(screen.getByRole('button', { name: 'Revision only' }))
    fireEvent.click(screen.getByRole('button', { name: 'Board view' }))
    fireEvent.click(screen.getByRole('button', { name: /reset all/i }))

    expect(props.onSearchChange).toHaveBeenCalledWith('tree')
    expect(props.onDifficultyToggle).toHaveBeenCalledWith('Easy')
    expect(props.onTopicsChange).toHaveBeenCalledWith(['Trees'])
    expect(props.onPlatformsChange).toHaveBeenCalledWith(['Codeforces'])
    expect(props.onSortChange).toHaveBeenCalledWith('title-asc')
    expect(props.onStatusChange).toHaveBeenCalledWith('Revisit')
    expect(props.onRevisionToggle).toHaveBeenCalledOnce()
    expect(props.onViewModeChange).toHaveBeenCalledWith('board')
    expect(props.onClearFilters).toHaveBeenCalledOnce()
  })
})
