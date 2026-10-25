import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProblemsTable } from '../components/problems/ProblemsTable'

const problem = {
  id: 'table-1',
  title: '[Draft] Two Sum',
  platform: 'LeetCode',
  url: 'https://example.com/two-sum',
  difficulty: 'Easy',
  topics: ['Arrays'],
  status: 'Todo',
  solvedDate: null,
  revision: { marked: false },
}

describe('ProblemsTable', () => {
  it('handles escaped search text, safe links, selection, and deletion', () => {
    const onToggleSelect = vi.fn()
    const onDelete = vi.fn()
    render(
      <ProblemsTable
        problems={[problem]}
        selectedIds={[]}
        onToggleSelect={onToggleSelect}
        onSelectAll={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
        onStatusCycle={vi.fn()}
        onToggleRevision={vi.fn()}
        sort="newest"
        onSortChange={vi.fn()}
        searchQuery="["
      />
    )

    const links = screen.getAllByRole('link', { name: '[Draft] Two Sum' })
    expect(links).toHaveLength(2)
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
    })

    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select [Draft] Two Sum' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete [Draft] Two Sum' })[0])
    expect(onToggleSelect).toHaveBeenCalledWith('table-1')
    expect(onDelete).toHaveBeenCalledWith(problem)
  })
})
