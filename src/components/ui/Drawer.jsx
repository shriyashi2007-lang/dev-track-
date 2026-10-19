import React, { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'max-w-md',
  className = '',
}) {
  const drawerRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const focusable = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length > 0) {
        focusable[0].focus()
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'drawer-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          className={clsx(
            'w-screen bg-base-surface border-l border-border-strong shadow-2xl flex flex-col animate-slide-up sm:animate-none',
            width,
            className
          )}
        >
          {/* Header */}
          <div className="p-5 border-b border-border-subtle flex items-start justify-between bg-base-elevated/40">
            <div>
              {title && (
                <h2 id="drawer-title" className="text-base font-semibold text-content-primary">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-content-secondary mt-1">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="text-content-muted hover:text-content-primary p-1.5 rounded-subtle hover:bg-base-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </div>
      </div>
    </div>
  )
}
