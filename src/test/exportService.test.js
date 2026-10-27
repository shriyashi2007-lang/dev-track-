import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  downloadJson,
  exportAnalyticsSummary,
} from '../services/exportService'

describe('export service', () => {
  let click
  let createObjectURL
  let revokeObjectURL

  beforeEach(() => {
    click = vi.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    createObjectURL = vi.fn(() => 'blob:devtrack-export')
    revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('downloads formatted JSON and releases the object URL', () => {
    downloadJson({ solved: 3 }, 'summary.json')

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(createObjectURL.mock.calls[0][0]).toBeInstanceOf(Blob)
    expect(createObjectURL.mock.calls[0][0].type).toBe('application/json')
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:devtrack-export')
    expect(document.querySelector('a[download="summary.json"]')).toBeNull()
  })

  it('uses a dated filename for analytics summaries', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 21, 12))

    exportAnalyticsSummary(
      { solved: 4 },
      { currentStreak: 2, longestStreak: 5, activeDaysCount: 8 }
    )

    const downloads = click.mock.instances.map((anchor) => anchor.download)
    expect(downloads).toEqual(['devtrack-analytics-2026-10-21.json'])
    expect(revokeObjectURL).toHaveBeenCalledOnce()
  })
})
