import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, Edit2, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { formatDate } from '../../utils/dates'
import { getRecentSolved } from '../../utils/dashboardMetrics'
import { isSafeExternalUrl } from '../../utils/problemNormalizer'
import { isReducedMotion, transitions } from '../../styles/motion'

const difficultyStripes = {
  Easy: 'border-l-4 border-l-difficulty-easy stripe-easy',
  Medium: 'border-l-4 border-l-difficulty-medium stripe-medium',
  Hard: 'border-l-4 border-l-difficulty-hard stripe-hard',
  Unknown: 'border-l-4 border-l-border-strong stripe-primary',
}

export function RecentSolvedList({ problems = [], onEdit, onToggleRevision, onDelete, onAddProblem }) {
  const recent = getRecentSolved(problems)
  const reduced = isReducedMotion()

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-status-solved" aria-hidden="true" /><h3 className="text-xs font-display font-semibold text-content-primary uppercase tracking-wider">Recently solved</h3></div>
        <Link to="/problems?status=Solved" className="text-xs font-display font-medium text-primary hover:text-primary-hover flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-accent group"><span>View all</span><ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" /></Link>
      </div>

      {recent.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm font-semibold text-content-primary">No dated solves yet</p>
          <p className="mt-1 text-xs text-content-muted">Add a solved problem with a date to see it here.</p>
          {onAddProblem && <Button className="mt-4" size="sm" variant="secondary" onClick={onAddProblem} leftIcon={<Plus className="w-3.5 h-3.5" />}>Add problem</Button>}
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {recent.map((problem) => (
              <motion.article
                layout={!reduced}
                key={problem.id}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
                transition={transitions.fast}
                className={`p-3 bg-base-elevated/40 hover:bg-base-elevated border border-border-subtle rounded-card flex items-center justify-between gap-3 ${difficultyStripes[problem.difficulty]}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button type="button" onClick={() => onEdit(problem)} title={problem.title} className="font-medium text-left text-xs text-content-primary hover:text-primary truncate focus-visible:ring-1 focus-visible:ring-accent">{problem.title}</button>
                    <Badge variant={problem.difficulty} size="xs">{problem.difficulty}</Badge>
                    {isSafeExternalUrl(problem.url) && <a href={problem.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${problem.title} on ${problem.platform}`} className="text-content-muted hover:text-accent focus-visible:ring-1 focus-visible:ring-accent"><ExternalLink className="w-3 h-3" /></a>}
                  </div>
                  <p className="text-[10px] text-content-muted truncate">{problem.platform} · {problem.topics[0]} · <time dateTime={problem.solvedDate}>{formatDate(problem.solvedDate, 'MMM d, yyyy')}</time></p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => onToggleRevision(problem)} aria-label={problem.revision?.marked ? `Remove ${problem.title} from revision` : `Mark ${problem.title} for revision`} className={`p-1.5 rounded focus-visible:ring-1 focus-visible:ring-accent ${problem.revision?.marked ? 'text-accent bg-accent-light' : 'text-content-muted hover:text-content-primary'}`}><BookOpen className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => onEdit(problem)} aria-label={`Edit ${problem.title}`} className="p-1.5 text-content-muted hover:text-content-primary rounded focus-visible:ring-1 focus-visible:ring-accent"><Edit2 className="w-3.5 h-3.5" /></button>
                  {onDelete && <button type="button" onClick={() => onDelete(problem.id)} aria-label={`Delete ${problem.title}`} className="p-1.5 text-content-muted hover:text-difficulty-hard rounded focus-visible:ring-1 focus-visible:ring-accent"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  )
}
