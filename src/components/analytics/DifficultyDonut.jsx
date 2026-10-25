import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'
import { chartColors, rechartsTheme } from '../../styles/chartTheme'
import { isReducedMotion } from '../../styles/motion'
import { AnalyticsChartCard } from './AnalyticsChartCard'

const COLORS = {
  Easy: chartColors.easy,
  Medium: chartColors.medium,
  Hard: chartColors.hard,
}

function DifficultyTooltip({ active, payload }) {
  if (!active || !payload?.[0]?.payload) return null
  const item = payload[0].payload
  return <div style={rechartsTheme.tooltip.contentStyle}><p style={rechartsTheme.tooltip.labelStyle}>{item.name}</p><p style={rechartsTheme.tooltip.itemStyle}>{item.count} solved · {item.percentage}% of known difficulties</p></div>
}

export function DifficultyDonut({ distribution }) {
  const data = distribution.items.filter((item) => item.count > 0)

  return (
    <AnalyticsChartCard
      title="Difficulty distribution"
      subtitle="Solved problems in this range. Percentages use known Easy, Medium, and Hard values."
      icon={PieIcon}
      isEmpty={distribution.total === 0}
    >
        <div className="relative h-72 min-h-72 w-full" role="img" aria-label={`${distribution.total} solved problems: ${distribution.items.map((item) => `${item.name} ${item.count}`).join(', ')}.`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="54%"
                outerRadius="78%"
                paddingAngle={4}
                dataKey="count"
                isAnimationActive={!isReducedMotion()}
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={COLORS[entry.name]}
                    stroke="var(--bg-surface)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<DifficultyTooltip />} />
              <text x="50%" y="48%" textAnchor="middle" fill="var(--text-primary)" className="text-2xl font-bold">{distribution.total}</text>
              <text x="50%" y="57%" textAnchor="middle" fill="var(--text-muted)" className="text-[10px]">solved in range</text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Difficulty legend">
          {distribution.items.map((entry) => (
            <div
              key={entry.name}
              className="flex items-center justify-between rounded-subtle border border-border-subtle bg-base-elevated/40 px-3 py-2 text-xs"
            >
              <span className="flex items-center gap-2 text-content-secondary"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[entry.name] }} />{entry.name}</span>
              <strong className="tabular-nums text-content-primary">{entry.count} · {entry.percentage}%</strong>
            </div>
          ))}
        </div>
        {distribution.unknownCount > 0 && <p className="mt-3 text-[11px] text-content-muted">{distribution.unknownCount} solved problem{distribution.unknownCount === 1 ? '' : 's'} with an unknown difficulty remain in the range total but are excluded from the percentage split.</p>}
        <table className="sr-only"><caption>Difficulty distribution</caption><thead><tr><th>Difficulty</th><th>Count</th><th>Percentage</th></tr></thead><tbody>{distribution.items.map((item) => <tr key={item.name}><td>{item.name}</td><td>{item.count}</td><td>{item.percentage}%</td></tr>)}</tbody></table>
    </AnalyticsChartCard>
  )
}
