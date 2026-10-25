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
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref
) {
  const generatedId = React.useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`
  const describedBy = [ariaDescribedBy, error ? errorId : helperText ? helperId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-display font-medium text-content-secondary mb-1.5"
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
          aria-invalid={ariaInvalid ?? Boolean(error)}
          aria-describedby={describedBy}
          className={clsx(
            'w-full bg-base-elevated/70 text-content-primary text-sm rounded-input border px-3.5 py-2.5 transition-all duration-150',
            'placeholder:text-content-muted font-sans',
            'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 focus:bg-base-surface',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon ? 'pl-9' : 'pl-3.5',
            rightIcon ? 'pr-9' : 'pr-3.5',
            error
              ? 'border-difficulty-hard focus:border-difficulty-hard focus:ring-difficulty-hard/30'
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
        <p id={errorId} role="alert" className="mt-1 text-xs text-difficulty-hard">{error}</p>
      ) : helperText ? (
        <p id={helperId} className="mt-1 text-xs text-content-muted">{helperText}</p>
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
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref
) {
  const generatedId = React.useId()
  const textareaId = id || generatedId
  const errorId = `${textareaId}-error`
  const helperId = `${textareaId}-helper`
  const describedBy = [ariaDescribedBy, error ? errorId : helperText ? helperId : null].filter(Boolean).join(' ') || undefined

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
        aria-invalid={ariaInvalid ?? Boolean(error)}
        aria-describedby={describedBy}
        className={clsx(
          'w-full bg-base-elevated/60 text-content-primary text-sm rounded-card border px-3 py-2 transition-colors duration-150 resize-y',
          'placeholder:text-content-muted',
          'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-difficulty-hard focus:border-difficulty-hard focus:ring-difficulty-hard'
            : 'border-border-subtle hover:border-border-strong',
          className
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-xs text-difficulty-hard">{error}</p>
      ) : helperText ? (
        <p id={helperId} className="mt-1 text-xs text-content-muted">{helperText}</p>
      ) : null}
    </div>
  )
})
