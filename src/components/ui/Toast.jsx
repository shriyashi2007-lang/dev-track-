import React from 'react'
import clsx from 'clsx'
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react'

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-status-solved shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-difficulty-hard shrink-0" />,
  info: <Info className="w-5 h-5 text-status-attempted shrink-0" />,
}

const typeStripeClasses = {
  success: 'border-l-4 border-l-status-solved stripe-success shadow-glow-mint',
  error: 'border-l-4 border-l-difficulty-hard stripe-hard shadow-glow-rose',
  info: 'border-l-4 border-l-rainbow-6 stripe-sky shadow-ambient',
}

const typeEmojis = {
  success: '✅',
  error: '⚠️',
  info: 'ℹ️',
}

export function Toast({ toast, onDismiss }) {
  const { id, type = 'info', title, message, onUndo, actionLabel = 'Undo' } = toast

  const rawTitle = title && (title.startsWith('✅') || title.startsWith('⚠️') || title.startsWith('ℹ️'))
    ? title.slice(2).trim()
    : title

  const emoji = typeEmojis[type] || 'ℹ️'

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'group flex items-center gap-3 p-4 glass-liquid rounded-card shadow-ambient hover:shadow-sticker transition-all duration-200 animate-slide-up max-w-md w-full border border-border-subtle relative overflow-hidden',
        typeStripeClasses[type] || typeStripeClasses.info
      )}
    >
      <div className="shrink-0">{icons[type] || icons.info}</div>
      <div className="flex-1 min-w-0">
        {rawTitle && (
          <p className="text-sm font-display font-semibold text-content-primary flex items-center gap-1.5">
            <span aria-hidden="true">{emoji}</span>
            <span>{rawTitle}</span>
          </p>
        )}
        {message && <p className="text-xs text-content-secondary truncate mt-0.5">{message}</p>}
      </div>

      {onUndo && (
        <button
          type="button"
          onClick={() => {
            onUndo()
            onDismiss(id)
          }}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-display font-semibold text-accent bg-accent-light hover:bg-accent/25 rounded-button border border-accent/30 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="text-content-muted hover:text-content-primary p-1.5 rounded-button hover:bg-base-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts.length) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-auto"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
