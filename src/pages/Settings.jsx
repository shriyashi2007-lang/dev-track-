import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useProblems } from '../context/ProblemsContext'
import { useToast } from '../context/ToastContext'
import { ACCENTS } from '../data/constants'
import { storageService } from '../services/storageService'
import { exportAllData } from '../services/exportService'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ImportModal } from '../components/problems/ImportModal'
import { OnboardingTour } from '../components/OnboardingTour'
import {
  User,
  Palette,
  Sliders,
  Database,
  Trash2,
  Download,
  Upload,
  Sparkles,
  HardDrive,
  Check,
} from 'lucide-react'
import clsx from 'clsx'

export function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings()
  const { problems, loadSampleData, clearSampleData, importProblems, refreshProblems, hasSampleData } = useProblems()
  const { addToast } = useToast()

  const [displayName, setDisplayName] = useState(settings.displayName || '')
  const [nameSaved, setNameSaved] = useState(false)
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal || 3)
  const [intervalsInput, setIntervalsInput] = useState(
    (settings.revisionIntervals || [1, 3, 7, 14, 30]).join(', ')
  )
  const [pageSize, setPageSize] = useState(settings.pageSize || 25)
  const [reduceMotion, setReduceMotion] = useState(Boolean(settings.reduceMotion))
  const [confetti, setConfetti] = useState(Boolean(settings.confetti))

  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isOnboardingTourOpen, setIsOnboardingTourOpen] = useState(false)

  const storageUsage = storageService.getStorageUsage()

  // Save profile name
  const handleSaveProfile = (e) => {
    e.preventDefault()
    const trimmed = displayName.trim()
    if (!trimmed) return
    updateSettings({ displayName: trimmed })
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
    addToast({
      type: 'success',
      title: 'Profile updated',
      message: `Display name saved as "${trimmed}".`,
    })
  }

  // Save Preferences
  const handleSavePreferences = () => {
    const parsedIntervals = intervalsInput
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0)

    const cleanIntervals = parsedIntervals.length > 0 ? parsedIntervals : [1, 3, 7, 14, 30]

    updateSettings({
      dailyGoal: Number(dailyGoal) || 3,
      revisionIntervals: cleanIntervals,
      pageSize: Number(pageSize) || 25,
      reduceMotion,
      confetti,
    })

    addToast({
      type: 'success',
      title: 'Preferences saved',
      message: 'Your system preferences have been updated.',
    })
  }

  // Handle Full Hard Reset (requires typing RESET)
  const handleHardReset = () => {
    storageService.clearAppStorage()
    resetSettings()
    refreshProblems()
    setIsResetModalOpen(false)
    addToast({
      type: 'info',
      title: 'Data reset complete',
      message: 'All problem data and configurations have been purged.',
    })
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-content-primary">Settings &amp; Preferences</h2>
        <p className="text-xs text-content-secondary mt-0.5">
          Manage your personal workspace, appearance, intervals, and local data storage.
        </p>
      </div>

      {/* 1. Profile Section */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-border-subtle pb-3">
          <User className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
            Profile Settings
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="flex flex-col sm:flex-row items-center gap-5">
          <Avatar name={displayName || 'Dev'} size="lg" className="shrink-0" />

          <div className="flex-1 w-full space-y-2">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name / Handle"
              helperText="Shown in your dashboard greeting and local stats."
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!displayName.trim()}
            leftIcon={nameSaved ? <Check className="w-3.5 h-3.5 text-content-inverse" /> : null}
            className="self-end sm:self-center"
          >
            {nameSaved ? 'Saved!' : 'Save Name'}
          </Button>
        </form>
      </Card>

      {/* 2. Appearance & Accent Picker */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-border-subtle pb-3">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
            Theme &amp; Visual Identity
          </h3>
        </div>

        <div className="space-y-4">
          {/* Theme selector */}
          <div>
            <label className="block text-xs font-medium text-content-secondary mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-3 max-w-sm">
              {['dark', 'light', 'system'].map((th) => (
                <button
                  key={th}
                  type="button"
                  onClick={() => updateSettings({ theme: th })}
                  className={clsx(
                    'py-2 px-3 rounded-card text-xs font-semibold capitalize border transition-all cursor-pointer',
                    settings.theme === th
                      ? 'bg-primary/20 text-primary border-primary shadow-sm'
                      : 'bg-base-elevated text-content-secondary border-border-subtle hover:border-border-strong'
                  )}
                >
                  {th}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color Picker */}
          <div>
            <label className="block text-xs font-medium text-content-secondary mb-2">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {ACCENTS.map((accent) => {
                const isSelected = settings.accent === accent.id
                return (
                  <button
                    key={accent.id}
                    type="button"
                    onClick={() => updateSettings({ accent: accent.id })}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-1.5 rounded-card border text-xs font-medium transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary ring-1 ring-primary bg-primary/10 text-content-primary'
                        : 'border-border-subtle bg-base-elevated text-content-secondary hover:border-border-strong'
                    )}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: accent.color }}
                    />
                    <span>{accent.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Prep Preferences */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-border-subtle pb-3">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
            Preparation Preferences
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              type="number"
              min="1"
              max="20"
              label="Daily Problem Target"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              helperText="Target shown on daily progress ring."
            />

            <Input
              label="Spaced Revision Intervals"
              value={intervalsInput}
              onChange={(e) => setIntervalsInput(e.target.value)}
              placeholder="1, 3, 7, 14, 30"
              helperText="Comma-separated day intervals."
            />

            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">
                Default Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full bg-base-elevated text-content-primary text-xs rounded-card border border-border-subtle px-3 py-2.5 focus:outline-none focus:border-primary"
              >
                <option value={10}>10 problems</option>
                <option value={25}>25 problems</option>
                <option value={50}>50 problems</option>
              </select>
            </div>
          </div>

          {/* Motion & Confetti toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 p-3 bg-base-elevated rounded-card border border-border-subtle cursor-pointer">
              <input
                type="checkbox"
                checked={confetti}
                onChange={(e) => setConfetti(e.target.checked)}
                className="rounded border-border-strong text-primary focus:ring-primary h-4 w-4"
              />
              <div>
                <span className="text-xs font-semibold text-content-primary block">
                  Celebration Confetti
                </span>
                <span className="text-[11px] text-content-muted">
                  Show celebratory bursts on daily goals and streak milestones.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-base-elevated rounded-card border border-border-subtle cursor-pointer">
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
                className="rounded border-border-strong text-primary focus:ring-primary h-4 w-4"
              />
              <div>
                <span className="text-xs font-semibold text-content-primary block">
                  Reduce Motion
                </span>
                <span className="text-[11px] text-content-muted">
                  Disable transitions and count-up animations for high performance.
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </div>
        </div>
      </Card>

      {/* 4. Local Data & Storage Management */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
              Local Data &amp; Backup
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-content-muted tabular-nums">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Usage: {storageUsage.formatted}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => exportAllData(problems, settings)}
          >
            Export Backup JSON
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => setIsImportModalOpen(true)}
          >
            Import Backup JSON
          </Button>
        </div>

        {/* Sample data controls */}
        <div className="p-3 bg-base-elevated rounded-card border border-border-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-content-primary">Demo Sample Dataset</p>
            <p className="text-[11px] text-content-muted">
              {hasSampleData
                ? 'Sample questions are active in your dashboard and lists.'
                : 'Inject a realistic DSA dataset to test charts and streaks.'}
            </p>
          </div>
          {hasSampleData ? (
            <Button variant="secondary" size="xs" onClick={clearSampleData}>
              Clear Sample Data
            </Button>
          ) : (
            <Button variant="secondary" size="xs" onClick={loadSampleData}>
              Load Sample Data
            </Button>
          )}
        </div>

        {/* Hard Reset Zone */}
        <div className="mt-6 pt-4 border-t border-difficulty-hard-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-difficulty-hard-text">Danger Zone: Purge All Workspace Data</p>
            <p className="text-[11px] text-content-muted">
              Permanently clears all solved problems, streaks, revision history, and settings from this browser.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setIsResetModalOpen(true)}
          >
            Reset All Data
          </Button>
        </div>
      </Card>

      {/* 5. Onboarding Tour Replay */}
      <Card className="p-4 bg-base-surface flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs font-semibold text-content-primary">Onboarding Walkthrough</p>
            <p className="text-[11px] text-content-muted">Replay the guided feature tour anytime.</p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="xs"
          onClick={() => setIsOnboardingTourOpen(true)}
        >
          Replay Tour
        </Button>
      </Card>

      {/* Reset Confirmation Dialog requiring "RESET" */}
      <ConfirmDialog
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleHardReset}
        title="Permanently Purge All Data?"
        description="This will wipe all tracked problems, streaks, and settings from localStorage. This action cannot be reversed."
        confirmText="Permanently Erase"
        requireMatch="RESET"
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importProblems}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={isOnboardingTourOpen}
        onClose={() => setIsOnboardingTourOpen(false)}
        onFinish={() => updateSettings({ onboardingCompleted: true })}
      />
    </div>
  )
}

export default SettingsPage
