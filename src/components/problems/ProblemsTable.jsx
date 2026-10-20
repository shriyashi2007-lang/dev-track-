import React, { useState } from 'react'
import clsx from 'clsx'
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  BookOpen,
  ArrowUpDown,
} from 'lucide-react'
import { Badge } from '../ui/Badge'
import { formatDate } from '../../utils/dates'
import { getTopicBadgeStyle } from '../../styles/chartTheme'

const difficultyStripes = {
  Easy: 'border-l-4 border-l-difficulty-easy stripe-easy',
  Medium: 'border-l-4 border-l-difficulty-medium stripe-medium',
  Hard: 'border-l-4 border-l-difficulty-hard stripe-hard',
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
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
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
    <div className="bg-base-surface border border-border-subtle rounded-card overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-base-elevated/40 text-[11px] font-semibold text-content-secondary uppercase tracking-wider">
              {/* Checkbox */}
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  aria-label="Select all problems on page"
                  className="rounded border-border-strong text-primary focus:ring-accent h-4 w-4"
                />
              </th>

              {/* Title */}
              <th className="py-3 px-4">
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
              <th className="py-3 px-4 w-28">
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
              <th className="py-3 px-4 hidden md:table-cell">Topics</th>

              {/* Status */}
              <th className="py-3 px-4 w-32">Status</th>

              {/* Solved Date */}
              <th className="py-3 px-4 hidden lg:table-cell w-32">
                <button
                  type="button"
                  onClick={() => handleHeaderSort('newest')}
                  className="flex items-center gap-1 hover:text-content-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                >
                  <span>Date</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </th>

              {/* Time */}
              <th className="py-3 px-4 hidden xl:table-cell w-20">Time</th>

              {/* Actions */}
              <th className="py-3 px-4 text-right w-28">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle text-xs">
            {problems.map((problem) => {
              const isSelected = selectedIds.includes(problem.id)
              const isExpanded = expandedRowId === problem.id

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
                            <span className="font-display font-medium text-content-primary truncate hover:underline cursor-pointer" onClick={() => onEdit(problem)}>
                              {renderHighlightedText(problem.title, searchQuery)}
                            </span>
                            {problem.url && (
                              <a
                                href={problem.url}
                                target="_blank"
                                rel="noreferrer"
                                title="Open in platform"
                                className="text-content-muted hover:text-accent transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
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
                        title="Click to cycle status: Todo → Attempted → Solved"
                        className="cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
                      >
                        <Badge variant={problem.status} size="sm" dot>
                          {problem.status}
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
                          title="Edit problem"
                          className="p-1.5 text-content-muted hover:text-content-primary hover:bg-base-elevated rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDelete(problem.id)}
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
  )
}
