import React, { useEffect, useRef } from 'react'
import { useSettings } from '../../context/SettingsContext'
import { confettiColors, isReducedMotion, motionValues } from '../../styles/motion'
import { getCssVar } from '../../styles/chartTheme'

export function Confetti({ trigger = false, onComplete }) {
  const canvasRef = useRef(null)
  const { settings } = useSettings()

  useEffect(() => {
    if (!trigger) return
    const allowConfetti = settings ? settings.confetti : true
    const reduceMotion = settings ? settings.reduceMotion : false
    if (!allowConfetti || reduceMotion || isReducedMotion()) {
      onComplete?.()
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const particleCount = motionValues.confettiCount
    const colors = confettiColors.map((token) => getCssVar(token.slice(4, -1)))

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.4 + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 1.5) * 8 - 4,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        opacity: 1,
      })
    }

    let animationFrameId
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      if (elapsed > motionValues.confettiLifetime) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        onComplete?.()
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += motionValues.confettiGravity
        p.rotation += p.vr
        p.opacity = Math.max(0, 1 - elapsed / motionValues.confettiLifetime)

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7)
        ctx.restore()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [trigger, settings, onComplete])

  if (!trigger) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      aria-hidden="true"
    />
  )
}
