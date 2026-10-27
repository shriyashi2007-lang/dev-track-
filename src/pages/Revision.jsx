import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarClock, CheckCircle2, ChevronDown, Clock3, ListFilter, Play, RotateCcw, Search } from 'lucide-react'
import clsx from 'clsx'
import { useProblems } from '../context/ProblemsContext'
import { deriveRevisionStats, filterRevisionQueue, REVISION_INTERVALS } from '../utils/spacedRepetition'
import { RevisionQueue } from '../components/revision/RevisionQueue'
import { RevisionHistory } from '../components/revision/RevisionHistory'
import { RescheduleDialog } from '../components/revision/RescheduleDialog'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

const cardMeta = {
  total: { label: 'Scheduled', icon: RotateCcw, className: 'border-border-strong text-content-primary' },
  today: { label: 'Due today', icon: CalendarClock, className: 'border-revision-today-border text-revision-today-text' },
  upcoming: { label: 'Upcoming', icon: Clock3, className: 'border-revision-upcoming-border text-revision-upcoming-text' },
  overdue: { label: 'Overdue', icon: AlertTriangle, className: 'border-revision-overdue-border text-revision-overdue-text' },
  completed: { label: 'Completed sessions', icon: CheckCircle2, className: 'border-revision-completed-border text-revision-completed-text' },
}

