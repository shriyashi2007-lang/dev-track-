import React, { useEffect, useId, useRef } from 'react'
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
  const previouslyFocusedRef = useRef(null)
  const generatedId = useId()
  const titleId = `${generatedId}-title`
  const descriptionId = `${generatedId}-description`

  useEffect(() => {
    if (isOpen) return undefined
    const rememberFocus = (event) => {
      const target = event?.target || document.activeElement
      if (target?.focus && !drawerRef.current?.contains(target)) previouslyFocusedRef.current = target
    }
    rememberFocus()
    document.addEventListener('focusin', rememberFocus)
    return () => document.removeEventListener('focusin', rememberFocus)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !drawerRef.current) return

    const previouslyFocused = previouslyFocusedRef.current || document.activeElement
    const drawer = drawerRef.current
    const getFocusable = () =>
      [...drawer.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )]

    const focusable = getFocusable()
    ;(focusable[0] || drawer).focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.()
        return
      }
      if (event.key !== 'Tab') return

      const currentFocusable = getFocusable()
      if (currentFocusable.length === 0) {
        event.preventDefault()
        drawer.focus()
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
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
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
          tabIndex={-1}
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
                <h2 id={titleId} className="text-base font-semibold text-content-primary">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="text-xs text-content-secondary mt-1">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="text-content-muted hover:text-content-primary p-1.5 rounded-subtle hover:bg-base-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
