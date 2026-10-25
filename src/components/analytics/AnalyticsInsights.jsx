import { CalendarDays, CheckCircle2, Gauge, Target } from 'lucide-react'
import { Card } from '../ui/Card'
import { AnimatedGroup } from '../motion-primitives/AnimatedGroup'

const cards = [
  { key: 'solved', label: 'Solved in range', icon: CheckCircle2, accent: 'text-status-solved-text' },
  { key: 'active', label: 'Active days', icon: CalendarDays, accent: 'text-primary' },
  { key: 'consistency', label: 'Consistency score', icon: Gauge, accent: 'text-accent-coral' },
  { key: 'topic', label: 'Most-practiced topic', icon: Target, accent: 'text-accent' },
]

export function AnalyticsInsights({ analytics }) {
  const values = {
    solved: { value: analytics.solvedInRange, suffix: analytics.solvedInRange === 1 ? 'problem' : 'problems', detail: `Across ${analytics.rangeDays} local days` },
    active: { value: analytics.consistency.activeDays, suffix: analytics.consistency.activeDays === 1 ? 'day' : 'days', detail: `${analytics.rangeDays - analytics.consistency.activeDays} inactive days in range` },
    consistency: { value: `${analytics.consistency.score}%`, suffix: '', detail: `${analytics.consistency.activeDays} of ${analytics.consistency.totalDays} days` },
    topic: { value: analytics.topic.mostPracticed?.name || '—', suffix: '', detail: analytics.topic.mostPracticed ? `${analytics.topic.mostPracticed.count} solved problem${analytics.topic.mostPracticed.count === 1 ? '' : 's'}` : 'No topic activity in range' },
  }
  return (
    <AnimatedGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, accent }) => (
        <Card key={key} className="bg-base-surface p-4" aria-label={`${label}: ${values[key].value}${values[key].suffix ? ` ${values[key].suffix}` : ''}`}>
          <div className="mb-2 flex items-center gap-2 text-content-secondary">
            <Icon className={`h-4 w-4 ${accent}`} aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
          </div>
          <p className="truncate text-2xl font-bold tabular-nums text-content-primary">
            {values[key].value}{values[key].suffix && <span className="ml-1 text-xs font-normal text-content-muted">{values[key].suffix}</span>}
          </p>
          <p className="mt-1 text-[11px] text-content-muted">{values[key].detail}</p>
        </Card>
      ))}
    </AnimatedGroup>
  )
}
