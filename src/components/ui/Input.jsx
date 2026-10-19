import React from 'react'
import clsx from 'clsx'

export const Input = React.forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className = '',
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const generatedId = React.useId()
  const inputId = id || generatedId

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-content-secondary mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-content-muted pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={clsx(
            'w-full bg-base-elevated/60 text-content-primary text-sm rounded-card border px-3 py-2 transition-colors duration-150',
            'placeholder:text-content-muted',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon ? 'pl-9' : 'pl-3',
            rightIcon ? 'pr-9' : 'pr-3',
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
              : 'border-border-subtle hover:border-border-strong',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-content-muted flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-rose-400">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-content-muted">{helperText}</p>
      ) : null}
    </div>
  )
})

export const Textarea = React.forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    className = '',
    id,
    rows = 3,
    disabled = false,
    ...props
  },
  ref
) {
  const generatedId = React.useId()
  const textareaId = id || generatedId

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-medium text-content-secondary mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={clsx(
          'w-full bg-base-elevated/60 text-content-primary text-sm rounded-card border px-3 py-2 transition-colors duration-150 resize-y',
          'placeholder:text-content-muted',
          'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
            : 'border-border-subtle hover:border-border-strong',
          className
        )}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-400">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-content-muted">{helperText}</p>
      ) : null}
    </div>
  )
})
