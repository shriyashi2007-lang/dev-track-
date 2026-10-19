import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Code2, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { authService } from '../services/authService'
import { useSettings } from '../context/SettingsContext'

export default function Login() {
  const navigate = useNavigate()
  const { updateSettings } = useSettings()

  const [email, setEmail] = useState('student@college.edu')
  const [password, setPassword] = useState('Password123!')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!email.trim()) {
      errs.email = 'Email address is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address'
    }

    if (!password) {
      errs.password = 'Password is required'
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const user = await authService.login(email, password)
      updateSettings({ displayName: user.name })
      navigate('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6">
        {/* Persistent Demo Warning Banner */}
        <div className="p-3.5 bg-difficulty-medium-bg border border-difficulty-medium-border rounded-card flex items-start gap-2.5 text-xs text-difficulty-medium-text">
          <ShieldAlert className="w-4 h-4 shrink-0 text-difficulty-medium-text mt-0.5" />
          <div>
            <strong className="font-semibold block">Demo Preview Mode</strong>
            <span>Demo only: no account is created and no data leaves your browser. Feel free to use test values.</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-base-surface border border-border-strong rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-card bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-content-inverse shadow-sm mx-auto mb-2">
              <Code2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-content-primary">Welcome to DevTrack</h1>
            <p className="text-xs text-content-secondary">
              Sign in to preview local session features
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: null })
              }}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
              placeholder="you@example.com"
            />

            <div>
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: null })
                }}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer hover:text-content-primary p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In (Demo Mode)
            </Button>
          </form>

          {/* Disabled Social Logins with "Coming Soon" */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-border-subtle w-full" />
              <span className="bg-base-surface px-2 text-[10px] text-content-muted uppercase tabular-nums">
                Or continue with
              </span>
            </div>

            <button
              type="button"
              disabled
              className="w-full py-2 px-3 bg-base-elevated/40 border border-border-subtle rounded-card text-xs text-content-muted flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
            >
              <span>GitHub (Coming Soon)</span>
            </button>
          </div>

          <p className="text-center text-xs text-content-secondary pt-2">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-semibold">
              Create demo account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
