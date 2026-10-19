import React from 'react'
import clsx from 'clsx'
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react'

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
  info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
}

export function Toast({ toast, onDismiss }) {
  const { id, type = 'info', title, message, onUndo, actionLabel = 'Undo' } = toast

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'flex items-center gap-3 p-4 bg-base-surface/95 border rounded-card shadow-2xl backdrop-blur-md transition-all duration-200 animate-slide-up max-w-md w-full',
        type === 'error' ? 'border-rose-500/40' : 'border-border-strong'
      )}
    >
      <div className="shrink-0">{icons[type] || icons.info}</div>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-content-primary">{title}</p>}
        {message && <p className="text-xs text-content-secondary truncate">{message}</p>}
      </div>

      {onUndo && (
        <button
          type="button"
          onClick={() => {
            onUndo()
            onDismiss(id)
          }}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded border border-primary/30 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="text-content-muted hover:text-content-primary p-1 rounded hover:bg-base-elevated transition-colors"
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
