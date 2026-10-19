import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { Drawer } from '../ui/Drawer'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { Select } from '../ui/Select'
import { PLATFORMS, DIFFICULTIES, STATUSES, PRIORITIES, TOPICS } from '../../data/constants'
import { validateProblem } from '../../utils/validators'
import { getLocalDateString } from '../../utils/dates'
import { X, Calendar, Clock, BookOpen } from 'lucide-react'

export function ProblemDrawer({
  isOpen,
  onClose,
  initialProblem = null,
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
  const [nextRevisionDate, setNextRevisionDate] = useState(getLocalDateString(new Date()))

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate or reset form whenever drawer opens or initialProblem changes
  useEffect(() => {
    if (isOpen) {
      if (initialProblem) {
        setTitle(initialProblem.title || '')
        setPlatform(initialProblem.platform || 'LeetCode')
        setUrl(initialProblem.url || '')
        setDifficulty(initialProblem.difficulty || 'Medium')
        setTopics(Array.isArray(initialProblem.topics) ? initialProblem.topics : ['Arrays'])
        setStatus(initialProblem.status || 'Solved')
        setSolvedDate(initialProblem.solvedDate || getLocalDateString(new Date()))
        setTimeTaken(initialProblem.timeTakenMinutes !== null && initialProblem.timeTakenMinutes !== undefined ? String(initialProblem.timeTakenMinutes) : '')
        setNotes(initialProblem.notes || '')
        setMarkRevision(Boolean(initialProblem.revision?.marked))
        setRevisionPriority(initialProblem.revision?.priority || 'Medium')
        setNextRevisionDate(initialProblem.revision?.nextRevisionDate || getLocalDateString(new Date()))
      } else {
        setTitle('')
        setPlatform('LeetCode')
        setUrl('')
        setDifficulty('Medium')
        setTopics(['Arrays'])
        setStatus('Solved')
        setSolvedDate(getLocalDateString(new Date()))
        setTimeTaken('')
        setNotes('')
        setMarkRevision(false)
        setRevisionPriority('Medium')
        setNextRevisionDate(getLocalDateString(new Date()))
      }
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen, initialProblem])

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
      return
    }

    try {
      await onSave(payload)
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
      onClose={onClose}
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
          <div className="p-3 text-xs bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-card">
            {errors.form}
          </div>
        )}

        {/* Title */}
        <Input
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
                    'py-2 px-3 rounded-card text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                    isSelected
                      ? diff === 'Easy'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm'
                        : diff === 'Medium'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-sm'
                      : 'bg-base-elevated text-content-muted border-border-subtle hover:border-border-strong'
                  )}
                >
                  <span
                    className={clsx(
                      'w-2 h-2 rounded-full',
                      diff === 'Easy' && 'bg-emerald-400',
                      diff === 'Medium' && 'bg-amber-400',
                      diff === 'Hard' && 'bg-rose-400'
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
          <div className="grid grid-cols-3 gap-2">
            {STATUSES.map((st) => {
              const isSelected = status === st
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={clsx(
                    'py-2 px-3 rounded-card text-xs font-semibold border transition-all flex items-center justify-center cursor-pointer',
                    isSelected
                      ? 'bg-primary/20 text-primary border-primary/50 shadow-sm'
                      : 'bg-base-elevated text-content-muted border-border-subtle hover:border-border-strong'
                  )}
                >
                  {st}
                </button>
              )
            })}
          </div>
        </div>

        {/* Solved Date and Time Taken (if Solved) */}
        {status === 'Solved' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-base-elevated/40 rounded-card border border-border-subtle animate-fade-in">
            <Input
              type="date"
              label="Date Solved *"
              value={solvedDate}
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
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-primary/15 text-primary border border-primary/30 rounded-full"
              >
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(t)}
                  aria-label={`Remove topic ${t}`}
                  className="hover:text-rose-400 p-0.5 rounded-full cursor-pointer"
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
                className="text-[11px] px-2 py-0.5 rounded bg-base-surface text-content-secondary hover:text-content-primary hover:border-border-strong border border-border-subtle transition-colors cursor-pointer"
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
              className="flex-1 bg-base-elevated text-content-primary text-xs rounded-subtle border border-border-subtle px-2.5 py-1.5 focus:outline-none focus:border-primary"
            />
            <Button variant="secondary" size="xs" onClick={handleAddTopic}>
              Add Tag
            </Button>
          </div>
          {errors.topics && <p className="mt-1 text-xs text-rose-400">{errors.topics}</p>}
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
              <BookOpen className="w-4 h-4 text-primary" />
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
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-base-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border border-border-strong"></div>
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
                onChange={(e) => setNextRevisionDate(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
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
