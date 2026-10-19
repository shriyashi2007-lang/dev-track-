import React from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'

export function Chip({
  children,
  selected = false,
  onSelect,
  onRemove,
  className = '',
  disabled = false,
}) {
  const isInteractive = Boolean(onSelect)

  return (
    <span
      onClick={isInteractive && !disabled ? onSelect : undefined}
      role={isInteractive ? 'button' : undefined}
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
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-all duration-150 select-none',
        selected
          ? 'bg-primary text-white border-primary shadow-sm font-medium'
          : 'bg-base-elevated text-content-secondary border-border-subtle hover:border-border-strong hover:text-content-primary',
        isInteractive && !disabled && 'cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
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
