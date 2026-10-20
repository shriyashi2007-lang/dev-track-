import { useEffect, useRef, useState } from 'react'
import { isReducedMotion } from '../../styles/motion'

/**
 * Interactive Rising Bubbles Canvas 🫧
 * - <= 30 bubbles on desktop, <= 12 on mobile
 * - Gentle cursor dodging/following
 * - Click / tap to POP with mini particle burst
 * - Automatically pauses when off-screen or tab hidden
 * - DevicePixelRatio capped to 2
 * - Strictly respects reduced-motion preferences
 */
export function BubblesCanvas({ className = '' }) {
  const canvasRef = useRef(null)
  const [poppedCount, setPoppedCount] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (isReducedMotion()) {
      return
    }

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId
    let isVisible = true
    const isMobile = window.innerWidth < 768
    const maxBubbles = isMobile ? 12 : 28

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    // Palette shades for bubbles
    const bubbleColors = [
      'rgba(250, 114, 104, 0.22)', // Coral 1
      'rgba(239, 95, 103, 0.18)',  // Coral 2
      'rgba(227, 76, 103, 0.16)',  // Rose 3
      'rgba(255, 255, 255, 0.18)', // White shimmer
      'rgba(198, 35, 104, 0.15)',  // Deep raspberry
    ]

    class Bubble {
      constructor(isInitial = false) {
        this.reset(isInitial)
      }

      reset(isInitial = false) {
        const width = canvas.width / dpr
        const height = canvas.height / dpr
        this.radius = 6 + Math.random() * 16
        this.x = Math.random() * width
        this.y = isInitial ? Math.random() * height : height + this.radius + Math.random() * 20
        this.speedY = 0.4 + Math.random() * 0.9
        this.speedX = (Math.random() - 0.5) * 0.4
        this.wobbleSpeed = 0.02 + Math.random() * 0.03
        this.wobbleOffset = Math.random() * Math.PI * 2
        this.color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)]
        this.popping = false
        this.popProgress = 0
        this.particles = []
      }

      pop() {
        if (this.popping) return
        this.popping = true
        this.popProgress = 0
        // Create 6-8 tiny burst droplets
        const count = 6 + Math.floor(Math.random() * 3)
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
          const speed = 1.2 + Math.random() * 2
          this.particles.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 1.5 + Math.random() * 1.5,
            alpha: 1,
          })
        }
      }

      update(mouseX, mouseY) {
        const width = canvas.width / dpr

        if (this.popping) {
          this.popProgress += 0.08
          this.particles.forEach((p) => {
            p.x += p.vx
            p.y += p.vy
            p.alpha -= 0.05
          })
          if (this.popProgress >= 1) {
            this.reset(false)
          }
          return
        }

        this.y -= this.speedY
        this.wobbleOffset += this.wobbleSpeed
        this.x += this.speedX + Math.sin(this.wobbleOffset) * 0.35

        // Gentle cursor interaction: dodge if cursor is within 70px
        if (mouseX !== null && mouseY !== null) {
          const dx = this.x - mouseX
          const dy = this.y - mouseY
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 70 && dist > 0) {
            const force = (70 - dist) / 70
            this.x += (dx / dist) * force * 1.8
            this.y += (dy / dist) * force * 1.8
          }
        }

        // Recycle if scrolled past top or out of bounds
        if (this.y < -this.radius * 2) {
          this.reset(false)
        }
        if (this.x < -this.radius) this.x = width + this.radius
        if (this.x > width + this.radius) this.x = -this.radius
      }

      draw(c) {
        if (this.popping) {
          // Draw burst particles
          this.particles.forEach((p) => {
            if (p.alpha <= 0) return
            c.save()
            c.globalAlpha = Math.max(0, p.alpha)
            c.fillStyle = this.color
            c.beginPath()
            c.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
            c.fill()
            c.restore()
          })
          return
        }

        c.save()
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()

        // Soft highlight reflection on upper-left curve
        c.beginPath()
        c.arc(
          this.x - this.radius * 0.35,
          this.y - this.radius * 0.35,
          this.radius * 0.28,
          0,
          Math.PI * 2
        )
        c.fillStyle = 'rgba(255, 255, 255, 0.45)'
        c.fill()

        // Delicate outer rim
        c.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        c.lineWidth = 0.75
        c.stroke()
        c.restore()
      }
    }

    const bubbles = Array.from({ length: maxBubbles }, () => new Bubble(true))

    let mouseX = null
    let mouseY = null

    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }

    function handleMouseLeave() {
      mouseX = null
      mouseY = null
    }

    function handleClick(e) {
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      // Check if clicked inside or near any bubble
      let poppedAny = false
      for (const b of bubbles) {
        if (b.popping) continue
        const dx = b.x - clickX
        const dy = b.y - clickY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= b.radius + 14) {
          b.pop()
          poppedAny = true
          break
        }
      }

      if (poppedAny) {
        setPoppedCount((prev) => prev + 1)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    canvas.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    canvas.addEventListener('click', handleClick)

    // Visibility and Intersection Observer to pause when hidden/offscreen
    function handleVisibility() {
      isVisible = document.visibilityState !== 'hidden'
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting && document.visibilityState !== 'hidden'
        })
      },
      { threshold: 0.05 }
    )
    observer.observe(canvas)

    function animate() {
      if (isVisible) {
        const width = canvas.width / dpr
        const height = canvas.height / dpr
        ctx.clearRect(0, 0, width, height)

        for (const bubble of bubbles) {
          bubble.update(mouseX, mouseY)
          bubble.draw(ctx)
        }
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('click', handleClick)
      document.removeEventListener('visibilitychange', handleVisibility)
      observer.disconnect()
    }
  }, [])

  return (
    <div className={`relative pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        title="Interactive bubbles: click to pop!"
        className="w-full h-full block pointer-events-auto cursor-crosshair select-none"
      />
      {poppedCount > 0 && (
        <div
          aria-live="polite"
          className="sr-only"
        >
          {poppedCount} bubble{poppedCount > 1 ? 's' : ''} popped!
        </div>
      )}
    </div>
  )
}
