import React, { useState } from 'react'
import clsx from 'clsx'
import { motion } from 'motion/react'
import {
  RotateCcw,
  Flame,
  Zap,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Command,
  Lock,
} from 'lucide-react'
import { bentoTile } from '../../styles/motion'

export function LandingBentoGrid() {
  // Mini interactive state 1: Spaced interval demo
  const [intervalStep, setIntervalStep] = useState(2) // 7 days
  const intervals = ['1d', '3d', '7d', '14d', '30d']
  const retentions = ['65%', '82%', '91%', '96%', '99%']

  // Mini interactive state 2: Quick capture toggle
  const [quickCaptured, setQuickCaptured] = useState(false)

  // Mini interactive state 3: Private toggle
  const [encryptionOn, setEncryptionOn] = useState(true)

  // Mini interactive state 4: Active heatmap cell hover
  const [hoveredDay, setHoveredDay] = useState(null)

  const sampleHeatmap = [
    { day: 'Mon', count: 3, level: 'bg-emerald-500' },
    { day: 'Tue', count: 5, level: 'bg-emerald-400' },
    { day: 'Wed', count: 2, level: 'bg-emerald-600' },
    { day: 'Thu', count: 4, level: 'bg-emerald-500' },
    { day: 'Fri', count: 6, level: 'bg-emerald-400' },
    { day: 'Sat', count: 1, level: 'bg-emerald-700' },
    { day: 'Sun', count: 4, level: 'bg-emerald-500' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[minmax(190px,auto)]">
      {/* Tile 1: 2x2 Hero Bento Tile - Spaced Recall */}
      <motion.div
        variants={bentoTile}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="md:col-span-2 md:row-span-2 p-6 sm:p-8 rounded-card border border-rainbow-2/30 bg-pastel-rose/70 dark:bg-pastel-rose/25 backdrop-blur-md shadow-card hover:shadow-card-hover flex flex-col justify-between relative overflow-hidden group stripe-rose"
      >
        {/* Ambient colored glow */}
        <div
          aria-hidden="true"
          className="absolute -top-12 -right-12 w-48 h-48 bg-rainbow-2/20 blur-3xl rounded-full pointer-events-none group-hover:bg-rainbow-2/30 transition-colors"
        />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-button bg-rainbow-2/20 text-rainbow-2 border border-rainbow-2/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="text-xs font-display font-semibold uppercase tracking-wider text-rainbow-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              SM-2 Algorithm
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-display font-bold text-content-primary mb-2">
            Spaced Recall — Zero cramming
          </h3>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed max-w-md">
            Algorithms slip away in days without reinforcement. DevTrack calculates the optimal forgetting curve interval so you recall core tricks under interview pressure.
          </p>
        </div>

        {/* Mini Interactive Visual: Interval Progression Picker */}
        <div className="mt-6 pt-4 border-t border-border-subtle/50">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-display font-medium text-content-secondary">
              Simulate Recall Interval:
            </span>
            <span className="font-mono font-bold text-rainbow-2">
              Retention: {retentions[intervalStep]}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {intervals.map((intv, idx) => (
              <button
                key={intv}
                type="button"
                onClick={() => setIntervalStep(idx)}
                className={clsx(
                  'py-1.5 rounded-button text-xs font-mono font-semibold transition-all duration-150 border',
                  intervalStep === idx
                    ? 'bg-rainbow-2 text-white border-rainbow-2 shadow-sm scale-105'
                    : 'bg-base-surface/80 text-content-secondary border-border-subtle hover:border-rainbow-2/60'
                )}
              >
                {intv}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-content-muted mt-2 font-sans italic">
            Tap an interval to preview retention probability before scheduled review.
          </p>
        </div>
      </motion.div>

      {/* Tile 2: 2x1 Bento Tile - Streak Matrix */}
      <motion.div
        variants={bentoTile}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="md:col-span-2 p-6 rounded-card border border-rainbow-5/30 bg-pastel-mint/70 dark:bg-pastel-mint/25 backdrop-blur-md shadow-card hover:shadow-card-hover flex flex-col justify-between relative overflow-hidden group stripe-mint"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="p-2 rounded-button bg-rainbow-5/20 text-status-solved border border-rainbow-5/30 w-fit mb-3">
              <Flame className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-content-primary">
              Streak Matrix — Unbroken momentum
            </h3>
            <p className="text-xs text-content-secondary mt-1">
              GitHub-style activity grid powered strictly by your browser localStorage timestamps.
            </p>
          </div>
          <span className="text-xl sm:text-2xl font-mono font-bold text-status-solved">
            14d🔥
          </span>
        </div>

        {/* Mini Interactive Heatmap Strip */}
        <div className="mt-4 pt-3 border-t border-border-subtle/40">
          <div className="flex items-center justify-between gap-1.5">
            {sampleHeatmap.map((item, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredDay(item)}
                onMouseLeave={() => setHoveredDay(null)}
                className={clsx(
                  'flex-1 h-7 rounded flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all duration-150 cursor-pointer hover:scale-110',
                  item.level
                )}
                title={`${item.day}: ${item.count} solved`}
              >
                {item.count}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] text-content-muted mt-1.5 font-sans">
            <span>{hoveredDay ? `${hoveredDay.day}: ${hoveredDay.count} problems solved` : 'Hover day cell for volume'}</span>
            <span className="text-status-solved font-mono">+4 today</span>
          </div>
        </div>
      </motion.div>

      {/* Tile 3: 1x1 Bento Tile - Quick Capture */}
      <motion.div
        variants={bentoTile}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="p-5 rounded-card border border-rainbow-6/30 bg-pastel-sky/70 dark:bg-pastel-sky/25 backdrop-blur-md shadow-card hover:shadow-card-hover flex flex-col justify-between relative group stripe-sky"
      >
        <div>
          <div className="p-2 rounded-button bg-rainbow-6/20 text-rainbow-6 border border-rainbow-6/30 w-fit mb-3">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-base font-display font-bold text-content-primary">
            Quick Capture — ⌘K flow
          </h3>
          <p className="text-xs text-content-secondary mt-1">
            Log in seconds without lifting hands from keyboard.
          </p>
        </div>

        {/* Mini Interactive Visual: Hotkey button */}
        <div className="mt-3 pt-3 border-t border-border-subtle/40">
          <button
            type="button"
            onClick={() => {
              setQuickCaptured(true)
              setTimeout(() => setQuickCaptured(false), 1500)
            }}
            className="w-full py-2 px-3 rounded-button bg-base-surface/80 border border-border-subtle hover:border-rainbow-6 text-xs font-mono flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-1 text-content-secondary">
              <Command className="w-3 h-3 text-rainbow-6" /> K
            </span>
            <span className={clsx('text-[11px] font-bold font-display', quickCaptured ? 'text-status-solved' : 'text-content-muted')}>
              {quickCaptured ? 'Indexed ✔' : 'Try Shortcut'}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Tile 4: 1x1 Bento Tile - Local-first Privacy */}
      <motion.div
        variants={bentoTile}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="p-5 rounded-card border border-rainbow-4/30 bg-pastel-amber/70 dark:bg-pastel-amber/25 backdrop-blur-md shadow-card hover:shadow-card-hover flex flex-col justify-between relative group stripe-amber"
      >
        <div>
          <div className="p-2 rounded-button bg-rainbow-4/20 text-rainbow-4 border border-rainbow-4/30 w-fit mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-base font-display font-bold text-content-primary">
            Local First — Zero telemetry
          </h3>
          <p className="text-xs text-content-secondary mt-1">
            Zero accounts required. Full data export in JSON anytime.
          </p>
        </div>

        {/* Mini Interactive Visual: Privacy Toggle */}
        <div className="mt-3 pt-3 border-t border-border-subtle/40">
          <button
            type="button"
            onClick={() => setEncryptionOn(!encryptionOn)}
            className="w-full py-1.5 px-2.5 rounded-button bg-base-surface/80 border border-border-subtle text-[11px] flex items-center justify-between font-display font-medium transition-colors"
          >
            <span className="flex items-center gap-1.5 text-content-secondary">
              <Lock className="w-3 h-3 text-rainbow-4" /> Local Storage
            </span>
            <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-mono', encryptionOn ? 'bg-status-solved/20 text-status-solved' : 'bg-base-elevated text-content-muted')}>
              {encryptionOn ? 'Secured' : 'Offline'}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Tile 5: 2x1 Bento Tile - Topic Coverage Radar */}
      <motion.div
        variants={bentoTile}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="md:col-span-2 p-6 rounded-card border border-rainbow-7/30 bg-pastel-violet/70 dark:bg-pastel-violet/25 backdrop-blur-md shadow-card hover:shadow-card-hover flex flex-col justify-between relative overflow-hidden group stripe-violet"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="p-2 rounded-button bg-rainbow-7/20 text-rainbow-7 border border-rainbow-7/30 w-fit mb-3">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-content-primary">
              Pattern Radar — Spot blindspots
            </h3>
            <p className="text-xs text-content-secondary mt-1 max-w-sm">
              Track mastery across 14 canonical DSA topics to ensure zero weak links on interview day.
            </p>
          </div>
          <span className="text-xs font-display font-semibold text-rainbow-7 flex items-center gap-1">
            <span>Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Mini Interactive Visual: Topic Distribution Bars */}
        <div className="mt-4 pt-3 border-t border-border-subtle/40 space-y-2">
          <div>
            <div className="flex justify-between text-[11px] font-display font-medium text-content-secondary mb-1">
              <span>Arrays &amp; Two Pointers</span>
              <span className="font-mono text-rainbow-1">88%</span>
            </div>
            <div className="h-1.5 w-full bg-base-elevated rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rainbow-1 to-rainbow-2 rounded-full" style={{ width: '88%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-display font-medium text-content-secondary mb-1">
              <span>Dynamic Programming</span>
              <span className="font-mono text-rainbow-7">74%</span>
            </div>
            <div className="h-1.5 w-full bg-base-elevated rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rainbow-7 to-rainbow-8 rounded-full" style={{ width: '74%' }} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
