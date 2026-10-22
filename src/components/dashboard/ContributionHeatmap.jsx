import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { Drawer } from '../ui/Drawer'
import { Calendar, ExternalLink } from 'lucide-react'
import { getHeatmapData, HEATMAP_LEVEL_THRESHOLDS } from '../../utils/dashboardMetrics'
import { isSafeExternalUrl } from '../../utils/problemNormalizer'
import { getHeatmapCellClass } from '../../styles/chartTheme'

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export function ContributionHeatmap({ problems = [] }) {
  const [selectedDay, setSelectedDay] = useState(null)
  const [activeDay, setActiveDay] = useState(null)
  const scrollRef = useRef(null)
  const cellRefs = useRef(new Map())
  const weeks = useMemo(() => getHeatmapData(problems), [problems])
  const days = useMemo(() => weeks.flatMap((week) => week.days), [weeks])
  const total = days.reduce((sum, day) => sum + day.count, 0)

  useEffect(() => {
    const container = scrollRef.current
    if (container) container.scrollLeft = container.scrollWidth
  }, [weeks])

  const moveFocus = (date, offset) => {
    let index = days.findIndex((day) => day.date === date) + offset
    while (index >= 0 && index < days.length && days[index].isFuture) index += Math.sign(offset)
    cellRefs.current.get(days[index]?.date)?.focus()
  }

  const handleKeyDown = (event, day) => {
    const offsets = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }
    if (offsets[event.key]) {
      event.preventDefault()
      moveFocus(day.date, offsets[event.key])
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" aria-hidden="true" />
          <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">Contribution heatmap</h3>
        </div>
        <p className="text-[11px] text-content-muted">{total} solved across the last 52 weeks</p>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-2" aria-label="Problem solving contribution calendar">
        <div className="inline-grid grid-cols-[2rem_auto] gap-x-2 min-w-max">
          <div />
          <div className="flex gap-1 h-4 text-[9px] text-content-muted" aria-hidden="true">
            {weeks.map((week, index) => <span key={week.days[0].date} className="w-3.5">{week.monthLabel || (index === 0 ? week.days[0].date.slice(5, 7) : '')}</span>)}
          </div>
          <div className="grid grid-rows-7 gap-1 text-[9px] text-content-muted" aria-hidden="true">
            {DAY_LABELS.map((label, index) => <span key={index} className="h-3.5 leading-[14px]">{label}</span>)}
          </div>
          <div className="flex gap-1" role="grid" aria-label="52 week contribution history">
            {weeks.map((week) => (
              <div key={week.days[0].date} className="grid grid-rows-7 gap-1" role="row">
                {week.days.map((day) => day.isFuture ? (
                  <span key={day.date} className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <button
                    key={day.date}
                    ref={(node) => node ? cellRefs.current.set(day.date, node) : cellRefs.current.delete(day.date)}
                    type="button"
                    role="gridcell"
                    onClick={() => setSelectedDay(day)}
                    onFocus={() => setActiveDay(day)}
                    onBlur={() => setActiveDay(null)}
                    onMouseEnter={() => setActiveDay(day)}
                    onMouseLeave={() => setActiveDay(null)}
                    onKeyDown={(event) => handleKeyDown(event, day)}
                    aria-label={`${day.count || 'No'} problem${day.count === 1 ? '' : 's'} solved on ${day.fullDate}`}
                    className={clsx('w-3.5 h-3.5 rounded-[3px] border focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none motion-reduce:transform-none motion-reduce:transition-none', getHeatmapCellClass(day.count))}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-5 mt-2 text-[11px] text-content-secondary" role="status" aria-live="polite">
        {activeDay ? `${activeDay.count || 'No'} problem${activeDay.count === 1 ? '' : 's'} solved on ${activeDay.fullDate}` : 'Focus or hover a day for details. Use arrow keys to move between days.'}
      </div>
      <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-end gap-1.5 text-[11px] text-content-muted" aria-label="Contribution intensity legend">
        <span>Less</span>
        {HEATMAP_LEVEL_THRESHOLDS.map((count) => <span key={count} className={clsx('w-3 h-3 rounded-[2px]', getHeatmapCellClass(count))} />)}
        <span>More</span>
      </div>

      <Drawer isOpen={Boolean(selectedDay)} onClose={() => setSelectedDay(null)} title={selectedDay ? `Activity on ${selectedDay.fullDate}` : ''} description={selectedDay ? `${selectedDay.count} problem${selectedDay.count === 1 ? '' : 's'} solved.` : ''} width="max-w-md">
        {selectedDay?.problems.length === 0 ? <p className="text-center py-12 text-xs text-content-muted">No problems were solved on this date.</p> : (
          <div className="space-y-3">
            {selectedDay?.problems.map((problem) => (
              <article key={problem.id} className="p-3.5 bg-base-elevated/50 border border-border-subtle rounded-card space-y-2">
                <div className="flex items-start justify-between gap-2"><h4 className="font-semibold text-xs text-content-primary">{problem.title}</h4><Badge variant={problem.difficulty} size="xs">{problem.difficulty}</Badge></div>
                <p className="text-[11px] text-content-muted">{problem.platform}{problem.timeTakenMinutes ? ` · ${problem.timeTakenMinutes} mins` : ''}</p>
                {isSafeExternalUrl(problem.url) && <a href={problem.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline focus-visible:ring-1 focus-visible:ring-accent"><span>View on {problem.platform}</span><ExternalLink className="w-3 h-3" /></a>}
              </article>
            ))}
          </div>
        )}
      </Drawer>
    </Card>
  )
}
