import React from 'react'
import clsx from 'clsx'

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills',
  className = '',
}) {
  return (
    <div
      role="tablist"
      className={clsx(
        'flex items-center gap-1 overflow-x-auto no-scrollbar',
        variant === 'pills' && 'p-1 bg-base-elevated rounded-card border border-border-subtle inline-flex',
        variant === 'underline' && 'border-b border-border-subtle w-full gap-4',
        className
      )}
    >
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              variant === 'pills' && [
                'px-3 py-1.5 rounded-subtle',
                isSelected
                  ? 'bg-base-surface text-content-primary shadow-sm font-semibold border border-border-subtle'
                  : 'text-content-secondary hover:text-content-primary hover:bg-base-surface/50',
              ],
              variant === 'underline' && [
                'py-2 px-1 border-b-2',
                isSelected
                  ? 'border-accent text-accent font-semibold'
                  : 'border-transparent text-content-secondary hover:text-content-primary hover:border-border-strong',
              ]
            )}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'px-1.5 py-0.5 text-[10px] rounded-full tabular-nums',
                  isSelected
                    ? 'bg-accent-light text-accent'
                    : 'bg-base-surface text-content-muted'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
