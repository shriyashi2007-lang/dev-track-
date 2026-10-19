import React from 'react'
import clsx from 'clsx'

const variants = {
  // Difficulty (strictly distinct semantic tokens)
  Easy: 'bg-difficulty-easy-bg text-difficulty-easy-text border-difficulty-easy-border',
  Medium: 'bg-difficulty-medium-bg text-difficulty-medium-text border-difficulty-medium-border',
  Hard: 'bg-difficulty-hard-bg text-difficulty-hard-text border-difficulty-hard-border',
  
  // Status
  Todo: 'bg-status-todo-bg text-status-todo-text border-status-todo-border',
  Attempted: 'bg-status-attempted-bg text-status-attempted-text border-status-attempted-border',
  Solved: 'bg-status-solved-bg text-status-solved-text border-status-solved-border',

  // Priority
  High: 'bg-difficulty-hard-bg text-difficulty-hard-text border-difficulty-hard-border',
  Low: 'bg-status-todo-bg text-status-todo-text border-status-todo-border',

  // Generic & Brand
  primary: 'bg-primary-light text-primary border-primary/30',
  accent: 'bg-accent-light text-accent border-accent/30',
  neutral: 'bg-base-elevated text-content-secondary border-border-subtle',
  sample: 'bg-difficulty-medium-bg text-difficulty-medium-text border-difficulty-medium-border font-semibold animate-pulse',
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
        'inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wider',
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
