import { useState } from 'react'
import clsx from 'clsx'
import { ChevronDown, Plus, Search, SlidersHorizontal, Table, LayoutGrid, Upload, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { DIFFICULTIES, PLATFORMS, STATUSES, TOPICS } from '../../data/constants'

const statusLabel = (status) => status === 'Todo' ? 'To Do' : status

export function ProblemsFilterBar({
  search,
  onSearchChange,
  difficulties = [],
  onDifficultyToggle,
  selectedTopics = [],
  onTopicsChange,
  selectedPlatforms = [],
  onPlatformsChange,
  status,
  onStatusChange,
  revisionOnly,
  onRevisionToggle,
  sort,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  viewMode,
  onViewModeChange,
  onOpenImport,
  onOpenAdd,
  totalFilteredCount,
  totalCount,
}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const controls = (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto] xl:items-end">
      <fieldset>
        <legend className="mb-1.5 text-[11px] font-semibold text-content-secondary">Difficulty</legend>
        <div className="flex min-h-10 items-center gap-1 rounded-card border border-border-subtle bg-base-surface p-1">
          {DIFFICULTIES.map((difficulty) => {
            const selected = difficulties.includes(difficulty)
            return (
              <button
                key={difficulty}
                type="button"
                onClick={() => onDifficultyToggle(difficulty)}
                aria-pressed={selected}
                className={clsx(
                  'flex-1 rounded px-2 py-1.5 text-[11px] font-medium transition-colors focus-visible:ring-1 focus-visible:ring-accent',
                  selected
                    ? difficulty === 'Easy'
                      ? 'bg-difficulty-easy-bg text-difficulty-easy-text'
                      : difficulty === 'Medium'
                        ? 'bg-difficulty-medium-bg text-difficulty-medium-text'
                        : 'bg-difficulty-hard-bg text-difficulty-hard-text'
                    : 'text-content-secondary hover:text-content-primary'
                )}
              >
                {difficulty}
              </button>
            )
          })}
        </div>
      </fieldset>

      <label className="block text-[11px] font-semibold text-content-secondary">
        Topic
        <select
          value={selectedTopics[0] || ''}
          onChange={(event) => onTopicsChange(event.target.value ? [event.target.value] : [])}
          className="mt-1.5 min-h-10 w-full rounded-input border border-border-subtle bg-base-surface px-3 text-xs text-content-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All topics</option>
          {TOPICS.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
        </select>
      </label>

      <label className="block text-[11px] font-semibold text-content-secondary">
        Platform
        <select
          value={selectedPlatforms[0] || ''}
          onChange={(event) => onPlatformsChange(event.target.value ? [event.target.value] : [])}
          className="mt-1.5 min-h-10 w-full rounded-input border border-border-subtle bg-base-surface px-3 text-xs text-content-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All platforms</option>
          {PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
        </select>
      </label>

      <label className="block text-[11px] font-semibold text-content-secondary">
        Sort
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className="mt-1.5 min-h-10 w-full rounded-input border border-border-subtle bg-base-surface px-3 text-xs text-content-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="newest">Date: newest</option>
          <option value="oldest">Date: oldest</option>
          <option value="title-asc">Title: A–Z</option>
          <option value="title-desc">Title: Z–A</option>
          <option value="difficulty-asc">Difficulty: Easy–Hard</option>
          <option value="difficulty-desc">Difficulty: Hard–Easy</option>
        </select>
      </label>

      <button
        type="button"
        onClick={onRevisionToggle}
        aria-pressed={revisionOnly}
        className={clsx(
          'min-h-10 rounded-card border px-3 text-[11px] font-semibold transition-colors focus-visible:ring-1 focus-visible:ring-accent',
          revisionOnly
            ? 'border-accent/40 bg-accent-light text-accent'
            : 'border-border-subtle bg-base-surface text-content-secondary hover:border-border-strong'
        )}
      >
        Revision only
      </button>
    </div>
  )

  return (
    <section className="space-y-3" aria-label="Problem controls">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search problems by title"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search problem titles…"
            className="w-full rounded-card border border-border-subtle bg-base-surface py-2.5 pl-9 pr-9 text-sm text-content-primary placeholder:text-content-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {search && (
            <button type="button" onClick={() => onSearchChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-content-muted hover:text-content-primary" aria-label="Clear search">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((open) => !open)}
            aria-expanded={mobileFiltersOpen}
            aria-controls="mobile-problem-filters"
            className="inline-flex min-h-10 items-center gap-2 rounded-card border border-border-subtle bg-base-surface px-3 text-xs font-semibold text-content-secondary md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform', mobileFiltersOpen && 'rotate-180')} />
          </button>

          <div className="flex items-center rounded-card border border-border-subtle bg-base-surface p-1">
            <button type="button" onClick={() => onViewModeChange('table')} aria-label="Table view" aria-pressed={viewMode === 'table'} className={clsx('rounded-subtle p-1.5 focus-visible:ring-1 focus-visible:ring-accent', viewMode === 'table' ? 'bg-primary text-white' : 'text-content-secondary')}><Table className="h-4 w-4" /></button>
            <button type="button" onClick={() => onViewModeChange('board')} aria-label="Board view" aria-pressed={viewMode === 'board'} className={clsx('rounded-subtle p-1.5 focus-visible:ring-1 focus-visible:ring-accent', viewMode === 'board' ? 'bg-primary text-white' : 'text-content-secondary')}><LayoutGrid className="h-4 w-4" /></button>
          </div>

          <Button variant="outline" size="sm" leftIcon={<Upload className="h-3.5 w-3.5" />} onClick={onOpenImport} className="hidden sm:inline-flex">Import</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={onOpenAdd}>Add Problem</Button>
        </div>
      </div>

      <div className="hidden md:block">{controls}</div>
      {mobileFiltersOpen && <div id="mobile-problem-filters" className="rounded-card border border-border-subtle bg-base-elevated/40 p-3 md:hidden">{controls}</div>}

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-content-muted">
        <span aria-live="polite">Showing {totalFilteredCount} of {totalCount}</span>
        <div className="flex items-center gap-2">
          <label className="font-semibold text-content-secondary">
            Status
            <select value={status} onChange={(event) => onStatusChange(event.target.value)} className="ml-2 min-h-8 rounded-input border border-border-subtle bg-base-surface px-2 text-[11px] text-content-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent">
              <option value="all">All</option>
              {STATUSES.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}
            </select>
          </label>
          {(hasActiveFilters || sort !== 'newest') && (
            <button type="button" onClick={onClearFilters} className="inline-flex min-h-8 items-center gap-1 rounded-card border border-difficulty-hard-border bg-difficulty-hard-bg px-2.5 font-semibold text-difficulty-hard-text focus-visible:ring-1 focus-visible:ring-accent">
              <X className="h-3 w-3" /> Reset All
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
