import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '../ui/Card'
import { Activity } from 'lucide-react'
import { computeActivitySeries } from '../../utils/stats'
import { rechartsTheme } from '../../styles/chartTheme'

export function ConsistencyChart({ problems = [], rangeDays = 30 }) {
  const data = useMemo(() => {
    return computeActivitySeries(problems, rangeDays)
  }, [problems, rangeDays])

  const totalSolves = data.reduce((acc, curr) => acc + curr.total, 0)
  const activeDays = data.filter((d) => d.total > 0).length
  const consistencyRate = rangeDays > 0 ? Math.round((activeDays / rangeDays) * 100) : 0
  const avgPerActive = activeDays > 0 ? (totalSolves / activeDays).toFixed(1) : 0

  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-status-solved-text" />
          <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
            Consistency Trend ({rangeDays}d Window)
          </h3>
        </div>

        {/* Consistency metric badges */}
        <div className="flex items-center gap-3 text-xs tabular-nums">
          <span className="text-content-secondary">
            Active: <strong className="text-content-primary">{activeDays}/{rangeDays}d</strong>
          </span>
          <span className="text-content-secondary">
            Consistency: <strong className="text-status-solved-text">{consistencyRate}%</strong>
          </span>
          <span className="text-content-secondary">
            Avg/Active Day: <strong className="text-accent">{avgPerActive}</strong>
          </span>
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...rechartsTheme.cartesianGrid} vertical={false} />
            <XAxis dataKey="displayDate" {...rechartsTheme.xAxis} fontSize={10} />
            <YAxis allowDecimals={false} {...rechartsTheme.yAxis} fontSize={10} />
            <Tooltip
              contentStyle={rechartsTheme.tooltip.contentStyle}
              itemStyle={rechartsTheme.tooltip.itemStyle}
              labelStyle={rechartsTheme.tooltip.labelStyle}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--accent-primary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
