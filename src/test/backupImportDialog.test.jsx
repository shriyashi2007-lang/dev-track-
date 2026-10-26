import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BackupImportDialog } from '../components/settings/BackupImportDialog'
import { STORAGE_KEYS } from '../data/constants'
import { buildBackup } from '../utils/dataPortability'

const settings = {
  displayName: 'Developer', theme: 'dark', accent: 'indigo', dailyGoal: 3,
  revisionIntervals: [1, 3, 7, 14, 30], pageSize: 25,
  reduceMotion: false, confetti: true, onboardingCompleted: false, usingSampleData: false,
}

function problem(id) {
  return {
    id, title: `Problem ${id}`, platform: 'LeetCode', url: '', difficulty: 'Easy', topics: ['Arrays'],
    status: 'Solved', solvedDate: '2026-10-25', timeTakenMinutes: 10, notes: '',
    revision: { marked: false, priority: 'Medium', stage: 0, nextRevisionDate: null, revisionCount: 0, addedAt: null, updatedAt: null, lastRevisedDate: null, scheduleRepaired: false },
    createdAt: '2026-10-25T00:00:00.000Z', updatedAt: '2026-10-25T00:00:00.000Z', isSample: false,
  }
}

function fileWithText(name, text, type = 'application/json') {
  const file = new globalThis.File([text], name, { type })
  Object.defineProperty(file, 'text', { value: async () => text })
  return file
}

const current = { problems: [], revisionHistory: [], settings }

function renderDialog(overrides = {}) {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    current,
    onApplied: vi.fn().mockResolvedValue(undefined),
    onDownloadCurrent: vi.fn(() => ({ downloaded: true })),
    ...overrides,
  }
  render(<BackupImportDialog {...props} />)
  return props
}

describe('BackupImportDialog', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('unrelated:key', 'keep me')
  })

  it('cancels without changing storage and clears the selected file state', async () => {
    const before = { ...localStorage }
    const props = renderDialog()
    const backup = buildBackup({ problems: [problem('cancelled')], revisionHistory: [], settings })

    fireEvent.change(screen.getByLabelText('Backup JSON file'), {
      target: { files: [fileWithText('cancel.json', JSON.stringify(backup))] },
    })
    expect(await screen.findByText(/Validated cancel.json/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel without changes' }))

    expect(props.onClose).toHaveBeenCalledOnce()
    expect({ ...localStorage }).toEqual(before)
    expect(screen.queryByText(/Validated cancel.json/)).not.toBeInTheDocument()
  })

  it('rejects malformed JSON without mutating storage', async () => {
    const before = { ...localStorage }
    const props = renderDialog()

    fireEvent.change(screen.getByLabelText('Backup JSON file'), {
      target: { files: [fileWithText('broken.json', '{not-json')] },
    })

    expect(await screen.findByText(/malformed JSON/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Merge verified backup' })).toBeDisabled()
    expect(props.onApplied).not.toHaveBeenCalled()
    expect({ ...localStorage }).toEqual(before)
  })

  it('previews without mutation and applies only after explicit confirmation', async () => {
    const props = renderDialog()
    const backup = buildBackup({ problems: [problem('restored')], revisionHistory: [], settings })

    fireEvent.change(screen.getByLabelText('Backup JSON file'), {
      target: { files: [fileWithText('valid.json', JSON.stringify(backup))] },
    })
    expect(await screen.findByText(/Validated valid.json/)).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEYS.PROBLEMS)).toBeNull()

    const applyButton = screen.getByRole('button', { name: 'Merge verified backup' })
    expect(applyButton).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox', { name: /I reviewed the preview/ }))
    expect(applyButton).toBeEnabled()
    fireEvent.click(applyButton)

    await waitFor(() => expect(props.onApplied).toHaveBeenCalledOnce())
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.PROBLEMS))).toHaveLength(1)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.PROBLEMS))[0].id).toBe('restored')
    expect(localStorage.getItem('unrelated:key')).toBe('keep me')
    expect(props.onClose).toHaveBeenCalledOnce()
  })

  it('only labels the safety backup as downloaded after a verified download', async () => {
    renderDialog({ onDownloadCurrent: vi.fn(() => ({ downloaded: false })) })
    const backup = buildBackup({ problems: [], revisionHistory: [], settings })
    fireEvent.change(screen.getByLabelText('Backup JSON file'), {
      target: { files: [fileWithText('valid.json', JSON.stringify(backup))] },
    })
    expect(await screen.findByText(/Validated valid.json/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Download current backup' }))
    expect(screen.getByRole('button', { name: 'Download current backup' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Backup downloaded' })).not.toBeInTheDocument()
  })
})
