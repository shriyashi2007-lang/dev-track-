import { Activity } from 'lucide-react'
import { AnalyticsChartCard } from './AnalyticsChartCard'

export function ConsistencyChart({ consistency }) {
  const { activeDays, totalDays, score } = consistency
  return (
    <AnalyticsChartCard
      title="Practice consistency"
      subtitle="A transparent activity measure based on unique local calendar days, not the number of problems solved."
      icon={Activity}
    >
      <div className="grid items-center gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-base-elevated" aria-label={`Consistency score ${score} percent`} role="img">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: `conic-gradient(var(--accent-primary) ${score}%, var(--border-subtle) ${score}% 100%)` }}
            aria-hidden="true"
          />
          <div className="absolute inset-3 rounded-full bg-base-surface" aria-hidden="true" />
          <div className="relative text-center">
            <p className="text-3xl font-bold tabular-nums text-content-primary">{score}%</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-content-muted">consistency</p>
          </div>
        </div>

        <div>
          <p className="text-lg font-semibold text-content-primary">{activeDays} active day{activeDays === 1 ? '' : 's'} out of {totalDays} days</p>
          <p className="mt-2 text-sm leading-relaxed text-content-secondary">
            Consistency score = unique days with at least one solved problem ÷ total days in the selected period × 100.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-base-elevated" aria-hidden="true">
            <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${score}%` }} />
          </div>
          <p className="mt-2 text-xs text-content-muted">Multiple solves on the same day count as one active day.</p>
        </div>
      </div>
    </AnalyticsChartCard>
  )
}
