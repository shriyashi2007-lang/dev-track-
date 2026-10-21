export const PLATFORMS = [
  'LeetCode',
  'GeeksforGeeks',
  'Codeforces',
  'HackerRank',
  'CodeChef',
  'AtCoder',
  'Other',
]

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export const STATUSES = ['Todo', 'Attempted', 'Solved']

export const PRIORITIES = ['High', 'Medium', 'Low']

export const TOPICS = [
  'Arrays',
  'Strings',
  'Hash Table',
  'Two Pointers',
  'Binary Search',
  'Sliding Window',
  'Linked List',
  'Stack',
  'Queue',
  'Trees',
  'Binary Search Tree',
  'Trie',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Bit Manipulation',
  'Math',
  'Matrix',
]

export const ACCENTS = [
  { id: 'indigo', name: 'Electric Indigo', color: 'var(--rainbow-5)' },
  { id: 'violet', name: 'Neon Violet', color: 'var(--rainbow-6)' },
  { id: 'emerald', name: 'Emerald Green', color: 'var(--rainbow-3)' },
  { id: 'amber', name: 'Warm Amber', color: 'var(--rainbow-2)' },
  { id: 'cyan', name: 'Cyber Cyan', color: 'var(--rainbow-4)' },
]

export const DEFAULT_SETTINGS = {
  displayName: 'Developer',
  theme: 'dark',
  accent: 'indigo',
  dailyGoal: 3,
  revisionIntervals: [1, 3, 7, 14, 30],
  pageSize: 25,
  reduceMotion: false,
  confetti: true,
  onboardingCompleted: false,
  usingSampleData: false,
}

export const STORAGE_KEYS = {
  PROBLEMS: 'devtrack:v1:problems',
  SETTINGS: 'devtrack:v1:settings',
  RECENT_SEARCHES: 'devtrack:v1:recent_searches',
  DEMO_AUTH: 'devtrack:v1:demo_auth',
}
