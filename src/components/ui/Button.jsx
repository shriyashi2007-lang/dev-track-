import React from 'react'
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm active:scale-[0.98]',
  secondary: 'bg-base-elevated text-content-primary hover:bg-opacity-80 border border-border-subtle active:scale-[0.98]',
  outline: 'border border-border-strong text-content-primary hover:bg-base-elevated active:scale-[0.98]',
  ghost: 'text-content-secondary hover:text-content-primary hover:bg-base-elevated active:scale-[0.98]',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm active:scale-[0.98]',
  dangerGhost: 'text-rose-500 hover:bg-rose-500/10 active:scale-[0.98]',
}

const sizes = {
  xs: 'px-2 py-1 text-xs gap-1 rounded-subtle',
  sm: 'px-3 py-1.5 text-xs font-medium gap-1.5 rounded-subtle',
  md: 'px-4 py-2 text-sm font-medium gap-2 rounded-card',
  lg: 'px-5 py-2.5 text-base font-medium gap-2.5 rounded-card',
}

export const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
})
