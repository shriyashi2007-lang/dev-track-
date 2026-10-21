import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { Flame, CheckCircle2, RotateCcw, TrendingUp } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { isReducedMotion, motionValues } from '../../styles/motion'

export function HeroPreviewCard() {
  const cardRef = useRef(null)
  const reduced = isReducedMotion()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring physics for smooth tilt
  const springConfig = motionValues.previewTilt
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig)
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig)

  const handleMouseMove = (e) => {
    if (reduced || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const xPct = (e.clientX - rect.left) / rect.width - 0.5
    const yPct = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(xPct)
    mouseY.set(yPct)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-4xl mx-auto perspective-1000 py-4 select-none"
    >
      <motion.div
        style={reduced ? {} : { rotateX: tiltX, rotateY: tiltY }}
        className="glass-liquid relative rounded-large border-t-4 border-t-transparent [border-image:var(--gradient-hard-wave)_1] p-4 sm:p-6 shadow-ambient transition-shadow duration-200 hover:shadow-card-hover"
      >
        {/* Fake window toolbar */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-difficulty-hard-text/80" />
            <div className="w-3 h-3 rounded-full bg-difficulty-medium-text/80" />
            <div className="w-3 h-3 rounded-full bg-difficulty-easy-text/80" />
            <span className="text-xs text-content-muted ml-2 font-medium">
              devtrack.app/dashboard — sample preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="sticker-badge bg-pastel-mint border border-pastel-mint-border text-pastel-mint-text text-[11px] font-bold">
              Sample data
            </span>
          </div>
        </div>

        {/* Dashboard Grid Simulation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Stat 1: Total Solved */}
          <div className="md:col-span-4 p-4 rounded-xl bg-base-elevated/70 border border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-content-muted">
              <span>Total Solved</span>
              <CheckCircle2 className="w-4 h-4 text-status-solved" />
            </div>
            <div className="mt-2">
              <span className="text-3xl sm:text-4xl font-bold tabular-nums text-content-primary">
                142
              </span>
              <span className="text-xs text-status-solved ml-2 font-semibold">
                +4 today
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-content-muted">
              <span className="w-2 h-2 rounded-full bg-difficulty-easy" /> 48 Easy
              <span className="w-2 h-2 rounded-full bg-difficulty-medium ml-1" /> 74 Med
              <span className="w-2 h-2 rounded-full bg-difficulty-hard ml-1" /> 20 Hard
            </div>
          </div>

          {/* Stat 2: Active Streak */}
          <div className="md:col-span-4 p-4 rounded-xl bg-base-elevated/70 border border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-content-muted">
              <span>Consistency Streak</span>
              <Flame className="w-4 h-4 text-accent-coral" />
            </div>
            <div className="mt-2">
              <span className="text-3xl sm:text-4xl font-bold tabular-nums text-content-primary">
                19
              </span>
              <span className="text-xs text-accent-coral ml-2 font-semibold">
                🔥 Personal Best!
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1">
              {[1, 1, 1, 1, 1, 1, 1].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-2 rounded-sm bg-rainbow-1/80"
                  title="Daily goal hit"
                />
              ))}
            </div>
          </div>

          {/* Stat 3: Revisions Due */}
          <div className="md:col-span-4 p-4 rounded-xl bg-base-elevated/70 border border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-content-muted">
              <span>Spaced Recall Queue</span>
              <RotateCcw className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-2">
              <span className="text-3xl sm:text-4xl font-bold tabular-nums text-content-primary">
                3
              </span>
              <span className="text-xs text-primary ml-2 font-semibold">
                due today
              </span>
            </div>
            <div className="mt-3 text-[11px] text-content-secondary truncate">
              Next: LRU Cache (Interval #3)
            </div>
          </div>

          {/* Mini Activity Sparkline & Recent Problems */}
          <div className="md:col-span-12 p-4 rounded-xl bg-base-elevated/40 border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-card bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-content-primary block">
                  Recent Milestone: Dynamic Programming Depth
                </span>
                <span className="text-[11px] text-content-muted">
                  Coin Change • 0/1 Knapsack • Longest Common Subsequence
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="Medium" size="xs">
                Medium
              </Badge>
              <span className="text-xs text-content-muted tabular-nums">
                Just now
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Decorative Badges with subtle offset */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute -top-4 -left-6 sticker-badge bg-primary text-content-inverse text-xs shadow-xl -rotate-6 pointer-events-none"
      >
        ⚡ 3-Sec Quick Capture
      </div>
      <div
        aria-hidden="true"
        className="hidden lg:block absolute -bottom-3 -right-6 sticker-badge bg-accent-coral text-content-inverse text-xs shadow-xl rotate-3 pointer-events-none"
      >
        🔒 100% Local Storage
      </div>
    </div>
  )
}
