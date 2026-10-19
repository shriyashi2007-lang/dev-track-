import React from 'react'
import clsx from 'clsx'
import { Inbox } from 'lucide-react'

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'Get started by creating your first entry or adjust your search filters.',
  action,
  secondaryAction,
  className = '',
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border-subtle rounded-card bg-base-surface/40',
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-sm">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-content-primary mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-content-secondary max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
