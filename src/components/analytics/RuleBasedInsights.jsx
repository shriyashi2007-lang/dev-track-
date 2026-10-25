import { Activity, CalendarDays, Gauge, Layers3, Target, TrendingUp } from 'lucide-react'
import { Card } from '../ui/Card'
import { AnimatedGroup } from '../motion-primitives/AnimatedGroup'

const ICONS = {
  target: Target,
  layers: Layers3,
  gauge: Gauge,
  calendar: CalendarDays,
  trending: TrendingUp,
}

const toneClasses = {
  positive: 'border-status-solved/35 bg-status-solved-bg/40',
  caution: 'border-difficulty-medium/35 bg-difficulty-medium-bg/30',
  neutral: 'border-border-subtle bg-base-elevated/35',
}

export function RuleBasedInsights({ insights = [] }) {
  return (
    <section aria-labelledby="analytics-insights-heading" className="space-y-3">
      <div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 id="analytics-insights-heading" className="text-base font-bold text-content-primary">Personalized insights</h2>
        </div>
        <p className="mt-1 text-xs text-content-muted">Rule-based insights calculated from your saved data.</p>
      </div>
      <AnimatedGroup className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" staggerDelay={0.04}>
        {insights.map((insight) => {
          const Icon = ICONS[insight.icon] || Activity
          return (
            <Card key={insight.id} className={`p-4 ${toneClasses[insight.tone] || toneClasses.neutral}`}>
              <div className="flex items-start gap-3">
                <div className="rounded-subtle border border-border-subtle bg-base-surface p-2 text-primary"><Icon className="h-4 w-4" aria-hidden="true" /></div>
                <div><h3 className="text-sm font-semibold text-content-primary">{insight.title}</h3><p className="mt-1 text-xs leading-relaxed text-content-secondary">{insight.text}</p></div>
              </div>
            </Card>
          )
        })}
      </AnimatedGroup>
    </section>
  )
}
