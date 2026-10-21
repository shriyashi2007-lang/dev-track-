import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'
import { InView } from '../motion-primitives/InView'
import { PenTool, RotateCcw, Trophy, MoveDown } from 'lucide-react'
import { isReducedMotion, springPresets, transitions } from '../../styles/motion'

const STEPS = [
  {
    num: '01',
    emoji: '📝',
    title: 'Solve & Capture — Record intuition in 10s',
    subtitle: 'Immediate retention trigger',
    icon: PenTool,
    stripe: 'stripe-coral',
    color: 'border-accent-coral/30 bg-accent-coral/10 text-accent-coral',
    description:
      'Solve on LeetCode or Codeforces, then press ⌘+K to log. Note the core intuition, tricky edge cases, and time/space complexity before you forget.',
  },
  {
    num: '02',
    emoji: '🧠',
    title: 'Spaced Recall — Automated SM-2 intervals',
    subtitle: '1 → 3 → 7 → 14 → 30 day scheduling',
    icon: RotateCcw,
    stripe: 'stripe-rose',
    color: 'border-primary/30 bg-primary/10 text-primary',
    description:
      'Our spaced repetition engine puts problems back in your review queue right before forgetting happens. Quiz yourself in rapid flashcard sessions.',
  },
  {
    num: '03',
    emoji: '🚀',
    title: 'Pattern Mastery — Walk into interviews ready',
    subtitle: 'Zero cramming on interview morning',
    icon: Trophy,
    stripe: 'stripe-mint',
    color: 'border-difficulty-easy-border bg-difficulty-easy-bg text-difficulty-easy-text',
    description:
      'When your interviewer throws an unexpected Graph or Dynamic Programming twist, the recurring patterns are fresh in your working memory. Zero guessing.',
  },
]

export function ConnectedHowItWorks() {
  const containerRef = useRef(null)
  const reduced = isReducedMotion()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 70%', 'end 70%'],
  })

  const scaleY = useSpring(scrollYProgress, springPresets.connectedPath)

  return (
    <div ref={containerRef} className="relative max-w-4xl mx-auto px-4 py-8">
      {/* Central Connecting Line (Desktop) */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute left-1/2 top-12 bottom-12 w-0.5 -translate-x-1/2 bg-border-subtle"
      >
        <motion.div
          style={reduced ? { scaleY: 1 } : { scaleY }}
          className="w-full h-full bg-gradient-to-b from-accent-coral via-primary to-difficulty-easy-text origin-top"
        />
      </div>

      <div className="space-y-12 sm:space-y-16">
        {STEPS.map((step, idx) => {
          const Icon = step.icon
          const isEven = idx % 2 === 1

          return (
            <InView
              key={step.num}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: transitions.slow },
              }}
            >
              <div
                className={`relative flex flex-col md:flex-row items-center gap-6 md:gap-12 ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Step Card with colored left stripe and glass-liquid */}
                <div className="w-full md:w-1/2">
                  <div className={`p-6 sm:p-8 rounded-card bg-base-surface border border-border-subtle hover:border-border-strong shadow-card hover:shadow-card-hover transition-all ${step.stripe}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="sticker-badge bg-base-elevated border border-border-subtle text-primary text-xs font-bold tabular-nums font-mono">
                        Step {step.num} <span aria-hidden="true">{step.emoji}</span>
                      </span>
                      <span className="text-xs text-content-muted font-display font-medium">
                        {step.subtitle}
                      </span>
                    </div>

                    <h4 className="text-xl sm:text-2xl font-display font-bold text-content-primary mb-2">
                      {step.title}
                    </h4>

                    <p className="text-sm sm:text-base text-content-secondary leading-relaxed font-sans">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Central Step Icon Node with animated flow arrow below */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-base-surface border-2 border-border-strong flex items-center justify-center shadow-sticker shrink-0 hover:scale-110 transition-transform">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Flow Arrow to next step (for all except last) */}
                  {idx < STEPS.length - 1 && (
                    <div className="my-2 text-content-muted flex items-center justify-center" aria-hidden="true">
                      <MoveDown className="w-4 h-4 text-accent animate-bounce" />
                    </div>
                  )}
                </div>

                {/* Spacer on opposite side to maintain center alignment */}
                <div className="hidden md:block w-1/2" />
              </div>
            </InView>
          )
        })}
      </div>
    </div>
  )
}
