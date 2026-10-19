import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProblems } from '../context/ProblemsContext'
import { useSettings } from '../context/SettingsContext'
import { categorizeRevisions, calculateNextRevision } from '../utils/spacedRepetition'
import { getLocalDateString } from '../utils/dates'
import { RevisionCard } from '../components/revision/RevisionCard'
import { RevisionCalendar } from '../components/revision/RevisionCalendar'
import { Tabs } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { AnimatedGroup } from '../components/motion-primitives/AnimatedGroup'
import { RotateCcw, Play, CheckCircle2 } from 'lucide-react'

export default function Revision() {
  const { problems, updateProblem } = useProblems()
  const { settings } = useSettings()

  const [activeTab, setActiveTab] = useState('dueToday') // 'dueToday' | 'overdue' | 'upcoming' | 'completed'
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null)

  const revisionData = useMemo(() => {
    return categorizeRevisions(problems)
  }, [problems])

  const { counts } = revisionData

  const tabs = [
    { id: 'dueToday', label: 'Due Today', count: counts.dueToday },
    { id: 'overdue', label: 'Overdue', count: counts.overdue },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ]

  // Filter tab list by calendar date if selected
  const displayedProblems = useMemo(() => {
    let list = revisionData[activeTab] || []
    if (selectedCalendarDate) {
      list = list.filter((p) => p.revision?.nextRevisionDate === selectedCalendarDate)
    }
    return list
  }, [revisionData, activeTab, selectedCalendarDate])

  // Spaced repetition handler: user clicked Hard, Okay, or Easy
  const handleMarkRevised = async (id, confidence) => {
    const target = problems.find((p) => p.id === id)
    if (!target) return

    const currentCount = target.revision?.revisionCount || 0
    const todayStr = getLocalDateString(new Date())

    const schedule = calculateNextRevision({
      confidence,
      currentCount,
      intervals: settings.revisionIntervals || [1, 3, 7, 14, 30],
      fromDate: new Date(),
    })

    const newHistory = [
      ...(target.revision?.history || []),
      { date: todayStr, confidence },
    ]

    await updateProblem(id, {
      revision: {
        ...target.revision,
        nextRevisionDate: schedule.nextRevisionDate,
        revisionCount: schedule.nextCount,
        lastRevisedDate: todayStr,
        history: newHistory,
      },
    })
  }

  const handleReschedule = async (id, newDate) => {
    const target = problems.find((p) => p.id === id)
    if (!target) return

    await updateProblem(id, {
      revision: {
        ...target.revision,
        nextRevisionDate: newDate,
      },
    })
  }

  const handlePriorityChange = async (id, newPriority) => {
    const target = problems.find((p) => p.id === id)
    if (!target) return

    await updateProblem(id, {
      revision: {
        ...target.revision,
        priority: newPriority,
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Session Mode Launch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-primary/10 via-base-surface to-base-surface border border-primary/25 rounded-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RotateCcw className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-content-primary">Spaced Repetition Engine</h2>
          </div>
          <p className="text-xs text-content-secondary max-w-xl leading-relaxed">
            Problems scheduled across expanding intervals (1 &rarr; 3 &rarr; 7 &rarr; 14 &rarr; 30 days). Quizzing yourself retains algorithmic patterns for interview day.
          </p>
        </div>

        <Link to="/revision/session" className="shrink-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Play className="w-4 h-4 fill-current" />}
          >
            Start Flashcard Session ({counts.dueToday + counts.overdue} due)
          </Button>
        </Link>
      </div>

      {/* Mini Calendar Schedule */}
      <RevisionCalendar
        problems={problems}
        selectedDate={selectedCalendarDate}
        onSelectDate={setSelectedCalendarDate}
      />

      {/* Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-2">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab)
            setSelectedCalendarDate(null)
          }}
        />

        {selectedCalendarDate && (
          <span className="text-xs tabular-nums text-primary font-semibold">
            Filtering by date: {selectedCalendarDate}
          </span>
        )}
      </div>

      {/* Problems List or Empty State */}
      {displayedProblems.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={
            activeTab === 'dueToday'
              ? 'No revisions due today!'
              : activeTab === 'overdue'
              ? 'No overdue revisions'
              : 'Queue is clear'
          }
          description={
            activeTab === 'dueToday'
              ? 'Great job keeping up with your scheduled algorithms. Take on new problems or review upcoming cards.'
              : 'No problems currently match this category.'
          }
          action={
            <Link to="/problems">
              <Button variant="secondary" size="sm">
                Browse Problems
              </Button>
            </Link>
          }
        />
      ) : (
        <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedProblems.map((problem) => (
            <RevisionCard
              key={problem.id}
              problem={problem}
              onMarkRevised={handleMarkRevised}
              onReschedule={handleReschedule}
              onPriorityChange={handlePriorityChange}
            />
          ))}
        </AnimatedGroup>
      )}
    </div>
  )
}
