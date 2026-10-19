import React, { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card } from '../ui/Card'
import { BarChart3 } from 'lucide-react'
import { computeActivitySeries } from '../../utils/stats'
import { chartColors, rechartsTheme } from '../../styles/chartTheme'
import clsx from 'clsx'

export function ActivityChart({ problems = [] }) {
  const [rangeDays, setRangeDays] = useState(7) // 7 | 30 | 90

  const data = useMemo(() => {
    return computeActivitySeries(problems, rangeDays)
  }, [problems, rangeDays])

  const ranges = [
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 },
  ]

  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
            Solve Activity
          </h3>
        </div>

        {/* Range switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-base-elevated rounded-card border border-border-subtle self-start sm:self-auto">
          {ranges.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setRangeDays(r.days)}
              className={clsx(
                'px-2.5 py-1 text-xs font-medium rounded-subtle transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
                rangeDays === r.days
                  ? 'bg-base-surface text-content-primary font-semibold shadow-sm'
                  : 'text-content-secondary hover:text-content-primary'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid {...rechartsTheme.cartesianGrid} vertical={false} />
            <XAxis dataKey="displayDate" {...rechartsTheme.xAxis} />
            <YAxis allowDecimals={false} {...rechartsTheme.yAxis} />
            <Tooltip
              contentStyle={rechartsTheme.tooltip.contentStyle}
              itemStyle={rechartsTheme.tooltip.itemStyle}
              labelStyle={rechartsTheme.tooltip.labelStyle}
            />
            <Legend
              wrapperStyle={rechartsTheme.legend.wrapperStyle}
              iconType="circle"
            />
            <Bar dataKey="Easy" stackId="a" fill={chartColors.easy} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Medium" stackId="a" fill={chartColors.medium} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Hard" stackId="a" fill={chartColors.hard} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
