/**
 * DevTrack Motion Language & Animation Presets
 * =====================================================================
 * Centralized motion tokens, easing curves, springs, and hover presets.
 * Tuning this single file adjusts the motion personality across the app.
 * Fully respects prefers-reduced-motion and in-app settings.
 * =====================================================================
 */

export const transitions = {
  instant: { duration: 0.08, ease: 'easeOut' },
  fast: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  normal: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  slow: { duration: 0.36, ease: [0.16, 1, 0.3, 1] },
  spring: { type: 'spring', stiffness: 380, damping: 28 },
  gentleSpring: { type: 'spring', stiffness: 220, damping: 24 },
  bouncySpring: { type: 'spring', stiffness: 420, damping: 22 },
  wipe: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  swipe: { duration: 0.22, ease: 'easeOut' },
}

export const springPresets = {
  animatedNumber: { mass: 0.8, stiffness: 85, damping: 15 },
  connectedPath: { stiffness: 100, damping: 24, restDelta: 0.001 },
  magnetic: { damping: 18, stiffness: 220, mass: 0.1 },
  swipeDeck: { type: 'spring', stiffness: 340, damping: 26 },
  featureCarousel: { type: 'spring', stiffness: 320, damping: 26 },
  activeBackground: { type: 'spring', bounce: 0.15, duration: 0.35 },
}

export const motionValues = {
  terminalCharDelay: 54,
  terminalOutputDelay: 180,
  terminalIntroDelay: 350,
  copyFeedbackDelay: 2000,
  quickCaptureFeedbackDelay: 1500,
  routeWipeDelay: 320,
  routeWipeStagger: 0.018,
  textCharStagger: 0.02,
  textWordStagger: 0.06,
  confettiCount: 70,
  confettiGravity: 0.35,
  confettiLifetime: 3000,
  previewTilt: { damping: 20, stiffness: 180, mass: 0.1 },
}

export const confettiColors = [
  'var(--rainbow-1)', 'var(--rainbow-2)', 'var(--rainbow-3)', 'var(--rainbow-4)',
  'var(--rainbow-5)', 'var(--rainbow-6)', 'var(--rainbow-7)', 'var(--rainbow-8)',
]

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

export const bentoTile = {
  initial: { y: 0, scale: 1 },
  hover: { y: -5, scale: 1.012, transition: transitions.fast },
  tap: { y: 0, scale: 0.985, transition: transitions.instant },
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

/**
 * Shared Interactive Hover & Tap Presets (120-220ms, transform/opacity only)
 * On reduced motion, transform transitions are nullified.
 */
export const hoverPresets = {
  cardLift: {
    whileHover: { y: -4, transition: transitions.fast },
    whileTap: { y: -1, scale: 0.99 },
  },
  bentoTile: {
    whileHover: { y: -5, scale: 1.012, transition: transitions.fast },
    whileTap: { scale: 0.985 },
  },
  buttonPrimary: {
    whileHover: { scale: 1.03, transition: transitions.fast },
    whileTap: { scale: 0.96 },
  },
  chip: {
    whileHover: { scale: 1.05, y: -1, transition: transitions.fast },
    whileTap: { scale: 0.95 },
  },
  iconWiggle: {
    whileHover: { rotate: [0, -8, 8, 0], transition: { duration: 0.28 } },
  },
  arrowSlide: {
    whileHover: { x: 4, transition: transitions.fast },
  },
}
