import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'
import { InView } from '../motion-primitives/InView'
import { PenTool, RotateCcw, Trophy } from 'lucide-react'
import { isReducedMotion } from '../../styles/motion'

const STEPS = [
  {
    num: '01',
    emoji: '📝',
    title: 'Solve & Capture Intuition',
    subtitle: 'Takes < 10 seconds per problem',
    icon: PenTool,
    color: 'border-accent-coral/30 bg-accent-coral/10 text-accent-coral',
    description:
      'Solve on LeetCode or Codeforces, then press ⌘+K to log. Note the core intuition, tricky edge cases, and time/space complexity before you forget.',
  },
  {
    num: '02',
    emoji: '🧠',
    title: 'Spaced Repetition Flashcards',
    subtitle: 'Automated 1 → 3 → 7 → 14 → 30 day intervals',
    icon: RotateCcw,
    color: 'border-primary/30 bg-primary/10 text-primary',
    description:
      'Our spaced repetition engine puts problems back in your review queue right before forgetting happens. Quiz yourself in rapid flashcard sessions.',
  },
  {
    num: '03',
    emoji: '🚀',
    title: 'Walk into Interviews Ready',
    subtitle: 'Empirical pattern recognition under pressure',
    icon: Trophy,
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

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 24,
    restDelta: 0.001,
  })

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
                visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
              }}
            >
              <div
                className={`relative flex flex-col md:flex-row items-center gap-6 md:gap-12 ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Step Card */}
                <div className="w-full md:w-1/2">
                  <div className="p-6 sm:p-8 rounded-2xl bg-base-surface border border-border-subtle hover:border-border-strong shadow-card hover:shadow-card-hover transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="sticker-badge bg-base-elevated border border-border-subtle text-primary text-xs font-bold tabular-nums">
                        Step {step.num} {step.emoji}
                      </span>
                      <span className="text-xs text-content-muted font-semibold">
                        {step.subtitle}
                      </span>
                    </div>

                    <h4 className="text-xl sm:text-2xl font-bold text-content-primary mb-2">
                      {step.title}
                    </h4>

                    <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Central Step Icon Node */}
                <div className="relative z-10 w-14 h-14 rounded-full bg-base-surface border-2 border-border-strong flex items-center justify-center shadow-lg shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
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
