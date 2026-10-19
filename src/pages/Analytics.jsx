import { useState, useMemo } from 'react'
import { useProblems } from '../context/ProblemsContext'
import { AnalyticsInsights } from '../components/analytics/AnalyticsInsights'
import { DifficultyDonut } from '../components/analytics/DifficultyDonut'
import { TopicChart } from '../components/analytics/TopicChart'
import { ConsistencyChart } from '../components/analytics/ConsistencyChart'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { exportAnalyticsSummary } from '../services/exportService'
import { BarChart3, Download, ExternalLink, Database, X } from 'lucide-react'
import { formatDate } from '../utils/dates'
import clsx from 'clsx'

const RANGES = [
  { id: '7d', label: '7 Days', days: 7 },
  { id: '30d', label: '30 Days', days: 30 },
  { id: '90d', label: '90 Days', days: 90 },
  { id: '1y', label: '1 Year', days: 365 },
]

export default function Analytics() {
  const { problems, stats, streaks, loadSampleData } = useProblems()
  const [selectedRange, setSelectedRange] = useState(30)
  const [selectedDifficulty, setSelectedDifficulty] = useState(null)

  // Filter problems when user clicked a difficulty slice
  const sliceFilteredProblems = useMemo(() => {
    if (!selectedDifficulty) return []
    return problems.filter((p) => p.status === 'Solved' && p.difficulty === selectedDifficulty)
  }, [problems, selectedDifficulty])

  const handleExport = () => {
    exportAnalyticsSummary(stats, streaks)
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-content-primary">Performance &amp; Preparation Analytics</h2>
          </div>
          <p className="text-xs text-content-secondary mt-0.5">
            Deep dive into your DSA problem solving velocity, consistency trends, and topic depth.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Range selector */}
          <div className="flex items-center gap-1 p-0.5 bg-base-elevated rounded-card border border-border-subtle">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRange(r.days)}
                className={clsx(
                  'px-2.5 py-1 text-xs font-medium rounded-subtle transition-colors cursor-pointer',
                  selectedRange === r.days
                    ? 'bg-base-surface text-content-primary font-semibold shadow-sm'
                    : 'text-content-secondary hover:text-content-primary'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExport}
          >
            Export JSON
          </Button>
        </div>
      </div>

      {problems.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics available yet"
          description="Log or solve your first set of problems to generate interactive velocity and topic charts."
          action={
            <Button variant="primary" size="sm" onClick={loadSampleData} leftIcon={<Database className="w-4 h-4" />}>
              Load Sample Data
            </Button>
          }
        />
      ) : (
        <>
          {/* Top 4 Insight Cards */}
          <AnalyticsInsights stats={stats} streaks={streaks} />

          {/* Consistency Area Chart */}
          <ConsistencyChart problems={problems} rangeDays={selectedRange} />

          {/* Charts Row: Difficulty Donut & Topic Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DifficultyDonut
              stats={stats}
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
            />
            <TopicChart stats={stats} />
          </div>

          {/* Sliced Difficulty Problems Table if slice clicked */}
          {selectedDifficulty && (
            <div className="p-5 bg-base-surface border border-border-strong rounded-card space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedDifficulty} size="sm">
                    {selectedDifficulty}
                  </Badge>
                  <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
                    Solved Problems ({sliceFilteredProblems.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDifficulty(null)}
                  className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Dismiss Slice Filter
                </button>
              </div>

              <div className="divide-y divide-border-subtle max-h-60 overflow-y-auto pr-1">
                {sliceFilteredProblems.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <span className="font-medium text-content-primary truncate block">
                        {p.title}
                      </span>
                      <span className="text-[10px] text-content-muted">
                        {p.platform} • {(p.topics || []).slice(0, 2).join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] tabular-nums text-content-muted">
                        {p.solvedDate ? formatDate(p.solvedDate, 'MMM d') : ''}
                      </span>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-content-muted hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
