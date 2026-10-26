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
  role = 'dialog',
}) {
  const modalRef = useRef(null)

  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const previouslyFocused = document.activeElement
    const modal = modalRef.current
    const getFocusable = () =>
      [...modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )]

    const focusable = getFocusable()
    ;(focusable[0] || modal).focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.()
        return
      }
      if (event.key !== 'Tab') return

      const currentFocusable = getFocusable()
      if (currentFocusable.length === 0) {
        event.preventDefault()
        modal.focus()
        return
      }

      const first = currentFocusable[0]
      const last = currentFocusable.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role={role}
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
        tabIndex={-1}
        className={clsx(
          'relative w-full glass-liquid border border-border-strong rounded-modal shadow-ambient hover:shadow-sticker p-6 z-10 animate-scale-in my-8 transition-shadow duration-200',
          maxWidth,
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h2 id="modal-title" className="text-xl font-display font-bold text-content-primary tracking-tight">
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
