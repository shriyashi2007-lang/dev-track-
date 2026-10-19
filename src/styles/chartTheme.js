/**
 * DevTrack Chart Theme Engine
 * =====================================================================
 * Reads design tokens from CSS variables and provides unified
 * styling for Recharts charts and the GitHub-style contribution heatmap.
 * Prompt 2 visual redesign swaps colors directly through tokens.css.
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
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return val || fallback
}

export const chartColors = {
  // Brand Wave Palette
  coral1: 'var(--wave-coral-1)',
  coral2: 'var(--wave-coral-2)',
  rose: 'var(--wave-rose-3)',
  raspberry: 'var(--wave-raspberry-4)',
  deepRaspberry: 'var(--wave-deep-raspberry-5)',

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
    fontFamily: 'var(--font-family-base)',
    axisLine: { stroke: 'var(--border-subtle)' },
  },
  yAxis: {
    stroke: 'var(--text-muted)',
    fontSize: 11,
    tickLine: false,
    fontFamily: 'var(--font-family-base)',
    axisLine: { stroke: 'var(--border-subtle)' },
  },
  tooltip: {
    contentStyle: {
      backgroundColor: 'var(--bg-surface)',
      borderColor: 'var(--border-strong)',
      borderRadius: 'var(--radius-subtle)',
      fontSize: '12px',
      fontFamily: 'var(--font-family-base)',
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-card)',
    },
    itemStyle: {
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-family-base)',
      fontSize: '11px',
    },
    labelStyle: {
      color: 'var(--text-secondary)',
      fontFamily: 'var(--font-family-base)',
      fontWeight: 600,
      marginBottom: '4px',
    },
  },
  legend: {
    wrapperStyle: {
      fontSize: '11px',
      fontFamily: 'var(--font-family-base)',
      paddingTop: '8px',
      color: 'var(--text-secondary)',
    },
  },
}

/**
 * Heatmap cell classes based on solve count
 * Uses the brand gradient progression: Subtle elevated -> Coral/Rose progression
 */
export function getHeatmapCellClass(count) {
  if (count === 0) {
    return 'bg-base-elevated/70 border-border-subtle/50 hover:border-border-strong'
  }
  if (count === 1) {
    return 'bg-primary/30 border-primary/40 hover:bg-primary/40'
  }
  if (count === 2) {
    return 'bg-primary/60 border-primary/70 hover:bg-primary/70'
  }
  if (count === 3) {
    return 'bg-primary/85 border-primary hover:bg-primary'
  }
  // Tier 4+: Vibrant coral accent highlight
  return 'bg-accent border-accent text-white shadow-sm hover:brightness-110'
}
