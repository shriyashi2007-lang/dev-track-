import { useState, useMemo } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import {
  LayoutDashboard,
  Home,
  Code2,
  BarChart3,
  RotateCcw,
  Settings,
  Plus,
  Search,
  Sun,
  Moon,
  HelpCircle,
  Command,
  Database,
  Trash2,
  Menu,
  AlertTriangle,
} from 'lucide-react'
import { useProblems } from '../context/ProblemsContext'
import { useSettings } from '../context/SettingsContext'
import { useCommandPalette } from '../context/CommandPaletteContext'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useBackendHealth } from '../hooks/useBackendHealth'
import { CommandPalette } from '../components/CommandPalette'
import { BackendStatus } from '../components/BackendStatus'
import { KeyboardShortcutsModal } from '../components/KeyboardShortcutsModal'
import { ProblemDrawer } from '../components/problems/ProblemDrawer'
import { OnboardingTour } from '../components/OnboardingTour'
import { Confetti } from '../components/ui/Confetti'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Drawer } from '../components/ui/Drawer'
import { WaveDivider } from '../components/ui/WaveDivider'
import { WaveWipeTransition } from '../components/motion-primitives/WaveWipeTransition'
import { categorizeRevisions } from '../utils/spacedRepetition'

export function AppLayout() {
  const location = useLocation()
  const { problems, addProblem, hasSampleData, clearSampleData } = useProblems()
  const { settings, storageError: settingsStorageError, updateSettings, toggleTheme } = useSettings()
  const { open: openCommandPalette } = useCommandPalette()
  const { health: backendHealth, retry: retryBackend } = useBackendHealth()

  // Overlay states
  const [isProblemDrawerOpen, setIsProblemDrawerOpen] = useState(false)
  const [editingProblem, setEditingProblem] = useState(null)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(
    () => !settings.onboardingCompleted
  )
  const [triggerConfetti, setTriggerConfetti] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // Compute revision counts for sidebar badge
  const revisionStats = useMemo(() => {
    return categorizeRevisions(problems)
  }, [problems])

  const overdueCount = revisionStats.counts.overdue + revisionStats.counts.dueToday

  // Open problem drawer for new problem
  const handleOpenNewProblem = () => {
    setEditingProblem(null)
    setIsProblemDrawerOpen(true)
  }

  // Global keyboard shortcuts hook
  useKeyboardShortcuts({
    onNewProblem: handleOpenNewProblem,
    onOpenHelp: () => setIsHelpOpen(true),
    onFocusSearch: () => openCommandPalette(),
  })

  const navItems = [
    {
      to: '/',
      label: 'Landing ✦',
      icon: Home,
    },
    {
      to: '/dashboard',
      label: 'Dashboard 📊',
      icon: LayoutDashboard,
      shortcut: 'G D',
    },
    {
      to: '/problems',
      label: 'Problems ⚡',
      icon: Code2,
      shortcut: 'G P',
    },
    {
      to: '/analytics',
      label: 'Analytics 📈',
      icon: BarChart3,
      shortcut: 'G A',
    },
    {
      to: '/revision',
      label: 'Revision 🔁',
      icon: RotateCcw,
      badge: overdueCount > 0 ? overdueCount : null,
      shortcut: 'G R',
    },
    {
      to: '/settings',
      label: 'Settings ⚙️',
      icon: Settings,
      shortcut: 'G S',
    },
  ]

  const workspaceNavItems = navItems.filter((item) => item.to !== '/')

  // Get current section title
  const currentNav = navItems.find((item) => (
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  ))
  const pageTitle = currentNav ? currentNav.label : 'DevTrack 🌊'

  return (
    <div className="app-spectrum-shell min-h-screen bg-base text-content-primary flex flex-col md:flex-row">
      {/* Skip to Content for Accessibility */}
      <a
        href="#app-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-card focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Skip to main content
      </a>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border-subtle bg-base-surface/90 backdrop-blur-md shrink-0 h-screen sticky top-0">
        {/* Brand Header with Em-dash */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between">
          <NavLink
            to="/"
            aria-label="Go to DevTrack landing page"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-card bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-glow group-hover:scale-105 group-hover:shadow-glow-rose transition-all">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight block text-content-primary">
                DevTrack <span aria-hidden="true">🌊</span>
              </span>
              <span className="text-[10px] text-content-muted font-sans">
                DSA Tracker &bull; Spaced Repetition
              </span>
            </div>
          </NavLink>
        </div>

        {/* Quick Add Problem CTA */}
        <div className="p-3">
          <button
            type="button"
            onClick={handleOpenNewProblem}
            className="w-full flex items-center justify-between px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 rounded-button transition-all font-display font-medium text-xs shadow-sm hover:shadow-ambient cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span>Log Problem</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-base-surface text-primary rounded-subtle border border-primary/30 font-mono">
              N
            </kbd>
          </button>
        </div>

        {/* Navigation Items */}
        <nav aria-label="Primary navigation" className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-button text-xs font-display font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent select-none',
                    isActive
                      ? 'bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-glow-rose border-l-4 border-l-accent'
                      : 'text-content-secondary hover:text-content-primary hover:bg-base-elevated hover:translate-x-1'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon className={clsx('w-4 h-4', isActive ? 'text-white' : 'text-content-muted')} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={clsx(
                            'px-1.5 py-0.5 text-[10px] font-bold rounded-full tabular-nums',
                            isActive ? 'bg-white/25 text-white' : 'bg-difficulty-hard-bg text-difficulty-hard border border-difficulty-hard-border'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      <span
                        className={clsx(
                          'text-[10px] opacity-0 group-hover:opacity-100',
                          isActive ? 'text-white/60' : 'text-content-muted'
                        )}
                      >
                        {item.shortcut}
                      </span>
                    </div>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Sample Data Active Banner */}
        {hasSampleData && (
          <div className="p-3 mx-3 mb-3 bg-difficulty-medium-bg border border-difficulty-medium-border rounded-card flex items-center justify-between text-xs text-difficulty-medium-text">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-difficulty-medium shrink-0" />
              <span className="font-semibold text-[11px]">Sample Data</span>
            </div>
            <button
              type="button"
              onClick={clearSampleData}
              title="Clear sample problems"
              aria-label="Clear sample problems"
              className="p-1 hover:bg-black/10 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="px-3 pb-3">
          <BackendStatus health={backendHealth} onRetry={retryBackend} />
        </div>

        {/* User Card & Palette Trigger */}
        <div className="p-3 border-t border-border-subtle bg-base-elevated/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={settings.displayName || 'Dev'} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-content-primary truncate">
                {settings.displayName || 'Developer'}
              </p>
              <p className="text-[10px] text-content-muted">Local Profile</p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Open Command Palette"
            className="p-1.5 text-content-muted hover:text-content-primary rounded-subtle hover:bg-base-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Command className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Topbar with subtle wave gradient line */}
        <header className="sticky top-0 z-30 h-14 border-b border-border-subtle bg-base-surface/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 md:hidden text-content-secondary hover:text-content-primary rounded hover:bg-base-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Open navigation menu"
              aria-expanded={mobileDrawerOpen}
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-sm font-semibold text-content-primary truncate">
              {pageTitle}
            </h1>

            {/* Demo mode pill badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-status-solved-bg text-status-solved-text border border-status-solved-border">
              <span className="w-1.5 h-1.5 rounded-full bg-status-solved animate-pulse" />
              Demo: Local-first
            </span>
          </div>

          {/* Quick Actions in Topbar */}
          <div className="flex items-center gap-2">
            {/* Search / Palette button */}
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Search problems and commands"
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-content-secondary bg-base-elevated/70 hover:bg-base-elevated border border-border-subtle rounded-card transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] bg-base-surface border border-border-strong rounded">
                ⌘K
              </kbd>
            </button>

            {/* Log Problem CTA in Topbar */}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenNewProblem}
              className="hidden sm:inline-flex"
            >
              Log Problem
            </Button>

            {/* Help / Shortcuts modal */}
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              title="Keyboard Shortcuts (?)"
              aria-label="Keyboard Shortcuts"
              className="p-2 text-content-secondary hover:text-content-primary hover:bg-base-elevated rounded-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title="Toggle theme (T)"
              aria-label={settings.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={settings.theme === 'dark'}
              className="p-2 text-content-secondary hover:text-content-primary hover:bg-base-elevated rounded-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
          {/* Subtle faint wave accent in top bar */}
          <WaveDivider height="h-2" opacity="opacity-20" className="absolute bottom-0 left-0 right-0 pointer-events-none" />
        </header>

        {/* Routed Page Content with Wave Wipe */}
        <main id="app-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {settingsStorageError && (
            <div className="mb-4 flex flex-col gap-2 rounded-card border border-difficulty-medium-border bg-difficulty-medium-bg/30 p-3 text-xs text-content-secondary sm:flex-row sm:items-center sm:justify-between" role="status">
              <span className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-difficulty-medium-text" aria-hidden="true" />
                DevTrack could not read your saved settings. Safe defaults are active for this session, and the original browser value was not erased.
              </span>
              <NavLink to="/settings" className="shrink-0 font-semibold text-difficulty-medium-text underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-accent">Review data settings</NavLink>
            </div>
          )}
          <WaveWipeTransition>
            <Outlet />
          </WaveWipeTransition>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-base-surface/95 backdrop-blur-md border-t border-border-subtle h-14 flex items-center justify-around px-2"
      >
        {workspaceNavItems.slice(0, 4).map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center w-14 py-1 text-[10px] font-medium transition-colors relative',
                  isActive ? 'text-primary font-bold' : 'text-content-secondary'
                )
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-difficulty-hard" />
              )}
            </NavLink>
          )
        })}

        {/* Plus quick action on mobile */}
        <button
          type="button"
          onClick={handleOpenNewProblem}
          className="flex flex-col items-center justify-center w-12 h-10 rounded-full bg-primary text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Add problem"
        >
          <Plus className="w-5 h-5" />
        </button>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center w-14 py-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary font-bold' : 'text-content-secondary'
            )
          }
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Global Overlays & Modals */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="DevTrack navigation"
        description="Choose a workspace section."
        width="max-w-xs"
      >
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileDrawerOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center justify-between rounded-button px-3 py-3 text-sm font-display font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-content-secondary hover:bg-base-elevated hover:text-content-primary'
                  )
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                {item.badge && (
                  <span className="rounded-full bg-difficulty-hard px-2 py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>
        <div className="mt-5 border-t border-border-subtle pt-4">
          <BackendStatus health={backendHealth} onRetry={retryBackend} />
        </div>
      </Drawer>
      <CommandPalette onNewProblem={handleOpenNewProblem} />
      <KeyboardShortcutsModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      
      <ProblemDrawer
        isOpen={isProblemDrawerOpen}
        onClose={() => {
          setIsProblemDrawerOpen(false)
          setEditingProblem(null)
        }}
        initialProblem={editingProblem}
        onSave={async (problemData) => {
          const created = await addProblem(problemData)
          if (created.status === 'Solved') {
            setTriggerConfetti(true)
          }
        }}
      />

      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onFinish={() => updateSettings({ onboardingCompleted: true })}
      />

      <Confetti trigger={triggerConfetti} onComplete={() => setTriggerConfetti(false)} />
    </div>
  )
}
