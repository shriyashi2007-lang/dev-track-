import { Card } from '../ui/Card'
import { Calendar, TrendingUp, Clock, Target } from 'lucide-react'

export function AnalyticsInsights({ stats, streaks }) {
  const { strongestTopic, averageTimeMinutes, weekSolvedCount } = stats
  const { activeDaysCount, longestStreak } = streaks

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Consistency Metric */}
      <Card className="p-4 bg-base-surface">
        <div className="flex items-center gap-2 text-content-secondary mb-1">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase">Total Active Days</span>
        </div>
        <p className="text-2xl font-bold font-mono text-content-primary">
          {activeDaysCount} <span className="text-xs text-content-muted font-normal">days</span>
        </p>
        <p className="text-[11px] text-content-muted mt-0.5">
          Best streak: {longestStreak} consecutive days
        </p>
      </Card>

      {/* Velocity Metric */}
      <Card className="p-4 bg-base-surface">
        <div className="flex items-center gap-2 text-content-secondary mb-1">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase">7-Day Velocity</span>
        </div>
        <p className="text-2xl font-bold font-mono text-content-primary">
          {weekSolvedCount} <span className="text-xs text-content-muted font-normal">solved</span>
        </p>
        <p className="text-[11px] text-content-muted mt-0.5">
          Problems completed in last 7 days
        </p>
      </Card>

      {/* Average Solve Time */}
      <Card className="p-4 bg-base-surface">
        <div className="flex items-center gap-2 text-content-secondary mb-1">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase">Average Solve Time</span>
        </div>
        <p className="text-2xl font-bold font-mono text-content-primary">
          {averageTimeMinutes || '—'}{' '}
          <span className="text-xs text-content-muted font-normal">minutes</span>
        </p>
        <p className="text-[11px] text-content-muted mt-0.5">
          Per timed solved problem
        </p>
      </Card>

      {/* Dominant Topic */}
      <Card className="p-4 bg-base-surface">
        <div className="flex items-center gap-2 text-content-secondary mb-1">
          <Target className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-semibold uppercase">Top Focus Area</span>
        </div>
        <p className="text-xl font-bold text-content-primary truncate">
          {strongestTopic ? strongestTopic.name : '—'}
        </p>
        <p className="text-[11px] text-content-muted mt-0.5">
          {strongestTopic ? `${strongestTopic.count} problems mastered` : 'No data yet'}
        </p>
      </Card>
    </div>
  )
}
