import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { CheckCircle2, ArrowRight, ExternalLink, Edit2, BookOpen } from 'lucide-react'
import { formatDate } from '../../utils/dates'

const difficultyStripes = {
  Easy: 'border-l-4 border-l-difficulty-easy stripe-easy',
  Medium: 'border-l-4 border-l-difficulty-medium stripe-medium',
  Hard: 'border-l-4 border-l-difficulty-hard stripe-hard',
}

export function RecentSolvedList({ problems = [], onEdit, onToggleRevision }) {
  const recent = problems
    .filter((p) => p.status === 'Solved')
    .slice(0, 5)

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-status-solved" />
          <h3 className="text-xs font-display font-semibold text-content-primary uppercase tracking-wider">
            Recently Solved — Latest Activity
          </h3>
        </div>
        <Link
          to="/problems?status=Solved"
          className="text-xs font-display font-medium text-primary hover:text-primary-hover flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent group"
        >
          <span>View all</span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="text-xs text-content-muted py-6 text-center font-sans">
          No problems marked as solved yet.
        </p>
      ) : (
        <div className="space-y-2.5">
          {recent.map((problem) => (
            <div
              key={problem.id}
              className={`p-3 bg-base-elevated/40 hover:bg-base-elevated border border-border-subtle rounded-card flex items-center justify-between gap-3 transition-all duration-150 hover:shadow-ambient hover:-translate-y-0.5 ${
                difficultyStripes[problem.difficulty] || 'stripe-primary'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    onClick={() => onEdit(problem)}
                    className="font-medium text-xs text-content-primary hover:text-primary transition-colors cursor-pointer truncate"
                  >
                    {problem.title}
                  </span>
                  <Badge variant={problem.difficulty} size="xs">
                    {problem.difficulty}
                  </Badge>
                  {problem.url && (
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-content-muted hover:text-accent transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-content-muted tabular-nums">
                  <span>{problem.platform}</span>
                  <span>•</span>
                  <span>{formatDate(problem.solvedDate, 'MMM d, yyyy')}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleRevision(problem)}
                  title={problem.revision?.marked ? 'Marked for revision' : 'Mark for revision'}
                  className={`p-1.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                    problem.revision?.marked
                      ? 'text-accent bg-accent-light'
                      : 'text-content-muted hover:text-content-primary'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(problem)}
                  title="Edit problem"
                  className="p-1.5 text-content-muted hover:text-content-primary rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
