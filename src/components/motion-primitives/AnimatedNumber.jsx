import React, { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'motion/react'
import { isReducedMotion } from '../../styles/motion'

/**
 * Motion Primitives: AnimatedNumber
 * Smoothly interpolates numeric values using spring physics.
 */
export function AnimatedNumber({
  value = 0,
  className = '',
  springOptions = { mass: 0.8, stiffness: 85, damping: 15 },
}) {
  const reduced = isReducedMotion()
  const numValue = Number(value) || 0
  const spring = useSpring(numValue, springOptions)
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString())

  useEffect(() => {
    spring.set(numValue)
  }, [spring, numValue])

  if (reduced) {
    return <span className={`tabular-nums ${className}`}>{numValue.toLocaleString()}</span>
  }

  return (
    <motion.span className={`tabular-nums ${className}`}>
      {display}
    </motion.span>
  )
}
