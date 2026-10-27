import { useState } from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { BarChart3, LineChart as LineIcon, Rows3 } from 'lucide-react'
import clsx from 'clsx'
import { AnalyticsChartCard } from './AnalyticsChartCard'
import { chartColors, rechartsTheme } from '../../styles/chartTheme'
import { isReducedMotion } from '../../styles/motion'

function ValueTooltip({ active, payload, mode = 'daily' }) {
  if (!active || !payload?.[0]?.payload) return null
  const point = payload[0].payload
  const value = mode === 'cumulative' ? point.cumulative : point.count
  return (
    <div style={rechartsTheme.tooltip.contentStyle}>
      <p style={rechartsTheme.tooltip.labelStyle}>{point.fullDate || point.label}</p>
      <p style={rechartsTheme.tooltip.itemStyle}>
        {mode === 'cumulative' ? 'Cumulative total' : 'Problems solved'}: {value}
      </p>
      {mode === 'cumulative' && <p style={rechartsTheme.tooltip.itemStyle}>Solved that day: {point.count}</p>}
    </div>
  )
}

function axisInterval(length) {
  return Math.max(Math.ceil(length / 6) - 1, 0)
}

function DataTable({ caption, data, valueKey, valueLabel }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead><tr><th scope="col">Date or period</th><th scope="col">{valueLabel}</th></tr></thead>
      <tbody>{data.map((point) => <tr key={point.date || point.key}><td>{point.fullDate || point.label}</td><td>{point[valueKey]}</td></tr>)}</tbody>
    </table>
  )
}

export function DailySolvedChart({ data = [], total = 0 }) {
  const summary = `${total} solved problem${total === 1 ? '' : 's'} across ${data.length} local calendar days.`
  return (
    <AnalyticsChartCard
      title="Daily solved"
      subtitle="One bar per local calendar day, including days with zero activity."
      icon={BarChart3}
      isEmpty={total === 0}
    >
      <div className="h-72 min-h-72 w-full" role="img" aria-label={summary}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid {...rechartsTheme.cartesianGrid} vertical={false} />
            <XAxis dataKey="label" {...rechartsTheme.xAxis} interval={axisInterval(data.length)} />
            <YAxis allowDecimals={false} {...rechartsTheme.yAxis} />
            <Tooltip content={<ValueTooltip />} cursor={{ fill: 'var(--bg-elevated)', opacity: 0.5 }} />
            <Bar dataKey="count" name="Solved" fill={chartColors.primary} radius={[5, 5, 0, 0]} isAnimationActive={!isReducedMotion()} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataTable caption="Daily solved problem counts" data={data} valueKey="count" valueLabel="Problems solved" />
    </AnalyticsChartCard>
  )
}

export function CumulativeSolvedChart({ data = [], baseline = 0, solvedInRange = 0 }) {
  const finalTotal = data.at(-1)?.cumulative || baseline
  return (
    <AnalyticsChartCard
      title="Cumulative solved"
      subtitle={`Starts from ${baseline} valid solve${baseline === 1 ? '' : 's'} recorded before this range, then adds this period.`}
      icon={LineIcon}
      isEmpty={solvedInRange === 0 && baseline === 0}
    >
      <div className="h-72 min-h-72 w-full" role="img" aria-label={`Cumulative solved count ends at ${finalTotal}, including a baseline of ${baseline}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 24, left: -22, bottom: 0 }}>
            <CartesianGrid {...rechartsTheme.cartesianGrid} vertical={false} />
            <XAxis dataKey="label" {...rechartsTheme.xAxis} interval={axisInterval(data.length)} />
            <YAxis allowDecimals={false} {...rechartsTheme.yAxis} domain={[0, 'auto']} />
            <Tooltip content={<ValueTooltip mode="cumulative" />} />
            <Line type="monotone" dataKey="cumulative" name="Cumulative solved" stroke={chartColors.secondary} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={!isReducedMotion()} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <DataTable caption="Cumulative solved problem counts" data={data} valueKey="cumulative" valueLabel="Cumulative solved" />
    </AnalyticsChartCard>
  )
}

export function ActivityAggregationChart({ weekly = [], monthly = [], total = 0 }) {
  const [mode, setMode] = useState('week')
  const data = mode === 'week' ? weekly : monthly
  const toggle = (
    <div className="flex rounded-subtle border border-border-subtle bg-base-elevated p-0.5" role="group" aria-label="Activity grouping">
      {['week', 'month'].map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={mode === option}
          onClick={() => setMode(option)}
          className={clsx(
            'min-h-8 rounded-subtle px-3 text-[11px] font-semibold capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            mode === option ? 'bg-base-surface text-content-primary shadow-sm' : 'text-content-muted hover:text-content-primary'
          )}
        >
          {option === 'week' ? 'Weekly' : 'Monthly'}
        </button>
      ))}
    </div>
  )
  return (
    <AnalyticsChartCard
      title="Activity by period"
      subtitle="Weeks begin Monday; calendar months and empty periods are retained."
      icon={Rows3}
      action={toggle}
      isEmpty={total === 0}
    >
      <div className="h-72 min-h-72 w-full" role="img" aria-label={`${total} solved problems grouped by ${mode}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="analyticsActivityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.coral} stopOpacity={0.4} />
                <stop offset="95%" stopColor={chartColors.coral} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid {...rechartsTheme.cartesianGrid} vertical={false} />
            <XAxis dataKey="label" {...rechartsTheme.xAxis} interval={axisInterval(data.length)} />
            <YAxis allowDecimals={false} {...rechartsTheme.yAxis} />
            <Tooltip content={<ValueTooltip />} />
            <Area type="monotone" dataKey="count" name="Solved" stroke={chartColors.coral} strokeWidth={2} fill="url(#analyticsActivityFill)" isAnimationActive={!isReducedMotion()} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <DataTable caption={`Solved problems grouped by ${mode}`} data={data} valueKey="count" valueLabel="Problems solved" />
    </AnalyticsChartCard>
  )
}
