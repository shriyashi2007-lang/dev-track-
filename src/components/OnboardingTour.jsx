import React, { useState } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { LayoutDashboard, Plus, Flame, RotateCcw, Command, CheckCircle2 } from 'lucide-react'

const tourSteps = [
  {
    title: 'Welcome to DevTrack',
    icon: LayoutDashboard,
    badge: 'Step 1 of 5',
    description:
      'DevTrack is your private, local-first workspace for tracking DSA problem solving, consistency streaks, and interview readiness without complex setup or accounts.',
    tip: 'Everything is saved locally in your browser with zero latency and zero data leakage.',
  },
  {
    title: 'Log Problems in Seconds',
    icon: Plus,
    badge: 'Step 2 of 5',
    description:
      'Track problems with difficulty, topics, platform, time spent, and key intuition notes. Use keyboard shortcut "N" anytime to open the drawer.',
    tip: 'Solved problems automatically sync to your daily target and contribution heatmap.',
  },
  {
    title: 'Streaks & Contribution Heatmap',
    icon: Flame,
    badge: 'Step 3 of 5',
    description:
      'Stay consistent with consecutive daily streaks and a GitHub-style 52-week activity heatmap. Click on any heatmap cell to inspect past submissions.',
    tip: 'Get notified with a streak-at-risk warning if you have not logged a problem today.',
  },
  {
    title: 'Automated Spaced Revision',
    icon: RotateCcw,
    badge: 'Step 4 of 5',
    description:
      'Never forget a solved algorithm. Mark tricky problems for revision, and DevTrack automatically schedules spaced intervals (1 -> 3 -> 7 -> 14 -> 30 days).',
    tip: 'Use full-screen Flashcard Revision Sessions to quiz yourself on approaches before interviews.',
  },
  {
    title: 'Command Palette & Power Shortcuts',
    icon: Command,
    badge: 'Step 5 of 5',
    description:
      'Press Cmd/Ctrl+K anywhere to jump across pages, filter problems, or trigger actions. Press "?" at any time to view all keyboard shortcuts.',
    tip: 'Try chord navigation: press "G" then "P" to jump straight to your problems table.',
  },
]

export function OnboardingTour({ isOpen, onClose, onFinish }) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const step = tourSteps[currentStep]
  const Icon = step.icon
  const isLast = currentStep === tourSteps.length - 1

  const handleNext = () => {
    if (isLast) {
      onFinish?.()
      onClose()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSkip = () => {
    onFinish?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} maxWidth="max-w-lg" showClose={true}>
      <div className="text-center py-2">
        {/* Step indicator pills */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {tourSteps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-6 bg-primary'
                  : idx < currentStep
                  ? 'w-2 bg-primary/40'
                  : 'w-2 bg-base-elevated'
              }`}
            />
          ))}
        </div>

        {/* Step Icon */}
        <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-4 shadow-sm animate-scale-in">
          <Icon className="w-7 h-7" />
        </div>

        <span className="text-[11px] font-mono uppercase font-bold text-primary tracking-wider block mb-1">
          {step.badge}
        </span>
        <h3 className="text-lg font-bold text-content-primary mb-2.5">{step.title}</h3>
        <p className="text-xs sm:text-sm text-content-secondary leading-relaxed mb-4 max-w-md mx-auto">
          {step.description}
        </p>

        {/* Pro Tip Box */}
        <div className="p-3 bg-base-elevated/70 border border-border-subtle rounded-card text-left max-w-md mx-auto mb-6">
          <p className="text-[11px] text-content-muted">
            <strong className="text-content-primary">Pro-tip: </strong>
            {step.tip}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-content-muted hover:text-content-primary transition-colors cursor-pointer"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button variant="secondary" size="sm" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              rightIcon={isLast ? <CheckCircle2 className="w-4 h-4" /> : null}
            >
              {isLast ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
