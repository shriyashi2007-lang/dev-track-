import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { FileJson, AlertCircle, CheckCircle2 } from 'lucide-react'
import { validateImportData } from '../../utils/validators'
import { validateBackupFileMetadata } from '../../utils/dataPortability'

export function ImportModal({ isOpen, onClose, onImport }) {
  const [fileData, setFileData] = useState(null)
  const [validationResult, setValidationResult] = useState(null)
  const [importMode, setImportMode] = useState('merge') // 'merge' | 'replace'
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [skipInvalid, setSkipInvalid] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSkipInvalid(false)
    const metadata = validateBackupFileMetadata(file)
    if (!metadata.isValid) {
      setError(metadata.errors.join(' '))
      return
    }
    try {
        const parsed = JSON.parse(await file.text())
        const items = Array.isArray(parsed) ? parsed : parsed.problems
        if (!items) {
          throw new Error('Invalid file format. File must contain an array of problems.')
        }
        const validated = validateImportData(items)
        if (!validated.isValid) {
          setError(validated.error || 'No valid problems found in this file.')
          setValidationResult(null)
          setFileData(null)
          return
        }
        setValidationResult(validated)
        setFileData(validated.validItems)
    } catch {
      setError('Failed to parse JSON file. Ensure it is valid JSON.')
      setValidationResult(null)
      setFileData(null)
    }
  }

  const handleConfirm = async () => {
    if (!fileData) return
    setIsLoading(true)
    try {
      await onImport(fileData, importMode)
      handleClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFileData(null)
    setValidationResult(null)
    setError(null)
    setSkipInvalid(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Problems JSON"
      description="Import problems exported from DevTrack or other tools."
      maxWidth="max-w-md"
    >
      <div className="space-y-4 my-3">
        {/* File input drop zone */}
        <div className="border-2 border-dashed border-border-strong hover:border-accent rounded-card p-6 text-center transition-colors">
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            aria-describedby="import-json-help"
            className="hidden"
            id="import-json-file"
          />
          <label htmlFor="import-json-file" className="cursor-pointer block">
            <div className="w-12 h-12 rounded-full bg-accent-light border border-accent/25 flex items-center justify-center text-accent mx-auto mb-3">
              <FileJson className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-content-primary mb-1">
              Click to select JSON backup file
            </p>
            <p id="import-json-help" className="text-[11px] text-content-muted">
              Accepts a DevTrack .json backup file
            </p>
          </label>
        </div>

        {error && (
          <div role="alert" className="p-3 text-xs bg-difficulty-hard-bg border border-difficulty-hard-border text-difficulty-hard-text rounded-card flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Validation Preview */}
        {validationResult && (
          <div className="p-4 bg-base-elevated rounded-card border border-border-subtle space-y-3 animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-status-solved-text font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Validated {validationResult.validItems.length} problems ready to import</span>
            </div>
            {validationResult.rejectedCount > 0 && (
              <label className="flex items-start gap-2 text-[11px] text-difficulty-medium-text">
                <input type="checkbox" checked={skipInvalid} onChange={(event) => setSkipInvalid(event.target.checked)} className="mt-0.5" />
                <span>Skip {validationResult.rejectedCount} invalid item{validationResult.rejectedCount === 1 ? '' : 's'} and import only the validated records. This is opt-in.</span>
              </label>
            )}

            {/* Merge vs Replace selection */}
            <div className="pt-2 border-t border-border-subtle">
              <span className="block text-[11px] font-semibold text-content-secondary mb-1.5 uppercase">
                Import Mode:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  aria-pressed={importMode === 'merge'}
                  className={`py-2 px-3 rounded-card text-xs font-medium border text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                    importMode === 'merge'
                      ? 'bg-accent-light text-accent border-accent/50 font-semibold'
                      : 'bg-base-surface text-content-secondary border-border-subtle'
                  }`}
                >
                  <p className="font-semibold">Merge</p>
                  <p className="text-[10px] text-content-muted">Keep existing items</p>
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  aria-pressed={importMode === 'replace'}
                  className={`py-2 px-3 rounded-card text-xs font-medium border text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                    importMode === 'replace'
                      ? 'bg-difficulty-hard-bg text-difficulty-hard-text border-difficulty-hard-border font-semibold'
                      : 'bg-base-surface text-content-secondary border-border-subtle'
                  }`}
                >
                  <p className="font-semibold">Replace</p>
                  <p className="text-[10px] text-content-muted">Overwrite all data</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
        <Button variant="secondary" size="sm" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleConfirm}
          disabled={!fileData || isLoading || (validationResult?.rejectedCount > 0 && !skipInvalid)}
          isLoading={isLoading}
        >
          Confirm Import
        </Button>
      </div>
    </Modal>
  )
}
