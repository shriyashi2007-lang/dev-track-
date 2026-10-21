import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { Card } from '../ui/Card'
import { Drawer } from '../ui/Drawer'
import { Badge } from '../ui/Badge'
import { Calendar, ExternalLink } from 'lucide-react'
import { getLocalDateString, subDays, formatDate, toDate } from '../../utils/dates'
import { getHeatmapCellClass } from '../../styles/chartTheme'

export function ContributionHeatmap({ problems = [] }) {
  const [rangeMode, setRangeMode] = useState('year') // 'year' (52 weeks) | 'sixMonths' (26 weeks)
  const [selectedDay, setSelectedDay] = useState(null)
  const [hoveredCell, setHoveredCell] = useState(null)

  const numWeeks = rangeMode === 'year' ? 52 : 26

  // Pre-index problems by solved local date string
  const problemsByDate = useMemo(() => {
    const map = {}
    for (const p of problems) {
      if (p.status === 'Solved' && p.solvedDate) {
        const d = toDate(p.solvedDate)
        if (d) {
          const key = getLocalDateString(d)
          if (!map[key]) map[key] = []
          map[key].push(p)
        }
      }
    }
    return map
  }, [problems])

  // Generate calendar grid
  const weeks = useMemo(() => {
    const today = new Date()
    const totalDays = numWeeks * 7
    const startDate = subDays(today, totalDays - 1)

    // Adjust start date to previous Sunday so columns align Sun-Sat
    const startDayOfWeek = startDate.getDay()
    const alignedStartDate = subDays(startDate, startDayOfWeek)

    const weeksArray = []
    let currentWeek = []

    let curr = alignedStartDate
    const endDate = today

    let dayCount = 0
    while (curr <= endDate || currentWeek.length > 0) {
      const dateStr = getLocalDateString(curr)
      const dayOfWeek = curr.getDay()

      const dayProblems = problemsByDate[dateStr] || []
      currentWeek.push({
        dateStr,
        date: new Date(curr),
        count: dayProblems.length,
        problems: dayProblems,
        dayOfWeek,
      })

      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek)
        currentWeek = []
      }

      curr = new Date(curr.getTime() + 24 * 60 * 60 * 1000)
      dayCount++
      if (dayCount > 400) break // Safety circuit breaker
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeksArray.push(currentWeek)
    }

    return weeksArray
  }, [numWeeks, problemsByDate])

  return (
    <Card className="p-5">
      {/* Header with Title and Range Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
            Contribution Heatmap
          </h3>
          <span className="text-[11px] text-content-muted">
            ({numWeeks} weeks active history)
          </span>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-base-elevated rounded-card border border-border-subtle self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setRangeMode('year')}
            aria-pressed={rangeMode === 'year'}
            className={clsx(
              'px-2.5 py-1 text-xs font-medium rounded-subtle transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
              rangeMode === 'year'
                ? 'bg-base-surface text-content-primary font-semibold shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            )}
          >
            1 Year
          </button>
          <button
            type="button"
            onClick={() => setRangeMode('sixMonths')}
            aria-pressed={rangeMode === 'sixMonths'}
            className={clsx(
              'px-2.5 py-1 text-xs font-medium rounded-subtle transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
              rangeMode === 'sixMonths'
                ? 'bg-base-surface text-content-primary font-semibold shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            )}
          >
            6 Months
          </button>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 relative">
        <div className="inline-block min-w-full">
          {/* Days & Weeks container */}
          <div className="flex gap-1">
            {/* Weekday labels */}
            <div className="grid grid-rows-7 gap-1 pr-2 text-[9px] text-content-muted text-right select-none pt-0.5">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-rows-7 gap-1">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return <div key={dIdx} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    }

                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        onMouseEnter={() => setHoveredCell(day)}
                        onMouseLeave={() => setHoveredCell(null)}
                        aria-label={`${day.count} problems solved on ${formatDate(day.dateStr, 'MMM d, yyyy')}`}
                        aria-pressed={selectedDay?.dateStr === day.dateStr}
                        className={clsx(
                          'w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] border transition-all cursor-pointer focus-visible:ring-1 focus-visible:ring-accent',
                          getHeatmapCellClass(day.count)
                        )}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hover Tooltip Floating indicator */}
        {hoveredCell && (
          <div className="mt-2 text-[11px] text-content-secondary flex items-center gap-1.5">
            <span className="font-semibold text-content-primary">
              {hoveredCell.count} problem{hoveredCell.count === 1 ? '' : 's'} solved
            </span>
            <span>on {formatDate(hoveredCell.dateStr, 'MMMM d, yyyy')}</span>
            <span className="text-content-muted text-[10px]">(click cell for details)</span>
          </div>
        )}
      </div>

      {/* Legend using theme scale */}
      <div className="mt-4 pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3 text-[11px] text-content-muted">
        <span>Click any cell to inspect logged submissions</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className={clsx('w-3 h-3 rounded-[2px]', getHeatmapCellClass(0))} />
          <span className={clsx('w-3 h-3 rounded-[2px]', getHeatmapCellClass(1))} />
          <span className={clsx('w-3 h-3 rounded-[2px]', getHeatmapCellClass(2))} />
          <span className={clsx('w-3 h-3 rounded-[2px]', getHeatmapCellClass(3))} />
          <span className={clsx('w-3 h-3 rounded-[2px]', getHeatmapCellClass(4))} />
          <span>More</span>
        </div>
      </div>

      {/* Side Panel Drawer for Selected Day's Problems */}
      <Drawer
        isOpen={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? `Activity on ${formatDate(selectedDay.dateStr, 'MMMM d, yyyy')}` : ''}
        description={
          selectedDay
            ? `${selectedDay.count} problem${selectedDay.count === 1 ? '' : 's'} solved on this date.`
            : ''
        }
        width="max-w-md"
      >
        {selectedDay && selectedDay.problems.length === 0 ? (
          <div className="text-center py-12 text-content-muted text-xs">
            No problems were solved on this date.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDay?.problems.map((p) => (
              <div
                key={p.id}
                className="p-3.5 bg-base-elevated/50 border border-border-subtle rounded-card space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-xs text-content-primary">{p.title}</h4>
                  <Badge variant={p.difficulty} size="xs">
                    {p.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-content-muted">
                  <span>{p.platform}</span>
                  {p.timeTakenMinutes && <span className="tabular-nums">• {p.timeTakenMinutes} mins</span>}
                </div>
                {p.notes && (
                  <p className="text-[11px] text-content-secondary bg-base-surface p-2 rounded border border-border-subtle line-clamp-3">
                    {p.notes}
                  </p>
                )}
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  >
                    <span>View on {p.platform}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </Card>
  )
}
