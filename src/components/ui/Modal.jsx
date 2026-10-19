import React, { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  className = '',
  showClose = true,
}) {
  const modalRef = useRef(null)

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
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        ref={modalRef}
        className={clsx(
          'relative w-full bg-base-surface border border-border-strong rounded-card shadow-2xl p-6 z-10 animate-scale-in my-8',
          maxWidth,
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-content-primary">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className="text-xs text-content-secondary mt-1">
                {description}
              </p>
            )}
          </div>
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="text-content-muted hover:text-content-primary p-1.5 rounded-subtle hover:bg-base-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
