import React, { createContext, useContext, useState, useCallback } from 'react'
import { ToastContainer } from '../components/ui/Toast'
import { generateId } from '../utils/ids'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({
      type = 'info',
      title,
      message,
      onUndo,
      actionLabel = 'Undo',
      duration = 4000,
    }) => {
      const id = generateId()
      const newToast = { id, type, title, message, onUndo, actionLabel }

      setToasts((prev) => [...prev, newToast])

      if (duration && duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }

      return id
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
