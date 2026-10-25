import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  X,
  Eye,
  CheckCircle2,
  ExternalLink,
  Trophy,
} from 'lucide-react'
import { useProblems } from '../context/ProblemsContext'
import { categorizeRevisions } from '../utils/spacedRepetition'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Confetti } from '../components/ui/Confetti'

export default function RevisionSession() {
  const navigate = useNavigate()
  const { problems, completeProblemRevision } = useProblems()

  const [revealed, setRevealed] = useState(false)
  const [completedList, setCompletedList] = useState([])
  const [sessionFinished, setSessionFinished] = useState(false)
  const [triggerConfetti, setTriggerConfetti] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  // Grab problems due today or overdue
  const dueProblems = useMemo(() => {
    const { dueToday, overdue } = categorizeRevisions(problems)
    return [...overdue, ...dueToday]
  }, [problems])

  const currentProblem = dueProblems[0]
  const totalDue = dueProblems.length

  const handleComplete = async () => {
    if (!currentProblem || isCompleting) return
    setIsCompleting(true)
    try {
      const result = await completeProblemRevision(currentProblem.id, { stage: currentProblem.revision.stage, dueDate: currentProblem.revision.nextRevisionDate })
      if (result.duplicate) return

      setCompletedList((prev) => [
        ...prev,
        { title: currentProblem.title, difficulty: currentProblem.difficulty },
      ])

      if (totalDue === 1) {
        setSessionFinished(true)
        setTriggerConfetti(true)
      } else {
        setRevealed(false)
      }
    } finally {
      setIsCompleting(false)
    }
  }

  // If no problems due at start
  if (totalDue === 0 && !sessionFinished) {
    return (
      <div className="min-h-screen bg-base text-content-primary flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-difficulty-easy-bg border border-difficulty-easy-border flex items-center justify-center text-difficulty-easy-text mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">No Revisions Due Today</h2>
        <p className="text-sm text-content-secondary max-w-md mb-6 leading-relaxed">
          Your spaced repetition queue is fully up to date. Excellent consistency!
        </p>
        <Link to="/revision">
          <Button variant="primary">Return to Revision Queue</Button>
        </Link>
      </div>
    )
  }

  // Summary screen after session completion
  if (sessionFinished) {
    return (
      <div className="min-h-screen bg-base text-content-primary flex flex-col items-center justify-center p-6">
        <Confetti trigger={triggerConfetti} onComplete={() => setTriggerConfetti(false)} />

        <div className="max-w-lg w-full bg-base-surface border border-border-strong rounded-card p-8 shadow-2xl text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-4">
            <Trophy className="w-8 h-8" />
          </div>
          <span className="text-xs tabular-nums uppercase font-bold text-primary tracking-wider block mb-1">
            Session Completed!
          </span>
          <h2 className="text-2xl font-bold text-content-primary mb-2">
            Fantastic Algorithmic Recall
          </h2>
          <p className="text-sm text-content-secondary mb-6">
            You revised {completedList.length} problems with spaced repetition intervals.
          </p>

          {/* Breakdown cards */}
          <div className="space-y-2 mb-6 max-h-52 overflow-y-auto text-left pr-1">
            {completedList.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-base-elevated rounded border border-border-subtle flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={item.difficulty} size="xs">
                    {item.difficulty}
                  </Badge>
                  <span className="font-medium text-content-primary">{item.title}</span>
                </div>
                <span className="font-semibold text-[11px] text-revision-completed-text">Completed</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" onClick={() => navigate('/revision')}>
              Return to Revision Hub
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Active Flashcard Session Flow
  const sessionTotal = completedList.length + totalDue
  const progressPercent = Math.round(((completedList.length + 1) / sessionTotal) * 100)

  return (
    <div className="min-h-screen bg-base text-content-primary flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header & Progress */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/revision')}
            aria-label="Exit session"
            className="p-2 rounded-card text-content-muted hover:text-content-primary hover:bg-base-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs tabular-nums font-bold text-primary">
              Problem {completedList.length + 1} of {sessionTotal}
            </span>
            <span className="text-xs text-content-muted block sm:inline sm:ml-2">
              (Spaced Repetition Review)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-32 sm:w-44 h-2 bg-base-elevated rounded-full overflow-hidden border border-border-subtle">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Center Interactive Flashcard */}
      <div className="max-w-2xl mx-auto w-full my-auto py-6">
        <div className="bg-base-surface border border-border-strong rounded-card shadow-2xl p-6 sm:p-10 space-y-6 animate-scale-in">
          {/* Card Meta Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
            <div className="flex items-center gap-2">
              <Badge variant={currentProblem.difficulty} size="sm">
                {currentProblem.difficulty}
              </Badge>
              <span className="text-xs text-content-muted">{currentProblem.platform}</span>
            </div>

            <span className="text-xs tabular-nums text-content-muted">
              Revision #{currentProblem.revision?.revisionCount || 0}
            </span>
          </div>

          {/* Problem Title & Topics */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-content-primary mb-3 leading-snug">
              {currentProblem.title}
            </h1>
            <div className="flex flex-wrap gap-1.5">
              {(currentProblem.topics || []).map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Problem link if available */}
          {currentProblem.url && (
            <div>
              <a
                href={currentProblem.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
              >
                <span>Open problem on {currentProblem.platform}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Hidden Notes / Reveal Toggle */}
          <div className="pt-2">
            {!revealed ? (
              <div className="p-8 border-2 border-dashed border-border-subtle rounded-card text-center bg-base-elevated/30">
                <p className="text-xs text-content-secondary mb-3">
                  Think about the pattern, time/space complexity, and edge cases before revealing your notes.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Eye className="w-4 h-4" />}
                  onClick={() => setRevealed(true)}
                >
                  Reveal Solution Intuition
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-base-elevated rounded-card border border-border-subtle space-y-2 animate-fade-in">
                <span className="text-xs font-semibold text-content-primary block">
                  Your Solution Notes &amp; Key Intuition:
                </span>
                <p className="text-xs sm:text-sm text-content-secondary whitespace-pre-wrap leading-relaxed">
                  {currentProblem.notes || 'No notes were written for this problem.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Completion Action */}
      <div className="max-w-2xl mx-auto w-full pb-4">
        <p className="text-xs text-center text-content-secondary font-medium mb-3">
          The next interval is counted from today, the actual completion date.
        </p>
        <Button variant="primary" size="md" onClick={handleComplete} isLoading={isCompleting} disabled={isCompleting} className="w-full">Complete revision</Button>
      </div>
    </div>
  )
}
