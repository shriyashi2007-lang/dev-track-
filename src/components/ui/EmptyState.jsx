import React from 'react'
import clsx from 'clsx'
import { Inbox } from 'lucide-react'
import { WaveDivider } from './WaveDivider'

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'Get started by creating your first entry or adjust your search filters.',
  action,
  secondaryAction,
  className = '',
  showWave = true,
}) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border-subtle rounded-card bg-base-surface/40',
        className
      )}
    >
      <div className="relative z-10 w-14 h-14 rounded-full bg-accent-light border border-accent/25 flex items-center justify-center text-accent mb-4 shadow-sm">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="relative z-10 text-base font-semibold text-content-primary mb-1.5">{title}</h3>
      <p className="relative z-10 text-xs sm:text-sm text-content-secondary max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
      {showWave && (
        <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-20 dark:opacity-15">
          <WaveDivider height="h-12" opacity="opacity-100" />
        </div>
      )}
    </div>
  )
}
