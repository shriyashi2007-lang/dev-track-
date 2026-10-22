import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { problemService } from '../services/problemService'
import { computeStats } from '../utils/stats'
import { calculateStreaks } from '../utils/streaks'
import { useSettings } from './SettingsContext'
import { useToast } from './ToastContext'

const ProblemsContext = createContext(null)

export function ProblemsProvider({ children }) {
  const [problems, setProblems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { settings } = useSettings()
  const { addToast } = useToast()

  const refreshProblems = useCallback(async () => {
    try {
      const { problems: data, error } = await problemService.getAllWithMeta()
      setProblems(data)
      if (error) {
        addToast({
          type: 'warning',
          title: 'Saved data needs attention',
          message: 'DevTrack could not read the saved problem list. The original browser data was left unchanged.',
          duration: 7000,
        })
      }
    } catch (err) {
      console.error('[ProblemsProvider] Error loading problems:', err)
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
        isLoading,
        stats,
        streaks,
        hasSampleData,
        addProblem,
        updateProblem,
        deleteProblem,
        bulkDeleteProblems,
        bulkUpdateStatus,
        bulkMarkRevision,
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
