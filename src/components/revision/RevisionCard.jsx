import { useState } from 'react'
import clsx from 'clsx'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'
import { formatDate, addDays, getLocalDateString } from '../../utils/dates'
import { PRIORITIES } from '../../data/constants'

export function RevisionCard({
  problem,
  onMarkRevised,
  onReschedule,
  onPriorityChange,
}) {
  const [showConfidence, setShowConfidence] = useState(false)
  const [showQuickReschedule, setShowQuickReschedule] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  const revision = problem.revision || {}
  const nextDateFormatted = revision.nextRevisionDate
    ? formatDate(revision.nextRevisionDate, 'MMM d, yyyy')
    : 'No date set'

  const priorityColors = {
    High: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Low: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  }

  const handleSelectConfidence = (confidence) => {
    onMarkRevised(problem.id, confidence)
    setShowConfidence(false)
  }

  return (
    <Card className="p-4 bg-base-surface border-border-subtle hover:border-border-strong transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant={problem.difficulty} size="xs">
            {problem.difficulty}
          </Badge>
          <span className="font-semibold text-xs sm:text-sm text-content-primary truncate">
            {problem.title}
          </span>
          {problem.url && (
            <a
              href={problem.url}
              target="_blank"
              rel="noreferrer"
              className="text-content-muted hover:text-primary transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Priority dropdown & Revision count */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Priority selector */}
          <select
            value={revision.priority || 'Medium'}
            onChange={(e) => onPriorityChange(problem.id, e.target.value)}
            className={clsx(
              'px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer focus:outline-none',
              priorityColors[revision.priority] || priorityColors.Medium
            )}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p} className="bg-base-elevated text-content-primary">
                {p} Priority
              </option>
            ))}
          </select>

          <span className="text-[11px] font-mono text-content-muted bg-base-elevated px-2 py-0.5 rounded border border-border-subtle">
            Rev #{revision.revisionCount || 0}
          </span>
        </div>
      </div>

      {/* Meta: Topics and next due date */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-content-secondary mb-3">
        <div className="flex flex-wrap gap-1">
          {(problem.topics || []).map((t) => (
            <span key={t} className="px-1.5 py-0.5 text-[10px] bg-base-elevated rounded">
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-content-muted font-mono">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>Due: {nextDateFormatted}</span>
        </div>
      </div>

      {/* Reveal Notes toggle */}
      {problem.notes && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>{showNotes ? 'Hide intuition notes' : 'Peek intuition notes'}</span>
            <ChevronDown className={clsx('w-3 h-3 transition-transform', showNotes && 'rotate-180')} />
          </button>
          {showNotes && (
            <div className="mt-2 p-2.5 bg-base-elevated rounded border border-border-subtle text-xs text-content-secondary leading-relaxed whitespace-pre-wrap animate-fade-in">
              {problem.notes}
            </div>
          )}
        </div>
      )}

      {/* Action Bar: Mark Revised / Confidence / Reschedule */}
      <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
        {showConfidence ? (
          <div className="flex items-center gap-2 animate-scale-in">
            <span className="text-[11px] text-content-muted font-semibold">How was it?</span>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleSelectConfidence('Hard')}
              className="border-rose-500/40 text-rose-400 hover:border-rose-500"
            >
              Hard (1d)
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleSelectConfidence('Okay')}
              className="border-amber-500/40 text-amber-400 hover:border-amber-500"
            >
              Okay
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleSelectConfidence('Easy')}
              className="border-emerald-500/40 text-emerald-400 hover:border-emerald-500"
            >
              Easy (+interval)
            </Button>
            <button
              type="button"
              onClick={() => setShowConfidence(false)}
              className="text-[10px] text-content-muted hover:text-content-primary underline ml-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="xs"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => setShowConfidence(true)}
            >
              Mark Revised
            </Button>

            {/* Quick Reschedule dropdown */}
            <div className="relative">
              <Button
                variant="secondary"
                size="xs"
                leftIcon={<Clock className="w-3.5 h-3.5" />}
                onClick={() => setShowQuickReschedule(!showQuickReschedule)}
              >
                Reschedule
              </Button>

              {showQuickReschedule && (
                <div className="absolute left-0 bottom-full mb-1 w-36 bg-base-elevated border border-border-strong rounded-card shadow-xl p-1 z-20 text-xs animate-scale-in space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      onReschedule(problem.id, getLocalDateString(addDays(new Date(), 1)))
                      setShowQuickReschedule(false)
                    }}
                    className="w-full text-left px-2 py-1 text-content-primary hover:bg-base-surface rounded cursor-pointer"
                  >
                    Tomorrow (+1d)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onReschedule(problem.id, getLocalDateString(addDays(new Date(), 3)))
                      setShowQuickReschedule(false)
                    }}
                    className="w-full text-left px-2 py-1 text-content-primary hover:bg-base-surface rounded cursor-pointer"
                  >
                    In 3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onReschedule(problem.id, getLocalDateString(addDays(new Date(), 7)))
                      setShowQuickReschedule(false)
                    }}
                    className="w-full text-left px-2 py-1 text-content-primary hover:bg-base-surface rounded cursor-pointer"
                  >
                    Next Week (+7d)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {revision.lastRevisedDate && (
          <span className="text-[10px] text-content-muted font-mono">
            Last revised: {formatDate(revision.lastRevisedDate, 'MMM d')}
          </span>
        )}
      </div>
    </Card>
  )
}
