/**
 * DevTrack Chart Theme Engine
 * =====================================================================
 * Reads design tokens from CSS variables and provides unified
 * styling for Recharts charts, topic badges, and the GitHub-style
 * contribution heatmap.
 * =====================================================================
 */

/**
 * Returns computed CSS variable value at runtime.
 * Works seamlessly in client browser environments with safe SSR fallback.
 */
export function getCssVar(name, fallback = '') {
  if (typeof window === 'undefined' || !document?.documentElement) {
    return fallback
  }
  const val = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return val || fallback
}

export const chartColors = {
  // Brand Wave Palette
  coral1: 'var(--wave-coral-1)',
  coral2: 'var(--wave-coral-2)',
  rose: 'var(--wave-rose-3)',
  raspberry: 'var(--wave-raspberry-4)',
  deepRaspberry: 'var(--wave-deep-raspberry-5)',

  // Rainbow Palette
  rainbow1: 'var(--rainbow-1)',
  rainbow2: 'var(--rainbow-2)',
  rainbow3: 'var(--rainbow-3)',
  rainbow4: 'var(--rainbow-4)',
  rainbow5: 'var(--rainbow-5)',
  rainbow6: 'var(--rainbow-6)',
  rainbow7: 'var(--rainbow-7)',
  rainbow8: 'var(--rainbow-8)',

  // Semantic Interactive & Status Colors
  primary: 'var(--accent-primary)',
  secondary: 'var(--accent-secondary)',
  coral: 'var(--accent-coral)',
  easy: 'var(--color-easy)',
  medium: 'var(--color-medium)',
  hard: 'var(--color-hard)',
  todo: 'var(--color-todo)',
  attempted: 'var(--color-attempted)',
  solved: 'var(--color-solved)',
}

export const rainbowList = [
  'var(--rainbow-1)',
  'var(--rainbow-2)',
  'var(--rainbow-3)',
  'var(--rainbow-4)',
  'var(--rainbow-5)',
  'var(--rainbow-6)',
  'var(--rainbow-7)',
  'var(--rainbow-8)',
]

/**
 * Stable pastel badge styling per topic
 */
export function getTopicBadgeStyle(topicName = '') {
  const t = topicName.toLowerCase()
  if (t.includes('array') || t.includes('hash')) {
    return 'border-pastel-coral-border bg-pastel-coral text-pastel-coral-text'
  }
  if (t.includes('tree') || t.includes('bst')) {
    return 'border-pastel-mint-border bg-pastel-mint text-pastel-mint-text'
  }
  if (t.includes('graph') || t.includes('bfs') || t.includes('dfs')) {
    return 'border-pastel-violet-border bg-pastel-violet text-pastel-violet-text'
  }
  if (t.includes('dynamic') || t.includes('dp')) {
    return 'border-pastel-rose-border bg-pastel-rose text-pastel-rose-text'
  }
  if (t.includes('heap') || t.includes('priority')) {
    return 'border-pastel-raspberry-border bg-pastel-raspberry text-pastel-raspberry-text'
  }
  if (t.includes('window') || t.includes('two pointer')) {
    return 'border-pastel-sky-border bg-pastel-sky text-pastel-sky-text'
  }
  if (t.includes('search') || t.includes('binary')) {
    return 'border-pastel-blue-border bg-pastel-blue text-pastel-blue-text'
  }
  return 'border-pastel-amber-border bg-pastel-amber text-pastel-amber-text'
}

/**
 * Recharts shared styling objects
 */
export const rechartsTheme = {
  cartesianGrid: {
    stroke: 'var(--border-subtle)',
    strokeDasharray: '3 3',
  },
  xAxis: {
    stroke: 'var(--text-muted)',
    fontSize: 11,
    tickLine: false,
    fontFamily: 'var(--font-display)',
    axisLine: { stroke: 'var(--border-subtle)' },
  },
  yAxis: {
    stroke: 'var(--text-muted)',
    fontSize: 11,
    tickLine: false,
    fontFamily: 'var(--font-display)',
    axisLine: { stroke: 'var(--border-subtle)' },
  },
  tooltip: {
    contentStyle: {
      backgroundColor: 'var(--bg-surface-glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderColor: 'var(--border-glass)',
      borderRadius: 'var(--radius-card)',
      fontSize: '12px',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-card)',
    },
    itemStyle: {
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      fontSize: '11px',
    },
    labelStyle: {
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      marginBottom: '4px',
    },
  },
  legend: {
    wrapperStyle: {
      fontSize: '11px',
      fontFamily: 'var(--font-sans)',
      paddingTop: '8px',
      color: 'var(--text-secondary)',
    },
  },
}

/**
 * Heatmap cell classes using the rainbow progression:
 * 0: Base elevated
 * 1: Mint (rainbow-3)
 * 2: Amber (rainbow-2)
 * 3: Coral (rainbow-1)
 * 4+: Deep Raspberry (rainbow-8)
 */
export function getHeatmapCellClass(count) {
  if (count === 0) {
    return 'bg-base-elevated/70 border-border-subtle/50 hover:border-border-strong hover:scale-110 transition-transform'
  }
  if (count === 1) {
    return 'bg-rainbow-3/35 border-rainbow-3/50 hover:bg-rainbow-3/50 hover:scale-125 transition-transform'
  }
  if (count === 2) {
    return 'bg-rainbow-2/50 border-rainbow-2/70 hover:bg-rainbow-2/70 hover:scale-125 transition-transform'
  }
  if (count === 3) {
    return 'bg-rainbow-1/75 border-rainbow-1 hover:bg-rainbow-1 hover:scale-125 transition-transform'
  }
  // Tier 4+: Vibrant deep raspberry highlight
  return 'bg-rainbow-8 border-rainbow-8 text-white shadow-sm hover:brightness-110 hover:scale-125 transition-transform'
}
