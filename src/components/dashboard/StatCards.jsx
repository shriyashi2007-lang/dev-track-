import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Zap, Award, Target } from 'lucide-react'
import { Card } from '../ui/Card'
import { AnimatedNumber } from '../motion-primitives/AnimatedNumber'
import { AnimatedGroup } from '../motion-primitives/AnimatedGroup'

function StatCard({ title, value, sublabel, icon: Icon, color, onClick, bgGradient }) {
  return (
    <Card
      hover={Boolean(onClick)}
      onClick={onClick}
      className={`p-5 relative overflow-hidden transition-all duration-200 ${bgGradient || ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-content-secondary uppercase tracking-wider">{title}</p>
          <div className="text-2xl sm:text-3xl font-bold text-content-primary mt-1">
            <AnimatedNumber value={value} />
          </div>
          {sublabel && (
            <p className="text-[11px] text-content-muted mt-1">{sublabel}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-card flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  )
}

export function StatCards({ stats }) {
  const navigate = useNavigate()

  return (
    <AnimatedGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Solved */}
      <StatCard
        title="Total Solved"
        value={stats.solved}
        sublabel={`${stats.todo} to do • ${stats.attempted} in progress`}
        icon={Target}
        color="bg-primary-light text-primary border border-primary/25"
        onClick={() => navigate('/problems?status=Solved')}
      />

      {/* Easy */}
      <StatCard
        title="Easy Solved"
        value={stats.easy}
        sublabel="Foundational patterns"
        icon={CheckCircle2}
        color="bg-difficulty-easy-bg text-difficulty-easy-text border border-difficulty-easy-border"
        onClick={() => navigate('/problems?diff=Easy&status=Solved')}
      />

      {/* Medium */}
      <StatCard
        title="Medium Solved"
        value={stats.medium}
        sublabel="Core interview targets"
        icon={Zap}
        color="bg-difficulty-medium-bg text-difficulty-medium-text border border-difficulty-medium-border"
        onClick={() => navigate('/problems?diff=Medium&status=Solved')}
      />

      {/* Hard */}
      <StatCard
        title="Hard Solved"
        value={stats.hard}
        sublabel="Advanced competitive logic"
        icon={Award}
        color="bg-difficulty-hard-bg text-difficulty-hard-text border border-difficulty-hard-border"
        onClick={() => navigate('/problems?diff=Hard&status=Solved')}
      />
    </AnimatedGroup>
  )
}
