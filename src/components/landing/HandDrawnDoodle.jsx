import React from 'react'

/**
 * Hand-drawn SVG Underline & Scribble Doodles
 * Creates an organic, crafted editorial feel instead of generic AI styling.
 */
export function UnderlineDoodle({ className = '', color = 'var(--accent-coral)' }) {
  return (
    <svg
      viewBox="0 0 240 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`w-full block pointer-events-none select-none ${className}`}
    >
      <path
        d="M3 13.5C45 4.5 125 3 237 11.5M18 16C72 9.5 155 8.5 220 14"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function WaveSquiggleDoodle({ className = '', color = 'var(--wave-rose-3)' }) {
  return (
    <svg
      viewBox="0 0 100 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block pointer-events-none select-none ${className}`}
    >
      <path
        d="M2 10C12 2 18 18 28 10C38 2 44 18 54 10C64 2 70 18 80 10C90 2 94 16 98 10"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
