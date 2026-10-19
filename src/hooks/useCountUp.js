import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../context/SettingsContext'

export function useCountUp(targetNumber = 0, duration = 600) {
  const [count, setCount] = useState(0)
  const { settings } = useSettings()
  const countRef = useRef(0)

  useEffect(() => {
    // If reduced motion is requested, immediately jump to target
    if (settings?.reduceMotion || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      setCount(targetNumber)
      countRef.current = targetNumber
      return
    }

    const end = Number(targetNumber) || 0
    if (end === 0) {
      setCount(0)
      countRef.current = 0
      return
    }

    let startTimestamp = null
    const startValue = countRef.current

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const current = Math.floor(progress * (end - startValue) + startValue)
      setCount(current)
      countRef.current = current

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setCount(end)
        countRef.current = end
      }
    }

    const frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [targetNumber, duration, settings?.reduceMotion])

  return count
}
