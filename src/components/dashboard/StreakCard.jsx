import React from 'react'
import { Card } from '../ui/Card'
import { Flame, AlertTriangle, Check, Trophy } from 'lucide-react'
import { AnimatedNumber } from '../motion-primitives/AnimatedNumber'
import clsx from 'clsx'

export function StreakCard({ streaks }) {
  const { currentStreak, longestStreak, isStreakAtRisk, last7Days = [] } = streaks

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-subtle bg-accent-light flex items-center justify-center text-accent">
              <Flame className="w-4 h-4 fill-accent" />
            </div>
            <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
              Consistency Streak
            </h3>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-content-muted tabular-nums">
            <Trophy className="w-3.5 h-3.5 text-accent" />
            <span>Best: {longestStreak}d</span>
          </div>
        </div>

        {/* Big current streak display with AnimatedNumber */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-content-primary">
            <AnimatedNumber value={currentStreak} />
          </span>
          <span className="text-xs text-content-secondary font-medium">
            consecutive day{currentStreak === 1 ? '' : 's'}
          </span>
        </div>

        {/* Nudge if streak is at risk */}
        {isStreakAtRisk && (
          <div className="p-2 mb-3 bg-difficulty-medium-bg border border-difficulty-medium-border rounded-subtle flex items-center gap-2 text-[11px] text-difficulty-medium-text animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-difficulty-medium" />
            <span>Streak at risk! Solve 1 problem today to keep your streak.</span>
          </div>
        )}
      </div>

      {/* 7-Day Mini Calendar */}
      <div>
        <p className="text-[10px] uppercase font-semibold text-content-muted mb-2">Past 7 Days</p>
        <div className="grid grid-cols-7 gap-1.5">
          {last7Days.map((d) => (
            <div
              key={d.dateStr}
              className={clsx(
                'flex flex-col items-center justify-center py-1.5 rounded-subtle border text-center transition-all',
                d.isSolved
                  ? 'bg-status-solved-bg border-status-solved-border text-status-solved-text'
                  : 'bg-base-elevated/40 border-border-subtle text-content-muted',
                d.isToday && 'ring-1 ring-accent'
              )}
            >
              <span className="text-[9px] uppercase leading-none mb-1">
                {d.dayOfWeek.charAt(0)}
              </span>
              <div
                className={clsx(
                  'w-4 h-4 rounded-full flex items-center justify-center text-[10px] tabular-nums',
                  d.isSolved ? 'bg-status-solved text-white' : 'bg-base-surface text-content-muted'
                )}
              >
                {d.isSolved ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : d.dayNumber}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
