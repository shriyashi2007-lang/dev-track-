/**
 * DevTrack Motion Language & Animation Presets
 * =====================================================================
 * Centralized motion tokens, easing curves, springs, and variants.
 * Tuning this single file adjusts the motion personality across the app.
 * Fully respects prefers-reduced-motion and in-app settings.
 * =====================================================================
 */

export const transitions = {
  fast: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  normal: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  slow: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  spring: { type: 'spring', stiffness: 380, damping: 28 },
  gentleSpring: { type: 'spring', stiffness: 220, damping: 24 },
}

/**
 * Checks if reduced motion is requested via media query or DOM attribute.
 */
export function isReducedMotion() {
  if (typeof window === 'undefined') return false
  const attr = document.documentElement.getAttribute('data-reduce-motion')
  if (attr === 'true') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Reusable animation variants
 */
export const fadeInVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitions.normal },
  exit: { opacity: 0, transition: transitions.fast },
}

export const slideUpVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: transitions.normal },
  exit: { opacity: 0, y: 12, transition: transitions.fast },
}

export const scaleInVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: transitions.gentleSpring },
  exit: { opacity: 0, scale: 0.96, transition: transitions.fast },
}

export const staggerContainer = (staggerDelay = 0.06, delayChildren = 0.02) => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren,
    },
  },
})

export const pageTransitionVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } },
}
