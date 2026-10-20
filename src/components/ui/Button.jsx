import React from 'react'
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active shadow-card hover:shadow-glow-primary hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  accent: 'bg-accent text-white hover:bg-accent-hover shadow-card hover:shadow-glow-coral hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  secondary: 'bg-base-elevated text-content-primary hover:bg-opacity-85 border border-border-subtle shadow-sm hover:border-border-strong hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  outline: 'border-2 border-border-strong text-content-primary hover:bg-base-elevated hover:border-primary hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  ghost: 'text-content-secondary hover:text-content-primary hover:bg-base-elevated active:scale-[0.98]',
  glass: 'glass-liquid text-content-primary hover:border-accent-coral hover:-translate-y-0.5 active:scale-[0.98]',
  danger: 'bg-difficulty-hard text-white hover:brightness-110 shadow-sm active:scale-[0.98]',
  dangerGhost: 'text-difficulty-hard hover:bg-difficulty-hard-bg active:scale-[0.98]',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-subtle',
  sm: 'px-3.5 py-1.5 text-xs font-semibold gap-1.5 rounded-card',
  md: 'px-4.5 py-2.5 text-sm font-bold gap-2 rounded-card',
  lg: 'px-6 py-3 text-base font-bold gap-2.5 rounded-large',
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
        'group inline-flex items-center justify-center font-display tracking-tight transition-all duration-150 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0 transition-transform duration-150 group-hover:scale-110">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="shrink-0 transition-transform duration-150 group-hover:translate-x-1">
          {rightIcon}
        </span>
      )}
    </button>
  )
})
