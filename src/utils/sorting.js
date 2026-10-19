const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 }

export function sortProblems(problems = [], sortBy = 'newest') {
  const cloned = [...problems]

  return cloned.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return (b.solvedDate || b.createdAt || '').localeCompare(
          a.solvedDate || a.createdAt || ''
        )
      case 'oldest':
        return (a.solvedDate || a.createdAt || '').localeCompare(
          b.solvedDate || b.createdAt || ''
        )
      case 'title-asc':
        return (a.title || '').localeCompare(b.title || '')
      case 'title-desc':
        return (b.title || '').localeCompare(a.title || '')
      case 'difficulty-asc':
        return (
          (difficultyOrder[a.difficulty] || 0) -
          (difficultyOrder[b.difficulty] || 0)
        )
      case 'difficulty-desc':
        return (
          (difficultyOrder[b.difficulty] || 0) -
          (difficultyOrder[a.difficulty] || 0)
        )
      case 'time-asc':
        return (a.timeTakenMinutes || 9999) - (b.timeTakenMinutes || 9999)
      case 'time-desc':
        return (b.timeTakenMinutes || 0) - (a.timeTakenMinutes || 0)
      default:
        return 0
    }
  })
}
