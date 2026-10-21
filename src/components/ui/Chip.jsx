import React from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'

import { getTopicBadgeStyle } from '../../styles/chartTheme'

export function Chip({
  children,
  selected = false,
  topic,
  variant,
  onSelect,
  onRemove,
  className = '',
  disabled = false,
}) {
  const isInteractive = Boolean(onSelect)

  let customPastelClass = ''
  if (topic) {
    const style = getTopicBadgeStyle(typeof children === 'string' ? children : topic)
    customPastelClass = style.className
  } else if (variant?.startsWith('pastel-')) {
    customPastelClass = `bg-${variant} text-content-primary border-border-subtle`
  }

  return (
    <span
      onClick={isInteractive && !disabled ? onSelect : undefined}
      role={isInteractive ? 'button' : undefined}
      aria-pressed={isInteractive ? selected : undefined}
      aria-disabled={isInteractive && disabled ? true : undefined}
      tabIndex={isInteractive && !disabled ? 0 : undefined}
      onKeyDown={
        isInteractive && !disabled
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect()
              }
            }
          : undefined
      }
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border transition-all duration-150 select-none font-sans',
        selected
          ? 'bg-primary text-white border-primary shadow-sm font-medium'
          : customPastelClass || 'bg-base-elevated text-content-secondary border-border-subtle hover:border-border-strong hover:text-content-primary',
        isInteractive && !disabled && 'cursor-pointer hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm hover:shadow-ambient',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label="Remove item"
          className="hover:text-white rounded-full p-0.5 hover:bg-black/20 focus-visible:outline-none"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}
