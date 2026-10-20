import React from 'react'
import clsx from 'clsx'

const stripeClasses = {
  easy: 'stripe-easy stripe-hover',
  medium: 'stripe-medium stripe-hover',
  hard: 'stripe-hard stripe-hover',
  primary: 'stripe-primary stripe-hover',
  coral: 'stripe-coral stripe-hover',
  info: 'stripe-info stripe-hover',
}

export function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  glass = false,
  stripe = null,
  hardStop = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
      className={clsx(
        'relative overflow-hidden rounded-card transition-all duration-200 shadow-card',
        glass
          ? 'glass-liquid'
          : 'bg-base-surface border border-border-subtle',
        hover &&
          'hover:border-border-strong hover:shadow-card-hover hover:-translate-y-1 cursor-pointer',
        glow && 'hover:shadow-glow hover:border-primary/50',
        stripe && stripeClasses[stripe],
        onClick &&
          'focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none cursor-pointer',
        className
      )}
      {...props}
    >
      {hardStop && <div className="hard-stop-wave-bar" aria-hidden="true" />}
      {children}
    </div>
  )
}

export function GlassCard({ children, className = '', ...props }) {
  return (
    <Card glass hover {...props} className={className}>
      {children}
    </Card>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'p-5 border-b border-border-subtle flex items-center justify-between font-display tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={clsx('p-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'p-4 bg-base-elevated/40 border-t border-border-subtle flex items-center justify-between',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
