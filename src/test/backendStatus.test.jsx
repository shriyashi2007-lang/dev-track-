import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BackendStatus } from '../components/BackendStatus'
import { useBackendHealth } from '../hooks/useBackendHealth'

const healthyPayload = {
  success: true,
  status: 'ok',
  service: 'devtrack-api',
  timestamp: '2026-10-27T12:00:00.000Z',
}

function Harness() {
  const { health, retry } = useBackendHealth()
  return <BackendStatus health={health} onRetry={retry} />
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('BackendStatus', () => {
  it('moves from checking to connected without polling', async () => {
    let resolveRequest
    const fetchMock = vi.fn(() => new Promise((resolve) => {
      resolveRequest = resolve
    }))
    vi.stubGlobal('fetch', fetchMock)

    render(<Harness />)
    expect(screen.getByText('Checking backend')).toBeInTheDocument()

    resolveRequest({ ok: true, status: 200, json: vi.fn().mockResolvedValue(healthyPayload) })
    expect(await screen.findByText('Backend connected')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows the offline-safe explanation and reconnects on retry', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(healthyPayload),
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<Harness />)
    expect(await screen.findByText('Backend offline')).toBeInTheDocument()
    expect(screen.getByText(/Your data is stored locally and DevTrack works offline/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Retry backend connection' }))

    await waitFor(() => expect(screen.getByText('Backend connected')).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
