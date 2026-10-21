import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react'
import { CheckCircle2, RotateCcw, Flame, Sparkles, RefreshCw, Layers } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Confetti } from '../ui/Confetti'
import { ProgressRing } from '../ui/ProgressRing'
import { isReducedMotion, springPresets, transitions } from '../../styles/motion'

const SAMPLE_DECK = [
  {
    id: 'demo-1',
    title: 'LRU Cache Design',
    difficulty: 'Medium',
    platform: 'LeetCode #146',
    topics: ['Hash Map', 'Doubly Linked List'],
    hint: 'O(1) get and put using a hash map mapped to doubly-linked list nodes.',
  },
  {
    id: 'demo-2',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    platform: 'LeetCode #42',
    topics: ['Two Pointers', 'Monotonic Stack'],
    hint: 'Maintain leftMax and rightMax pointers from both ends inward.',
  },
  {
    id: 'demo-3',
    title: 'Course Schedule II',
    difficulty: 'Medium',
    platform: 'LeetCode #210',
    topics: ['Graph', 'Topological Sort', 'BFS'],
    hint: "Kahn's algorithm using in-degree array and a processing queue.",
  },
  {
    id: 'demo-4',
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    platform: 'LeetCode #5',
    topics: ['String', 'Dynamic Programming'],
    hint: 'Expand around center for both odd and even length candidates.',
  },
  {
    id: 'demo-5',
    title: 'Invert Binary Tree',
    difficulty: 'Easy',
    platform: 'LeetCode #226',
    topics: ['Binary Tree', 'DFS / Recursion'],
    hint: 'Recursively swap left and right child pointers down to base leaves.',
  },
]

