import { getLocalDateString, toDate, subDays } from './dates'

export function computeStats(problems = [], dailyGoal = 3, referenceDate = new Date()) {
  const total = problems.length
  let solved = 0
  let todo = 0
  let attempted = 0

  let easy = 0
  let medium = 0
  let hard = 0

  let totalTime = 0
  let timedProblemsCount = 0

  const todayStr = getLocalDateString(referenceDate)
  let todaySolvedCount = 0

  const sevenDaysAgoStr = getLocalDateString(subDays(referenceDate, 7))
  let weekSolvedCount = 0
  let weekMediumCount = 0
  let weekHardCount = 0

  const topicCounts = {}
  const platformCounts = {}

  for (const p of problems) {
    if (p.status === 'Solved') {
      solved++
      if (p.difficulty === 'Easy') easy++
      else if (p.difficulty === 'Medium') medium++
      else if (p.difficulty === 'Hard') hard++

      if (Array.isArray(p.topics)) {
        for (const t of p.topics) {
          topicCounts[t] = (topicCounts[t] || 0) + 1
        }
      }

      if (p.platform) {
        platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1
      }

      if (typeof p.timeTakenMinutes === 'number' && p.timeTakenMinutes > 0) {
        totalTime += p.timeTakenMinutes
        timedProblemsCount++
      }

      if (p.solvedDate) {
        const d = toDate(p.solvedDate)
        if (d) {
          const pDateStr = getLocalDateString(d)
          if (pDateStr === todayStr) {
            todaySolvedCount++
          }
          if (pDateStr >= sevenDaysAgoStr && pDateStr <= todayStr) {
            weekSolvedCount++
            if (p.difficulty === 'Medium') weekMediumCount++
            if (p.difficulty === 'Hard') weekHardCount++
          }
        }
      }
    } else if (p.status === 'Attempted') {
      attempted++
    } else {
      todo++
    }
  }

  const sortedTopics = Object.entries(topicCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: solved > 0 ? Math.round((count / solved) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  const strongestTopic = sortedTopics.length > 0 ? sortedTopics[0] : null
  const weakestTopic =
    sortedTopics.length > 1 ? sortedTopics[sortedTopics.length - 1] : null

  const averageTimeMinutes =
    timedProblemsCount > 0 ? Math.round(totalTime / timedProblemsCount) : 0

  const dailyGoalProgress = Math.min(
    Math.round((todaySolvedCount / Math.max(dailyGoal, 1)) * 100),
    100
  )

  let insight = 'Start solving problems today to build your streak!'
  if (todaySolvedCount >= dailyGoal && dailyGoal > 0) {
    insight = `Target crushed! You completed your daily goal of ${dailyGoal} problems today.`
  } else if (todaySolvedCount > 0) {
    insight = `Great start! ${todaySolvedCount} solved today, ${dailyGoal - todaySolvedCount} more to hit your daily goal.`
  } else if (weekHardCount > 0) {
    insight = `Impressive dedication! You tackled ${weekHardCount} Hard problem${weekHardCount > 1 ? 's' : ''} this week.`
  } else if (weekMediumCount >= 3) {
    insight = `Consistent momentum: ${weekMediumCount} Medium problems conquered in the last 7 days.`
  } else if (solved > 0 && strongestTopic) {
    insight = `Your strongest topic is ${strongestTopic.name} with ${strongestTopic.count} solved problem${strongestTopic.count > 1 ? 's' : ''}.`
  }

  return {
    total,
    solved,
    todo,
    attempted,
    easy,
    medium,
    hard,
    todaySolvedCount,
    dailyGoal,
    dailyGoalProgress,
    weekSolvedCount,
    weekMediumCount,
    weekHardCount,
    topicCounts: sortedTopics,
    strongestTopic,
    weakestTopic,
    platformCounts,
    averageTimeMinutes,
    insight,
  }
}

export function computeActivitySeries(problems = [], days = 7, referenceDate = new Date()) {
  const dateMap = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(referenceDate, i)
    const key = getLocalDateString(d)
    dateMap[key] = {
      date: key,
      displayDate: `${d.getMonth() + 1}/${d.getDate()}`,
      Easy: 0,
      Medium: 0,
      Hard: 0,
      total: 0,
    }
  }

  for (const p of problems) {
    if (p.status === 'Solved' && p.solvedDate) {
      const d = toDate(p.solvedDate)
      if (d) {
        const key = getLocalDateString(d)
        if (dateMap[key]) {
          const diff = p.difficulty || 'Easy'
          dateMap[key][diff] = (dateMap[key][diff] || 0) + 1
          dateMap[key].total += 1
        }
      }
    }
  }

  return Object.values(dateMap)
}
