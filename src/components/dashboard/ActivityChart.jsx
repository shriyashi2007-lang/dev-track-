import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart3, Plus } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { getWeeklyProgress } from '../../utils/dashboardMetrics'
import { chartColors, rechartsTheme } from '../../styles/chartTheme'
import { isReducedMotion } from '../../styles/motion'

function WeeklyTooltip({ active, payload }) {
  if (!active || !payload?.[0]?.payload) return null
  const day = payload[0].payload
  return (
    <div style={rechartsTheme.tooltip.contentStyle}>
      <p style={rechartsTheme.tooltip.labelStyle}>{day.fullDate}</p>
      <p style={rechartsTheme.tooltip.itemStyle}>{day.count} problem{day.count === 1 ? '' : 's'} solved</p>
    </div>
  )
}

export function ActivityChart({ problems = [], onAddProblem }) {
  const data = useMemo(() => getWeeklyProgress(problems), [problems])
  const total = data.reduce((sum, day) => sum + day.count, 0)
  const summary = `${total} problem${total === 1 ? '' : 's'} solved in the last 7 days. ${data.map((day) => `${day.label}: ${day.count}`).join(', ')}.`

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" aria-hidden="true" />
          <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">Last 7 days</h3>
        </div>
        <span className="text-[11px] text-content-muted tabular-nums">{total} solved</span>
      </div>

      {total === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center px-5">
          <p className="text-sm font-semibold text-content-primary">No solved problems this week</p>
          <p className="mt-1 text-xs text-content-muted">Log a solved problem to start the chart.</p>
          {onAddProblem && <Button className="mt-4" size="sm" variant="secondary" onClick={onAddProblem} leftIcon={<Plus className="w-3.5 h-3.5" />}>Add problem</Button>}
        </div>
      ) : (
        <div className="h-64 w-full" role="img" aria-label={summary}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid {...rechartsTheme.cartesianGrid} vertical={false} />
              <XAxis dataKey="label" {...rechartsTheme.xAxis} />
              <YAxis allowDecimals={false} {...rechartsTheme.yAxis} />
              <Tooltip content={<WeeklyTooltip />} />
              <Bar dataKey="count" name="Solved" fill={chartColors.primary} radius={[5, 5, 0, 0]} isAnimationActive={!isReducedMotion()} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <table className="sr-only">
        <caption>Solved problems for each of the last seven days</caption>
        <thead><tr><th>Date</th><th>Problems solved</th></tr></thead>
        <tbody>{data.map((day) => <tr key={day.date}><td>{day.fullDate}</td><td>{day.count}</td></tr>)}</tbody>
      </table>
    </Card>
  )
}
