import React, { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { Copy, Check, RotateCcw, Terminal } from 'lucide-react'

const DEFAULT_COMMAND = 'devtrack add "Two Sum" --easy --arrays'

const DEFAULT_OUTPUTS = [
  { text: '✔ Problem indexed: Two Sum [Easy] (Arrays & Hashing)', stripe: 'stripe-mint', color: 'text-status-solved' },
  { text: '🔥 Streak updated: 14 days consecutive (+1 today)', stripe: 'stripe-rose', color: 'text-primary' },
  { text: '📊 Heatmap cell updated: Today → 4 problems solved', stripe: 'stripe-coral', color: 'text-rainbow-1' },
  { text: '🧠 Spaced repetition: Next review scheduled in 3 days', stripe: 'stripe-sky', color: 'text-rainbow-6' },
  { text: '✨ Ready for next challenge: run `devtrack suggest`', stripe: 'stripe-violet', color: 'text-content-secondary' },
]

export function TerminalWindow({
  command = DEFAULT_COMMAND,
  outputs = DEFAULT_OUTPUTS,
  title = 'devtrack-cli — bash',
  className = '',
}) {
  const [typedChars, setTypedChars] = useState(0)
  const [showOutputs, setShowOutputs] = useState(false)
  const [outputIndex, setOutputIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const containerRef = useRef(null)

  // Reduced motion check
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Intersection observer to trigger typing when scrolled into view
  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedChars(command.length)
      setShowOutputs(true)
      setOutputIndex(outputs.length)
      setHasStarted(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.3 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [hasStarted, prefersReducedMotion, command.length, outputs.length])

  // Typewriter effect for command
  useEffect(() => {
    if (!hasStarted || prefersReducedMotion) return

    if (typedChars < command.length) {
      const timer = setTimeout(() => {
        setTypedChars((prev) => prev + 1)
      }, 45 + Math.random() * 30)
      return () => clearTimeout(timer)
    } else if (!showOutputs) {
      const timer = setTimeout(() => {
        setShowOutputs(true)
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [hasStarted, typedChars, command.length, showOutputs, prefersReducedMotion])

  // Sequentially reveal output lines
  useEffect(() => {
    if (!showOutputs || prefersReducedMotion) return

    if (outputIndex < outputs.length) {
      const timer = setTimeout(() => {
        setOutputIndex((prev) => prev + 1)
      }, 180)
      return () => clearTimeout(timer)
    }
  }, [showOutputs, outputIndex, outputs.length, prefersReducedMotion])

  const handleReplay = () => {
    setTypedChars(0)
    setShowOutputs(false)
    setOutputIndex(0)
    setHasStarted(true)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div
      ref={containerRef}
      className={clsx(
        'w-full max-w-2xl mx-auto rounded-card overflow-hidden shadow-sticker border border-border-strong bg-[#0d0f17] text-left text-xs sm:text-sm font-mono transition-all duration-200',
        className
      )}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#151824] border-b border-border-subtle select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm" />
          </div>
          <span className="text-content-muted text-xs ml-2 font-display flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-accent" />
            <span>{title}</span>
          </span>
        </div>

        {/* Demo badge & actions */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-primary/20 text-primary border border-primary/30">
            UI Demo — Sample CLI
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-content-muted hover:text-content-primary hover:bg-base-elevated transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            title="Copy command"
            aria-label="Copy CLI command"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-status-solved" />
                <span className="text-status-solved">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReplay}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-content-muted hover:text-content-primary hover:bg-base-elevated transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            title="Replay animation"
            aria-label="Replay typing animation"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Replay</span>
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 sm:p-5 space-y-3 min-h-[220px] bg-[#0d0f17]">
        {/* Command line */}
        <div className="flex items-center gap-2 text-white">
          <span className="text-accent font-bold select-none">$</span>
          <span>{command.slice(0, typedChars)}</span>
          <span
            className={clsx(
              'inline-block w-2 h-4 bg-accent align-middle',
              (!hasStarted || typedChars < command.length) ? 'animate-pulse' : 'opacity-70'
            )}
            aria-hidden="true"
          />
        </div>

        {/* Outputs with colored left stripes */}
        {showOutputs && (
          <div className="space-y-2 pt-2 border-t border-border-subtle/40">
            {outputs.slice(0, outputIndex).map((out, idx) => (
              <div
                key={idx}
                className={clsx(
                  'pl-3 py-1 border-l-2 bg-white/[0.02] rounded-r transition-all duration-200 animate-slide-up flex items-center justify-between',
                  out.stripe,
                  out.color
                )}
              >
                <span>{out.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Terminal Footer notice */}
      <div className="px-4 py-2 bg-[#12141f] border-t border-border-subtle/50 text-[10px] text-content-muted flex items-center justify-between font-sans">
        <span>DevTrack Developer Suite &bull; Interactive Simulation</span>
        <span className="text-content-muted/70">Sample metrics only — not your live profile</span>
      </div>
    </div>
  )
}
