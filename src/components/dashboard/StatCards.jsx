import { useNavigate } from 'react-router-dom'
import { Award, CheckCircle2, Flame, Target, Trophy, Zap } from 'lucide-react'
import { Card } from '../ui/Card'
import { AnimatedNumber } from '../motion-primitives/AnimatedNumber'
import { AnimatedGroup } from '../motion-primitives/AnimatedGroup'

function StatCard({ title, value, sublabel, icon: Icon, color, onClick }) {
  return (
    <Card hover={Boolean(onClick)} onClick={onClick} className="p-4 sm:p-5 min-h-32">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-content-secondary uppercase tracking-wider">{title}</p>
          <div className="mt-1 text-2xl sm:text-3xl font-display font-bold tabular-nums text-content-primary">
            <AnimatedNumber value={value} />
          </div>
          <p className="mt-1 text-[11px] leading-snug text-content-muted">{sublabel}</p>
        </div>
        <span className={`w-9 h-9 rounded-card flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
      </div>
    </Card>
  )
}

export function StatCards({ stats, streaks }) {
  const navigate = useNavigate()
  const cards = [
    ['Total solved', stats.solved, `${stats.todo} to do · ${stats.attempted} in progress`, Target, 'bg-primary-light text-primary border border-primary/25', () => navigate('/problems?status=Solved')],
    ['Easy', stats.easy, 'Foundational patterns', CheckCircle2, 'bg-difficulty-easy-bg text-difficulty-easy-text border border-difficulty-easy-border', () => navigate('/problems?diff=Easy&status=Solved')],
    ['Medium', stats.medium, 'Core interview targets', Zap, 'bg-difficulty-medium-bg text-difficulty-medium-text border border-difficulty-medium-border', () => navigate('/problems?diff=Medium&status=Solved')],
    ['Hard', stats.hard, stats.unknown ? `${stats.unknown} solved with unknown difficulty` : 'Advanced problem solving', Award, 'bg-difficulty-hard-bg text-difficulty-hard-text border border-difficulty-hard-border', () => navigate('/problems?diff=Hard&status=Solved')],
    ['Current streak', streaks.currentStreak, streaks.isStreakAtRisk ? 'Solve today to keep it alive' : 'Consecutive active days', Flame, 'bg-pastel-coral text-pastel-coral-text border border-pastel-coral-border'],
    ['Longest streak', streaks.longestStreak, 'Personal best in days', Trophy, 'bg-pastel-amber text-pastel-amber-text border border-pastel-amber-border'],
  ]

  return (
    <AnimatedGroup className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {cards.map(([title, value, sublabel, icon, color, onClick]) => (
        <StatCard key={title} title={title} value={value} sublabel={sublabel} icon={icon} color={color} onClick={onClick} />
      ))}
    </AnimatedGroup>
  )
}
