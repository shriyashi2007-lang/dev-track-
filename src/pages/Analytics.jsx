import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BarChart3, Database, Download, RefreshCw } from 'lucide-react'
import { useProblems } from '../context/ProblemsContext'
import { AnalyticsInsights } from '../components/analytics/AnalyticsInsights'
import { AnalyticsRangeSelector } from '../components/analytics/AnalyticsRangeSelector'
import { DailySolvedChart, CumulativeSolvedChart, ActivityAggregationChart } from '../components/analytics/ProgressCharts'
import { DifficultyDonut } from '../components/analytics/DifficultyDonut'
import { TopicChart } from '../components/analytics/TopicChart'
import { ConsistencyChart } from '../components/analytics/ConsistencyChart'
import { RuleBasedInsights } from '../components/analytics/RuleBasedInsights'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { CardSkeleton, Skeleton } from '../components/ui/Skeleton'
import { exportAnalyticsSummary } from '../services/exportService'
import { getAnalyticsSnapshot, getSolvedProblemCount } from '../utils/analytics'

function AnalyticsLoading() {
  return (
    <div className="space-y-6" aria-label="Loading analytics" aria-busy="true">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}

export default function Analytics() {
  const { problems, stats, streaks, isLoading, loadError, refreshProblems, loadSampleData } = useProblems()
  const [selectedRange, setSelectedRange] = useState(30)
  const analytics = useMemo(() => getAnalyticsSnapshot(problems, selectedRange), [problems, selectedRange])
  const solvedTotal = useMemo(() => getSolvedProblemCount(problems), [problems])

  return (
    <div className="space-y-7">
      <header className="relative overflow-hidden rounded-card border border-border-subtle bg-base-surface px-4 py-5 shadow-card sm:px-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-accent-light/60 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-bold text-content-primary sm:text-2xl">Advanced analytics</h2>
            </div>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-content-secondary sm:text-sm">
              Explore coding activity, practice coverage, and consistency using only your saved solved problems.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <AnalyticsRangeSelector value={selectedRange} onChange={setSelectedRange} />
            <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />} onClick={() => exportAnalyticsSummary(stats, streaks)}>
              Export
            </Button>
          </div>
        </div>
      </header>

      {isLoading ? (
        <AnalyticsLoading />
      ) : loadError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Analytics could not read your saved data"
          description="Your original browser data was left unchanged. Retry after checking that local storage is available and contains valid data."
          action={<Button variant="primary" size="sm" onClick={refreshProblems} leftIcon={<RefreshCw className="h-4 w-4" />}>Retry loading</Button>}
          showWave={false}
        />
      ) : solvedTotal === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No solved problems yet"
          description="Mark a problem as solved to start building accurate activity, topic, difficulty, and consistency analytics."
          action={<Link to="/problems" className="inline-flex min-h-9 items-center justify-center rounded-button bg-primary px-4 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Go to Problems</Link>}
          secondaryAction={<Button variant="outline" size="sm" onClick={loadSampleData} leftIcon={<Database className="h-4 w-4" />}>Load sample data</Button>}
        />
      ) : analytics.datedSolvedTotal === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Solved problems need completion dates"
          description="Your solved records are safe, but Analytics needs a valid solved date to place them on a local calendar. Edit those records from the Problems page."
          action={<Link to="/problems" className="inline-flex min-h-9 items-center justify-center rounded-button bg-primary px-4 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Review Problems</Link>}
          showWave={false}
        />
      ) : (
        <>
          <AnalyticsInsights analytics={analytics} />

          <section aria-labelledby="coding-progress-heading" className="space-y-3">
            <div>
              <h2 id="coding-progress-heading" className="text-base font-bold text-content-primary">Coding progress</h2>
              <p className="mt-1 text-xs text-content-muted">Range-based activity ending today, using local calendar dates.</p>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <DailySolvedChart data={analytics.daily} total={analytics.solvedInRange} />
              <CumulativeSolvedChart data={analytics.cumulative.series} baseline={analytics.cumulative.baseline} solvedInRange={analytics.solvedInRange} />
              <div className="xl:col-span-2"><ActivityAggregationChart weekly={analytics.weekly} monthly={analytics.monthly} total={analytics.solvedInRange} /></div>
            </div>
          </section>

          <section aria-labelledby="distribution-heading" className="space-y-3">
            <div>
              <h2 id="distribution-heading" className="text-base font-bold text-content-primary">Practice coverage</h2>
              <p className="mt-1 text-xs text-content-muted">Counts describe practice activity only; they do not measure mastery.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <DifficultyDonut distribution={analytics.difficulty} />
              <TopicChart topicAnalytics={analytics.topic} />
            </div>
          </section>

          <ConsistencyChart consistency={analytics.consistency} />

          {analytics.insights.length > 0 ? (
            <RuleBasedInsights insights={analytics.insights} />
          ) : (
            <section aria-labelledby="analytics-insights-heading" className="rounded-card border border-dashed border-border-subtle bg-base-surface/40 p-6 text-center">
              <h2 id="analytics-insights-heading" className="text-sm font-semibold text-content-primary">Personalized insights</h2>
              <p className="mt-1 text-xs text-content-muted">No range activity is available for rule-based insights. Try a longer range.</p>
            </section>
          )}
        </>
      )}
    </div>
  )
}
