import { useEffect, useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { getLocalDateString } from '../../utils/dates'
import { isValidDateKey } from '../../utils/spacedRepetition'

export function RescheduleDialog({ problem, isOpen, onClose, onSave, isSaving = false }) {
  const [date, setDate] = useState('')
  const [error, setError] = useState('')
  const today = getLocalDateString()

  useEffect(() => {
    if (isOpen) {
      setDate(problem?.revision?.nextRevisionDate || today)
      setError('')
    }
  }, [isOpen, problem, today])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isValidDateKey(date)) {
      setError('Choose a valid date.')
      return
    }
    if (date < today) {
      setError('Choose today or a future date.')
      return
    }
    await onSave(date)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule revision"
      description={`Choose a new due date for ${problem?.title || 'this problem'}. Its stage and completion count will stay the same.`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-card border border-revision-upcoming-border bg-revision-upcoming-bg p-3 text-xs text-revision-upcoming-text">
          <CalendarClock className="mr-2 inline h-4 w-4" aria-hidden="true" />
          Rescheduling does not add a completed history session.
        </div>
        <Input
          id="revision-reschedule-date"
          type="date"
          label="New revision date"
          min={today}
          value={date}
          onChange={(event) => {
            setDate(event.target.value)
            setError('')
          }}
          error={error}
          required
        />
        <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>Save date</Button>
        </div>
      </form>
    </Modal>
  )
}
