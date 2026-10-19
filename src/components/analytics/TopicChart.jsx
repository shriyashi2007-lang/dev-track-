import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { Card } from '../ui/Card'
import { Layers } from 'lucide-react'
import clsx from 'clsx'

export function TopicChart({ stats }) {
  const [chartType, setChartType] = useState('bar') // 'bar' | 'radar'
  const { topicCounts = [] } = stats

  const data = topicCounts.slice(0, 8)

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
            Topic Breakdown
          </h3>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-base-elevated rounded-card border border-border-subtle">
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={clsx(
              'px-2 py-0.5 text-xs font-medium rounded-subtle transition-colors cursor-pointer',
              chartType === 'bar'
                ? 'bg-base-surface text-content-primary font-semibold shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            )}
          >
            Bar
          </button>
          <button
            type="button"
            onClick={() => setChartType('radar')}
            className={clsx(
              'px-2 py-0.5 text-xs font-medium rounded-subtle transition-colors cursor-pointer',
              chartType === 'radar'
                ? 'bg-base-surface text-content-primary font-semibold shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            )}
          >
            Radar
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs text-content-muted">
          No topic data logged yet.
        </div>
      ) : chartType === 'bar' ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="var(--text-muted)"
                fontSize={10}
                width={85}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-strong)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              />
              <Bar dataKey="count" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="var(--border-subtle)" />
              <PolarAngleAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
              <PolarRadiusAxis stroke="var(--text-muted)" fontSize={9} />
              <Radar
                name="Solved"
                dataKey="count"
                stroke="var(--accent-primary)"
                fill="var(--accent-primary)"
                fillOpacity={0.4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-strong)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
