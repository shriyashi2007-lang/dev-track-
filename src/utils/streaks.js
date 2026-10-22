import { getLocalDateString, subDays } from './dates'
import { getCurrentStreak, getLongestStreak, getWeeklyProgress } from './dashboardMetrics'
import { normalizeProblems } from './problemNormalizer'

export function calculateStreaks(problems = [], referenceDate = new Date()) {
  const records = normalizeProblems(problems)
  const weekly = getWeeklyProgress(records, referenceDate)
  const today = getLocalDateString(referenceDate)
  const datesMap = {}

  records.forEach((problem) => {
    if (problem.solvedDate && problem.solvedDate <= today) {
      datesMap[problem.solvedDate] = (datesMap[problem.solvedDate] || 0) + 1
    }
  })
  const activeDatesSet = new Set(Object.keys(datesMap))
  const yesterday = getLocalDateString(subDays(referenceDate, 1))

  return {
    currentStreak: getCurrentStreak(records, referenceDate),
    longestStreak: getLongestStreak(records, referenceDate),
    isStreakAtRisk: !activeDatesSet.has(today) && activeDatesSet.has(yesterday),
    activeDaysCount: activeDatesSet.size,
    last7Days: weekly.map((day) => ({
      dateStr: day.date,
      dayOfWeek: day.label,
      dayNumber: Number(day.date.slice(-2)),
      isSolved: day.count > 0,
      isToday: day.date === today,
    })),
    activeDatesSet,
    datesMap,
  }
}
