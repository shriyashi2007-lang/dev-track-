import clsx from 'clsx'
import { Search, X, Table, LayoutGrid, Upload, Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { DIFFICULTIES, STATUSES } from '../../data/constants'

export function ProblemsFilterBar({
  search,
  onSearchChange,
  difficulties,
  onDifficultyToggle,
  status,
  onStatusChange,
  revisionOnly,
  onRevisionToggle,
  onClearFilters,
  hasActiveFilters,
  viewMode,
  onViewModeChange,
  onOpenImport,
  onOpenAdd,
  totalFilteredCount,
}) {
  return (
    <div className="space-y-3">
      {/* Top row: search bar, view mode switch, action buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input with live clear */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search problems, topics, notes (Press '/' to focus)..."
            className="w-full bg-base-surface text-content-primary text-xs sm:text-sm rounded-card border border-border-subtle pl-9 pr-8 py-2 placeholder:text-content-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-content-muted hover:text-content-primary rounded"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View toggle & Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Table / Board toggle */}
          <div className="p-1 bg-base-surface border border-border-subtle rounded-card flex items-center">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              title="Table view"
              aria-label="Table view"
              className={clsx(
                'p-1.5 rounded-subtle transition-colors cursor-pointer',
                viewMode === 'table'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-content-secondary hover:text-content-primary'
              )}
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('board')}
              title="Kanban board view"
              aria-label="Kanban board view"
              className={clsx(
                'p-1.5 rounded-subtle transition-colors cursor-pointer',
                viewMode === 'board'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-content-secondary hover:text-content-primary'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            onClick={onOpenImport}
            className="hidden sm:inline-flex"
          >
            Import
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onOpenAdd}
          >
            Add Problem
          </Button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {/* Difficulty filter chips */}
        <div className="flex items-center gap-1 bg-base-surface p-1 rounded-card border border-border-subtle">
          <span className="text-[11px] text-content-muted px-2 font-medium">Difficulty:</span>
          {DIFFICULTIES.map((diff) => {
            const isSelected = difficulties.includes(diff)
            return (
              <button
                key={diff}
                type="button"
                onClick={() => onDifficultyToggle(diff)}
                className={clsx(
                  'px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer',
                  isSelected
                    ? diff === 'Easy'
                      ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                      : diff === 'Medium'
                      ? 'bg-amber-500/20 text-amber-400 font-semibold'
                      : 'bg-rose-500/20 text-rose-400 font-semibold'
                    : 'text-content-secondary hover:text-content-primary'
                )}
              >
                {diff}
              </button>
            )
          })}
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-1 bg-base-surface p-1 rounded-card border border-border-subtle">
          <span className="text-[11px] text-content-muted px-2 font-medium">Status:</span>
          {['all', ...STATUSES].map((st) => {
            const isSelected = status === st
            return (
              <button
                key={st}
                type="button"
                onClick={() => onStatusChange(st)}
                className={clsx(
                  'px-2 py-0.5 rounded text-[11px] font-medium transition-colors capitalize cursor-pointer',
                  isSelected
                    ? 'bg-primary/20 text-primary font-semibold'
                    : 'text-content-secondary hover:text-content-primary'
                )}
              >
                {st}
              </button>
            )
          })}
        </div>

        {/* Revision filter button */}
        <button
          type="button"
          onClick={onRevisionToggle}
          className={clsx(
            'px-2.5 py-1.5 rounded-card border text-[11px] font-medium transition-colors cursor-pointer',
            revisionOnly
              ? 'bg-primary/20 text-primary border-primary/40 font-semibold'
              : 'bg-base-surface text-content-secondary border-border-subtle hover:border-border-strong'
          )}
        >
          Revision Only
        </button>

        {/* Clear all filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-card border border-rose-500/20 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}

        <span className="ml-auto text-[11px] font-mono text-content-muted">
          {totalFilteredCount} problem{totalFilteredCount === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  )
}
