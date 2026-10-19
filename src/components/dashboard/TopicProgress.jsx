import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Layers } from 'lucide-react'

export function TopicProgress({ stats }) {
  const navigate = useNavigate()
  const { topicCounts = [], strongestTopic, weakestTopic } = stats

  const displayTopics = topicCounts.slice(0, 6)

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
              Topic Mastery
            </h3>
          </div>
          <span className="text-[11px] text-content-muted">Top practiced</span>
        </div>

        {/* Insights Callouts */}
        {(strongestTopic || weakestTopic) && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {strongestTopic && (
              <div className="p-2.5 rounded-subtle bg-difficulty-easy-bg border border-difficulty-easy-border text-xs">
                <span className="text-[10px] uppercase font-semibold text-difficulty-easy-text block mb-0.5">
                  Strongest Topic
                </span>
                <span className="font-semibold text-content-primary truncate block">
                  {strongestTopic.name}
                </span>
                <span className="text-[10px] text-content-muted tabular-nums">{strongestTopic.count} solved</span>
              </div>
            )}
            {weakestTopic && (
              <div className="p-2.5 rounded-subtle bg-difficulty-medium-bg border border-difficulty-medium-border text-xs">
                <span className="text-[10px] uppercase font-semibold text-difficulty-medium-text block mb-0.5">
                  Needs Practice
                </span>
                <span className="font-semibold text-content-primary truncate block">
                  {weakestTopic.name}
                </span>
                <span className="text-[10px] text-content-muted tabular-nums">{weakestTopic.count} solved</span>
              </div>
            )}
          </div>
        )}

        {/* Topic bars */}
        <div className="space-y-3">
          {displayTopics.length === 0 ? (
            <p className="text-xs text-content-muted py-6 text-center">
              Solve problems to visualize topic coverage.
            </p>
          ) : (
            displayTopics.map((item) => (
              <div
                key={item.name}
                onClick={() => navigate(`/problems?topic=${encodeURIComponent(item.name)}`)}
                className="group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-subtle p-1"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/problems?topic=${encodeURIComponent(item.name)}`)
                }}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-content-primary group-hover:text-primary transition-colors">
                    {item.name}
                  </span>
                  <span className="tabular-nums text-content-muted text-[11px]">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-base-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 group-hover:brightness-110"
                    style={{ width: `${Math.max(item.percentage, 5)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
