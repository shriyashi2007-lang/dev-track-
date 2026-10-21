import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { isReducedMotion, motionValues, transitions } from '../../styles/motion'

/**
 * Fast Layered Wave-Wipe Route Transition 🌊
 * Sweeps across the viewport in the 5 brand wave colors in <= 320ms
 * on page/route changes, smoothly revealing the new route.
 * Automatically degrades to simple fade under prefers-reduced-motion.
 */
export function WaveWipeTransition({ children }) {
  const location = useLocation()
  const [isWiping, setIsWiping] = useState(false)
  const reduced = isReducedMotion()

  useEffect(() => {
    if (reduced) return
    setIsWiping(true)
    const timer = setTimeout(() => {
      setIsWiping(false)
    }, motionValues.routeWipeDelay)
    return () => clearTimeout(timer)
  }, [location.pathname, reduced])

  const waveColors = [
    'var(--wave-coral-1)',
    'var(--wave-coral-2)',
    'var(--wave-rose-3)',
    'var(--wave-raspberry-4)',
    'var(--wave-deep-raspberry-5)',
  ]

  return (
    <div className="relative w-full min-h-screen">
      {/* 5-Layered Wave Wipe Overlays */}
      {!reduced && isWiping && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[999] pointer-events-none overflow-hidden flex flex-col"
        >
          {waveColors.map((color, index) => (
            <motion.div
              key={`wave-bar-${index}`}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{
                scaleX: [0, 1, 1, 0],
                originX: [0, 0, 1, 1],
              }}
              transition={{
                ...transitions.wipe,
                delay: index * motionValues.routeWipeStagger,
              }}
              style={{ backgroundColor: color }}
              className="w-full flex-1"
            />
          ))}
        </div>
      )}

      {/* Main Page Content with gentle fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: reduced ? 0 : 0.4 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduced ? transitions.fast : transitions.normal}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
