import { getLocalDateString, toDate, subDays } from './dates'

/**
 * Calculates current streak, longest streak, and streak activity
 * @param {Array} problems - Array of problem objects
 * @param {Date} [referenceDate=new Date()] - Reference date for calculation
 */
export function calculateStreaks(problems = [], referenceDate = new Date()) {
  if (!problems || problems.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      isStreakAtRisk: false,
      activeDaysCount: 0,
      last7Days: generateLast7Days(new Set(), referenceDate),
      activeDatesSet: new Set(),
      datesMap: {},
    }
  }

  // Collect unique local date strings for all Solved problems
  const datesMap = {} // dateStr -> count
  for (const p of problems) {
    if (p.status === 'Solved' && p.solvedDate) {
      const d = toDate(p.solvedDate)
      if (d) {
        const dateStr = getLocalDateString(d)
        datesMap[dateStr] = (datesMap[dateStr] || 0) + 1
      }
    }
  }

  const activeDates = Object.keys(datesMap).sort() // ascending 'YYYY-MM-DD'
  const activeDatesSet = new Set(activeDates)
  const activeDaysCount = activeDates.length

  if (activeDaysCount === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      isStreakAtRisk: false,
      activeDaysCount: 0,
      last7Days: generateLast7Days(activeDatesSet, referenceDate),
      activeDatesSet,
      datesMap,
    }
  }

  // Calculate longest streak across history
  let longestStreak = 0
  let currentRunning = 0
  let prevDate = null

  for (const dateStr of activeDates) {
    if (!prevDate) {
      currentRunning = 1
    } else {
      const prevD = new Date(prevDate + 'T00:00:00')
      const currD = new Date(dateStr + 'T00:00:00')
      const diffTime = currD - prevD
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        currentRunning += 1
      } else {
        currentRunning = 1
      }
    }
    if (currentRunning > longestStreak) {
      longestStreak = currentRunning
    }
    prevDate = dateStr
  }

  // Calculate current streak ending today or yesterday
  const todayStr = getLocalDateString(referenceDate)
  const yesterdayStr = getLocalDateString(subDays(referenceDate, 1))

  const hasToday = activeDatesSet.has(todayStr)
  const hasYesterday = activeDatesSet.has(yesterdayStr)

  let currentStreak = 0
  let isStreakAtRisk = false

  if (hasToday) {
    // Streak ends today: walk backwards from today
    let checkDate = referenceDate
    while (activeDatesSet.has(getLocalDateString(checkDate))) {
      currentStreak++
      checkDate = subDays(checkDate, 1)
    }
  } else if (hasYesterday) {
    // No solve today yet, but solved yesterday: streak is alive but at risk!
    isStreakAtRisk = true
    let checkDate = subDays(referenceDate, 1)
    while (activeDatesSet.has(getLocalDateString(checkDate))) {
      currentStreak++
      checkDate = subDays(checkDate, 1)
    }
  } else {
    currentStreak = 0
    isStreakAtRisk = false
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak
  }

  const last7Days = generateLast7Days(activeDatesSet, referenceDate)

  return {
    currentStreak,
    longestStreak,
    isStreakAtRisk,
    activeDaysCount,
    last7Days,
    activeDatesSet,
    datesMap,
  }
}

function generateLast7Days(activeDatesSet, referenceDate) {
  const days = []
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const todayStr = getLocalDateString(referenceDate)

  for (let i = 6; i >= 0; i--) {
    const d = subDays(referenceDate, i)
    const dateStr = getLocalDateString(d)
    const dayOfWeek = dayNames[d.getDay()]

    days.push({
      dateStr,
      dayOfWeek,
      dayNumber: d.getDate(),
      isSolved: activeDatesSet.has(dateStr),
      isToday: dateStr === todayStr,
    })
  }

  return days
}
