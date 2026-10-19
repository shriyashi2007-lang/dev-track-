import { useState } from 'react'
import clsx from 'clsx'
import { MoreHorizontal, Edit2, Trash2, BookOpen, MoveRight } from 'lucide-react'
import { Badge } from '../ui/Badge'

const COLUMNS = [
  { id: 'Todo', title: 'To Do', border: 'border-status-todo-border', headerBg: 'bg-status-todo-bg text-status-todo-text' },
  { id: 'Attempted', title: 'In Progress / Attempted', border: 'border-status-attempted-border', headerBg: 'bg-status-attempted-bg text-status-attempted-text' },
  { id: 'Solved', title: 'Solved & Mastered', border: 'border-status-solved-border', headerBg: 'bg-status-solved-bg text-status-solved-text' },
]

export function ProblemsBoard({
  problems = [],
  onUpdateStatus,
  onEdit,
  onDelete,
}) {
  const [draggedProblemId, setDraggedProblemId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id)
    setDraggedProblemId(id)
  }

  const handleDragOver = (e, colId) => {
    e.preventDefault()
    setDragOverCol(colId)
  }

  const handleDrop = (e, colId) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || draggedProblemId
    if (id) {
      onUpdateStatus(id, colId)
    }
    setDraggedProblemId(null)
    setDragOverCol(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {COLUMNS.map((col) => {
        const colProblems = problems.filter((p) => p.status === col.id)
        const isTarget = dragOverCol === col.id

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={clsx(
              'bg-base-surface/60 border rounded-card transition-all duration-200 flex flex-col min-h-[450px]',
              col.border,
              isTarget && 'ring-2 ring-accent bg-accent-light'
            )}
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-semibold', col.headerBg)}>
                  {col.title}
                </span>
                <span className="text-xs font-medium text-content-muted tabular-nums">
                  {colProblems.length}
                </span>
              </div>
            </div>

            {/* Droppable Card List */}
            <div className="p-3 space-y-3 flex-1">
              {colProblems.length === 0 ? (
                <div className="h-32 border border-dashed border-border-subtle rounded-card flex items-center justify-center text-xs text-content-muted">
                  Drag problems here
                </div>
              ) : (
                colProblems.map((problem) => (
                  <div
                    key={problem.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, problem.id)}
                    className="bg-base-surface border border-border-subtle hover:border-border-strong rounded-card p-3.5 shadow-sm cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-all relative group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4
                        onClick={() => onEdit(problem)}
                        className="font-semibold text-xs text-content-primary hover:text-accent transition-colors cursor-pointer line-clamp-2"
                      >
                        {problem.title}
                      </h4>

                      {/* Accessible Keyboard Move-To & Action Menu */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === problem.id ? null : problem.id)}
                          className="p-1 text-content-muted hover:text-content-primary rounded hover:bg-base-elevated transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                          aria-label="Options"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {openMenuId === problem.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-base-elevated border border-border-strong rounded-card shadow-2xl p-1 z-30 animate-scale-in text-xs space-y-0.5">
                            <span className="px-2 py-1 text-[10px] text-content-muted font-semibold block uppercase">
                              Move To:
                            </span>
                            {COLUMNS.filter((c) => c.id !== problem.status).map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  onUpdateStatus(problem.id, c.id)
                                  setOpenMenuId(null)
                                }}
                                className="w-full text-left px-2 py-1 text-content-primary hover:bg-accent-light rounded flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                              >
                                <MoveRight className="w-3 h-3 text-content-muted" />
                                <span>{c.title}</span>
                              </button>
                            ))}
                            <div className="my-1 border-t border-border-subtle" />
                            <button
                              type="button"
                              onClick={() => {
                                onEdit(problem)
                                setOpenMenuId(null)
                              }}
                              className="w-full text-left px-2 py-1 text-content-primary hover:bg-base-surface rounded flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                            >
                              <Edit2 className="w-3 h-3 text-content-muted" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDelete(problem.id)
                                setOpenMenuId(null)
                              }}
                              className="w-full text-left px-2 py-1 text-difficulty-hard hover:bg-difficulty-hard-bg rounded flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                            >
                              <Trash2 className="w-3 h-3 text-difficulty-hard" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Difficulty and Platform */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Badge variant={problem.difficulty} size="xs">
                        {problem.difficulty}
                      </Badge>
                      <span className="text-[10px] text-content-muted">{problem.platform}</span>
                      {problem.revision?.marked && (
                        <span className="ml-auto flex items-center gap-1 text-[10px] text-accent">
                          <BookOpen className="w-3 h-3" />
                          <span>Revise</span>
                        </span>
                      )}
                    </div>

                    {/* Topics tags */}
                    <div className="flex flex-wrap gap-1">
                      {(problem.topics || []).slice(0, 2).map((t) => (
                        <span key={t} className="px-1.5 py-0.5 text-[10px] bg-base-elevated rounded text-content-secondary">
                          {t}
                        </span>
                      ))}
                      {(problem.topics || []).length > 2 && (
                        <span className="text-[10px] text-content-muted">
                          +{(problem.topics || []).length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
