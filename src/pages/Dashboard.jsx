import React, { useState } from 'react'
import { useProblems } from '../context/ProblemsContext'
import { useSettings } from '../context/SettingsContext'
import { StatCards } from '../components/dashboard/StatCards'
import { QuickAddWidget } from '../components/dashboard/QuickAddWidget'
import { ContributionHeatmap } from '../components/dashboard/ContributionHeatmap'
import { ActivityChart } from '../components/dashboard/ActivityChart'
import { TopicProgress } from '../components/dashboard/TopicProgress'
import { RecentSolvedList } from '../components/dashboard/RecentSolvedList'
import { ProblemDrawer } from '../components/problems/ProblemDrawer'
import { Sparkles, Database, Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { CardSkeleton, Skeleton } from '../components/ui/Skeleton'

export default function Dashboard() {
  const { problems, stats, streaks, isLoading, addProblem, updateProblem, deleteProblem, loadSampleData } = useProblems()
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

  const handleAdd = () => {
    setEditingProblem(null)
    setIsDrawerOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
        <div className="space-y-2"><Skeleton className="h-8 w-72" /><Skeleton className="h-4 w-96 max-w-full" /></div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">{Array.from({ length: 6 }, (_, index) => <CardSkeleton key={index} />)}</div>
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
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
      {/* Top Greeting & Dynamic Motivational Banner with Em-dash */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-subtle">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-content-primary">
            {greeting}, {settings.displayName || 'Developer'} — DevTrack Hub
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-content-secondary mt-1 font-sans">
            <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{stats.insight}</span>
          </div>
        </div>

      </div>

      {problems.length === 0 && (
        <section className="p-5 sm:p-6 rounded-card bg-primary-light border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4" aria-labelledby="empty-dashboard-title">
          <div><h3 id="empty-dashboard-title" className="font-display font-bold text-content-primary">Your progress dashboard starts here</h3><p className="mt-1 text-xs text-content-secondary max-w-2xl">Log a solved problem to build your streak, weekly chart, contribution history, topic progress, and recent activity.</p></div>
          <div className="flex flex-wrap gap-2"><Button size="sm" onClick={handleAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>Add first problem</Button><Button variant="secondary" size="sm" onClick={loadSampleData} leftIcon={<Database className="w-3.5 h-3.5" />}>Load labeled sample data</Button></div>
        </section>
      )}

      <StatCards stats={stats} streaks={streaks} />

      {/* Inline Quick-Add Widget */}
      <QuickAddWidget onAdd={addProblem} />

      {/* Contribution Heatmap with Day Panel */}
      <ContributionHeatmap problems={problems} />

      {/* Activity Chart & Topic Mastery Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart problems={problems} onAddProblem={handleAdd} />
        <TopicProgress stats={stats} />
      </div>

      {/* Recent Solved List */}
      <RecentSolvedList
        problems={problems}
        onEdit={handleEdit}
        onToggleRevision={handleToggleRevision}
        onDelete={deleteProblem}
        onAddProblem={handleAdd}
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
