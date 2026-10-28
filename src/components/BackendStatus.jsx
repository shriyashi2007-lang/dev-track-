import { LoaderCircle, RefreshCw, Server, ServerOff } from 'lucide-react'

const STATUS_CONTENT = {
  checking: {
    label: 'Checking backend',
    description: 'Testing the optional API connection.',
    icon: LoaderCircle,
    iconClass: 'text-content-muted motion-safe:animate-spin',
    dotClass: 'bg-content-muted',
  },
  connected: {
    label: 'Backend connected',
    description: 'API health check passed.',
    icon: Server,
    iconClass: 'text-status-solved',
    dotClass: 'bg-status-solved',
  },
  disconnected: {
    label: 'Backend offline',
    description: 'Backend unreachable. Your data is stored locally and DevTrack works offline.',
    icon: ServerOff,
    iconClass: 'text-difficulty-medium-text',
    dotClass: 'bg-difficulty-medium',
  },
}

export function BackendStatus({ health, onRetry, compact = false }) {
  const content = STATUS_CONTENT[health.state] || STATUS_CONTENT.disconnected
  const Icon = content.icon

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-card border border-border-subtle bg-base-elevated/50 p-2.5 text-content-secondary"
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${content.dotClass}`} aria-hidden="true" />
        <Icon className={`h-3.5 w-3.5 shrink-0 ${content.iconClass}`} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-content-primary">
          {content.label}
        </span>
        {health.state === 'disconnected' && (
          <button
            type="button"
            onClick={onRetry}
            aria-label="Retry backend connection"
            className="rounded-subtle p-1 text-content-muted transition-colors hover:bg-base-surface hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
      {!compact && (
        <p className="mt-1.5 text-[10px] leading-relaxed text-content-muted">
          {content.description}
        </p>
      )}
    </div>
  )
}
