import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Code2, Sun, Moon, Menu, X, ArrowRight } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { Button } from '../components/ui/Button'
import { WaveWipeTransition } from '../components/motion-primitives/WaveWipeTransition'
import { WaveDivider } from '../components/ui/WaveDivider'

export function PublicLayout() {
  const { settings, toggleTheme } = useSettings()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-base text-content-primary">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-card focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Skip to main content
      </a>

      {/* Top Navbar with Liquid Glass */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? 'glass-liquid border-b border-border-subtle shadow-ambient'
            : 'bg-base/70 backdrop-blur-sm border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-card bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-glow group-hover:scale-105 group-hover:shadow-glow-rose transition-all">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base tracking-tight leading-none text-content-primary">
                DevTrack <span aria-hidden="true">🌊</span>
              </span>
              <span className="text-[10px] text-content-muted leading-tight font-sans">
                DSA Tracker &bull; Spaced Repetition
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-display font-medium text-content-secondary">
            <a href="/#features" className="hover:text-content-primary transition-colors flex items-center gap-1.5">
              <span>Features</span>
            </a>
            <a href="/#terminal-demo" className="hover:text-content-primary transition-colors flex items-center gap-1.5">
              <span>CLI Demo</span>
            </a>
            <a href="/#interactive-demo" className="hover:text-content-primary transition-colors flex items-center gap-1.5">
              <span>Sandbox</span>
            </a>
            <a href="/#how-it-works" className="hover:text-content-primary transition-colors flex items-center gap-1.5">
              <span>How It Works</span>
            </a>
            <Link to="/problems" className="hover:text-content-primary transition-colors flex items-center gap-1.5">
              <span>Problems</span>
            </Link>
            <Link to="/revision" className="hover:text-content-primary transition-colors flex items-center gap-1.5">
              <span>Revision</span>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-button text-content-secondary hover:text-content-primary hover:bg-base-elevated transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link to="/login">
              <Button variant="ghost" size="sm">
                Demo Login
              </Button>
            </Link>

            <Link to="/dashboard" className="group">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />}
              >
                <span>Dive In</span>
                <span aria-hidden="true" className="ml-1">🚀</span>
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-card text-content-secondary hover:text-content-primary hover:bg-base-elevated transition-colors"
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open navigation menu"
              className="p-2 rounded-card text-content-secondary hover:text-content-primary hover:bg-base-elevated"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border-subtle bg-base-surface p-4 space-y-3 animate-slide-up">
            <nav className="flex flex-col gap-2.5 text-sm font-medium text-content-secondary">
              <a href="/#features" className="px-3 py-2 rounded-subtle hover:bg-base-elevated hover:text-content-primary">
                🔁 Features
              </a>
              <a href="/#interactive-demo" className="px-3 py-2 rounded-subtle hover:bg-base-elevated hover:text-content-primary">
                🃏 Live Sandbox
              </a>
              <a href="/#how-it-works" className="px-3 py-2 rounded-subtle hover:bg-base-elevated hover:text-content-primary">
                🧠 How It Works
              </a>
              <Link to="/problems" className="px-3 py-2 rounded-subtle hover:bg-base-elevated hover:text-content-primary">
                📊 Problems
              </Link>
              <Link to="/revision" className="px-3 py-2 rounded-subtle hover:bg-base-elevated hover:text-content-primary">
                ⚡ Revision
              </Link>
            </nav>
            <div className="pt-3 border-t border-border-subtle flex flex-col gap-2">
              <Link to="/dashboard" className="w-full">
                <Button variant="primary" size="sm" className="w-full">
                  Launch Dashboard 🚀
                </Button>
              </Link>
              <Link to="/login" className="w-full">
                <Button variant="outline" size="sm" className="w-full">
                  Demo Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content with Layered Wave-Wipe Route Transition */}
      <main id="main-content" className="flex-1">
        <WaveWipeTransition>
          <Outlet />
        </WaveWipeTransition>
      </main>

      {/* Wave Decorative Divider above Footer */}
      <WaveDivider height="h-12 sm:h-16" opacity="opacity-35 dark:opacity-25" />

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-base-surface/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-subtle bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-content-primary">DevTrack 🌊</span>
            <span className="text-xs text-content-muted">
              — Ocean-depth consistency tracker for DSA &amp; coding preparation.
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-content-secondary">
            <span>🔒 Local-first • 🫧 Zero tracking • 100% Free</span>
            <Link to="/dashboard" className="hover:text-content-primary underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent">
              Open App 🚀
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
