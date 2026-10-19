import React from 'react'
import clsx from 'clsx'

export function Skeleton({ className = '', variant = 'rect', ...props }) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        'animate-pulse bg-base-elevated/80 border border-border-subtle/50',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'h-4 rounded',
        variant === 'rect' && 'rounded-card',
        className
      )}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-base-surface border border-border-subtle rounded-card p-5 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton variant="text" className="w-28 h-4" />
        <Skeleton variant="circle" className="w-8 h-8" />
      </div>
      <Skeleton variant="text" className="w-20 h-7" />
      <Skeleton variant="text" className="w-36 h-3" />
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-border-subtle animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <Skeleton variant="text" className="w-full h-4" />
        </td>
      ))}
    </tr>
  )
}
