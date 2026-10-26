import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, ShieldCheck, Upload } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { parseBackupText, planImport, validateBackupFileMetadata } from '../../utils/dataPortability'
import { applyPlanToStorage } from '../../services/backupService'

function formatBytes(bytes) {
  return bytes < 1024 ? `${bytes} bytes` : `${(bytes / 1024).toFixed(1)} KB`
}

export function BackupImportDialog({ isOpen, onClose, current, onApplied, onDownloadCurrent }) {
  const inputRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [validation, setValidation] = useState(null)
  const [fileError, setFileError] = useState('')
  const [mode, setMode] = useState('merge')
  const [takePreferences, setTakePreferences] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [backupDownloaded, setBackupDownloaded] = useState(false)

  const clearState = () => {
    setFileName('')
    setFileSize(0)
    setValidation(null)
    setFileError('')
    setMode('merge')
    setTakePreferences(false)
    setConfirmed(false)
    setIsReading(false)
    setIsApplying(false)
    setApplyError('')
    setBackupDownloaded(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  useEffect(() => {
    if (!isOpen) clearState()
  }, [isOpen])

  const plan = useMemo(() => {
    if (!validation?.isValid || !validation.backup) return null
    return planImport(current, validation.backup, { mode, takePreferences })
  }, [current, mode, takePreferences, validation])

  const close = () => {
    if (isApplying) return
    clearState()
    onClose()
  }

  const readFile = async (file) => {
    clearState()
    if (!file) return
    setFileName(file.name)
    setFileSize(file.size)
    const metadata = validateBackupFileMetadata(file)
    if (!metadata.isValid) {
      setFileError(`${metadata.errors.join(' ')}${file.size ? ` (${formatBytes(file.size)})` : ''}`)
      return
    }
    setIsReading(true)
    try {
      const text = await file.text()
      setValidation(parseBackupText(text))
    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'The file could not be read.')
    } finally {
      setIsReading(false)
    }
  }

  const apply = async () => {
    if (!plan || !confirmed || isApplying) return
    setIsApplying(true)
    setApplyError('')
    const result = applyPlanToStorage(plan)
    if (!result.ok) {
      setApplyError(`${result.error} ${result.rollbackSucceeded ? 'Your previous data was restored.' : 'Rollback could not be fully verified.'}`)
      setIsApplying(false)
      return
    }
    try {
      await onApplied(plan)
      clearState()
      onClose()
    } catch (error) {
      setApplyError(`The backup was stored and verified, but the page could not refresh: ${error instanceof Error ? error.message : 'unknown error'}. Reload DevTrack to show the restored data.`)
      setIsApplying(false)
    }
  }

  const downloadCurrent = () => {
    const result = onDownloadCurrent()
    setBackupDownloaded(Boolean(result?.downloaded))
  }

  const preview = plan?.preview
  const errors = validation?.errors || []

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Import DevTrack backup"
      description="Validate and preview a versioned JSON backup before changing browser data."
      maxWidth="max-w-3xl"
    >
      <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
        <div>
          <label htmlFor="backup-file" className="mb-2 block text-xs font-semibold text-content-secondary">Backup JSON file</label>
          <input
            ref={inputRef}
            id="backup-file"
            type="file"
            accept=".json,application/json"
            onChange={(event) => readFile(event.target.files?.[0])}
            disabled={isReading || isApplying}
            className="block w-full cursor-pointer rounded-card border border-border-subtle bg-base-elevated p-2 text-xs text-content-secondary file:mr-3 file:rounded-subtle file:border-0 file:bg-primary file:px-3 file:py-2 file:font-semibold file:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <p className="mt-1 text-[11px] text-content-muted">JSON only, maximum 5 MB. Selecting or cancelling never changes stored data.</p>
        </div>

        <div aria-live="polite">
          {isReading && <p className="flex items-center gap-2 text-xs text-content-secondary"><Upload className="h-4 w-4 animate-pulse" />Reading and validating…</p>}
          {fileError && <div className="rounded-card border border-difficulty-hard-border bg-difficulty-hard-bg p-3 text-xs text-difficulty-hard-text" role="alert"><strong>Import blocked:</strong> {fileError}</div>}
          {validation && !validation.isValid && (
            <div className="rounded-card border border-difficulty-hard-border bg-difficulty-hard-bg p-3" role="alert">
              <div className="flex items-center gap-2 text-xs font-semibold text-difficulty-hard-text"><AlertTriangle className="h-4 w-4" />Backup rejected with {errors.length} validation error{errors.length === 1 ? '' : 's'}</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[11px] text-content-secondary">{errors.slice(0, 6).map((error) => <li key={error}>{error}</li>)}</ul>
              {errors.length > 6 && <p className="mt-2 text-[11px] text-content-muted">Plus {errors.length - 6} more errors.</p>}
            </div>
          )}
        </div>

        {validation?.isValid && plan && (
          <>
            <div className="rounded-card border border-status-solved-border bg-status-solved-bg/35 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-status-solved-text"><CheckCircle2 className="h-4 w-4" />Validated {fileName} ({formatBytes(fileSize)})</div>
              <p className="mt-1 text-[11px] text-content-secondary">Schema {validation.backup.schemaVersion} · exported {new Date(validation.backup.exportedAt).toLocaleString()}</p>
              {validation.warnings.map((warning) => <p key={warning} className="mt-1 text-[11px] text-difficulty-medium-text">{warning}</p>)}
            </div>

            <fieldset>
              <legend className="mb-2 text-xs font-semibold text-content-secondary">Restore mode</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: 'merge', title: 'Merge safely', text: 'Keep existing-only records; newer imported conflicts win.' },
                  { value: 'replace', title: 'Replace all portable data', text: 'Remove current portable records and use only this backup.' },
                ].map((option) => (
                  <label key={option.value} className={`cursor-pointer rounded-card border p-3 ${mode === option.value ? 'border-primary bg-accent-light' : 'border-border-subtle bg-base-elevated'}`}>
                    <input type="radio" name="backup-mode" value={option.value} checked={mode === option.value} onChange={() => { setMode(option.value); setConfirmed(false) }} className="mr-2" />
                    <span className="text-xs font-semibold text-content-primary">{option.title}</span>
                    <span className="mt-1 block text-[11px] text-content-muted">{option.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {mode === 'merge' && (
              <label className="flex items-start gap-2 rounded-card border border-border-subtle bg-base-elevated p-3 text-xs text-content-secondary">
                <input type="checkbox" checked={takePreferences} onChange={(event) => { setTakePreferences(event.target.checked); setConfirmed(false) }} className="mt-0.5" />
                <span><strong className="text-content-primary">Use imported preferences and daily goal.</strong><br />Otherwise your current theme, goal, and preferences stay unchanged.</span>
              </label>
            )}

            <div className="rounded-card border border-border-subtle bg-base-surface p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-content-primary">Change preview</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div><p className="text-[10px] uppercase text-content-muted">Problems</p><p className="text-lg font-bold text-content-primary">{preview.incoming.problems}</p><p className="text-[10px] text-content-muted">Current {preview.current.problems}</p></div>
                <div><p className="text-[10px] uppercase text-content-muted">Queue</p><p className="text-lg font-bold text-content-primary">{preview.incoming.revisionQueue}</p><p className="text-[10px] text-content-muted">Current {preview.current.revisionQueue}</p></div>
                <div><p className="text-[10px] uppercase text-content-muted">History</p><p className="text-lg font-bold text-content-primary">{preview.incoming.revisionHistory}</p><p className="text-[10px] text-content-muted">Current {preview.current.revisionHistory}</p></div>
                <div><p className="text-[10px] uppercase text-content-muted">Preferences</p><p className="text-lg font-bold text-content-primary">{preview.incoming.preferences ? 'Yes' : 'No'}</p><p className="text-[10px] text-content-muted">Goal {validation.backup.data.dailyGoal}</p></div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-content-secondary">
                {mode === 'replace'
                  ? `${preview.current.problems} current problem${preview.current.problems === 1 ? '' : 's'} will be removed; ${preview.incoming.problems} imported problem${preview.incoming.problems === 1 ? '' : 's'} will be stored.`
                  : `${preview.addedProblems} new problem${preview.addedProblems === 1 ? '' : 's'} will be added and ${preview.updatedProblems} updated. ${preview.conflicts} conflict${preview.conflicts === 1 ? '' : 's'}: ${preview.importedNewer} imported version${preview.importedNewer === 1 ? '' : 's'} win and ${preview.existingKept} existing version${preview.existingKept === 1 ? '' : 's'} stay.`}
              </p>
            </div>

            <div className="rounded-card border border-difficulty-medium-border bg-difficulty-medium-bg/25 p-4">
              <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-difficulty-medium-text" /><div><p className="text-xs font-semibold text-content-primary">Back up current data first</p><p className="mt-1 text-[11px] leading-relaxed text-content-muted">Recommended before every restore. Browser storage uses multiple keys and cannot provide a truly atomic transaction; DevTrack will snapshot, verify, and roll back on failure.</p></div></div>
              <Button className="mt-3" variant="outline" size="sm" onClick={downloadCurrent}>{backupDownloaded ? 'Backup downloaded' : 'Download current backup'}</Button>
            </div>

            <label className="flex items-start gap-2 text-xs text-content-secondary">
              <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5" />
              <span>I reviewed the preview and understand that {mode === 'replace' ? 'all current portable DevTrack data will be replaced' : 'newer imported conflicts may replace matching records'}.</span>
            </label>
          </>
        )}

        {applyError && <div className="rounded-card border border-difficulty-hard-border bg-difficulty-hard-bg p-3 text-xs text-difficulty-hard-text" role="alert">{applyError}</div>}
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 border-t border-border-subtle pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="sm" onClick={close} disabled={isApplying}>Cancel without changes</Button>
        <Button variant={mode === 'replace' ? 'danger' : 'primary'} size="sm" onClick={apply} disabled={!plan || !confirmed || isReading} isLoading={isApplying}>
          {mode === 'replace' ? 'Replace all portable data' : 'Merge verified backup'}
        </Button>
      </div>
    </Modal>
  )
}
