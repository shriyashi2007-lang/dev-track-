import React, { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { AlertTriangle } from 'lucide-react'

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  requireMatch = null, // e.g. "RESET"
  isLoading = false,
}) {
  const [matchInput, setMatchInput] = useState('')

  const isMatchValid = !requireMatch || matchInput.trim() === requireMatch

  const handleConfirm = () => {
    if (isMatchValid) {
      onConfirm()
      setMatchInput('')
    }
  }

  const handleClose = () => {
    setMatchInput('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-content-primary">{title}</h3>
          <p className="text-xs text-content-secondary mt-1">{description}</p>
        </div>
      </div>

      {requireMatch && (
        <div className="my-4 p-3 bg-base-elevated rounded-card border border-border-subtle">
          <p className="text-xs text-content-secondary mb-2">
            To confirm, please type <span className="font-mono font-bold text-rose-400 select-all">{requireMatch}</span> below:
          </p>
          <Input
            value={matchInput}
            onChange={(e) => setMatchInput(e.target.value)}
            placeholder={`Type "${requireMatch}" to confirm`}
            autoFocus
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-border-subtle">
        <Button variant="secondary" size="sm" onClick={handleClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          size="sm"
          onClick={handleConfirm}
          disabled={!isMatchValid}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
