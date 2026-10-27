import React, { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import clsx from 'clsx'
import {
  CheckCircle2,
  Circle,
  Clock3,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  BookOpen,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react'
import { Badge } from '../ui/Badge'
import { ProblemCard } from './ProblemCard'
import { formatDate } from '../../utils/dates'
import { getTopicBadgeStyle } from '../../styles/chartTheme'

const difficultyStripes = {
  Easy: 'border-l-4 border-l-difficulty-easy stripe-easy',
  Medium: 'border-l-4 border-l-difficulty-medium stripe-medium',
  Hard: 'border-l-4 border-l-difficulty-hard stripe-hard',
}

const statusMeta = {
  Todo: { label: 'To Do', icon: Circle },
  Attempted: { label: 'Attempted', icon: Clock3 },
  Solved: { label: 'Solved', icon: CheckCircle2 },
  Revisit: { label: 'Revisit', icon: RotateCcw },
}

export function ProblemsTable({
  problems = [],
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onStatusCycle,
  onToggleRevision,
  sort,
  onSortChange,
  searchQuery = '',
}) {
  const [expandedRowId, setExpandedRowId] = useState(null)

  const isAllSelected = problems.length > 0 && selectedIds.length === problems.length

  const handleHeaderSort = (field) => {
    if (sort === `${field}-asc`) {
      onSortChange(`${field}-desc`)
    } else {
      onSortChange(`${field}-asc`)
    }
  }

  // Highlight matching search text
  const renderHighlightedText = (text, query) => {
    if (!query || !text) return text
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-accent-light text-accent rounded px-0.5 font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        <AnimatePresence initial={false}>
          {problems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              selected={selectedIds.includes(problem.id)}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusCycle={onStatusCycle}
              onToggleRevision={onToggleRevision}
            />
          ))}
        </AnimatePresence>
      </div>
    <div className="hidden bg-base-surface border border-border-subtle rounded-card overflow-hidden shadow-card md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-base-elevated/40 text-[11px] font-semibold text-content-secondary uppercase tracking-wider">
              {/* Checkbox */}
              <th scope="col" className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  aria-label="Select all problems on page"
                  className="rounded border-border-strong text-primary focus:ring-accent h-4 w-4"
                />
              </th>

              {/* Title */}
              <th scope="col" className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => handleHeaderSort('title')}
                  className="flex items-center gap-1 hover:text-content-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                >
                  <span>Problem</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </th>

              {/* Difficulty */}
              <th scope="col" className="py-3 px-4 w-28">
                <button
                  type="button"
                  onClick={() => handleHeaderSort('difficulty')}
                  className="flex items-center gap-1 hover:text-content-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                >
                  <span>Difficulty</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </th>

              {/* Topics */}
              <th scope="col" className="py-3 px-4 hidden md:table-cell">Topics</th>

              {/* Status */}
              <th scope="col" className="py-3 px-4 w-32">Status</th>

              {/* Solved Date */}
              <th scope="col" className="py-3 px-4 hidden lg:table-cell w-32">
                <button
                  type="button"
                  onClick={() => onSortChange(sort === 'newest' ? 'oldest' : 'newest')}
                  className="flex items-center gap-1 hover:text-content-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                >
                  <span>Date</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </th>

              {/* Time */}
              <th scope="col" className="py-3 px-4 hidden xl:table-cell w-20">Time</th>

              {/* Actions */}
              <th scope="col" className="py-3 px-4 text-right w-28">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle text-xs">
            {problems.map((problem) => {
              const isSelected = selectedIds.includes(problem.id)
              const isExpanded = expandedRowId === problem.id
              const status = statusMeta[problem.status] || statusMeta.Todo
              const StatusIcon = status.icon

              return (
                <React.Fragment key={problem.id}>
                  <tr
                    className={clsx(
                      'hover:bg-base-elevated/50 transition-all duration-150 group',
                      difficultyStripes[problem.difficulty] || 'border-l-4 border-l-transparent',
                      isSelected && 'bg-primary/5'
                    )}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(problem.id)}
                        aria-label={`Select ${problem.title}`}
                        className="rounded border-border-strong text-primary focus:ring-accent h-4 w-4"
                      />
                    </td>

                    {/* Title & Platform */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedRowId(isExpanded ? null : problem.id)}
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} notes for ${problem.title}`}
                          className="text-content-muted hover:text-content-primary p-0.5 rounded focus-visible:outline-none"
                          title="Expand notes"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {problem.url ? (
                              <a
                                href={problem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex max-w-full items-center gap-1.5 truncate font-display font-medium text-content-primary hover:text-accent hover:underline focus-visible:ring-2 focus-visible:ring-accent"
                              >
                                <span className="truncate">{renderHighlightedText(problem.title, searchQuery)}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                              </a>
                            ) : (
                              <button type="button" className="max-w-full truncate text-left font-display font-medium text-content-primary hover:underline focus-visible:ring-2 focus-visible:ring-accent" onClick={() => onEdit(problem)} aria-label={`Edit ${problem.title}`}>
                                {renderHighlightedText(problem.title, searchQuery)}
                              </button>
                            )}
                            {problem.isSample && (
                              <Badge size="xs" variant="sample">
                                Sample
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-content-muted block sm:hidden font-sans">
                            {problem.platform}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3 px-4">
                      <Badge variant={problem.difficulty} size="sm">
                        {problem.difficulty}
                      </Badge>
                    </td>

                    {/* Topics with pastel rainbow styling */}
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(problem.topics || []).slice(0, 3).map((topic) => {
                          const topicStyle = getTopicBadgeStyle(topic)
                          return (
                            <span
                              key={topic}
                              className={clsx(
                                'px-2 py-0.5 text-[10px] rounded-full border transition-colors',
                                topicStyle.className
                              )}
                            >
                              {renderHighlightedText(topic, searchQuery)}
                            </span>
                          )
                        })}
                        {(problem.topics || []).length > 3 && (
                          <span className="text-[10px] text-content-muted self-center font-mono">
                            +{(problem.topics || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status with Inline Cycling */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => onStatusCycle(problem)}
                        aria-label={`Change status for ${problem.title}; current status ${status.label}`}
                        title="Click to cycle status"
                        className="cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
                      >
                        <Badge variant={problem.status} size="sm" dot>
                          <StatusIcon className="h-3 w-3" aria-hidden="true" />
                          {status.label}
                        </Badge>
                      </button>
                    </td>

                    {/* Solved Date */}
                    <td className="py-3 px-4 hidden lg:table-cell text-content-secondary tabular-nums text-[11px]">
                      {problem.solvedDate ? formatDate(problem.solvedDate, 'MMM d, yyyy') : '—'}
                    </td>

                    {/* Time */}
                    <td className="py-3 px-4 hidden xl:table-cell text-content-secondary tabular-nums text-[11px]">
                      {problem.timeTakenMinutes ? `${problem.timeTakenMinutes}m` : '—'}
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Revision toggle */}
                        <button
                          type="button"
                          onClick={() => onToggleRevision(problem)}
                          aria-label={`${problem.revision?.marked ? 'Remove' : 'Mark'} ${problem.title} ${problem.revision?.marked ? 'from' : 'for'} revision`}
                          title={problem.revision?.marked ? 'Marked for revision' : 'Mark for revision'}
                          className={clsx(
                            'p-1.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
                            problem.revision?.marked
                              ? 'text-accent bg-accent-light'
                              : 'text-content-muted hover:text-content-primary hover:bg-base-elevated'
                          )}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => onEdit(problem)}
                          aria-label={`Edit ${problem.title}`}
                          title="Edit problem"
                          className="p-1.5 text-content-muted hover:text-content-primary hover:bg-base-elevated rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDelete(problem)}
                          aria-label={`Delete ${problem.title}`}
                          title="Delete problem"
                          className="p-1.5 text-content-muted hover:text-difficulty-hard hover:bg-difficulty-hard-bg rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row for Notes */}
                  {isExpanded && (
                    <tr className="bg-base-elevated/20">
                      <td colSpan={8} className="p-4 pl-12 text-xs">
                        <div className="p-3 bg-base-surface border border-border-subtle rounded-card space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-content-primary">Solution Notes &amp; Intuition:</span>
                            <span className="text-[11px] text-content-muted">Platform: {problem.platform}</span>
                          </div>
                          <p className="text-content-secondary whitespace-pre-wrap leading-relaxed">
                            {problem.notes || 'No notes documented for this problem.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
    </>
  )
}
