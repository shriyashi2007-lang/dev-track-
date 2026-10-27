import { getLocalDateString } from '../utils/dates'

export function downloadJson(data, filename) {
  if (typeof window === 'undefined') return
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportAnalyticsSummary(stats, streaks) {
  const payload = {
    app: 'DevTrack Analytics Export',
    generatedAt: new Date().toISOString(),
    stats,
    streaks: {
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      activeDaysCount: streaks.activeDaysCount,
    },
  }
  const dateStr = getLocalDateString(new Date())
  downloadJson(payload, `devtrack-analytics-${dateStr}.json`)
}
