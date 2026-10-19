import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useCommandPalette } from '../context/CommandPaletteContext'

export function useKeyboardShortcuts({
  onNewProblem,
  onOpenHelp,
  onFocusSearch,
}) {
  const navigate = useNavigate()
  const { toggleTheme } = useSettings()
  const { toggle: toggleCommandPalette, isOpen: isPaletteOpen } = useCommandPalette()
  const pendingPrefixRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(e) {
      // Check if user is typing in an editable field
      const activeElement = document.activeElement
      const isInput =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.isContentEditable)

      // Command Palette: Cmd/Ctrl + K (always active even in inputs)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggleCommandPalette()
        return
      }

      // If typing in input, suppress general shortcuts
      if (isInput) return

      // Escape key (handled by individual modals, but can close palette)
      if (e.key === 'Escape') {
        pendingPrefixRef.current = null
        return
      }

      // Question mark for help modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        onOpenHelp?.()
        return
      }

      // Forward slash for search
      if (e.key === '/') {
        e.preventDefault()
        onFocusSearch?.()
        return
      }

      // Toggle Theme: T
      if (e.key.toLowerCase() === 't') {
        e.preventDefault()
        toggleTheme()
        return
      }

      // New Problem: N
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault()
        onNewProblem?.()
        return
      }

      // Two-key chord navigation: G then D/P/A/R/S
      if (e.key.toLowerCase() === 'g') {
        pendingPrefixRef.current = 'g'
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          pendingPrefixRef.current = null
        }, 1200)
        return
      }

      if (pendingPrefixRef.current === 'g') {
        const key = e.key.toLowerCase()
        pendingPrefixRef.current = null
        if (timerRef.current) clearTimeout(timerRef.current)

        switch (key) {
          case 'd':
            e.preventDefault()
            navigate('/dashboard')
            break
          case 'p':
            e.preventDefault()
            navigate('/problems')
            break
          case 'a':
            e.preventDefault()
            navigate('/analytics')
            break
          case 'r':
            e.preventDefault()
            navigate('/revision')
            break
          case 's':
            e.preventDefault()
            navigate('/settings')
            break
          default:
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [navigate, toggleTheme, toggleCommandPalette, onNewProblem, onOpenHelp, onFocusSearch, isPaletteOpen])
}
