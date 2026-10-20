import React from 'react'

const TOPICS = [
  { name: 'Arrays & Hashing', emoji: '📊', color: 'border-coral-1/30 bg-coral-1/10 text-coral-1' },
  { name: 'Two Pointers', emoji: '👉👈', color: 'border-primary/30 bg-primary/10 text-primary' },
  { name: 'Sliding Window', emoji: '🪟', color: 'border-accent/30 bg-accent/10 text-accent' },
  { name: 'Trees & BST', emoji: '🌳', color: 'border-difficulty-easy-border bg-difficulty-easy-bg text-difficulty-easy-text' },
  { name: 'Dynamic Programming', emoji: '🧠', color: 'border-secondary/30 bg-secondary/10 text-secondary' },
  { name: 'Graphs & BFS/DFS', emoji: '🕸️', color: 'border-difficulty-hard-border bg-difficulty-hard-bg text-difficulty-hard-text' },
  { name: 'Heaps & Priority Queues', emoji: '⛰️', color: 'border-difficulty-medium-border bg-difficulty-medium-bg text-difficulty-medium-text' },
  { name: 'Binary Search', emoji: '🔍', color: 'border-primary/30 bg-primary/10 text-primary' },
  { name: 'Backtracking', emoji: '🔁', color: 'border-coral-1/30 bg-coral-1/10 text-coral-1' },
  { name: 'Trie & Prefix Trees', emoji: '🌲', color: 'border-accent/30 bg-accent/10 text-accent' },
  { name: 'Greedy Algorithms', emoji: '⚡', color: 'border-difficulty-medium-border bg-difficulty-medium-bg text-difficulty-medium-text' },
  { name: 'Bit Manipulation', emoji: '0️⃣1️⃣', color: 'border-secondary/30 bg-secondary/10 text-secondary' },
  { name: 'Union Find (DSU)', emoji: '🔗', color: 'border-difficulty-easy-border bg-difficulty-easy-bg text-difficulty-easy-text' },
  { name: 'Monotonic Stack', emoji: '📚', color: 'border-primary/30 bg-primary/10 text-primary' },
]

export function TopicTicker() {
  // Duplicate list to achieve continuous seamless loop
  const duplicated = [...TOPICS, ...TOPICS]

  return (
    <div
      aria-label="Popular DSA problem topics"
      className="w-full overflow-hidden py-3 border-y border-border-subtle bg-base-surface/50 backdrop-blur-sm select-none"
    >
      <div className="topic-ticker-track flex items-center gap-3">
        {duplicated.map((topic, idx) => (
          <div
            key={`${topic.name}-${idx}`}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-subtle bg-base-elevated/70 text-xs font-semibold whitespace-nowrap shadow-sm hover:border-accent hover:scale-105 transition-all cursor-default"
          >
            <span aria-hidden="true" className="text-sm">
              {topic.emoji}
            </span>
            <span className="text-content-primary">{topic.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
