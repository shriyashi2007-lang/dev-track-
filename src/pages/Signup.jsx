import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Code2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ShieldAlert,
  ArrowRight,
  Check,
  X,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { authService } from '../services/authService'
import { useSettings } from '../context/SettingsContext'
import clsx from 'clsx'

export default function Signup() {
  const navigate = useNavigate()
  const { updateSettings } = useSettings()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Password strength checklist rules
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }

  const passedChecksCount = Object.values(checks).filter(Boolean).length
  const strengthPercentage = (passedChecksCount / 4) * 100

  const isFormValid =
    name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(email) &&
    passedChecksCount >= 3 &&
    password === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)
    try {
      const user = await authService.signup(name, email, password)
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
            <span>Demo only: no account is created and no data leaves your browser. Never enter a real personal password.</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-base-surface border border-border-strong rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-card bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-content-inverse shadow-sm mx-auto mb-2">
              <Code2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-content-primary">Create Demo Workspace</h1>
            <p className="text-xs text-content-secondary">
              Set up your profile name and test credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name / Display Name"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              leftIcon={<User className="w-4 h-4" />}
              autoFocus
            />

            <Input
              type="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@university.edu"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div>
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                name="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer hover:text-content-primary p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Password strength progress bar */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5 animate-fade-in">
                  <div className="h-1.5 w-full bg-base-elevated rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full transition-all duration-300',
                        strengthPercentage <= 25 && 'bg-difficulty-hard-text',
                        strengthPercentage === 50 && 'bg-difficulty-medium-text',
                        strengthPercentage === 75 && 'bg-accent',
                        strengthPercentage === 100 && 'bg-difficulty-easy-text'
                      )}
                      style={{ width: `${strengthPercentage}%` }}
                    />
                  </div>

                  {/* Checklist */}
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-content-muted pt-1">
                    <span className={clsx('flex items-center gap-1', checks.length ? 'text-difficulty-easy-text' : '')}>
                      {checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      8+ characters
                    </span>
                    <span className={clsx('flex items-center gap-1', checks.uppercase ? 'text-difficulty-easy-text' : '')}>
                      {checks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Uppercase letter
                    </span>
                    <span className={clsx('flex items-center gap-1', checks.number ? 'text-difficulty-easy-text' : '')}>
                      {checks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Number
                    </span>
                    <span className={clsx('flex items-center gap-1', checks.symbol ? 'text-difficulty-easy-text' : '')}>
                      {checks.symbol ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Symbol (!@#)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Input
              type={showPassword ? 'text' : 'password'}
              label="Confirm Password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={
                confirmPassword && password !== confirmPassword
                  ? 'Passwords do not match'
                  : null
              }
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              disabled={!isFormValid}
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Demo Setup
            </Button>
          </form>

          <p className="text-center text-xs text-content-secondary pt-2">
            Already have a demo profile?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
