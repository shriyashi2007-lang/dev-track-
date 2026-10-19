import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { ProgressRing } from '../ui/ProgressRing'
import { Target, CheckCircle2, Settings as SettingsIcon } from 'lucide-react'

export function DailyGoalWidget({ stats, dailyGoal = 3 }) {
  const solvedToday = stats.todaySolvedCount || 0
  const isGoalReached = solvedToday >= dailyGoal && dailyGoal > 0
  const remaining = Math.max(dailyGoal - solvedToday, 0)

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-subtle bg-primary-light flex items-center justify-center text-primary">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
            Daily Goal
          </h3>
        </div>
        <Link
          to="/settings"
          title="Adjust daily target"
          className="text-content-muted hover:text-content-primary p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center justify-around py-2">
        <ProgressRing
          value={solvedToday}
          max={dailyGoal}
          size={105}
          strokeWidth={9}
          sublabel="solved"
          color={isGoalReached ? 'var(--color-solved)' : 'var(--accent-coral)'}
        />

        <div className="space-y-1.5 max-w-[130px]">
          {isGoalReached ? (
            <div className="flex items-center gap-1.5 text-status-solved-text">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold leading-tight">Goal Complete!</span>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-content-primary tabular-nums">
                {remaining} more
              </p>
              <p className="text-[11px] text-content-muted">needed to hit target</p>
            </div>
          )}
          <p className="text-[10px] text-content-secondary leading-normal">
            Target: {dailyGoal} problems/day
          </p>
        </div>
      </div>
    </Card>
  )
}
