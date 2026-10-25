import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { CalendarClock, CheckCircle2, Clock3, History, RotateCcw, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { formatDate } from '../../utils/dates'
import { getRevisionDueState, getRevisionRelativeText } from '../../utils/spacedRepetition'

const dueMeta = {
  overdue: { label: 'Overdue', icon: Clock3, className: 'border-revision-overdue-border bg-revision-overdue-bg text-revision-overdue-text' },
  today: { label: 'Due today', icon: RotateCcw, className: 'border-revision-today-border bg-revision-today-bg text-revision-today-text' },
  upcoming: { label: 'Upcoming', icon: CalendarClock, className: 'border-revision-upcoming-border bg-revision-upcoming-bg text-revision-upcoming-text' },
}

function DueLabel({ problem }) {
  const state = getRevisionDueState(problem.revision)
  const meta = dueMeta[state]
  const Icon = meta.icon
  return <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold', meta.className)}><Icon className="h-3 w-3" aria-hidden="true" />{meta.label} · {getRevisionRelativeText(problem.revision.nextRevisionDate)}</span>
}

function Actions({ problem, processing, onRevise, onReschedule, onRemove, onHistory }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs" variant="primary" leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => onRevise(problem)} disabled={processing} isLoading={processing}>Revise</Button>
      <Button size="xs" variant="secondary" leftIcon={<CalendarClock className="h-3.5 w-3.5" />} onClick={() => onReschedule(problem)} disabled={processing}>Reschedule</Button>
      <Button size="xs" variant="ghost" leftIcon={<History className="h-3.5 w-3.5" />} onClick={() => onHistory(problem.id)}>History</Button>
      <button type="button" onClick={() => onRemove(problem)} aria-label={`Remove ${problem.title} from revision queue`} className="rounded p-1.5 text-content-muted hover:bg-revision-overdue-bg hover:text-revision-overdue-text focus-visible:ring-2 focus-visible:ring-accent"><Trash2 className="h-4 w-4" /></button>
    </div>
  )
}

export function RevisionQueue({ problems = [], hasFilters, processingId, onRevise, onReschedule, onRemove, onPriorityChange, onHistory, onResetFilters }) {
  const reduceMotion = useReducedMotion()
  if (problems.length === 0) {
    return <EmptyState icon={RotateCcw} title={hasFilters ? 'No revisions match these filters' : 'Your revision queue is empty'} description={hasFilters ? 'Reset the filters to see the full queue.' : 'Mark problems for revision from the Problems page to schedule the first review for tomorrow.'} action={hasFilters ? <Button variant="secondary" size="sm" onClick={onResetFilters}>Reset filters</Button> : <Link to="/problems" className="inline-flex rounded-card bg-primary px-4 py-2 text-xs font-semibold text-white focus-visible:ring-2 focus-visible:ring-accent">Browse problems</Link>} />
  }

  return (
    <section aria-label="Revision queue">
      <div className="space-y-3 md:hidden">
        {problems.map((problem) => (
          <motion.article key={problem.id} layout={!reduceMotion} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.16 }} className="rounded-card border border-border-subtle bg-base-surface p-4 shadow-card">
            <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-content-primary">{problem.title}</h3><p className="mt-1 text-[11px] text-content-muted">{problem.topics?.[0] || 'Uncategorized'} · {problem.status}</p></div><Badge variant={problem.difficulty} size="xs">{problem.difficulty}</Badge></div>
            <div className="mt-3"><DueLabel problem={problem} /></div>
            <dl className="my-3 grid grid-cols-3 gap-2 border-y border-border-subtle py-3 text-xs"><div><dt className="text-content-muted">Due</dt><dd className="text-content-secondary">{formatDate(problem.revision.nextRevisionDate)}</dd></div><div><dt className="text-content-muted">Revisions</dt><dd className="text-content-secondary">{problem.revision.revisionCount}</dd></div><div><dt className="text-content-muted">Priority</dt><dd><select aria-label={`Priority for ${problem.title}`} value={problem.revision.priority} onChange={(event) => onPriorityChange(problem.id, event.target.value)} className="mt-1 w-full rounded border border-border-subtle bg-base-elevated px-1 py-1 text-content-primary"><option>High</option><option>Medium</option><option>Low</option></select></dd></div></dl>
            <Actions problem={problem} processing={processingId === problem.id} onRevise={onRevise} onReschedule={onReschedule} onRemove={onRemove} onHistory={onHistory} />
          </motion.article>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-card border border-border-subtle bg-base-surface shadow-card md:block">
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="border-b border-border-subtle bg-base-elevated/50 text-[11px] uppercase tracking-wide text-content-muted"><tr><th className="px-4 py-3">Problem</th><th className="px-4 py-3">Difficulty</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Next revision</th><th className="px-4 py-3">Count</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-border-subtle">{problems.map((problem) => <tr key={problem.id} className="hover:bg-base-elevated/30"><td className="px-4 py-3"><div className="font-semibold text-content-primary">{problem.title}</div><div className="mt-0.5 text-[10px] text-content-muted">{problem.topics?.[0] || 'Uncategorized'}</div></td><td className="px-4 py-3"><Badge variant={problem.difficulty} size="xs">{problem.difficulty}</Badge></td><td className="px-4 py-3"><select aria-label={`Priority for ${problem.title}`} value={problem.revision.priority} onChange={(event) => onPriorityChange(problem.id, event.target.value)} className="rounded border border-border-subtle bg-base-elevated px-2 py-1 text-content-primary"><option>High</option><option>Medium</option><option>Low</option></select></td><td className="px-4 py-3"><DueLabel problem={problem} /><div className="mt-1 text-[10px] text-content-muted">{formatDate(problem.revision.nextRevisionDate)}</div></td><td className="px-4 py-3 tabular-nums text-content-secondary">{problem.revision.revisionCount}</td><td className="px-4 py-3 text-content-secondary">{problem.status}</td><td className="px-4 py-3"><Actions problem={problem} processing={processingId === problem.id} onRevise={onRevise} onReschedule={onReschedule} onRemove={onRemove} onHistory={onHistory} /></td></tr>)}</tbody></table></div>
      </div>
    </section>
  )
}
