/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          overlay: 'var(--bg-overlay)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        primary: {
          DEFAULT: 'var(--accent-primary)',
          hover: 'var(--accent-hover)',
          muted: 'var(--accent-muted)',
          light: 'var(--accent-light)',
          glow: 'var(--accent-glow)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        difficulty: {
          easy: '#10B981',
          'easy-bg': 'rgba(16, 185, 129, 0.12)',
          'easy-border': 'rgba(16, 185, 129, 0.25)',
          medium: '#F59E0B',
          'medium-bg': 'rgba(245, 158, 11, 0.12)',
          'medium-border': 'rgba(245, 158, 11, 0.25)',
          hard: '#F43F5E',
          'hard-bg': 'rgba(244, 63, 94, 0.12)',
          'hard-border': 'rgba(244, 63, 94, 0.25)',
        },
        status: {
          todo: '#94A3B8',
          'todo-bg': 'rgba(148, 163, 184, 0.12)',
          attempted: '#38BDF8',
          'attempted-bg': 'rgba(56, 189, 248, 0.12)',
          solved: '#10B981',
          'solved-bg': 'rgba(16, 185, 129, 0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 25px -5px var(--accent-glow)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'scale-in': 'scaleIn 150ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      borderRadius: {
        'card': '12px',
        'subtle': '8px',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
}
