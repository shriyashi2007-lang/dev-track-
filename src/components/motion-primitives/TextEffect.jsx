import React, { useMemo } from 'react'
import { motion } from 'motion/react'
import { isReducedMotion } from '../../styles/motion'

/**
 * Motion Primitives: TextEffect
 * Animates text character by character or word by word.
 * Plain JSX with automatic reduced-motion detection.
 */
export function TextEffect({
  children,
  per = 'word', // 'word' | 'char' | 'line'
  as: Component = 'p',
  variants,
  className = '',
  delay = 0,
}) {
  const text = typeof children === 'string' ? children : ''
  const reduced = isReducedMotion()

  const defaultContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: per === 'char' ? 0.02 : 0.06,
        delayChildren: delay,
      },
    },
  }

  const defaultItemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
  }

  const items = useMemo(() => {
    if (!text) return []
    if (per === 'word') {
      return text.split(' ').map((word, i) => (i === 0 ? word : ` ${word}`))
    }
    return text.split('')
  }, [text, per])

  if (reduced || !text) {
    return <Component className={className}>{children}</Component>
  }

  return (
    <Component className={className}>
      <motion.span
        initial="hidden"
        animate="visible"
        variants={variants?.container || defaultContainerVariants}
        className="inline-block"
      >
        {items.map((item, index) => (
          <motion.span
            key={index}
            variants={variants?.item || defaultItemVariants}
            className="inline-block whitespace-pre"
          >
            {item}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  )
}
