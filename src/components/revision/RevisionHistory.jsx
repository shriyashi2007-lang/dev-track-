import { CalendarCheck2, History, UserRoundX } from 'lucide-react'
import { formatDate } from '../../utils/dates'
import { REVISION_INTERVALS } from '../../utils/spacedRepetition'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'

export function RevisionHistory({ history = [], problems = [], problemId = null, onClearProblem }) {
  const problemMap = new Map(problems.map((problem) => [problem.id, problem]))
  const records = [...history]
    .filter((entry) => !problemId || entry.problemId === problemId)
    .sort((left, right) => right.revisedAt.localeCompare(left.revisedAt))

  if (records.length === 0) {
    return (
      <EmptyState
        icon={History}
        title={problemId ? 'No completed sessions for this problem' : 'No revision history yet'}
        description="Completed revisions will appear here and stay available after rescheduling or queue removal."
        action={problemId ? <Button variant="secondary" size="sm" onClick={onClearProblem}>Show all history</Button> : null}
      />
    )
  }

  return (
    <section aria-label="Completed revision history" className="space-y-3">
      {problemId && (
        <div className="flex items-center justify-between rounded-card border border-border-subtle bg-base-elevated/40 p-3 text-xs text-content-secondary">
          <span>Showing history for one problem</span>
          <Button variant="secondary" size="xs" onClick={onClearProblem}>Show all</Button>
        </div>
      )}
      <div className="space-y-3 md:hidden">
        {records.map((entry) => {
          const problem = problemMap.get(entry.problemId)
          return (
            <article key={entry.id} className="rounded-card border border-revision-completed-border bg-base-surface p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-content-primary">{problem?.title || entry.snapshotTitle || 'Problem deleted'}</h3>
                  {!problem && <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-content-muted"><UserRoundX className="h-3 w-3" />Problem deleted</span>}
                </div>
                <CalendarCheck2 className="h-5 w-5 text-revision-completed-text" aria-hidden="true" />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div><dt className="text-content-muted">Completed</dt><dd className="text-content-secondary">{formatDate(entry.revisedAt, 'MMM d, yyyy h:mm a')}</dd></div>
                <div><dt className="text-content-muted">Stage</dt><dd className="text-content-secondary">{entry.stage + 1} · {REVISION_INTERVALS[entry.stage]} day</dd></div>
                <div><dt className="text-content-muted">Previous due</dt><dd className="text-content-secondary">{formatDate(entry.previousDueDate)}</dd></div>
                <div><dt className="text-content-muted">Next scheduled</dt><dd className="text-content-secondary">{entry.nextScheduledDate ? formatDate(entry.nextScheduledDate) : '—'}</dd></div>
              </dl>
            </article>
          )
        })}
      </div>
      <div className="hidden overflow-hidden rounded-card border border-border-subtle bg-base-surface shadow-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border-subtle bg-base-elevated/50 text-[11px] uppercase tracking-wide text-content-muted">
              <tr><th className="px-4 py-3">Problem</th><th className="px-4 py-3">Completed</th><th className="px-4 py-3">Stage</th><th className="px-4 py-3">Previous due</th><th className="px-4 py-3">Next scheduled</th></tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {records.map((entry) => {
                const problem = problemMap.get(entry.problemId)
                return (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 font-medium text-content-primary">{problem?.title || entry.snapshotTitle || 'Problem deleted'}{!problem && <span className="ml-2 text-[10px] font-normal text-content-muted">Problem deleted</span>}</td>
                    <td className="px-4 py-3 text-content-secondary">{formatDate(entry.revisedAt, 'MMM d, yyyy h:mm a')}</td>
                    <td className="px-4 py-3 text-content-secondary">{entry.stage + 1} · {REVISION_INTERVALS[entry.stage]} day</td>
                    <td className="px-4 py-3 text-content-secondary">{formatDate(entry.previousDueDate)}</td>
                    <td className="px-4 py-3 text-content-secondary">{entry.nextScheduledDate ? formatDate(entry.nextScheduledDate) : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
