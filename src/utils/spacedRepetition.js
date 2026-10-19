import { getLocalDateString, toDate, addDays } from './dates'

/**
 * Calculates the next revision date given confidence and revision count
 * @param {Object} options
 * @param {string} options.confidence - 'Hard' | 'Okay' | 'Easy'
 * @param {number} options.currentCount - Number of times already revised
 * @param {number[]} options.intervals - e.g. [1, 3, 7, 14, 30]
 * @param {Date} [options.fromDate=new Date()]
 */
export function calculateNextRevision({
  confidence = 'Okay',
  currentCount = 0,
  intervals = [1, 3, 7, 14, 30],
  fromDate = new Date(),
}) {
  let nextIndex = 0

  if (confidence === 'Hard') {
    nextIndex = 0
  } else if (confidence === 'Easy') {
    nextIndex = Math.min(currentCount + 2, intervals.length - 1)
  } else {
    nextIndex = Math.min(currentCount + 1, intervals.length - 1)
  }

  const daysToAdd = intervals[nextIndex] || 1
  const nextDate = addDays(fromDate, daysToAdd)

  return {
    nextRevisionDate: getLocalDateString(nextDate),
    nextCount: currentCount + 1,
    daysAdded: daysToAdd,
  }
}

/**
 * Categorizes problems marked for revision into Due Today, Overdue, Upcoming, Completed
 */
export function categorizeRevisions(problems = [], referenceDate = new Date()) {
  const todayStr = getLocalDateString(referenceDate)

  const dueToday = []
  const overdue = []
  const upcoming = []
  const completed = []

  for (const p of problems) {
    if (!p.revision || !p.revision.marked) continue

    const nextDate = p.revision.nextRevisionDate
    if (!nextDate) {
      dueToday.push(p)
      continue
    }

    const nextD = toDate(nextDate)
    if (!nextD) continue
    const dateStr = getLocalDateString(nextD)

    if (p.revision.revisionCount >= 5 && p.revision.isCompleted) {
      completed.push(p)
      continue
    }

    if (dateStr === todayStr) {
      dueToday.push(p)
    } else if (dateStr < todayStr) {
      overdue.push(p)
    } else {
      upcoming.push(p)
    }
  }

  const priorityWeight = { High: 3, Medium: 2, Low: 1 }

  overdue.sort((a, b) => (a.revision?.nextRevisionDate || '').localeCompare(b.revision?.nextRevisionDate || ''))
  dueToday.sort((a, b) => (priorityWeight[b.revision?.priority] || 0) - (priorityWeight[a.revision?.priority] || 0))
  upcoming.sort((a, b) => (a.revision?.nextRevisionDate || '').localeCompare(b.revision?.nextRevisionDate || ''))

  return {
    dueToday,
    overdue,
    upcoming,
    completed,
    counts: {
      dueToday: dueToday.length,
      overdue: overdue.length,
      upcoming: upcoming.length,
      completed: completed.length,
      totalActive: dueToday.length + overdue.length,
    },
  }
}
