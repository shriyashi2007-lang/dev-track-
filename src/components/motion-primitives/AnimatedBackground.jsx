import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { isReducedMotion } from '../../styles/motion'

/**
 * Motion Primitives: AnimatedBackground
 * Shared layout indicator for tabs, sidebars, and navbars.
 */
export function AnimatedBackground({
  defaultValue,
  value,
  onValueChange,
  className = '',
  transition = { type: 'spring', bounce: 0.15, duration: 0.35 },
  enableHover = false,
  children,
}) {
  const [activeId, setActiveId] = useState(defaultValue ?? null)
  const currentId = value !== undefined ? value : activeId
  const reduced = isReducedMotion()

  const handleSelect = (id) => {
    setActiveId(id)
    if (onValueChange) onValueChange(id)
  }

  return (
    <>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child
        const id = child.props['data-id'] || String(index)
        const isSelected = currentId === id

        const interactionProps = enableHover
          ? {
              onMouseEnter: () => handleSelect(id),
            }
          : {
              onClick: (e) => {
                if (child.props.onClick) child.props.onClick(e)
                handleSelect(id)
              },
            }

        return React.cloneElement(
          child,
          {
            key: id,
            className: `${child.props.className || ''} relative`,
            ...interactionProps,
          },
          <>
            <AnimatePresence>
              {isSelected && !reduced && (
                <motion.div
                  layoutId="animated-background-indicator"
                  className={className}
                  transition={transition}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
            <span className="relative z-10">{child.props.children}</span>
          </>
        )
      })}
    </>
  )
}