export default function Revision() {
  const {
    problems,
    revisionHistory,
    revisionRepairCount,
    completeProblemRevision,
    rescheduleProblemRevision,
    changeRevisionPriority,
    setProblemRevision,
  } = useProblems()
  const [view, setView] = useState('queue')
  const [filters, setFilters] = useState({ search: '', topic: '', difficulty: '', priority: '', dueState: 'all' })
  const [processingId, setProcessingId] = useState(null)
  const [rescheduleTarget, setRescheduleTarget] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [historyProblemId, setHistoryProblemId] = useState(null)
  const [announcement, setAnnouncement] = useState('')

  const queue = useMemo(() => problems.filter((problem) => problem.revision?.marked), [problems])
  const stats = useMemo(() => deriveRevisionStats(problems, revisionHistory), [problems, revisionHistory])
  const topics = useMemo(() => [...new Set(queue.flatMap((problem) => problem.topics || []))].sort(), [queue])
  const visibleQueue = useMemo(() => filterRevisionQueue(queue, filters), [queue, filters])
  const hasFilters = Boolean(filters.search.trim() || filters.topic || filters.difficulty || filters.priority || filters.dueState !== 'all')

  const resetFilters = () => setFilters({ search: '', topic: '', difficulty: '', priority: '', dueState: 'all' })
  const selectSummary = (key) => {
    if (key === 'completed') {
      setHistoryProblemId(null)
      setView('history')
      return
    }
    setView('queue')
    setFilters((current) => ({ ...current, dueState: key === 'total' ? 'all' : key }))
  }

  const handleRevise = async (problem) => {
    if (processingId) return
    setProcessingId(problem.id)
    try {
      const result = await completeProblemRevision(problem.id, { stage: problem.revision.stage, dueDate: problem.revision.nextRevisionDate })
      setAnnouncement(result.duplicate ? `${problem.title} was already completed for this due cycle.` : `${problem.title} completed. Next revision ${result.problem.revision.nextRevisionDate}.`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReschedule = async (date) => {
    if (!rescheduleTarget) return
    setProcessingId(rescheduleTarget.id)
    try {
      await rescheduleProblemRevision(rescheduleTarget.id, date)
      setAnnouncement(`${rescheduleTarget.title} rescheduled to ${date}.`)
      setRescheduleTarget(null)
    } finally {
      setProcessingId(null)
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setProcessingId(removeTarget.id)
    try {
      await setProblemRevision(removeTarget.id, false)
      setAnnouncement(`${removeTarget.title} removed from the revision queue. History was preserved.`)
      setRemoveTarget(null)
    } finally {
      setProcessingId(null)
    }
  }

  const showProblemHistory = (problemId) => {
    setHistoryProblemId(problemId)
    setView('history')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-card border border-primary/25 bg-gradient-to-r from-primary/10 via-base-surface to-base-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2"><RotateCcw className="h-5 w-5 text-primary" /><h2 className="text-lg font-bold text-content-primary">Smart Revision Tracker</h2></div>
          <p className="max-w-2xl text-xs leading-relaxed text-content-secondary">A deterministic local-calendar schedule keeps each problem moving through focused recall sessions.</p>
        </div>
        <Link to="/revision/session"><Button variant="primary" size="md" leftIcon={<Play className="h-4 w-4 fill-current" />}>Start session ({stats.today + stats.overdue} due)</Button></Link>
      </div>

      {revisionRepairCount > 0 && <div role="status" className="rounded-card border border-revision-today-border bg-revision-today-bg p-3 text-xs text-revision-today-text"><AlertTriangle className="mr-2 inline h-4 w-4" />DevTrack repaired {revisionRepairCount} missing or invalid revision schedule{revisionRepairCount === 1 ? '' : 's'} to tomorrow.</div>}

      <details className="group rounded-card border border-border-subtle bg-base-surface p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-content-primary focus-visible:ring-2 focus-visible:ring-accent">How the schedule works <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
        <p className="mt-3 text-xs leading-relaxed text-content-secondary">Reviews follow the {REVISION_INTERVALS.join(', ')} day ladder. Each next date counts from the day you actually complete the revision, so overdue work never stacks intervals from an old due date. After the 30-day stage, the problem stays in the queue for recurring 30-day maintenance until you remove it manually.</p>
      </details>

      <section aria-label="Revision summary" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Object.entries(cardMeta).map(([key, meta]) => {
          const Icon = meta.icon
          const pressed = key === 'completed' ? view === 'history' && !historyProblemId : view === 'queue' && filters.dueState === (key === 'total' ? 'all' : key)
          return <button key={key} type="button" onClick={() => selectSummary(key)} aria-pressed={pressed} className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><Card className={clsx('h-full border p-4 transition-transform hover:-translate-y-0.5', meta.className, pressed && 'ring-2 ring-accent')}><div className="flex items-center justify-between"><Icon className="h-4 w-4" aria-hidden="true" /><span className="font-display text-2xl font-bold tabular-nums">{stats[key]}</span></div><span className="mt-2 block text-[11px] font-semibold text-content-secondary">{meta.label}</span></Card></button>
        })}
      </section>

      <div className="flex items-center gap-2 border-b border-border-subtle pb-2" role="tablist" aria-label="Revision views">
        <button type="button" role="tab" aria-selected={view === 'queue'} onClick={() => setView('queue')} className={clsx('rounded-card px-4 py-2 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-accent', view === 'queue' ? 'bg-primary text-white' : 'text-content-secondary hover:bg-base-elevated')}>Queue ({stats.total})</button>
        <button type="button" role="tab" aria-selected={view === 'history'} onClick={() => { setHistoryProblemId(null); setView('history') }} className={clsx('rounded-card px-4 py-2 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-accent', view === 'history' ? 'bg-primary text-white' : 'text-content-secondary hover:bg-base-elevated')}>History ({stats.completed})</button>
      </div>

      {view === 'queue' ? (
        <>
          <section aria-label="Revision filters" className="rounded-card border border-border-subtle bg-base-surface p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_repeat(4,1fr)_auto]">
              <label className="relative"><span className="sr-only">Search revision queue by title</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" /><input type="search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search titles…" className="min-h-10 w-full rounded-input border border-border-subtle bg-base-elevated pl-9 pr-3 text-xs text-content-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" /></label>
              <label className="text-[11px] font-semibold text-content-secondary"><span className="sr-only">Topic</span><select aria-label="Topic" value={filters.topic} onChange={(event) => setFilters({ ...filters, topic: event.target.value })} className="min-h-10 w-full rounded-input border border-border-subtle bg-base-elevated px-3 text-xs text-content-primary"><option value="">All topics</option>{topics.map((topic) => <option key={topic}>{topic}</option>)}</select></label>
              <select aria-label="Difficulty" value={filters.difficulty} onChange={(event) => setFilters({ ...filters, difficulty: event.target.value })} className="min-h-10 rounded-input border border-border-subtle bg-base-elevated px-3 text-xs text-content-primary"><option value="">All difficulties</option><option>Easy</option><option>Medium</option><option>Hard</option></select>
              <select aria-label="Priority" value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })} className="min-h-10 rounded-input border border-border-subtle bg-base-elevated px-3 text-xs text-content-primary"><option value="">All priorities</option><option>High</option><option>Medium</option><option>Low</option></select>
              <select aria-label="Due state" value={filters.dueState} onChange={(event) => setFilters({ ...filters, dueState: event.target.value })} className="min-h-10 rounded-input border border-border-subtle bg-base-elevated px-3 text-xs text-content-primary"><option value="all">All due states</option><option value="overdue">Overdue</option><option value="today">Today</option><option value="upcoming">Upcoming</option></select>
              <Button variant="secondary" size="sm" leftIcon={<ListFilter className="h-4 w-4" />} onClick={resetFilters} disabled={!hasFilters}>Reset</Button>
            </div>
            <p className="mt-3 text-[11px] text-content-muted" aria-live="polite">Showing {visibleQueue.length} of {queue.length} scheduled problems</p>
          </section>
          <RevisionQueue problems={visibleQueue} hasFilters={hasFilters} processingId={processingId} onRevise={handleRevise} onReschedule={setRescheduleTarget} onRemove={setRemoveTarget} onPriorityChange={changeRevisionPriority} onHistory={showProblemHistory} onResetFilters={resetFilters} />
        </>
      ) : <RevisionHistory history={revisionHistory} problems={problems} problemId={historyProblemId} onClearProblem={() => setHistoryProblemId(null)} />}

      <p className="sr-only" aria-live="polite">{announcement}</p>
      <RescheduleDialog problem={rescheduleTarget} isOpen={Boolean(rescheduleTarget)} onClose={() => !processingId && setRescheduleTarget(null)} onSave={handleReschedule} isSaving={Boolean(processingId)} />
      <ConfirmDialog isOpen={Boolean(removeTarget)} onClose={() => !processingId && setRemoveTarget(null)} onConfirm={handleRemove} title="Remove from revision queue?" description={`This removes only ${removeTarget?.title || 'the problem'} from the queue. The problem and completed history stay saved.`} confirmText="Remove from queue" isLoading={Boolean(processingId)} />
    </div>
  )
}
