import { AlertTriangle, BarChart3 } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

export function AnalyticsChartCard({
  title,
  subtitle,
  icon: Icon = BarChart3,
  action,
  isEmpty = false,
  emptyTitle = 'No activity in this period',
  emptyText = 'Choose a longer range or record a solved problem to populate this view.',
  error,
  onRetry,
  children,
  className = '',
}) {
  return (
    <Card className={`p-4 sm:p-5 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-content-primary">{title}</h3>
          </div>
          {subtitle && <p className="mt-1 text-xs leading-relaxed text-content-muted">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {error ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center" role="alert">
          <AlertTriangle className="mb-3 h-7 w-7 text-difficulty-hard-text" aria-hidden="true" />
          <p className="text-sm font-semibold text-content-primary">This chart could not be calculated</p>
          <p className="mt-1 max-w-sm text-xs text-content-muted">{error}</p>
          {onRetry && <Button className="mt-4" size="sm" variant="outline" onClick={onRetry}>Retry</Button>}
        </div>
      ) : isEmpty ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
          <p className="text-sm font-semibold text-content-primary">{emptyTitle}</p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-content-muted">{emptyText}</p>
        </div>
      ) : (
        <div className="mt-5">{children}</div>
      )}
    </Card>
  )
}
