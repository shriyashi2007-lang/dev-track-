import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const WORDMARK = 'DEVTRACK'.split('')

export default function Landing() {
  const landingRef = useRef(null)
  const cursorRef = useRef(null)

  useEffect(() => {
    const landing = landingRef.current
    const cursor = cursorRef.current
    const finePointer = window.matchMedia('(pointer: fine)')

    if (!landing || !cursor || !finePointer.matches) return undefined

    let animationFrame

    const moveCursor = (event) => {
      const bounds = landing.getBoundingClientRect()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top

      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        landing.style.setProperty('--cursor-x', `${x}px`)
        landing.style.setProperty('--cursor-y', `${y}px`)
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
        cursor.dataset.visible = 'true'
      })
    }

    const hideCursor = () => {
      cursor.dataset.visible = 'false'
    }

    landing.addEventListener('pointermove', moveCursor)
    landing.addEventListener('pointerleave', hideCursor)

    return () => {
      cancelAnimationFrame(animationFrame)
      landing.removeEventListener('pointermove', moveCursor)
      landing.removeEventListener('pointerleave', hideCursor)
    }
  }, [])

  return (
    <section ref={landingRef} className="devtrack-intro" aria-labelledby="devtrack-intro-title">
      <div className="devtrack-intro__grid" aria-hidden="true" />
      <div className="devtrack-intro__glow" aria-hidden="true" />
      <div className="devtrack-intro__cursor-aura" aria-hidden="true" />

      <div className="devtrack-wave" aria-hidden="true">
        <svg viewBox="0 0 1200 430" preserveAspectRatio="none">
          <defs>
            <linearGradient id="devtrack-spectrum" x1="60" y1="0" x2="1140" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#00d9ff" />
              <stop offset="0.27" stopColor="#2589ff" />
              <stop offset="0.52" stopColor="#9f4dff" />
              <stop offset="0.76" stopColor="#ff2f9f" />
              <stop offset="1" stopColor="#ff9f2f" />
            </linearGradient>
            <linearGradient id="devtrack-spectrum-reverse" x1="1140" y1="0" x2="70" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ff7b2f" />
              <stop offset="0.28" stopColor="#ff2f9f" />
              <stop offset="0.56" stopColor="#a249ff" />
              <stop offset="1" stopColor="#00dcff" />
            </linearGradient>
            <filter id="devtrack-wave-glow" x="-30%" y="-80%" width="160%" height="260%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            className="devtrack-wave__beam devtrack-wave__beam--one"
            d="M52 226C130 18 232 382 430 212C596 70 672 54 788 166C906 280 1042 332 1148 178"
            pathLength="1"
          />
          <path
            className="devtrack-wave__beam devtrack-wave__beam--two"
            d="M58 178C204 348 310 62 486 196C650 320 748 310 858 144C948 10 1090 62 1144 222"
            pathLength="1"
          />
          <path
            className="devtrack-wave__beam devtrack-wave__beam--spark"
            d="M76 232C260 190 350 230 510 216C710 200 862 186 1128 220"
            pathLength="1"
          />
        </svg>
        <div className="devtrack-wave__reflection" />
      </div>

      <div className="devtrack-intro__content">
        <h1 id="devtrack-intro-title" className="sr-only">
          DevTrack
        </h1>

        <div className="devtrack-wordmark" aria-hidden="true">
          {WORDMARK.map((letter, index) => (
            <span key={`${letter}-${index}`} className="devtrack-wordmark__letter">
              {letter}
            </span>
          ))}
        </div>

        <p className="devtrack-intro__tagline">
          <span>Code</span>
          <span aria-hidden="true">•</span>
          <span>Commit</span>
          <span aria-hidden="true">•</span>
          <span>Track</span>
          <span aria-hidden="true">•</span>
          <span>Consistent</span>
        </p>

        <Link className="devtrack-intro__cta" to="/dashboard">
          <span>Get Started</span>
          <span className="devtrack-intro__cta-accent" aria-hidden="true" />
        </Link>
      </div>

      <p className="devtrack-intro__status" aria-hidden="true">
        <span>DT // 01</span>
        <span>LOCAL-FIRST SYSTEM</span>
      </p>

      <div ref={cursorRef} className="devtrack-cursor" data-visible="false" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}
