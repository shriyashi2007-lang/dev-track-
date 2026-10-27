import React, { useId, useState } from 'react'
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
  extraContent = null,
  role = 'alertdialog',
}) {
  const [matchInput, setMatchInput] = useState('')
  const generatedId = useId()
  const titleId = `${generatedId}-title`
  const descriptionId = `${generatedId}-description`

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
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md" role={role} ariaLabelledBy={titleId} ariaDescribedBy={descriptionId}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-difficulty-hard-bg border border-difficulty-hard-border flex items-center justify-center text-difficulty-hard shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h2 id={titleId} className="text-base font-semibold text-content-primary">{title}</h2>
          <p id={descriptionId} className="text-xs text-content-secondary mt-1">{description}</p>
        </div>
      </div>

      {requireMatch && (
        <div className="my-4 p-3 bg-base-elevated rounded-card border border-border-subtle">
          <p className="text-xs text-content-secondary mb-2">
            To confirm, please type <span className="font-bold text-difficulty-hard select-all">{requireMatch}</span> below:
          </p>
          <Input
            label={`Type ${requireMatch} to confirm`}
            value={matchInput}
            onChange={(e) => setMatchInput(e.target.value)}
            placeholder={`Type "${requireMatch}" to confirm`}
            required
            autoComplete="off"
          />
        </div>
      )}

      {extraContent}

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
