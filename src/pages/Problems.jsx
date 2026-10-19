import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Code2,
  Trash2,
  X,
  Plus,
  Database,
} from 'lucide-react'
import { useProblems } from '../context/ProblemsContext'
import { useSettings } from '../context/SettingsContext'
import { filterProblems, parseFilterParams, serializeFilterParams } from '../utils/filters'
import { sortProblems } from '../utils/sorting'
import { useDebounce } from '../hooks/useDebounce'
import { ProblemsFilterBar } from '../components/problems/ProblemsFilterBar'
import { ProblemsTable } from '../components/problems/ProblemsTable'
import { ProblemsBoard } from '../components/problems/ProblemsBoard'
import { ImportModal } from '../components/problems/ImportModal'
import { ProblemDrawer } from '../components/problems/ProblemDrawer'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { exportAllData } from '../services/exportService'

export default function Problems() {
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    problems,
    addProblem,
    updateProblem,
    deleteProblem,
    bulkDeleteProblems,
    bulkUpdateStatus,
    bulkMarkRevision,
    loadSampleData,
    importProblems,
  } = useProblems()
  const { settings } = useSettings()

  // Parse URL search parameters on mount
  const initialFilters = useMemo(() => parseFilterParams(searchParams), [searchParams])

  // Local filter states
  const [searchInput, setSearchInput] = useState(initialFilters.search)
  const debouncedSearch = useDebounce(searchInput, 250)
  const [difficulties, setDifficulties] = useState(initialFilters.difficulties)
  const [selectedTopics, setSelectedTopics] = useState(initialFilters.topics)
  const [selectedPlatforms, setSelectedPlatforms] = useState(initialFilters.platforms)
  const [status, setStatus] = useState(initialFilters.status)
  const [revisionOnly, setRevisionOnly] = useState(initialFilters.revisionOnly)
  const [sort, setSort] = useState(initialFilters.sort)

  const [viewMode, setViewMode] = useState('table') // 'table' | 'board'
  const [pageSize, setPageSize] = useState(settings.pageSize || 25)
  const [currentPage, setCurrentPage] = useState(1)

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState([])

  // Modal / Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingProblem, setEditingProblem] = useState(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)

  // Sync state back to URLSearchParams
  useEffect(() => {
    const params = serializeFilterParams({
      search: debouncedSearch,
      difficulties,
      topics: selectedTopics,
      platforms: selectedPlatforms,
      status,
      revisionOnly,
      sort,
    })
    setSearchParams(params, { replace: true })
  }, [debouncedSearch, difficulties, selectedTopics, selectedPlatforms, status, revisionOnly, sort, setSearchParams])

  // Filter and sort problems
  const filteredProblems = useMemo(() => {
    const filtered = filterProblems(problems, {
      search: debouncedSearch,
      difficulties,
      topics: selectedTopics,
      platforms: selectedPlatforms,
      status,
      revisionOnly,
    })
    return sortProblems(filtered, sort)
  }, [problems, debouncedSearch, difficulties, selectedTopics, selectedPlatforms, status, revisionOnly, sort])

  // Paginated view for table
  const paginatedProblems = useMemo(() => {
    if (viewMode === 'board') return filteredProblems
    const start = (currentPage - 1) * pageSize
    return filteredProblems.slice(start, start + pageSize)
  }, [filteredProblems, currentPage, pageSize, viewMode])

  const totalPages = Math.ceil(filteredProblems.length / pageSize) || 1

  const handleSearchChange = (val) => {
    setSearchInput(val)
    setCurrentPage(1)
  }

  const handleDifficultyToggle = (diff) => {
    setDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    )
    setCurrentPage(1)
  }

  const handleTopicToggle = (t) => {
    setSelectedTopics((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    )
    setCurrentPage(1)
  }

  const handlePlatformToggle = (p) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    )
    setCurrentPage(1)
  }

  const handleStatusChange = (st) => {
    setStatus(st)
    setCurrentPage(1)
  }

  const handleRevisionToggleFilter = () => {
    setRevisionOnly(!revisionOnly)
    setCurrentPage(1)
  }

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    difficulties.length > 0 ||
    selectedTopics.length > 0 ||
    selectedPlatforms.length > 0 ||
    status !== 'all' ||
    revisionOnly

  const handleClearFilters = () => {
    setSearchInput('')
    setDifficulties([])
    setSelectedTopics([])
    setSelectedPlatforms([])
    setStatus('all')
    setRevisionOnly(false)
    setSort('newest')
    setCurrentPage(1)
  }

  // Row selection
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedProblems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedProblems.map((p) => p.id))
    }
  }

  // Inline status cycling: Todo -> Attempted -> Solved -> Todo
  const handleStatusCycle = (problem) => {
    const nextStatus =
      problem.status === 'Todo'
        ? 'Attempted'
        : problem.status === 'Attempted'
        ? 'Solved'
        : 'Todo'
    updateProblem(problem.id, { status: nextStatus })
  }

  const handleToggleRevision = (problem) => {
    const isMarked = !problem.revision?.marked
    updateProblem(problem.id, {
      revision: {
        ...problem.revision,
        marked: isMarked,
        priority: problem.revision?.priority || 'Medium',
      },
    })
  }

  const handleEdit = (problem) => {
    setEditingProblem(problem)
    setIsDrawerOpen(true)
  }

  const handleAddNew = () => {
    setEditingProblem(null)
    setIsDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Filter and View Controls Bar */}
      <ProblemsFilterBar
        search={searchInput}
        onSearchChange={handleSearchChange}
        difficulties={difficulties}
        onDifficultyToggle={handleDifficultyToggle}
        selectedTopics={selectedTopics}
        onTopicToggle={handleTopicToggle}
        selectedPlatforms={selectedPlatforms}
        onPlatformToggle={handlePlatformToggle}
        status={status}
        onStatusChange={handleStatusChange}
        revisionOnly={revisionOnly}
        onRevisionToggle={handleRevisionToggleFilter}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAdd={handleAddNew}
        onExport={() => exportAllData(problems, settings)}
        totalFilteredCount={filteredProblems.length}
      />

      {/* Floating Bulk Actions Bar when rows are selected */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-card flex flex-wrap items-center justify-between gap-3 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-primary font-mono">
              {selectedIds.length} problem{selectedIds.length === 1 ? '' : 's'} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-content-muted hover:text-content-primary underline cursor-pointer"
            >
              Deselect
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => bulkUpdateStatus(selectedIds, 'Solved')}
            >
              Mark Solved
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => bulkMarkRevision(selectedIds, true, 'Medium')}
            >
              Mark for Revision
            </Button>
            <Button
              variant="danger"
              size="xs"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setBulkConfirmOpen(true)}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Content Rendering: Empty State, Table View, or Board View */}
      {problems.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="No problems logged yet"
          description="Build your problem-solving repository. Track your first solved algorithm or import sample questions to test the app."
          action={
            <Button variant="primary" size="sm" onClick={handleAddNew} leftIcon={<Plus className="w-4 h-4" />}>
              Add Your First Problem
            </Button>
          }
          secondaryAction={
            <Button variant="secondary" size="sm" onClick={loadSampleData} leftIcon={<Database className="w-4 h-4" />}>
              Load Sample Data
            </Button>
          }
        />
      ) : filteredProblems.length === 0 ? (
        <EmptyState
          title="No problems match your filters"
          description="Try broadening your search term, clearing difficulty chips, or resetting your filter options."
          action={
            <Button variant="secondary" size="sm" onClick={handleClearFilters} leftIcon={<X className="w-4 h-4" />}>
              Clear All Filters
            </Button>
          }
        />
      ) : viewMode === 'table' ? (
        <div className="space-y-4">
          <ProblemsTable
            problems={paginatedProblems}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onEdit={handleEdit}
            onDelete={deleteProblem}
            onStatusCycle={handleStatusCycle}
            onToggleRevision={handleToggleRevision}
            sort={sort}
            onSortChange={setSort}
            searchQuery={debouncedSearch}
          />

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-content-secondary px-2">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-base-surface border border-border-subtle rounded px-2 py-1 text-content-primary focus:outline-none focus:border-primary"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>per page</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  size="xs"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ProblemsBoard
          problems={filteredProblems}
          onUpdateStatus={(id, newStatus) => updateProblem(id, { status: newStatus })}
          onEdit={handleEdit}
          onDelete={deleteProblem}
        />
      )}

      {/* Add / Edit Drawer */}
      <ProblemDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setEditingProblem(null)
        }}
        initialProblem={editingProblem}
        onSave={async (problemData) => {
          if (editingProblem?.id) {
            await updateProblem(editingProblem.id, problemData)
          } else {
            await addProblem(problemData)
          }
        }}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={importProblems}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkConfirmOpen}
        onClose={() => setBulkConfirmOpen(false)}
        onConfirm={async () => {
          await bulkDeleteProblems(selectedIds)
          setSelectedIds([])
          setBulkConfirmOpen(false)
        }}
        title={`Delete ${selectedIds.length} problems?`}
        description="These problems will be removed from your collection. You can restore them with the undo button on the toast."
        confirmText="Delete Selected"
      />
    </div>
  )
}
