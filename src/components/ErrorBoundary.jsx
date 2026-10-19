import React from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'
import { Button } from './ui/Button'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base text-content-primary flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center bg-base-surface border border-rose-500/30 rounded-card p-8 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto mb-4">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sm text-content-secondary mb-6 leading-relaxed">
              An unexpected rendering error occurred. Your saved problem data remains secure in your browser.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="primary"
                leftIcon={<RotateCcw className="w-4 h-4" />}
                onClick={this.handleReload}
              >
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
