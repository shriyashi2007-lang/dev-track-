import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProblemDrawer } from '../components/problems/ProblemDrawer'

describe('ProblemDrawer', () => {
  it('keeps invalid input, links the error, and focuses the first invalid field', async () => {
    render(<ProblemDrawer isOpen onClose={() => {}} onSave={vi.fn()} />)
    const title = screen.getByLabelText('Problem Title *')
    fireEvent.change(title, { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Problem' }))

    await waitFor(() => expect(title).toHaveFocus())
    expect(title).toHaveValue('   ')
    expect(title).toHaveAttribute('aria-invalid', 'true')
    expect(title).toHaveAccessibleDescription('Title is required')
  })

  it('warns about probable duplicates without blocking save', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ProblemDrawer isOpen onClose={() => {}} onSave={onSave} existingProblems={[{ id: 'existing', title: 'Two Sum', url: '' }]} />)
    fireEvent.change(screen.getByLabelText('Problem Title *'), { target: { value: ' two sum ' } })
    expect(screen.getByRole('status')).toHaveTextContent('A similar problem already exists')
    fireEvent.click(screen.getByRole('button', { name: 'Add Problem' }))
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
  })

  it('asks before closing a dirty form', () => {
    const onClose = vi.fn()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<ProblemDrawer isOpen onClose={onClose} onSave={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Problem Title *'), { target: { value: 'Draft' } })
    fireEvent.click(screen.getByRole('button', { name: 'Close drawer' }))
    expect(confirm).toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()

    confirm.mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: 'Close drawer' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    confirm.mockRestore()
  })
})
