import { useState, useEffect, useMemo, useRef } from 'react'
import clsx from 'clsx'
import { Drawer } from '../ui/Drawer'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { Select } from '../ui/Select'
import { PLATFORMS, DIFFICULTIES, STATUSES, PRIORITIES, TOPICS } from '../../data/constants'
import { validateProblem } from '../../utils/validators'
import { addDays, getLocalDateString } from '../../utils/dates'
import { X, Calendar, Clock, BookOpen, CheckCircle2, Circle, Clock3, RotateCcw } from 'lucide-react'

const statusMeta = {
  Todo: { label: 'To Do', icon: Circle },
  Attempted: { label: 'Attempted', icon: Clock3 },
  Solved: { label: 'Solved', icon: CheckCircle2 },
  Revisit: { label: 'Revisit', icon: RotateCcw },
}

export function ProblemDrawer({
  isOpen,
  onClose,
  initialProblem = null,
  existingProblems = [],
  onSave,
}) {
  const isEditing = Boolean(initialProblem?.id)

  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('LeetCode')
  const [url, setUrl] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [topics, setTopics] = useState(['Arrays'])
  const [newTopicInput, setNewTopicInput] = useState('')
  const [status, setStatus] = useState('Solved')
  const [solvedDate, setSolvedDate] = useState(getLocalDateString(new Date()))
  const [timeTaken, setTimeTaken] = useState('')
  const [notes, setNotes] = useState('')
  const [markRevision, setMarkRevision] = useState(false)
  const [revisionPriority, setRevisionPriority] = useState('Medium')
  const [nextRevisionDate, setNextRevisionDate] = useState(getLocalDateString(addDays(new Date(), 1)))

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const titleRef = useRef(null)
  const urlRef = useRef(null)
  const solvedDateRef = useRef(null)
  const baselineRef = useRef('')

  const getSnapshot = () => JSON.stringify({
    title,
    platform,
    url,
    difficulty,
    topics,
    status,
    solvedDate,
    timeTaken,
    notes,
    markRevision,
    revisionPriority,
    nextRevisionDate,
  })

  // Populate or reset form whenever drawer opens or initialProblem changes
  useEffect(() => {
    if (isOpen) {
      const today = getLocalDateString(new Date())
      const tomorrow = getLocalDateString(addDays(new Date(), 1))
      if (initialProblem) {
        setTitle(initialProblem.title || '')
        setPlatform(initialProblem.platform || 'LeetCode')
        setUrl(initialProblem.url || '')
        setDifficulty(initialProblem.difficulty || 'Medium')
        setTopics(Array.isArray(initialProblem.topics) ? initialProblem.topics : ['Arrays'])
        setStatus(initialProblem.status || 'Solved')
        setSolvedDate(initialProblem.solvedDate || today)
        setTimeTaken(initialProblem.timeTakenMinutes !== null && initialProblem.timeTakenMinutes !== undefined ? String(initialProblem.timeTakenMinutes) : '')
        setNotes(initialProblem.notes || '')
        setMarkRevision(Boolean(initialProblem.revision?.marked))
        setRevisionPriority(initialProblem.revision?.priority || 'Medium')
        setNextRevisionDate(initialProblem.revision?.nextRevisionDate || tomorrow)
        baselineRef.current = JSON.stringify({
          title: initialProblem.title || '', platform: initialProblem.platform || 'LeetCode', url: initialProblem.url || '',
          difficulty: initialProblem.difficulty || 'Medium', topics: Array.isArray(initialProblem.topics) ? initialProblem.topics : ['Arrays'],
          status: initialProblem.status || 'Solved', solvedDate: initialProblem.solvedDate || today,
          timeTaken: initialProblem.timeTakenMinutes !== null && initialProblem.timeTakenMinutes !== undefined ? String(initialProblem.timeTakenMinutes) : '',
          notes: initialProblem.notes || '', markRevision: Boolean(initialProblem.revision?.marked),
          revisionPriority: initialProblem.revision?.priority || 'Medium', nextRevisionDate: initialProblem.revision?.nextRevisionDate || tomorrow,
        })
      } else {
        setTitle('')
        setPlatform('LeetCode')
        setUrl('')
        setDifficulty('Medium')
        setTopics(['Arrays'])
        setStatus('Solved')
        setSolvedDate(today)
        setTimeTaken('')
        setNotes('')
        setMarkRevision(false)
        setRevisionPriority('Medium')
        setNextRevisionDate(tomorrow)
        baselineRef.current = JSON.stringify({
          title: '', platform: 'LeetCode', url: '', difficulty: 'Medium', topics: ['Arrays'], status: 'Solved',
          solvedDate: today, timeTaken: '', notes: '', markRevision: false, revisionPriority: 'Medium', nextRevisionDate: tomorrow,
        })
      }
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen, initialProblem])

  const duplicate = useMemo(() => {
    const cleanTitle = title.trim().toLowerCase()
    const cleanUrl = url.trim().toLowerCase()
    if (!cleanTitle && !cleanUrl) return null
    return existingProblems.find((problem) => problem.id !== initialProblem?.id && (
      (cleanUrl && problem.url?.trim().toLowerCase() === cleanUrl) ||
      (cleanTitle && problem.title?.trim().toLowerCase() === cleanTitle)
    )) || null
  }, [existingProblems, initialProblem?.id, title, url])

  const handleRequestClose = () => {
    const isDirty = Boolean(baselineRef.current) && getSnapshot() !== baselineRef.current
    if (isDirty && !window.confirm('Discard your unsaved problem changes?')) return
    onClose()
  }

  // Handle status toggle adjustments
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    if (newStatus === 'Solved' && !solvedDate) {
      setSolvedDate(getLocalDateString(new Date()))
    }
  }

  // Handle custom topic addition
  const handleAddTopic = () => {
    const trimmed = newTopicInput.trim()
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed])
      setNewTopicInput('')
    }
  }

  const handleRemoveTopic = (topicToRemove) => {
    if (topics.length <= 1) return // Keep at least one
    setTopics(topics.filter((t) => t !== topicToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      id: initialProblem?.id,
      title: title.trim(),
      platform,
      url: url.trim(),
      difficulty,
      topics,
      status,
      solvedDate: status === 'Solved' ? solvedDate : null,
      timeTakenMinutes: timeTaken ? Number(timeTaken) : null,
      notes: notes.trim(),
      revision: {
        marked: markRevision,
        priority: revisionPriority,
        nextRevisionDate: markRevision ? nextRevisionDate : null,
        revisionCount: initialProblem?.revision?.revisionCount || 0,
        lastRevisedDate: initialProblem?.revision?.lastRevisedDate || null,
        history: initialProblem?.revision?.history || [],
      },
    }

    const validation = validateProblem(payload)
    if (!validation.isValid) {
      setErrors(validation.errors)
      setIsSubmitting(false)
      const firstInvalidRef = [
        ['title', titleRef],
        ['url', urlRef],
        ['solvedDate', solvedDateRef],
      ].find(([field]) => validation.errors[field])?.[1]
      requestAnimationFrame(() => firstInvalidRef?.current?.focus())
      return
    }

    try {
      await onSave(payload)
      baselineRef.current = getSnapshot()
      onClose()
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleRequestClose}
      title={isEditing ? 'Edit Problem' : 'Log New Problem'}
      description={
        isEditing
          ? 'Update solution details, notes, or spaced revision dates.'
          : 'Track a solved or practicing problem directly into your local database.'
      }
      width="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pb-6">
        {errors.form && (
          <div role="alert" aria-live="assertive" className="p-3 text-xs bg-difficulty-hard-bg border border-difficulty-hard-border text-difficulty-hard-text rounded-card">
            {errors.form}
          </div>
        )}

        {duplicate && (
          <div role="status" className="rounded-card border border-difficulty-medium-border bg-difficulty-medium-bg p-3 text-xs text-difficulty-medium-text">
            A similar problem already exists: “{duplicate.title}”. You can still save this entry.
          </div>
        )}

        {/* Title */}
        <Input
          ref={titleRef}
          label="Problem Title *"
          placeholder="e.g. Two Sum, Median of Two Sorted Arrays"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (errors.title) setErrors({ ...errors, title: null })
          }}
          error={errors.title}
          autoFocus
        />

        {/* Platform & URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {PLATFORMS.map((plat) => (
              <option key={plat} value={plat} className="bg-base-elevated text-content-primary">
                {plat}
              </option>
            ))}
          </Select>

          <Input
            ref={urlRef}
            label="Problem URL (optional)"
            placeholder="https://leetcode.com/problems/..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (errors.url) setErrors({ ...errors, url: null })
            }}
            error={errors.url}
          />
        </div>

        {/* Difficulty segmented control */}
        <div>
          <label className="block text-xs font-medium text-content-secondary mb-1.5">
            Difficulty *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((diff) => {
              const isSelected = difficulty === diff
              return (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={clsx(
                    'py-2 px-3 rounded-card text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
                    isSelected
                      ? diff === 'Easy'
                        ? 'bg-difficulty-easy-bg text-difficulty-easy-text border-difficulty-easy-border shadow-sm'
                        : diff === 'Medium'
                        ? 'bg-difficulty-medium-bg text-difficulty-medium-text border-difficulty-medium-border shadow-sm'
                        : 'bg-difficulty-hard-bg text-difficulty-hard-text border-difficulty-hard-border shadow-sm'
                      : 'bg-base-elevated text-content-muted border-border-subtle hover:border-border-strong'
                  )}
                >
                  <span
                    className={clsx(
                      'w-2 h-2 rounded-full',
                      diff === 'Easy' && 'bg-difficulty-easy',
                      diff === 'Medium' && 'bg-difficulty-medium',
                      diff === 'Hard' && 'bg-difficulty-hard'
                    )}
                  />
                  <span>{diff}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Status segmented control */}
        <div>
          <label className="block text-xs font-medium text-content-secondary mb-1.5">
            Status *
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STATUSES.map((st) => {
              const isSelected = status === st
              const meta = statusMeta[st] || statusMeta.Todo
              const StatusIcon = meta.icon
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={clsx(
                    'py-2 px-3 rounded-card text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
                    isSelected
                      ? 'bg-primary-light text-primary border-primary shadow-sm'
                      : 'bg-base-elevated text-content-muted border-border-subtle hover:border-border-strong'
                  )}
                >
                  <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Solved Date and Time Taken (if Solved) */}
        {status === 'Solved' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-base-elevated/40 rounded-card border border-border-subtle animate-fade-in">
            <Input
              ref={solvedDateRef}
              type="date"
              label="Date Solved *"
              value={solvedDate}
              max={getLocalDateString(new Date())}
              onChange={(e) => {
                setSolvedDate(e.target.value)
                if (errors.solvedDate) setErrors({ ...errors, solvedDate: null })
              }}
              error={errors.solvedDate}
              leftIcon={<Calendar className="w-4 h-4" />}
            />

            <Input
              type="number"
              min="1"
              max="600"
              label="Time Taken (minutes)"
              placeholder="e.g. 25"
              value={timeTaken}
              onChange={(e) => setTimeTaken(e.target.value)}
              leftIcon={<Clock className="w-4 h-4" />}
            />
          </div>
        )}

        {/* Topics Selection & Tags */}
        <div>
          <label className="block text-xs font-medium text-content-secondary mb-1.5">
            Topics / Tags (at least 1) *
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {topics.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-primary-light text-primary border border-primary/30 rounded-full"
              >
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(t)}
                  aria-label={`Remove topic ${t}`}
                  className="hover:text-difficulty-hard p-0.5 rounded-full cursor-pointer focus-visible:outline-none"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Quick select topic pills */}
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-base-elevated/50 rounded-subtle border border-border-subtle mb-2">
            {TOPICS.filter((t) => !topics.includes(t)).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopics([...topics, t])}
                className="text-[11px] px-2 py-0.5 rounded bg-base-surface text-content-secondary hover:text-content-primary hover:border-border-strong border border-border-subtle transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                + {t}
              </button>
            ))}
          </div>

          {/* Custom tag add input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom topic..."
              value={newTopicInput}
              onChange={(e) => setNewTopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTopic()
                }
              }}
              className="flex-1 bg-base-elevated text-content-primary text-xs rounded-subtle border border-border-subtle px-2.5 py-1.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <Button variant="secondary" size="xs" onClick={handleAddTopic}>
              Add Tag
            </Button>
          </div>
          {errors.topics && <p className="mt-1 text-xs text-difficulty-hard">{errors.topics}</p>}
        </div>

        {/* Notes (Markdown-lite textarea) */}
        <Textarea
          label="Notes & Key Intuition"
          placeholder="Document the approach, space/time complexity, edge cases, or mental model..."
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          helperText="Tip: Record tricky edge cases and O(n) complexities here for quick revision."
        />

        {/* Spaced Revision Settings */}
        <div className="p-4 bg-base-elevated/60 rounded-card border border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              <div>
                <p className="text-xs font-semibold text-content-primary">Schedule for Spaced Revision</p>
                <p className="text-[11px] text-content-muted">Track this problem in your revision queue</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={markRevision}
                onChange={(e) => setMarkRevision(e.target.checked)}
                aria-label="Mark for revision"
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-base-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent border border-border-strong"></div>
            </label>
          </div>

          {markRevision && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-subtle animate-fade-in">
              <Select
                label="Revision Priority"
                value={revisionPriority}
                onChange={(e) => setRevisionPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="bg-base-elevated text-content-primary">
                    {p} Priority
                  </option>
                ))}
              </Select>

              <Input
                type="date"
                label="Next Due Date"
                value={nextRevisionDate}
                disabled
                helperText={initialProblem ? 'Use the Revision page to reschedule.' : 'The first revision is scheduled for tomorrow.'}
                leftIcon={<Calendar className="w-4 h-4" />}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button variant="secondary" onClick={handleRequestClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add Problem'}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}
