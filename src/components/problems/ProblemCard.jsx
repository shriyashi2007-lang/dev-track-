import { motion, useReducedMotion } from 'motion/react'
import { BookOpen, CheckCircle2, Circle, Clock3, Edit2, ExternalLink, RotateCcw, Trash2 } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { formatDate } from '../../utils/dates'

const statusMeta = {
  Todo: { label: 'To Do', icon: Circle },
  Attempted: { label: 'Attempted', icon: Clock3 },
  Solved: { label: 'Solved', icon: CheckCircle2 },
  Revisit: { label: 'Revisit', icon: RotateCcw },
}

export function ProblemCard({ problem, selected, onToggleSelect, onEdit, onDelete, onStatusCycle, onToggleRevision }) {
  const reduceMotion = useReducedMotion()
  const status = statusMeta[problem.status] || statusMeta.Todo
  const StatusIcon = status.icon

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
      transition={{ duration: reduceMotion ? 0 : 0.16 }}
      className="rounded-card border border-border-subtle bg-base-surface p-4 shadow-card"
    >
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(problem.id)} aria-label={`Select ${problem.title}`} className="mt-1 h-4 w-4 rounded border-border-strong text-primary focus:ring-accent" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {problem.url ? (
                <a href={problem.url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 font-display text-sm font-semibold text-content-primary hover:text-accent hover:underline focus-visible:ring-2 focus-visible:ring-accent">
                  <span className="truncate">{problem.title}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </a>
              ) : <h3 className="truncate font-display text-sm font-semibold text-content-primary">{problem.title}</h3>}
              <p className="mt-0.5 text-[11px] text-content-muted">{problem.platform}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={() => onEdit(problem)} aria-label={`Edit ${problem.title}`} className="rounded p-1.5 text-content-muted hover:bg-base-elevated hover:text-content-primary focus-visible:ring-1 focus-visible:ring-accent"><Edit2 className="h-4 w-4" /></button>
              <button type="button" onClick={() => onDelete(problem)} aria-label={`Delete ${problem.title}`} className="rounded p-1.5 text-content-muted hover:bg-difficulty-hard-bg hover:text-difficulty-hard focus-visible:ring-1 focus-visible:ring-accent"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={problem.difficulty} size="xs">{problem.difficulty}</Badge>
            <button type="button" onClick={() => onStatusCycle(problem)} aria-label={`Change status for ${problem.title}; current status ${status.label}`} className="rounded focus-visible:ring-1 focus-visible:ring-accent">
              <Badge variant={problem.status} size="xs"><StatusIcon className="h-3 w-3" aria-hidden="true" />{status.label}</Badge>
            </button>
            <button type="button" onClick={() => onToggleRevision(problem)} aria-label={`${problem.revision?.marked ? 'Remove' : 'Mark'} ${problem.title} ${problem.revision?.marked ? 'from' : 'for'} revision`} className="rounded focus-visible:ring-1 focus-visible:ring-accent">
              <Badge variant={problem.revision?.marked ? 'accent' : 'neutral'} size="xs"><BookOpen className="h-3 w-3" aria-hidden="true" />{problem.revision?.marked ? 'In revision queue' : 'Add to revision queue'}</Badge>
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(problem.topics || []).slice(0, 3).map((topic) => <span key={topic} className="rounded-full border border-border-subtle bg-base-elevated px-2 py-0.5 text-[10px] text-content-secondary">{topic}</span>)}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 text-[11px] text-content-muted">
            <span>{problem.status === 'Solved' && problem.solvedDate ? `Solved ${formatDate(problem.solvedDate, 'MMM d, yyyy')}` : 'No solved date'}</span>
            {problem.notes && <span className="max-w-[45%] truncate">{problem.notes}</span>}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
