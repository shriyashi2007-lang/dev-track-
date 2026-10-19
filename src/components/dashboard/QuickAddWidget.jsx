import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Plus, Zap, Check } from 'lucide-react'
import { PLATFORMS, DIFFICULTIES, TOPICS } from '../../data/constants'

export function QuickAddWidget({ onAdd }) {
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [topic, setTopic] = useState('Arrays')
  const [platform, setPlatform] = useState('LeetCode')
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
      })
      setTitle('')
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

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Problem title (e.g. Valid Anagram)..."
          className="flex-1 bg-base-elevated text-content-primary text-xs rounded-card border border-border-subtle px-3 py-2 focus:outline-none focus:border-primary placeholder:text-content-muted"
        />

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="bg-base-elevated text-content-primary text-xs rounded-card border border-border-subtle px-2.5 py-2 focus:outline-none focus:border-primary"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-base-elevated text-content-primary text-xs rounded-card border border-border-subtle px-2.5 py-2 focus:outline-none focus:border-primary"
        >
          {TOPICS.slice(0, 10).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="bg-base-elevated text-content-primary text-xs rounded-card border border-border-subtle px-2.5 py-2 focus:outline-none focus:border-primary"
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
          disabled={!title.trim()}
          leftIcon={justAdded ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Plus className="w-3.5 h-3.5" />}
        >
          {justAdded ? 'Logged!' : 'Log'}
        </Button>
      </form>
    </Card>
  )
}
