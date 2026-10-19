import React from 'react'
import clsx from 'clsx'

const variants = {
  // Difficulty
  Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  
  // Status
  Todo: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  Attempted: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  Solved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',

  // Priority
  High: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Low: 'bg-slate-500/15 text-slate-300 border-slate-500/30',

  // Generic
  primary: 'bg-primary/15 text-primary border-primary/30',
  neutral: 'bg-base-elevated text-content-secondary border-border-subtle',
  sample: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold animate-pulse',
}

const sizes = {
  xs: 'px-1.5 py-0.5 text-[10px] leading-tight',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs font-medium',
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  dot = false,
  ...props
}) {
  const appliedVariant = variants[children] || variants[variant] || variants.neutral

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-wider',
        appliedVariant,
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />
      )}
      <span>{children}</span>
    </span>
  )
}
