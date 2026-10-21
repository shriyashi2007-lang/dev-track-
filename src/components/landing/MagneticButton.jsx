import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { isReducedMotion, springPresets } from '../../styles/motion'

/**
 * Magnetic Button with subtle pull toward cursor and press squish.
 * Honors prefers-reduced-motion.
 */
export function MagneticButton({ children, className = '', onClick, ...props }) {
  const ref = useRef(null)
  const reduced = isReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = springPresets.magnetic
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e) => {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    // Max 10px pull distance
    const distanceX = (e.clientX - centerX) * 0.22
    const distanceY = (e.clientY - centerY) * 0.22
    x.set(Math.max(-10, Math.min(10, distanceX)))
    y.set(Math.max(-10, Math.min(10, distanceY)))
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={reduced ? {} : { scale: 1.04 }}
      whileTap={reduced ? {} : { scale: 0.95 }}
      style={reduced ? {} : { x: springX, y: springY }}
      onClick={onClick}
      className={`cursor-pointer transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
