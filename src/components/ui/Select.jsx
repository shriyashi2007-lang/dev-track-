import React from 'react'
import clsx from 'clsx'

export const Select = React.forwardRef(function Select(
  {
    label,
    error,
    helperText,
    children,
    className = '',
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const generatedId = React.useId()
  const selectId = id || generatedId

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-content-secondary mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        disabled={disabled}
        className={clsx(
          'w-full bg-base-elevated text-content-primary text-sm rounded-card border px-3 py-2 transition-colors duration-150',
          'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-difficulty-hard focus:border-difficulty-hard focus:ring-difficulty-hard'
            : 'border-border-subtle hover:border-border-strong',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-difficulty-hard">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-content-muted">{helperText}</p>
      ) : null}
    </div>
  )
})
