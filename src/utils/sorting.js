const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 }

export function sortProblems(problems = [], sortBy = 'newest') {
  const cloned = problems.map((problem, index) => ({ problem, index }))

  return cloned.sort((left, right) => {
    const a = left.problem
    const b = right.problem
    let comparison = 0
    switch (sortBy) {
      case 'newest': {
        const aDate = a.solvedDate || a.createdAt || ''
        const bDate = b.solvedDate || b.createdAt || ''
        comparison = aDate && bDate ? bDate.localeCompare(aDate) : aDate ? -1 : bDate ? 1 : 0
        break
      }
      case 'oldest': {
        const aDate = a.solvedDate || a.createdAt || ''
        const bDate = b.solvedDate || b.createdAt || ''
        comparison = aDate && bDate ? aDate.localeCompare(bDate) : aDate ? -1 : bDate ? 1 : 0
        break
      }
      case 'title-asc':
        comparison = (a.title || '').localeCompare(b.title || '')
        break
      case 'title-desc':
        comparison = (b.title || '').localeCompare(a.title || '')
        break
      case 'difficulty-asc':
        comparison = (
          (difficultyOrder[a.difficulty] || 0) -
          (difficultyOrder[b.difficulty] || 0)
        )
        break
      case 'difficulty-desc':
        comparison = (
          (difficultyOrder[b.difficulty] || 0) -
          (difficultyOrder[a.difficulty] || 0)
        )
        break
      case 'time-asc':
        comparison = (a.timeTakenMinutes || 9999) - (b.timeTakenMinutes || 9999)
        break
      case 'time-desc':
        comparison = (b.timeTakenMinutes || 0) - (a.timeTakenMinutes || 0)
        break
      default:
        comparison = 0
    }
    return comparison || left.index - right.index
  }).map(({ problem }) => problem)
}
