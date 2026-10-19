import React from 'react'
import clsx from 'clsx'

export function Avatar({
  name = 'User',
  size = 'md',
  className = '',
}) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-lg font-bold',
  }

  return (
    <div
      aria-label={name}
      className={clsx(
        'rounded-full flex items-center justify-center select-none shrink-0 shadow-sm border border-border-subtle bg-gradient-to-br from-primary via-wave-rose-3 to-accent text-white',
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    >
      <span>{initials}</span>
    </div>
  )
}
