import React from 'react'
import clsx from 'clsx'

export function ProgressRing({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  className = '',
  color = 'var(--accent-primary)',
  rainbow = false,
}) {
  const normalizedValue = Math.min(Math.max(value, 0), max)
  const percentage = max > 0 ? Math.round((normalizedValue / max) * 100) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const gradientId = React.useId()

  return (
    <div
      className={clsx('relative inline-flex flex-col items-center justify-center select-none font-display', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={normalizedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || 'Progress'}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {rainbow && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--rainbow-1)" />
              <stop offset="20%" stopColor="var(--rainbow-2)" />
              <stop offset="40%" stopColor="var(--rainbow-3)" />
              <stop offset="60%" stopColor="var(--rainbow-4)" />
              <stop offset="80%" stopColor="var(--rainbow-5)" />
              <stop offset="100%" stopColor="var(--rainbow-6)" />
            </linearGradient>
          </defs>
        )}
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-subtle)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress bar */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={rainbow ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset var(--motion-ring)' }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl sm:text-2xl font-display font-bold tabular-nums text-content-primary">
          {normalizedValue}
          <span className="text-xs text-content-muted font-normal font-sans">/{max}</span>
        </span>
        {sublabel && (
          <span className="text-[10px] uppercase font-semibold tracking-wider text-content-secondary mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}
