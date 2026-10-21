import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform } from 'motion/react'
import { ChevronLeft, ChevronRight, RotateCcw, Flame, Brain, Zap, ShieldCheck } from 'lucide-react'
import { isReducedMotion, springPresets } from '../../styles/motion'

const FEATURES = [
  {
    id: 'spaced-repetition',
    title: 'Spaced Repetition Recall',
    tag: 'Long-term Memory',
    badge: '🔁 Anti-Forgetting',
    icon: RotateCcw,
    color: 'from-accent-coral/20 via-primary/10 to-transparent',
    border: 'border-accent-coral/30',
    description:
      'Never forget an algorithm you solved 3 weeks ago. Automated 1 → 3 → 7 → 14 → 30 day review intervals keep patterns sharp for interview day.',
    stat: '94% Retention',
    highlight: 'Flashcard Sessions with Hard/Okay/Easy rating',
  },
  {
    id: 'consistency-heatmap',
    title: 'Daily Streak & Heatmap',
    tag: 'Consistency',
    badge: '🔥 Unbroken Momentum',
    icon: Flame,
    color: 'from-primary/20 via-secondary/10 to-transparent',
    border: 'border-primary/30',
    description:
      'Turn your GitHub-style activity grid deep emerald green. Watch your daily problem target and longest streaks grow with genuine empirical proof.',
    stat: '365-Day Matrix',
    highlight: 'Real localStorage timestamps, no fake numbers',
  },
  {
    id: 'topic-depth',
    title: 'Topic Mastery & Radar',
    tag: 'Coverage',
    badge: '🧠 Spot Blindspots',
    icon: Brain,
    color: 'from-secondary/20 via-accent/10 to-transparent',
    border: 'border-secondary/30',
    description:
      'Analyze your problem distribution across Arrays, Dynamic Programming, Graphs, and Trees. Fix weak domains before your recruiter asks.',
    stat: '14 Core Topics',
    highlight: 'Interactive difficulty breakdown & donut slices',
  },
  {
    id: 'quick-capture',
    title: 'Command Palette & Hotkeys',
    tag: 'Speed',
    badge: '⚡ 3-Sec Logging',
    icon: Zap,
    color: 'from-accent-coral/20 via-accent-hover/10 to-transparent',
    border: 'border-accent-coral/30',
    description:
      'Log problems instantly without leaving the keyboard. Press ⌘+K or Ctrl+K anywhere to search, filter, or jump between problem boards.',
    stat: '<100ms Latency',
    highlight: 'Built for developers who value fluid keyboard flow',
  },
  {
    id: 'offline-privacy',
    title: '100% Local & Private',
    tag: 'Privacy First',
    badge: '🔒 Your Machine Only',
    icon: ShieldCheck,
    color: 'from-primary/20 via-accent-coral/10 to-transparent',
    border: 'border-primary/30',
    description:
      'Zero cloud database, zero telemetry, zero passwords. Your prep records reside safely in your browser storage with single-click JSON export.',
    stat: '0 Byte Outbound',
    highlight: 'Export and backup your progress anytime',
  },
]

export function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef(null)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-4, 0, 4])
  const reduced = isReducedMotion()

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : FEATURES.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < FEATURES.length - 1 ? prev + 1 : 0))
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (document.activeElement?.closest('#features-carousel-section')) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          handlePrev()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          handleNext()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const currentFeature = FEATURES[currentIndex]
  const Icon = currentFeature.icon

  return (
    <div
      id="features-carousel-section"
      className="relative w-full max-w-4xl mx-auto px-4 focus:outline-none"
      tabIndex={0}
      aria-label="Features carousel. Use left and right arrow keys to navigate."
    >
      {/* Carousel Card with Drag Tilt and Spring Snap */}
      <motion.div
        ref={containerRef}
        key={currentFeature.id}
        style={reduced ? {} : { x, rotate }}
        drag={reduced ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) {
            handleNext()
          } else if (info.offset.x > 60) {
            handlePrev()
          }
        }}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={springPresets.featureCarousel}
        className={`relative overflow-hidden p-6 sm:p-10 rounded-2xl bg-base-surface border ${currentFeature.border} shadow-2xl bg-gradient-to-br ${currentFeature.color} cursor-grab active:cursor-grabbing select-none`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="sticker-badge bg-primary text-content-inverse text-xs -rotate-2">
                {currentFeature.badge}
              </span>
              <span className="text-xs text-content-muted tracking-wider uppercase font-semibold">
                {currentFeature.tag}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-content-primary leading-tight">
              {currentFeature.title}
            </h3>

            <p className="text-base sm:text-lg text-content-secondary leading-relaxed">
              {currentFeature.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-card bg-base-elevated border border-border-strong text-accent-coral tabular-nums">
                ⚡ {currentFeature.stat}
              </span>
              <span className="text-content-muted">
                {currentFeature.highlight}
              </span>
            </div>
          </div>

          {/* Large Decorative Feature Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-base-elevated/70 border border-border-subtle flex items-center justify-center text-primary shadow-inner shrink-0 self-start sm:self-auto">
            <Icon className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
        </div>

        {/* Swipe drag hint for touch users */}
        <div className="mt-6 pt-4 border-t border-border-subtle/50 flex items-center justify-between text-xs text-content-muted">
          <span>💡 Swipe left/right or use arrow buttons</span>
          <span className="tabular-nums font-semibold text-content-secondary">
            {currentIndex + 1} of {FEATURES.length}
          </span>
        </div>
      </motion.div>

      {/* Navigation Controls: Arrows, Progress Bar & Dots */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Progress bar */}
        <div className="w-full sm:w-48 h-1.5 bg-base-elevated rounded-full overflow-hidden border border-border-subtle">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / FEATURES.length) * 100}%` }}
          />
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center gap-2">
          {FEATURES.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}: ${f.title}`}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                i === currentIndex
                  ? 'w-8 bg-primary shadow-sm'
                  : 'w-2.5 bg-border-strong hover:bg-content-muted'
              }`}
            />
          ))}
        </div>

        {/* Arrow Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous feature"
            className="p-2.5 rounded-card bg-base-surface border border-border-subtle hover:border-border-strong text-content-primary hover:bg-base-elevated transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next feature"
            className="p-2.5 rounded-card bg-base-surface border border-border-subtle hover:border-border-strong text-content-primary hover:bg-base-elevated transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
