/**
 * Filters a list of problems based on filter criteria
 */
export function filterProblems(problems = [], criteria = {}) {
  const {
    search = '',
    difficulties = [],
    topics = [],
    platforms = [],
    status = 'all',
    revisionOnly = false,
  } = criteria

  const cleanSearch = (search || '').trim().toLowerCase()

  return problems.filter((problem) => {
    // Search text across title, notes, and topics
    if (cleanSearch) {
      const matchTitle = (problem.title || '').toLowerCase().includes(cleanSearch)
      const matchNotes = (problem.notes || '').toLowerCase().includes(cleanSearch)
      const matchTopics = Array.isArray(problem.topics) &&
        problem.topics.some((t) => t.toLowerCase().includes(cleanSearch))
      const matchPlatform = (problem.platform || '').toLowerCase().includes(cleanSearch)

      if (!matchTitle && !matchNotes && !matchTopics && !matchPlatform) {
        return false
      }
    }

    // Difficulty filter
    if (difficulties.length > 0 && !difficulties.includes(problem.difficulty)) {
      return false
    }

    // Topic filter (any match)
    if (topics.length > 0) {
      const hasTopic = Array.isArray(problem.topics) &&
        problem.topics.some((t) => topics.includes(t))
      if (!hasTopic) return false
    }

    // Platform filter
    if (platforms.length > 0 && !platforms.includes(problem.platform)) {
      return false
    }

    // Status filter
    if (status && status !== 'all' && problem.status !== status) {
      return false
    }

    // Revision marked
    if (revisionOnly && !problem.revision?.marked) {
      return false
    }

    return true
  })
}

/**
 * Parses search params from URL into filter object
 */
export function parseFilterParams(searchParams) {
  const search = searchParams.get('q') || ''
  const diffParam = searchParams.get('diff')
  const difficulties = diffParam ? diffParam.split(',').filter(Boolean) : []
  const topicParam = searchParams.get('topic')
  const topics = topicParam ? topicParam.split(',').filter(Boolean) : []
  const platformParam = searchParams.get('platform')
  const platforms = platformParam ? platformParam.split(',').filter(Boolean) : []
  const status = searchParams.get('status') || 'all'
  const revisionOnly = searchParams.get('revision') === 'true'
  const sort = searchParams.get('sort') || 'newest'

  return {
    search,
    difficulties,
    topics,
    platforms,
    status,
    revisionOnly,
    sort,
  }
}

/**
 * Serializes filter object to URLSearchParams
 */
export function serializeFilterParams(filters = {}) {
  const params = new URLSearchParams()
  if (filters.search) params.set('q', filters.search)
  if (filters.difficulties && filters.difficulties.length > 0) {
    params.set('diff', filters.difficulties.join(','))
  }
  if (filters.topics && filters.topics.length > 0) {
    params.set('topic', filters.topics.join(','))
  }
  if (filters.platforms && filters.platforms.length > 0) {
    params.set('platform', filters.platforms.join(','))
  }
  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status)
  }
  if (filters.revisionOnly) {
    params.set('revision', 'true')
  }
  if (filters.sort && filters.sort !== 'newest') {
    params.set('sort', filters.sort)
  }
  return params
}
