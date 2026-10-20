import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Target,
  Flame,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Award,
} from 'lucide-react'
import { AnimatedNumber } from '../motion-primitives/AnimatedNumber'
import { ProgressRing } from '../ui/ProgressRing'
import { bentoTile } from '../../styles/motion'

export function DashboardBentoOverview({ stats, streaks, dailyGoal = 3, onAddToday }) {
  const navigate = useNavigate()
  const { currentStreak, longestStreak, isStreakAtRisk, last7Days = [] } = streaks || {}
  const total = stats.solved || 0
  const easy = stats.easy || 0
  const medium = stats.medium || 0
  const hard = stats.hard || 0
  const todaySolved = stats.todaySolved || 0

  const easyPct = total > 0 ? Math.round((easy / total) * 100) : 0
  const medPct = total > 0 ? Math.round((medium / total) * 100) : 0
  const hardPct = total > 0 ? Math.round((hard / total) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
      {/* Tile 1: 2x2 Hero Bento Tile - Total Solved & Pattern Progress */}
      <motion.div
        variants={bentoTile}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="md:col-span-2 md:row-span-2 p-6 rounded-card border border-rainbow-2/30 bg-pastel-rose/60 dark:bg-pastel-rose/20 backdrop-blur-md shadow-card hover:shadow-card-hover flex flex-col justify-between relative overflow-hidden group stripe-primary border-l-4 border-l-primary"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-button bg-primary-light text-primary border border-primary/25">
              <Target className="w-5 h-5" />
            </div>
            <button
              type="button"
              onClick={() => navigate('/problems?status=Solved')}
              className="text-xs font-display font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
            >
              <span>View All Solved</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-content-secondary">
            Mastery Hub — Total Problems Solved
          </h3>

          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-4xl sm:text-5xl font-display font-extrabold text-content-primary tabular-nums tracking-tight">
              <AnimatedNumber value={total} />
            </span>
            <span className="text-xs text-content-secondary font-display font-medium">
              algorithms conquered
            </span>
          </div>
          <p className="text-xs text-content-muted mt-1 font-sans">
            {stats.todo || 0} queued to solve &bull; {stats.attempted || 0} in progress
          </p>
        </div>

        {/* Mini Interactive Visual: Stepped Hard-Stop Difficulty Distribution */}
        <div className="mt-6 pt-4 border-t border-border-subtle/50">
          <div className="flex items-center justify-between text-xs font-display font-medium text-content-secondary mb-2">
            <span>Difficulty Composition</span>
            <span className="text-[11px] font-mono text-content-muted">
              {easy}E &bull; {medium}M &bull; {hard}H
            </span>
          </div>

          {/* Hard-stop segment bar */}
          <div className="h-3 w-full rounded-full bg-base-elevated overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${easyPct}%` }}
              className="h-full bg-difficulty-easy transition-all duration-300 hover:opacity-90 cursor-pointer"
              title={`Easy: ${easy} (${easyPct}%)`}
              onClick={() => navigate('/problems?diff=Easy&status=Solved')}
            />
            <div
              style={{ width: `${medPct}%` }}
              className="h-full bg-difficulty-medium transition-all duration-300 hover:opacity-90 cursor-pointer"
              title={`Medium: ${medium} (${medPct}%)`}
              onClick={() => navigate('/problems?diff=Medium&status=Solved')}
            />
            <div
              style={{ width: `${hardPct}%` }}
              className="h-full bg-difficulty-hard transition-all duration-300 hover:opacity-90 cursor-pointer"
              title={`Hard: ${hard} (${hardPct}%)`}
              onClick={() => navigate('/problems?diff=Hard&status=Solved')}
            />
          </div>

          {/* Interactive Legend Tags */}
          <div className="flex items-center gap-4 mt-3 text-xs font-display">
            <button
              type="button"
              onClick={() => navigate('/problems?diff=Easy&status=Solved')}
              className="flex items-center gap-1.5 text-content-secondary hover:text-content-primary transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-difficulty-easy" />
              <span>Easy ({easyPct}%)</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/problems?diff=Medium&status=Solved')}
              className="flex items-center gap-1.5 text-content-secondary hover:text-content-primary transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-difficulty-medium" />
              <span>Med ({medPct}%)</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/problems?diff=Hard&status=Solved')}
              className="flex items-center gap-1.5 text-content-secondary hover:text-content-primary transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-difficulty-hard" />
              <span>Hard ({hardPct}%)</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tile 2: 2x1 Bento Tile - Rainbow Streak Ring & Momentum */}
      <motion.div
        variants={bentoTile}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="md:col-span-2 p-5 rounded-card border border-rainbow-4/30 bg-pastel-amber/60 dark:bg-pastel-amber/20 backdrop-blur-md shadow-card hover:shadow-card-hover flex items-center justify-between gap-4 relative overflow-hidden group stripe-coral border-l-4 border-l-accent-coral"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-button bg-accent-light text-accent">
              <Flame className="w-4 h-4 fill-accent" />
            </div>
            <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-content-secondary truncate">
              Streak Momentum — Daily Continuity
            </h3>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-display font-extrabold text-content-primary tabular-nums">
              <AnimatedNumber value={currentStreak || 0} />
            </span>
            <span className="text-xs text-content-secondary font-display font-medium">
              days consecutive
            </span>
          </div>

          <p className="text-[11px] text-content-muted mt-1 font-sans">
            Personal Record: <strong className="font-mono text-content-primary">{longestStreak || 0} days</strong>
          </p>

          {isStreakAtRisk && (
            <div className="mt-2 p-1.5 bg-difficulty-medium-bg border border-difficulty-medium-border rounded-button flex items-center gap-1.5 text-[10px] text-difficulty-medium-text animate-pulse">
              <AlertTriangle className="w-3 h-3 shrink-0 text-difficulty-medium" />
              <span>Solve 1 problem today to maintain streak!</span>
            </div>
          )}
        </div>

        {/* Mini Interactive Rainbow Streak Ring */}
        <div className="shrink-0 flex flex-col items-center justify-center p-2">
          <ProgressRing
            value={currentStreak || 0}
            max={Math.max(longestStreak || 7, 7)}
            size={90}
            strokeWidth={8}
            rainbow={true}
            sublabel="Streak"
          />
        </div>
      </motion.div>

      {/* Tile 3: 1x1 Bento Tile - Daily Target */}
      <motion.div
        variants={bentoTile}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="p-5 rounded-card border border-rainbow-5/30 bg-pastel-mint/60 dark:bg-pastel-mint/20 backdrop-blur-md shadow-card hover:shadow-card-hover flex flex-col justify-between relative group stripe-mint border-l-4 border-l-status-solved"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-button bg-status-solved-bg text-status-solved border border-status-solved-border">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono font-bold text-status-solved">
              {todaySolved}/{dailyGoal} Goal
            </span>
          </div>

          <h3 className="text-sm font-display font-bold text-content-primary mt-1">
            Daily Target — Today
          </h3>
          <p className="text-[11px] text-content-secondary mt-0.5 font-sans">
            {todaySolved >= dailyGoal ? 'Goal achieved today! 🎉' : `${dailyGoal - todaySolved} more to hit daily goal`}
          </p>
        </div>

        {/* Mini progress bar */}
        <div className="mt-3 pt-2 border-t border-border-subtle/40">
          <div className="h-2 w-full bg-base-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-status-solved transition-all duration-300"
              style={{ width: `${Math.min((todaySolved / dailyGoal) * 100, 100)}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Tile 4: 1x1 Bento Tile - Rapid Revision */}
      <motion.div
        variants={bentoTile}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onClick={() => navigate('/revision')}
        className="p-5 rounded-card border border-rainbow-6/30 bg-pastel-sky/60 dark:bg-pastel-sky/20 backdrop-blur-md shadow-card hover:shadow-card-hover flex flex-col justify-between relative group stripe-sky border-l-4 border-l-rainbow-6 cursor-pointer"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-button bg-rainbow-6/20 text-rainbow-6 border border-rainbow-6/30">
              <RotateCcw className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-rainbow-6 transition-transform group-hover:translate-x-1" />
          </div>

          <h3 className="text-sm font-display font-bold text-content-primary mt-1">
            Flashcard Deck — Spaced Recall
          </h3>
          <p className="text-[11px] text-content-secondary mt-0.5 font-sans">
            Review queued cards with SM-2 intervals.
          </p>
        </div>

        <div className="mt-3 pt-2 border-t border-border-subtle/40 flex items-center justify-between">
          <span className="text-[11px] font-display font-semibold text-rainbow-6">
            Launch Recall Deck
          </span>
          <span className="text-xs font-mono font-bold text-content-primary">
            SM-2 &bull; 30d
          </span>
        </div>
      </motion.div>
    </div>
  )
}
