import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Layers3 } from 'lucide-react'
import { AnalyticsChartCard } from './AnalyticsChartCard'
import { chartColors, rechartsTheme } from '../../styles/chartTheme'
import { isReducedMotion } from '../../styles/motion'

const SERIES = [
  { key: 'Easy', color: chartColors.easy },
  { key: 'Medium', color: chartColors.medium },
  { key: 'Hard', color: chartColors.hard },
  { key: 'Unknown', color: 'var(--text-muted)' },
]

function TopicTooltip({ active, payload }) {
  if (!active || !payload?.[0]?.payload) return null
  const topic = payload[0].payload
  return (
    <div style={rechartsTheme.tooltip.contentStyle}>
      <p style={rechartsTheme.tooltip.labelStyle}>{topic.name}</p>
      <p style={rechartsTheme.tooltip.itemStyle}>{topic.count} solved · {topic.percentage}% of solved problems</p>
      {SERIES.map(({ key }) => topic[key] > 0 && <p key={key} style={rechartsTheme.tooltip.itemStyle}>{key}: {topic[key]}</p>)}
    </div>
  )
}

export function TopicChart({ topicAnalytics }) {
  const data = topicAnalytics.items
  const height = Math.max(320, data.length * 34)
  return (
    <AnalyticsChartCard
      title="Practice activity by topic"
      subtitle="Counts reflect practice coverage, not mastery. A multi-topic problem contributes once to every listed topic."
      icon={Layers3}
      isEmpty={topicAnalytics.totalSolved === 0}
      className="lg:col-span-2"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-subtle border border-border-subtle bg-base-elevated/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-content-muted">Most practiced</p>
          <p className="mt-1 text-base font-bold text-content-primary">{topicAnalytics.mostPracticed?.name || '—'}</p>
          <p className="text-xs text-content-secondary">{topicAnalytics.mostPracticed?.count || 0} solved problems</p>
        </div>
        <div className="rounded-subtle border border-border-subtle bg-base-elevated/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-content-muted">Least practiced</p>
          <p className="mt-1 text-base font-bold text-content-primary">{topicAnalytics.leastPracticed?.name || '—'}</p>
          <p className="text-xs text-content-secondary">{topicAnalytics.leastPracticed?.count || 0} solved problems · core zeros included</p>
        </div>
      </div>

      <div className="mt-5 w-full" style={{ height }} role="img" aria-label={`Topic practice activity. ${data.map((topic) => `${topic.name}: ${topic.count}`).join(', ')}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid {...rechartsTheme.cartesianGrid} horizontal={false} />
            <XAxis type="number" allowDecimals={false} {...rechartsTheme.xAxis} />
            <YAxis type="category" dataKey="name" width={108} {...rechartsTheme.yAxis} tick={{ fontSize: 10 }} />
            <Tooltip content={<TopicTooltip />} cursor={{ fill: 'var(--bg-elevated)', opacity: 0.45 }} />
            {SERIES.map(({ key, color }, index) => (
              <Bar
                key={key}
                dataKey={key}
                name={key}
                stackId="difficulty"
                fill={color}
                radius={index === SERIES.length - 1 ? [0, 4, 4, 0] : 0}
                isAnimationActive={!isReducedMotion()}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-content-secondary" aria-label="Topic chart difficulty legend">
        {SERIES.map(({ key, color }) => <span key={key} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />{key}</span>)}
      </div>

      <div className="mt-4 overflow-hidden rounded-subtle border border-border-subtle">
        <div className="divide-y divide-border-subtle">
          {data.map((topic) => (
            <div key={topic.name} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-3 py-2 text-xs">
              <span className="truncate font-medium text-content-primary">{topic.name}</span>
              <span className="tabular-nums text-content-secondary">{topic.count} solved</span>
              <span className="w-10 text-right tabular-nums text-content-muted">{topic.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <table className="sr-only"><caption>Topic practice activity and difficulty breakdown</caption><thead><tr><th>Topic</th><th>Total</th><th>Share</th><th>Easy</th><th>Medium</th><th>Hard</th><th>Unknown</th></tr></thead><tbody>{data.map((topic) => <tr key={topic.name}><td>{topic.name}</td><td>{topic.count}</td><td>{topic.percentage}%</td><td>{topic.Easy}</td><td>{topic.Medium}</td><td>{topic.Hard}</td><td>{topic.Unknown}</td></tr>)}</tbody></table>
    </AnalyticsChartCard>
  )
}
