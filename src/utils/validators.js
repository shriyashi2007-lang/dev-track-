import { PLATFORMS, DIFFICULTIES, STATUSES, PRIORITIES } from '../data/constants'
import { toDate, getLocalDateString } from './dates'

export function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return true // optional
  const trimmed = urlString.trim()
  if (!trimmed) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateProblem(problem) {
  const errors = {}

  // Title
  const title = (problem.title || '').trim()
  if (!title) {
    errors.title = 'Title is required'
  } else if (title.length < 2) {
    errors.title = 'Title must be at least 2 characters'
  } else if (title.length > 120) {
    errors.title = 'Title must be 120 characters or fewer'
  }

  // Platform
  if (!problem.platform || !PLATFORMS.includes(problem.platform)) {
    errors.platform = `Platform must be one of: ${PLATFORMS.join(', ')}`
  }

  // Difficulty
  if (!problem.difficulty || !DIFFICULTIES.includes(problem.difficulty)) {
    errors.difficulty = `Difficulty must be Easy, Medium, or Hard`
  }

  // Topics
  if (!Array.isArray(problem.topics) || problem.topics.length === 0) {
    errors.topics = 'Select at least one topic'
  }

  // Status
  if (!problem.status || !STATUSES.includes(problem.status)) {
    errors.status = `Status must be Todo, Attempted, or Solved`
  }

  // Solved Date
  if (problem.status === 'Solved') {
    if (!problem.solvedDate) {
      errors.solvedDate = 'Solved date is required when status is Solved'
    } else {
      const parsedDate = toDate(problem.solvedDate)
      if (!parsedDate) {
        errors.solvedDate = 'Invalid date format'
      } else {
        const todayStr = getLocalDateString(new Date())
        const solvedStr = getLocalDateString(parsedDate)
        if (solvedStr > todayStr) {
          errors.solvedDate = 'Solved date cannot be in the future'
        }
      }
    }
  }

  // URL
  if (problem.url && !isValidUrl(problem.url)) {
    errors.url = 'Must be a valid URL starting with http:// or https://'
  }

  // Priority
  if (
    problem.revision?.marked &&
    problem.revision?.priority &&
    !PRIORITIES.includes(problem.revision.priority)
  ) {
    errors.priority = 'Priority must be High, Medium, or Low'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateImportData(data) {
  if (!Array.isArray(data)) {
    return {
      isValid: false,
      validItems: [],
      error: 'Import file must be a JSON array of problems',
    }
  }

  const validItems = []
  let rejectedCount = 0

  for (const item of data) {
    if (item && typeof item === 'object') {
      const { isValid } = validateProblem(item)
      if (isValid) {
        validItems.push(item)
      } else {
        rejectedCount++
      }
    } else {
      rejectedCount++
    }
  }

  return {
    isValid: validItems.length > 0,
    validItems,
    rejectedCount,
    totalCount: data.length,
    error: validItems.length === 0 ? 'No valid problem entries found in the file' : null,
  }
}
