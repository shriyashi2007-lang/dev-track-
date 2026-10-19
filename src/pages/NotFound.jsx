import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base text-content-primary flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-base-surface border border-border-subtle rounded-card p-8 shadow-card">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>
        <span className="text-4xl font-mono font-bold text-primary block mb-1">404</span>
        <h1 className="text-lg font-bold mb-2">Page Not Found</h1>
        <p className="text-xs sm:text-sm text-content-secondary mb-6 leading-relaxed">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/dashboard">
            <Button variant="primary" size="sm" leftIcon={<Home className="w-4 h-4" />}>
              Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Landing Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
