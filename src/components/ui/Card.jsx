import React from 'react'
import clsx from 'clsx'

export function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-base-surface border border-border-subtle rounded-card transition-all duration-200',
        hover && 'hover:border-border-strong hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        glow && 'hover:shadow-glow hover:border-primary/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={clsx('p-5 border-b border-border-subtle flex items-center justify-between', className)} {...props}>
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
    <div className={clsx('p-4 px-5 border-t border-border-subtle bg-base-elevated/40 rounded-b-card', className)} {...props}>
      {children}
    </div>
  )
}
