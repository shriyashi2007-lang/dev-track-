import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Zap, Award, Target } from 'lucide-react'
import { Card } from '../ui/Card'
import { useCountUp } from '../../hooks/useCountUp'

function AnimatedStatCard({ title, value, sublabel, icon: Icon, color, onClick, bgGradient }) {
  const animatedValue = useCountUp(value, 600)

  return (
    <Card
      hover={Boolean(onClick)}
      onClick={onClick}
      className={`p-5 relative overflow-hidden transition-all duration-200 ${bgGradient || ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-content-secondary uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-content-primary mt-1">
            {animatedValue}
          </p>
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Solved */}
      <AnimatedStatCard
        title="Total Solved"
        value={stats.solved}
        sublabel={`${stats.todo} to do • ${stats.attempted} in progress`}
        icon={Target}
        color="bg-primary/15 text-primary border border-primary/25"
        onClick={() => navigate('/problems?status=Solved')}
      />

      {/* Easy */}
      <AnimatedStatCard
        title="Easy Solved"
        value={stats.easy}
        sublabel="Foundational patterns"
        icon={CheckCircle2}
        color="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
        onClick={() => navigate('/problems?diff=Easy&status=Solved')}
      />

      {/* Medium */}
      <AnimatedStatCard
        title="Medium Solved"
        value={stats.medium}
        sublabel="Core interview targets"
        icon={Zap}
        color="bg-amber-500/15 text-amber-400 border border-amber-500/25"
        onClick={() => navigate('/problems?diff=Medium&status=Solved')}
      />

      {/* Hard */}
      <AnimatedStatCard
        title="Hard Solved"
        value={stats.hard}
        sublabel="Advanced competitive logic"
        icon={Award}
        color="bg-rose-500/15 text-rose-400 border border-rose-500/25"
        onClick={() => navigate('/problems?diff=Hard&status=Solved')}
      />
    </div>
  )
}
