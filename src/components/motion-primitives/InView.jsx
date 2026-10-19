import React, { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { isReducedMotion } from '../../styles/motion'

/**
 * Motion Primitives: InView
 * Triggers animations when element scrolls into viewport.
 */
export function InView({
  children,
  className = '',
  variants,
  transition = { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  viewOptions = { once: true, margin: '-40px' },
  as: Component = 'div',
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, viewOptions)
  const reduced = isReducedMotion()

  const defaultVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  }

  if (reduced) {
    return <Component className={className}>{children}</Component>
  }

  const MotionComponent = motion[Component] || motion.div

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants || defaultVariants}
      transition={transition}
      className={className}
    >
      {children}
    </MotionComponent>
  )
}
