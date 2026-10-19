import React from 'react'
import clsx from 'clsx'
import { Card } from '../ui/Card'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { getLocalDateString, addDays, formatDate } from '../../utils/dates'

export function RevisionCalendar({ problems = [], selectedDate, onSelectDate }) {
  // Generate next 14 days
  const today = new Date()
  const days = []

  // Count due problems by date
  const countsByDate = {}
  for (const p of problems) {
    if (p.revision?.marked && p.revision?.nextRevisionDate) {
      countsByDate[p.revision.nextRevisionDate] = (countsByDate[p.revision.nextRevisionDate] || 0) + 1
    }
  }

  for (let i = 0; i < 14; i++) {
    const d = addDays(today, i)
    const dateStr = getLocalDateString(d)
    days.push({
      dateStr,
      dayNumber: d.getDate(),
      dayName: formatDate(d, 'EEE'),
      monthName: formatDate(d, 'MMM'),
      count: countsByDate[dateStr] || 0,
      isToday: i === 0,
    })
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
            Due Schedule (Next 14 Days)
          </h3>
        </div>
        {selectedDate && (
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
          >
            <X className="w-3 h-3" />
            Clear Date Filter
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {days.map((d) => {
          const isSelected = selectedDate === d.dateStr
          return (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : d.dateStr)}
              className={clsx(
                'flex flex-col items-center justify-between p-2 rounded-card border min-w-[54px] h-[68px] transition-all cursor-pointer',
                isSelected
                  ? 'bg-primary text-white border-primary shadow-sm ring-1 ring-primary'
                  : d.isToday
                  ? 'bg-base-elevated border-primary/40 text-content-primary'
                  : 'bg-base-surface border-border-subtle hover:border-border-strong text-content-secondary'
              )}
            >
              <span className="text-[10px] uppercase font-mono font-semibold">
                {d.dayName}
              </span>
              <span className="text-sm font-bold font-mono">
                {d.dayNumber}
              </span>
              <span
                className={clsx(
                  'w-4 h-4 rounded-full text-[10px] font-mono flex items-center justify-center font-bold',
                  d.count > 0
                    ? isSelected
                      ? 'bg-white text-primary'
                      : 'bg-primary/20 text-primary'
                    : 'opacity-0'
                )}
              >
                {d.count}
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
