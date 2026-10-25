import React from 'react'
import clsx from 'clsx'

import { getTopicBadgeStyle } from '../../styles/chartTheme'

const variants = {
  // Difficulty (strictly distinct semantic tokens with left stripes)
  Easy: 'bg-difficulty-easy-bg text-difficulty-easy-text border-difficulty-easy-border border-l-2 border-l-difficulty-easy',
  Medium: 'bg-difficulty-medium-bg text-difficulty-medium-text border-difficulty-medium-border border-l-2 border-l-difficulty-medium',
  Hard: 'bg-difficulty-hard-bg text-difficulty-hard-text border-difficulty-hard-border border-l-2 border-l-difficulty-hard',
  
  // Status
  Todo: 'bg-status-todo-bg text-status-todo-text border-status-todo-border',
  Attempted: 'bg-status-attempted-bg text-status-attempted-text border-status-attempted-border',
  Solved: 'bg-status-solved-bg text-status-solved-text border-status-solved-border border-l-2 border-l-status-solved',
  Revisit: 'bg-accent-light text-accent border-accent/30 border-l-2 border-l-accent',

  // Priority
  High: 'bg-difficulty-hard-bg text-difficulty-hard-text border-difficulty-hard-border border-l-2 border-l-difficulty-hard',
  Low: 'bg-status-todo-bg text-status-todo-text border-status-todo-border',

  // Generic & Brand
  primary: 'bg-primary-light text-primary border-primary/30',
  accent: 'bg-accent-light text-accent border-accent/30',
  neutral: 'bg-base-elevated text-content-secondary border-border-subtle',
  sample: 'bg-difficulty-medium-bg text-difficulty-medium-text border-difficulty-medium-border font-semibold animate-pulse',

  // Pastel scale
  'pastel-coral': 'bg-pastel-coral text-content-primary border-rainbow-1/40',
  'pastel-rose': 'bg-pastel-rose text-content-primary border-rainbow-2/40',
  'pastel-raspberry': 'bg-pastel-raspberry text-content-primary border-rainbow-3/40',
  'pastel-amber': 'bg-pastel-amber text-content-primary border-rainbow-4/40',
  'pastel-mint': 'bg-pastel-mint text-content-primary border-rainbow-5/40',
  'pastel-sky': 'bg-pastel-sky text-content-primary border-rainbow-6/40',
  'pastel-violet': 'bg-pastel-violet text-content-primary border-rainbow-7/40',
  'pastel-plum': 'bg-pastel-plum text-content-primary border-rainbow-8/40',
}

const sizes = {
  xs: 'px-1.5 py-0.5 text-[10px] leading-tight',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs font-medium',
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  topic,
  className = '',
  dot = false,
  ...props
}) {
  let appliedVariant = variants[children] || variants[variant] || variants.neutral

  if (topic) {
    const topicStyle = getTopicBadgeStyle(topic)
    appliedVariant = topicStyle.className
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wider font-display font-medium transition-all duration-150',
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
