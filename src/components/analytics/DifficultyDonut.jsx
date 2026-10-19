import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card } from '../ui/Card'
import { PieChart as PieIcon } from 'lucide-react'
import { chartColors, rechartsTheme } from '../../styles/chartTheme'

const COLORS = {
  Easy: chartColors.easy,
  Medium: chartColors.medium,
  Hard: chartColors.hard,
}

export function DifficultyDonut({ stats, selectedDifficulty, onSelectDifficulty }) {
  const data = [
    { name: 'Easy', value: stats.easy || 0 },
    { name: 'Medium', value: stats.medium || 0 },
    { name: 'Hard', value: stats.hard || 0 },
  ].filter((d) => d.value > 0)

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
            Difficulty Distribution
          </h3>
        </div>
        {selectedDifficulty && (
          <button
            type="button"
            onClick={() => onSelectDifficulty(null)}
            className="text-[11px] text-difficulty-hard-text hover:underline focus-visible:outline-none"
          >
            Clear filter ({selectedDifficulty})
          </button>
        )}
      </div>

      <p className="text-[11px] text-content-muted mb-4">
        Click any slice to filter related problems in the list below.
      </p>

      {data.length === 0 ? (
        <div className="h-60 flex items-center justify-center text-xs text-content-muted">
          No solved problems to display.
        </div>
      ) : (
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                onClick={(entry) =>
                  onSelectDifficulty(
                    selectedDifficulty === entry.name ? null : entry.name
                  )
                }
                className="cursor-pointer"
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={COLORS[entry.name]}
                    stroke="var(--bg-surface)"
                    strokeWidth={selectedDifficulty === entry.name ? 3 : 1}
                    className="transition-all hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={rechartsTheme.tooltip.contentStyle}
                itemStyle={rechartsTheme.tooltip.itemStyle}
                labelStyle={rechartsTheme.tooltip.labelStyle}
              />
              <Legend
                wrapperStyle={rechartsTheme.legend.wrapperStyle}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
