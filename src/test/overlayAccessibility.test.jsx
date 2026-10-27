import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Toast } from '../components/ui/Toast'

function ConfirmHarness({ onConfirm = vi.fn() }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open delete dialog</button>
      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        title="Delete saved problem?"
        description="The selected problem will be removed."
        confirmText="Delete problem"
        requireMatch="DELETE"
      />
    </>
  )
}

describe('shared overlay accessibility', () => {
  it('names destructive dialogs, labels confirmation input, handles Escape, and restores focus', () => {
    render(<ConfirmHarness />)
    const trigger = screen.getByRole('button', { name: 'Open delete dialog' })
    trigger.focus()
    fireEvent.click(trigger)

    const dialog = screen.getByRole('alertdialog', { name: 'Delete saved problem?' })
    expect(dialog).toHaveAccessibleDescription('The selected problem will be removed.')
    expect(screen.getByLabelText('Type DELETE to confirm')).toBeRequired()
    expect(dialog).toContainElement(document.activeElement)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('requires the confirmation phrase before invoking a destructive action', () => {
    const onConfirm = vi.fn()
    render(<ConfirmHarness onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open delete dialog' }))
    const confirm = screen.getByRole('button', { name: 'Delete problem' })
    expect(confirm).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Type DELETE to confirm'), { target: { value: 'DELETE' } })
    expect(confirm).toBeEnabled()
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('announces critical toasts assertively', () => {
    render(<Toast toast={{ id: 'error', type: 'error', title: 'Save failed', message: 'Storage is unavailable.' }} onDismiss={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
  })
})
