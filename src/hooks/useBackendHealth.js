import { useCallback, useEffect, useRef, useState } from 'react'
import { checkHealth } from '../services/api'

const CHECKING = Object.freeze({ state: 'checking', reason: null })

export function useBackendHealth() {
  const [health, setHealth] = useState(CHECKING)
  const controllerRef = useRef(null)
  const requestIdRef = useRef(0)

  const retry = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    controllerRef.current?.abort()

    const controller = new AbortController()
    controllerRef.current = controller
    setHealth(CHECKING)

    const result = await checkHealth({ signal: controller.signal })
    if (controller.signal.aborted || requestId !== requestIdRef.current) return

    setHealth(result.connected
      ? { state: 'connected', reason: null }
      : { state: 'disconnected', reason: result.reason })
  }, [])

  useEffect(() => {
    retry()

    return () => {
      requestIdRef.current += 1
      controllerRef.current?.abort()
    }
  }, [retry])

  return { health, retry }
}
