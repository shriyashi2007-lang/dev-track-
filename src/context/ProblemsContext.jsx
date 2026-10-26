import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { problemService } from '../services/problemService'
import { computeStats } from '../utils/stats'
import { calculateStreaks } from '../utils/streaks'
import { useSettings } from './SettingsContext'
import { useToast } from './ToastContext'
import { STORAGE_KEYS } from '../data/constants'

const ProblemsContext = createContext(null)

export function ProblemsProvider({ children }) {
  const [problems, setProblems] = useState([])
  const [revisionHistory, setRevisionHistory] = useState([])
  const [revisionRepairCount, setRevisionRepairCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const { settings } = useSettings()
  const { addToast } = useToast()

  const refreshProblems = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const { problems: data, error, revisionHistory: history, revisionError, repairedCount } = await problemService.getAllWithMeta()
      setProblems(data)
      setRevisionHistory(history)
      setRevisionRepairCount(repairedCount)
      if (error) {
        setLoadError(error)
        addToast({
          type: 'warning',
          title: 'Saved data needs attention',
          message: 'DevTrack could not read the saved problem list. The original browser data was left unchanged.',
          duration: 7000,
        })
      }
      if (revisionError) {
        addToast({
          type: 'warning',
          title: 'Revision history needs attention',
          message: 'DevTrack left the unreadable history data unchanged and loaded the queue safely.',
          duration: 7000,
        })
      }
    } catch (err) {
      console.error('[ProblemsProvider] Error loading problems:', err)
      setLoadError(err)
      addToast({
        type: 'error',
        title: 'Error loading data',
        message: 'Could not load your saved problems.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    refreshProblems()
  }, [refreshProblems])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEYS.PROBLEMS || event.key === STORAGE_KEYS.REVISION_HISTORY) refreshProblems()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [refreshProblems])

  const addProblem = useCallback(
    async (problemData) => {
      try {
        const created = await problemService.create(problemData)
        setProblems((prev) => [created, ...prev])
        addToast({
          type: 'success',
          title: 'Problem added',
          message: `"${created.title}" was added successfully.`,
        })
        return created
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Failed to add problem',
          message: err.message,
        })
        throw err
      }
    },
    [addToast]
  )

  const updateProblem = useCallback(
    async (id, updates) => {
      try {
        const updated = await problemService.update(id, updates)
        setProblems((prev) => prev.map((p) => (p.id === id ? updated : p)))
        addToast({
          type: 'success',
          title: 'Problem updated',
          message: `Changes saved for "${updated.title}".`,
        })
        return updated
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Failed to update problem',
          message: err.message,
        })
        throw err
      }
    },
    [addToast]
  )

  const deleteProblem = useCallback(
    async (id) => {
      try {
        const removed = await problemService.remove(id)
        if (!removed) return
        setProblems((prev) => prev.filter((p) => p.id !== id))

        // 5-second Undo toast
        addToast({
          type: 'info',
          title: 'Problem deleted',
          message: `"${removed.title}" removed.`,
          actionLabel: 'Undo',
          duration: 5000,
          onUndo: async () => {
            await problemService.restore(removed)
            setProblems((prev) => [removed, ...prev])
            addToast({
              type: 'success',
              title: 'Problem restored',
              message: `"${removed.title}" was restored.`,
            })
          },
        })
        return removed
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Failed to delete problem',
          message: err.message,
        })
      }
    },
    [addToast]
  )

  const bulkDeleteProblems = useCallback(
    async (ids) => {
      try {
        const removedItems = await problemService.bulkRemove(ids)
        const idSet = new Set(ids)
        setProblems((prev) => prev.filter((p) => !idSet.has(p.id)))

        // Undo bulk delete
        addToast({
          type: 'info',
          title: 'Problems deleted',
          message: `${removedItems.length} problem(s) removed.`,
          actionLabel: 'Undo',
          duration: 5000,
          onUndo: async () => {
            for (const item of removedItems) {
              await problemService.restore(item)
            }
            setProblems((prev) => [...removedItems, ...prev])
            addToast({
              type: 'success',
              title: 'Problems restored',
              message: `${removedItems.length} problem(s) restored.`,
            })
          },
        })
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Failed to delete problems',
          message: err.message,
        })
      }
    },
    [addToast]
  )

  const bulkUpdateStatus = useCallback(
    async (ids, status) => {
      try {
        const updated = await problemService.bulkUpdateStatus(ids, status)
        setProblems(updated)
        addToast({
          type: 'success',
          title: 'Status updated',
          message: `Updated status to "${status}" for ${ids.length} problem(s).`,
        })
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Failed to update status',
          message: err.message,
        })
      }
    },
    [addToast]
  )

  const bulkMarkRevision = useCallback(
    async (ids, marked, priority) => {
      try {
        const updated = await problemService.bulkMarkRevision(ids, marked, priority)
        setProblems(updated)
        addToast({
          type: 'success',
          title: 'Revision updated',
          message: `Updated revision for ${ids.length} problem(s).`,
        })
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Failed to update revision',
          message: err.message,
        })
      }
    },
    [addToast]
  )

  const setProblemRevision = useCallback(
    async (id, marked, priority = 'Medium') => {
      try {
        const updated = await problemService.setRevisionMarked(id, marked, priority)
        setProblems((prev) => prev.map((problem) => problem.id === id ? updated : problem))
        addToast({
          type: marked ? 'success' : 'info',
          title: marked ? 'Added to revision queue' : 'Removed from revision queue',
          message: marked ? `"${updated.title}" is scheduled for tomorrow.` : `"${updated.title}" was removed; its history was preserved.`,
        })
        return updated
      } catch (err) {
        addToast({ type: 'error', title: 'Revision update failed', message: err.message })
        throw err
      }
    },
    [addToast]
  )

  const completeProblemRevision = useCallback(
    async (id, expectedCycle = null) => {
      try {
        const result = await problemService.completeRevision(id, new Date(), expectedCycle)
        if (result.duplicate) {
          addToast({ type: 'warning', title: 'Already completed', message: 'This due cycle was already recorded.' })
          return result
        }
        setProblems((prev) => prev.map((problem) => problem.id === id ? result.problem : problem))
        setRevisionHistory((prev) => [...prev, result.historyRecord])
        addToast({ type: 'success', title: 'Revision completed', message: `Next revision: ${result.problem.revision.nextRevisionDate}.` })
        return result
      } catch (err) {
        addToast({ type: 'error', title: 'Could not complete revision', message: err.message })
        throw err
      }
    },
    [addToast]
  )

  const rescheduleProblemRevision = useCallback(
    async (id, nextRevisionDate) => {
      try {
        const updated = await problemService.rescheduleRevision(id, nextRevisionDate)
        setProblems((prev) => prev.map((problem) => problem.id === id ? updated : problem))
        addToast({ type: 'success', title: 'Revision rescheduled', message: `New date: ${nextRevisionDate}.` })
        return updated
      } catch (err) {
        addToast({ type: 'error', title: 'Could not reschedule', message: err.message })
        throw err
      }
    },
    [addToast]
  )

  const changeRevisionPriority = useCallback(
    async (id, priority) => {
      try {
        const updated = await problemService.setRevisionPriority(id, priority)
        setProblems((prev) => prev.map((problem) => problem.id === id ? updated : problem))
        return updated
      } catch (err) {
        addToast({ type: 'error', title: 'Could not change priority', message: err.message })
        throw err
      }
    },
    [addToast]
  )

  const loadSampleData = useCallback(async () => {
    try {
      const data = await problemService.loadSampleData()
      setProblems(data)
      addToast({
        type: 'success',
        title: 'Sample data loaded',
        message: 'Loaded sample problem set for demonstration.',
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to load sample data',
        message: err.message,
      })
    }
  }, [addToast])

  const clearSampleData = useCallback(async () => {
    try {
      const remaining = await problemService.clearSampleData()
      setProblems(remaining)
      addToast({
        type: 'info',
        title: 'Sample data cleared',
        message: 'Removed all sample demo problems.',
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to clear sample data',
        message: err.message,
      })
    }
  }, [addToast])

  const importProblems = useCallback(
    async (importedList, mode = 'merge') => {
      try {
        const result = await problemService.importProblems(importedList, mode)
        setProblems(result)
        addToast({
          type: 'success',
          title: 'Import complete',
          message: `Imported ${importedList.length} problem(s) successfully.`,
        })
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Import failed',
          message: err.message,
        })
        throw err
      }
    },
    [addToast]
  )

  // Derived state memoized
  const stats = useMemo(() => {
    return computeStats(problems, settings.dailyGoal)
  }, [problems, settings.dailyGoal])

  const streaks = useMemo(() => {
    return calculateStreaks(problems)
  }, [problems])

  const hasSampleData = useMemo(() => {
    return problems.some((p) => p.isSample)
  }, [problems])

  return (
    <ProblemsContext.Provider
      value={{
        problems,
        revisionHistory,
        revisionRepairCount,
        isLoading,
        loadError,
        stats,
        streaks,
        hasSampleData,
        addProblem,
        updateProblem,
        deleteProblem,
        bulkDeleteProblems,
        bulkUpdateStatus,
        bulkMarkRevision,
        setProblemRevision,
        completeProblemRevision,
        rescheduleProblemRevision,
        changeRevisionPriority,
        loadSampleData,
        clearSampleData,
        importProblems,
        refreshProblems,
      }}
    >
      {children}
    </ProblemsContext.Provider>
  )
}

export function useProblems() {
  const context = useContext(ProblemsContext)
  if (!context) {
    throw new Error('useProblems must be used within a ProblemsProvider')
  }
  return context
}