function SwipeCard({ card, onSwipe, isTop }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-180, 0, 180], [-14, 0, 14])
  const opacity = useTransform(x, [-180, -90, 0, 90, 180], [0.4, 0.9, 1, 0.9, 0.4])
  const reduced = isReducedMotion()

  // Dynamic stamps when dragging left or right
  const solvedStampOpacity = useTransform(x, [20, 80], [0, 1])
  const reviseStampOpacity = useTransform(x, [-20, -80], [0, 1])

  return (
    <motion.div
      style={isTop && !reduced ? { x, rotate, opacity } : {}}
      drag={isTop && !reduced ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (info.offset.x > 90) {
          onSwipe('solved')
        } else if (info.offset.x < -90) {
          onSwipe('revise')
        }
      }}
      initial={{ scale: 0.94, y: 14, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={(direction) => ({
        x: direction === 'solved' ? 320 : -320,
        opacity: 0,
        rotate: direction === 'solved' ? 18 : -18,
        transition: transitions.swipe,
      })}
      transition={springPresets.swipeDeck}
      className={`absolute inset-0 rounded-2xl bg-base-surface border border-border-strong p-6 shadow-2xl flex flex-col justify-between select-none ${
        isTop ? 'cursor-grab active:cursor-grabbing z-20' : 'z-10 pointer-events-none'
      }`}
    >
      {/* Solved Stamp (Appears when dragging right) */}
      <motion.div
        style={{ opacity: solvedStampOpacity }}
        className="absolute top-4 right-4 border-2 border-emerald-400 text-emerald-400 px-3 py-1 rounded font-bold uppercase tracking-wider text-xs rotate-12 pointer-events-none"
      >
        ✅ Solved!
      </motion.div>

      {/* Revise Stamp (Appears when dragging left) */}
      <motion.div
        style={{ opacity: reviseStampOpacity }}
        className="absolute top-4 left-4 border-2 border-accent-coral text-accent-coral px-3 py-1 rounded font-bold uppercase tracking-wider text-xs -rotate-12 pointer-events-none"
      >
        🔁 Revise Later
      </motion.div>

      <div>
        <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-3 mb-4">
          <Badge variant={card.difficulty} size="sm">
            {card.difficulty}
          </Badge>
          <span className="text-xs text-content-muted tabular-nums">
            {card.platform}
          </span>
        </div>

        <h4 className="text-xl sm:text-2xl font-bold text-content-primary mb-2">
          {card.title}
        </h4>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {card.topics.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-base-elevated text-content-secondary border border-border-subtle"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="p-3 rounded-card bg-base-elevated/70 border border-border-subtle text-xs text-content-secondary leading-relaxed">
          <span className="font-semibold text-content-primary block mb-1">
            💡 Intuition Peek:
          </span>
          {card.hint}
        </div>
      </div>

      <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-content-muted">
        <span>⬅️ Swipe Left: Revise</span>
        <span>Swipe Right: Solved ➡️</span>
      </div>
    </motion.div>
  )
}

export function SwipeDeckDemo() {
  const [deck, setDeck] = useState(SAMPLE_DECK)
  const [solvedCount, setSolvedCount] = useState(0)
  const [reviseCount, setReviseCount] = useState(0)
  const [streakDays, setStreakDays] = useState(4)
  const [lastDirection, setLastDirection] = useState(null)
  const [triggerConfetti, setTriggerConfetti] = useState(false)

  const handleSwipe = (direction) => {
    if (deck.length === 0) return
    setLastDirection(direction)

    if (direction === 'solved') {
      setSolvedCount((c) => c + 1)
      setStreakDays((s) => s + 1)
      setTriggerConfetti(true)
    } else {
      setReviseCount((c) => c + 1)
    }

    setDeck((prev) => prev.slice(1))
  }

  const handleReset = () => {
    setDeck(SAMPLE_DECK)
    setSolvedCount(0)
    setReviseCount(0)
    setStreakDays(4)
    setLastDirection(null)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl bg-base-surface/80 border border-border-strong shadow-2xl relative overflow-hidden backdrop-blur-md">
      <Confetti trigger={triggerConfetti} onComplete={() => setTriggerConfetti(false)} />

      {/* Header with Demo Disclaimer Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="sticker-badge bg-accent-coral text-content-inverse text-xs -rotate-1">
              Interactive Sandbox 🃏
            </span>
            <span className="text-xs font-semibold text-content-muted">
              Try It Live
            </span>
          </div>
          <h3 className="text-2xl font-bold text-content-primary">
            Experience the Problem Review Flow
          </h3>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Swipe card or click action buttons. Updates local interactive state with spring physics and zero data persisted.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-card bg-base-elevated border border-border-subtle hover:border-border-strong text-xs font-semibold text-content-primary transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-primary" />
          <span>Reset Demo Deck</span>
        </button>
      </div>

      {/* Main Sandbox Grid: Interactive Card Deck & Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-8">
        {/* Left: Card Stack Container (7 cols) */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-sm h-88 sm:h-96">
            <AnimatePresence custom={lastDirection}>
              {deck.length > 0 ? (
                deck.slice(0, 3).map((card, idx) => (
                  <SwipeCard
                    key={card.id}
                    card={card}
                    isTop={idx === 0}
                    onSwipe={handleSwipe}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 rounded-2xl bg-base-surface border border-emerald-500/30 p-8 shadow-xl flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-content-primary">
                      All Sample Cards Reviewed! 🎉
                    </h4>
                    <p className="text-xs text-content-secondary mt-1 max-w-xs">
                      You marked {solvedCount} solved and {reviseCount} for spaced recall.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 rounded-card bg-primary text-content-inverse text-xs font-bold shadow-md hover:bg-accent-hover transition-all cursor-pointer"
                  >
                    ↺ Reset Sample Deck
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fallback Action Buttons for Keyboard & Mobile Tap */}
          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              disabled={deck.length === 0}
              onClick={() => handleSwipe('revise')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-card border border-accent-coral/40 bg-accent-coral/10 hover:bg-accent-coral/20 text-accent-coral text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Revise Later (⬅️)</span>
            </button>

            <button
              type="button"
              disabled={deck.length === 0}
              onClick={() => handleSwipe('solved')}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-card bg-primary text-content-inverse hover:bg-accent-hover text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Solved (➡️)</span>
            </button>
          </div>
        </div>

        {/* Right: Live Interactive Stats (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-base-elevated/70 border border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-content-muted block">Solved Demo</span>
                <span className="text-2xl font-bold tabular-nums text-content-primary">
                  {solvedCount}
                </span>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded">
              +{solvedCount * 10} pts
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-base-elevated/70 border border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-coral/10 border border-accent-coral/30 flex items-center justify-center text-accent-coral">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-content-muted block">Queued Revisions</span>
                <span className="text-2xl font-bold tabular-nums text-content-primary">
                  {reviseCount}
                </span>
              </div>
            </div>
            <span className="text-xs text-accent-coral font-semibold bg-accent-coral/10 px-2 py-1 rounded">
              1-Day Schedule
            </span>
          </div>

          {/* Interactive Streak Ring Widget */}
          <div className="p-4 rounded-2xl bg-base-elevated/70 border border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ProgressRing
                value={Math.min(streakDays, 7)}
                max={7}
                size={54}
                strokeWidth={5}
                colorClass="text-accent-coral"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-accent-coral" />
                  <span className="text-base font-bold tabular-nums text-content-primary">
                    {streakDays}-Day Streak
                  </span>
                </div>
                <span className="text-[11px] text-content-muted">
                  Interactive demo tracker
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-card bg-primary/10 border border-primary/20 text-[11px] text-content-secondary flex items-start gap-2">
            <Layers className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Real app features auto-sync with your actual solved problems and custom revision intervals in localStorage.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
