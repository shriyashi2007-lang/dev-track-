import clsx from 'clsx'
import { ANALYTICS_RANGES } from '../../utils/analytics'

export function AnalyticsRangeSelector({ value, onChange }) {
  return (
    <div
      className="grid grid-cols-3 gap-1 rounded-card border border-border-subtle bg-base-elevated p-1"
      role="group"
      aria-label="Analytics date range"
    >
      {ANALYTICS_RANGES.map((range) => (
        <button
          key={range.days}
          type="button"
          aria-pressed={value === range.days}
          onClick={() => onChange(range.days)}
          className={clsx(
            'min-h-9 rounded-subtle px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            value === range.days
              ? 'bg-base-surface text-content-primary shadow-sm'
              : 'text-content-secondary hover:text-content-primary'
          )}
        >
          {range.shortLabel}
        </button>
      ))}
    </div>
  )
}
