import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Plus, Zap, Check } from 'lucide-react'
import { PLATFORMS, DIFFICULTIES, TOPICS } from '../../data/constants'
import { getLocalDateString } from '../../utils/dates'

export function QuickAddWidget({ onAdd }) {
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [topic, setTopic] = useState('Arrays')
  const [platform, setPlatform] = useState('LeetCode')
  const [solvedDate, setSolvedDate] = useState(() => getLocalDateString())
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    setIsSubmitting(true)
    try {
      await onAdd({
        title: trimmed,
        difficulty,
        topics: [topic],
        platform,
        status: 'Solved',
        solvedDate,
        url,
      })
      setTitle('')
      setUrl('')
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-4 bg-base-surface/80 border-border-subtle">
      <div className="flex items-center gap-2 mb-2.5">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-content-primary">Quick Log Solved Problem</span>
        <span className="text-[10px] text-content-muted hidden sm:inline">— Log directly without opening full drawer</span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_auto_auto_auto_auto] gap-2">
        <label className="sr-only" htmlFor="quick-problem-title">Problem title</label>
        <input
          id="quick-problem-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Problem title (e.g. Valid Anagram)..."
          className="flex-1 bg-base-elevated text-content-primary text-xs rounded-card border border-border-subtle px-3 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-content-muted"
        />

        <label className="sr-only" htmlFor="quick-difficulty">Difficulty</label>
        <select
          id="quick-difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="bg-base-elevated text-content-primary text-xs rounded-card border border-border-subtle px-2.5 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="quick-topic">Topic</label>
        <select
          id="quick-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-base-elevated text-content-primary text-xs rounded-card border border-border-subtle px-2.5 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        >
          {TOPICS.slice(0, 10).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="quick-platform">Platform</label>
        <select
          id="quick-platform"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="bg-base-elevated text-content-primary text-xs rounded-card border border-border-subtle px-2.5 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="quick-solved-date">Solved date</label>
        <input
          id="quick-solved-date"
          type="date"
          value={solvedDate}
          max={getLocalDateString()}
          onChange={(event) => setSolvedDate(event.target.value)}
          required
          className="bg-base-elevated text-content-primary text-xs rounded-card border border-border-subtle px-2.5 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />

        <label className="sr-only" htmlFor="quick-problem-url">Problem URL (optional)</label>
        <input
          id="quick-problem-url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Problem URL (optional)"
          className="sm:col-span-2 xl:col-span-4 bg-base-elevated text-content-primary text-xs rounded-card border border-border-subtle px-3 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-content-muted"
        />

        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
          disabled={!title.trim()}
          className="sm:col-span-2 xl:col-span-1"
          leftIcon={justAdded ? <Check className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5" />}
        >
          {justAdded ? 'Logged!' : 'Log'}
        </Button>
      </form>
    </Card>
  )
}
