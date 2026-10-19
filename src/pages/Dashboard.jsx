import React, { useState } from 'react'
import { useProblems } from '../context/ProblemsContext'
import { useSettings } from '../context/SettingsContext'
import { StatCards } from '../components/dashboard/StatCards'
import { DailyGoalWidget } from '../components/dashboard/DailyGoalWidget'
import { StreakCard } from '../components/dashboard/StreakCard'
import { QuickAddWidget } from '../components/dashboard/QuickAddWidget'
import { ContributionHeatmap } from '../components/dashboard/ContributionHeatmap'
import { ActivityChart } from '../components/dashboard/ActivityChart'
import { TopicProgress } from '../components/dashboard/TopicProgress'
import { RecentSolvedList } from '../components/dashboard/RecentSolvedList'
import { ProblemDrawer } from '../components/problems/ProblemDrawer'
import { Sparkles, Database } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function Dashboard() {
  const { problems, stats, streaks, addProblem, updateProblem, loadSampleData, hasSampleData } = useProblems()
  const { settings } = useSettings()

  const [editingProblem, setEditingProblem] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Dynamic greeting by local hour
  const hour = new Date().getHours()
  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 17
      ? 'Good afternoon'
      : 'Good evening'

  const handleEdit = (problem) => {
    setEditingProblem(problem)
    setIsDrawerOpen(true)
  }

  const handleToggleRevision = (problem) => {
    updateProblem(problem.id, {
      revision: {
        ...problem.revision,
        marked: !problem.revision?.marked,
        priority: problem.revision?.priority || 'Medium',
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Greeting & Dynamic Motivational Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-subtle">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary">
            {greeting}, {settings.displayName || 'Developer'}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-content-secondary mt-1">
            <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{stats.insight}</span>
          </div>
        </div>

        {/* If completely empty, offer one-click sample load */}
        {problems.length === 0 && !hasSampleData && (
          <Button
            variant="secondary"
            size="sm"
            onClick={loadSampleData}
            leftIcon={<Database className="w-3.5 h-3.5 text-accent" />}
          >
            Load Sample Prep Data
          </Button>
        )}
      </div>

      {/* 4 Animated Stat Cards */}
      <StatCards stats={stats} />

      {/* Daily Goal & Streak Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyGoalWidget stats={stats} dailyGoal={settings.dailyGoal} />
        <StreakCard streaks={streaks} />
      </div>

      {/* Inline Quick-Add Widget */}
      <QuickAddWidget onAdd={addProblem} />

      {/* Contribution Heatmap with Day Panel */}
      <ContributionHeatmap problems={problems} />

      {/* Activity Chart & Topic Mastery Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart problems={problems} />
        <TopicProgress stats={stats} />
      </div>

      {/* Recent Solved List */}
      <RecentSolvedList
        problems={problems}
        onEdit={handleEdit}
        onToggleRevision={handleToggleRevision}
      />

      {/* Edit Drawer */}
      <ProblemDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setEditingProblem(null)
        }}
        initialProblem={editingProblem}
        onSave={async (problemData) => {
          if (editingProblem?.id) {
            await updateProblem(editingProblem.id, problemData)
          } else {
            await addProblem(problemData)
          }
        }}
      />
    </div>
  )
}
