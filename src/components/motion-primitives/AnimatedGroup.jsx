import React from 'react'
import { motion } from 'motion/react'
import { isReducedMotion } from '../../styles/motion'

/**
 * Motion Primitives: AnimatedGroup
 * Staggers children entrance transitions seamlessly.
 */
export function AnimatedGroup({
  children,
  className = '',
  variants,
  as: Component = 'div',
  staggerDelay = 0.08,
  delayChildren = 0.05,
}) {
  const reduced = isReducedMotion()

  const defaultContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayChildren,
      },
    },
  }

  const defaultItem = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
  }

  if (reduced) {
    return <Component className={className}>{children}</Component>
  }

  const MotionComponent = motion[Component] || motion.div

  return (
    <MotionComponent
      initial="hidden"
      animate="visible"
      variants={variants?.container || defaultContainer}
      className={className}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        return (
          <motion.div variants={variants?.item || defaultItem}>
            {child}
          </motion.div>
        )
      })}
    </MotionComponent>
  )
}
