import { getLocalDateString, subDays } from './dates'
import { normalizeProblems } from './problemNormalizer'
import { isSolvedProblem } from './dashboardMetrics'
import { getDailySolvedSeries, normalizeAnalyticsRecords } from './analytics'

export function computeStats(problems = [], dailyGoal = 3, referenceDate = new Date()) {
  const records = normalizeProblems(problems)
  const todayStr = getLocalDateString(referenceDate)
  const weekStart = getLocalDateString(subDays(referenceDate, 6))
  const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0, Unknown: 0 }
  const topicCounts = {}
  const platformCounts = {}
  let solved = 0
  let todo = 0
  let attempted = 0
  let totalTime = 0
  let timedProblemsCount = 0
  let todaySolvedCount = 0
  let weekSolvedCount = 0
  let weekMediumCount = 0
  let weekHardCount = 0

  records.forEach((problem) => {
    if (!isSolvedProblem(problem, referenceDate)) {
      if (problem.status === 'Attempted') attempted += 1
      else todo += 1
      return
    }

    solved += 1
    difficultyCounts[problem.difficulty] += 1
    problem.topics.forEach((topic) => { topicCounts[topic] = (topicCounts[topic] || 0) + 1 })
    platformCounts[problem.platform] = (platformCounts[problem.platform] || 0) + 1

    if (problem.timeTakenMinutes) {
      totalTime += problem.timeTakenMinutes
      timedProblemsCount += 1
    }
    if (problem.solvedDate === todayStr) todaySolvedCount += 1
    if (problem.solvedDate && problem.solvedDate >= weekStart && problem.solvedDate <= todayStr) {
      weekSolvedCount += 1
      if (problem.difficulty === 'Medium') weekMediumCount += 1
      if (problem.difficulty === 'Hard') weekHardCount += 1
    }
  })

  const sortedTopics = Object.entries(topicCounts)
    .map(([name, count]) => ({ name, count, percentage: solved ? Math.round((count / solved) * 100) : 0 }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
  const strongestTopic = sortedTopics[0] || null
  const weakestTopic = sortedTopics.length > 1 ? sortedTopics.at(-1) : null
  const goal = Math.max(Number(dailyGoal) || 0, 0)
  const dailyGoalProgress = goal ? Math.min(Math.round((todaySolvedCount / goal) * 100), 100) : 0

  let insight = 'Start solving problems today to build your streak!'
  if (goal > 0 && todaySolvedCount >= goal) {
    insight = `Target crushed! You completed your daily goal of ${goal} problems today.`
  } else if (todaySolvedCount > 0) {
    insight = `Great start! ${todaySolvedCount} solved today, ${Math.max(goal - todaySolvedCount, 0)} more to hit your daily goal.`
  } else if (weekHardCount > 0) {
    insight = `Impressive dedication! You tackled ${weekHardCount} Hard problem${weekHardCount === 1 ? '' : 's'} this week.`
  } else if (weekMediumCount >= 3) {
    insight = `Consistent momentum: ${weekMediumCount} Medium problems conquered in the last 7 days.`
  } else if (solved > 0 && strongestTopic) {
    insight = `Your strongest topic is ${strongestTopic.name} with ${strongestTopic.count} solved problem${strongestTopic.count === 1 ? '' : 's'}.`
  }

  return {
    total: records.length,
    solved,
    todo,
    attempted,
    easy: difficultyCounts.Easy,
    medium: difficultyCounts.Medium,
    hard: difficultyCounts.Hard,
    unknown: difficultyCounts.Unknown,
    todaySolvedCount,
    dailyGoal: goal,
    dailyGoalProgress,
    weekSolvedCount,
    weekMediumCount,
    weekHardCount,
    topicCounts: sortedTopics,
    strongestTopic,
    weakestTopic,
    platformCounts,
    averageTimeMinutes: timedProblemsCount ? Math.round(totalTime / timedProblemsCount) : 0,
    insight,
  }
}

export function computeActivitySeries(problems = [], days = 7, referenceDate = new Date()) {
  const records = normalizeAnalyticsRecords(problems)
  return getDailySolvedSeries(problems, days, referenceDate).map((day) => {
    const daily = records.filter((problem) => problem.solvedDate === day.date)
    return {
      ...day,
      displayDate: day.date.slice(5).replace('-', '/'),
      Easy: daily.filter((problem) => problem.difficulty === 'Easy').length,
      Medium: daily.filter((problem) => problem.difficulty === 'Medium').length,
      Hard: daily.filter((problem) => problem.difficulty === 'Hard').length,
      total: daily.length,
    }
  })
}
