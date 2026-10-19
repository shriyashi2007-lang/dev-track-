import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  Search,
  LayoutDashboard,
  Code2,
  BarChart3,
  RotateCcw,
  Settings,
  Plus,
  SunMoon,
  Download,
  Database,
  Trash2,
} from 'lucide-react'
import { useCommandPalette } from '../context/CommandPaletteContext'
import { useProblems } from '../context/ProblemsContext'
import { useSettings } from '../context/SettingsContext'
import { exportAllData } from '../services/exportService'

export function CommandPalette({ onNewProblem }) {
  const { isOpen, close } = useCommandPalette()
  const { problems, loadSampleData, clearSampleData, hasSampleData } = useProblems()
  const { settings, toggleTheme } = useSettings()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Define static actions and page navigation items
  const pages = useMemo(
    () => [
      { id: 'page-dash', title: 'Dashboard', icon: LayoutDashboard, category: 'Pages', action: () => navigate('/dashboard') },
      { id: 'page-prob', title: 'Problems List & Board', icon: Code2, category: 'Pages', action: () => navigate('/problems') },
      { id: 'page-anal', title: 'Analytics & Insights', icon: BarChart3, category: 'Pages', action: () => navigate('/analytics') },
      { id: 'page-revi', title: 'Revision Tracker', icon: RotateCcw, category: 'Pages', action: () => navigate('/revision') },
      { id: 'page-sett', title: 'Settings & Data', icon: Settings, category: 'Pages', action: () => navigate('/settings') },
    ],
    [navigate]
  )

  const quickActions = useMemo(
    () => [
      {
        id: 'act-new',
        title: 'Add New Problem',
        icon: Plus,
        category: 'Actions',
        shortcut: 'N',
        action: () => onNewProblem?.(),
      },
      {
        id: 'act-theme',
        title: `Toggle Theme (current: ${settings.theme})`,
        icon: SunMoon,
        category: 'Actions',
        shortcut: 'T',
        action: () => toggleTheme(),
      },
      {
        id: 'act-export',
        title: 'Export Backup JSON',
        icon: Download,
        category: 'Actions',
        action: () => exportAllData(problems, settings),
      },
      {
        id: 'act-sample-load',
        title: 'Load Sample Data',
        icon: Database,
        category: 'Actions',
        action: () => loadSampleData(),
      },
      ...(hasSampleData
        ? [
            {
              id: 'act-sample-clear',
              title: 'Clear Sample Data',
              icon: Trash2,
              category: 'Actions',
              action: () => clearSampleData(),
            },
          ]
        : []),
    ],
    [onNewProblem, settings, toggleTheme, problems, loadSampleData, clearSampleData, hasSampleData]
  )

  // Filter items matching query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()

    const matchText = (text) => (text || '').toLowerCase().includes(q)

    const filteredPages = pages.filter((p) => matchText(p.title))
    const filteredActions = quickActions.filter((a) => matchText(a.title))

    let filteredProblems = []
    if (q.length > 0) {
      filteredProblems = problems
        .filter((p) => matchText(p.title) || (Array.isArray(p.topics) && p.topics.some(matchText)))
        .slice(0, 8)
        .map((p) => ({
          id: `prob-${p.id}`,
          title: p.title,
          sublabel: `${p.difficulty} • ${(p.topics || []).slice(0, 2).join(', ')} • ${p.status}`,
          icon: Code2,
          category: 'Problems',
          action: () => navigate(`/problems?q=${encodeURIComponent(p.title)}`),
        }))
    }

    return [...filteredPages, ...filteredActions, ...filteredProblems]
  }, [query, pages, quickActions, problems, navigate])

  // Keyboard navigation within list
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(filteredItems.length, 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(filteredItems.length, 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action()
          close()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredItems, close])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={close}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-base-surface border border-border-strong rounded-card shadow-2xl overflow-hidden z-10 animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-border-subtle bg-base-elevated/40">
          <Search className="w-5 h-5 text-content-muted shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Type a command, page name, or problem title..."
            className="w-full bg-transparent text-content-primary placeholder:text-content-muted text-sm focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-content-muted bg-base-surface border border-border-strong rounded shadow-sm">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-content-secondary">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon
              const isSelected = idx === selectedIndex

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.action()
                    close()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-subtle text-left text-sm transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-primary text-white font-medium'
                      : 'text-content-primary hover:bg-base-elevated'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={clsx('w-4 h-4 shrink-0', isSelected ? 'text-white' : 'text-content-muted')} />
                    <div className="min-w-0">
                      <p className="truncate text-xs sm:text-sm">{item.title}</p>
                      {item.sublabel && (
                        <p
                          className={clsx(
                            'text-[11px] truncate',
                            isSelected ? 'text-white/80' : 'text-content-muted'
                          )}
                        >
                          {item.sublabel}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.shortcut && (
                      <kbd
                        className={clsx(
                          'px-1.5 py-0.5 text-[10px] font-mono rounded',
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-base-elevated text-content-secondary border border-border-subtle'
                        )}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                    <span
                      className={clsx(
                        'text-[10px] uppercase font-mono px-1.5 py-0.5 rounded',
                        isSelected ? 'bg-white/20 text-white' : 'bg-base-elevated text-content-muted'
                      )}
                    >
                      {item.category}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-border-subtle bg-base-elevated/30 flex items-center justify-between text-[11px] text-content-muted">
          <span>
            Navigate with <kbd className="font-mono font-bold">↑</kbd> <kbd className="font-mono font-bold">↓</kbd>
          </span>
          <span>
            Select with <kbd className="font-mono font-bold">Enter</kbd>
          </span>
        </div>
      </div>
    </div>
  )
}
