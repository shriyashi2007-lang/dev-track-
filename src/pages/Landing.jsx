import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Code2,
  Flame,
  BarChart3,
  RotateCcw,
  Command,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Database,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ProgressRing } from '../components/ui/ProgressRing'
import { useProblems } from '../context/ProblemsContext'

export default function Landing() {
  const navigate = useNavigate()
  const { loadSampleData } = useProblems()

  // Interactive "Try It Live" Mini Demo State (isolated local demo)
  const [demoSolved, setDemoSolved] = useState(2)
  const [demoStreak, setDemoStreak] = useState(3)
  const [demoTarget] = useState(4)
  const [demoRecent, setDemoRecent] = useState([
    { title: 'Reverse Linked List', diff: 'Easy' },
    { title: 'Binary Tree Level Order', diff: 'Medium' },
  ])

  const handleDemoSolve = (diff) => {
    setDemoSolved((prev) => prev + 1)
    if (demoSolved + 1 >= demoTarget) {
      setDemoStreak((prev) => prev + 1)
    }
    const sampleTitles = {
      Easy: 'Valid Palindrome',
      Medium: 'Subarray Sum Equals K',
      Hard: 'Merge k Sorted Lists',
    }
    setDemoRecent((prev) => [
      { title: sampleTitles[diff] || 'Algorithm Problem', diff },
      ...prev.slice(0, 2),
    ])
  }

  const handleLoadAndExplore = async () => {
    await loadSampleData()
    navigate('/dashboard')
  }

  return (
    <div className="space-y-24 py-12">
      {/* 1. HERO SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-medium animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Engineered for BTech students &amp; DSA interview candidates</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-content-primary leading-tight">
          Track every problem. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-primary bg-clip-text text-transparent">
            Build every habit.
          </span>{' '}
          Crack every interview.
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-content-secondary leading-relaxed">
          The high-performance, private, local-first DSA tracking workspace. Schedule spaced repetition, maintain contribution streaks, visualize topic depth, and review intuition notes with zero latency.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/dashboard">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Launch Dashboard
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="lg"
            leftIcon={<Database className="w-4 h-4 text-amber-400" />}
            onClick={handleLoadAndExplore}
          >
            Load Sample Data &amp; Explore
          </Button>
        </div>

        {/* Hero Mockup Preview with Subtle Tilt */}
        <div className="pt-10 max-w-4xl mx-auto">
          <div className="p-3 bg-gradient-to-b from-primary/20 via-border-subtle to-transparent rounded-2xl shadow-2xl">
            <div className="bg-base-surface border border-border-strong rounded-card overflow-hidden shadow-card">
              {/* Fake app bar */}
              <div className="px-4 py-3 border-b border-border-subtle bg-base-elevated/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                  <span className="text-content-muted font-mono ml-2">devtrack.local/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-content-muted font-mono text-[11px]">
                  <span>14 Solved</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">5d Streak</span>
                </div>
              </div>

              {/* Mockup content */}
              <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-base-surface">
                <div className="p-3 bg-base-elevated/50 rounded border border-border-subtle text-left">
                  <span className="text-[10px] text-content-muted uppercase">Solved</span>
                  <p className="text-xl font-bold font-mono text-content-primary">14</p>
                </div>
                <div className="p-3 bg-base-elevated/50 rounded border border-border-subtle text-left">
                  <span className="text-[10px] text-emerald-400 uppercase">Easy</span>
                  <p className="text-xl font-bold font-mono text-emerald-400">5</p>
                </div>
                <div className="p-3 bg-base-elevated/50 rounded border border-border-subtle text-left">
                  <span className="text-[10px] text-amber-400 uppercase">Medium</span>
                  <p className="text-xl font-bold font-mono text-amber-400">7</p>
                </div>
                <div className="p-3 bg-base-elevated/50 rounded border border-border-subtle text-left">
                  <span className="text-[10px] text-rose-400 uppercase">Hard</span>
                  <p className="text-xl font-bold font-mono text-rose-400">2</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "TRY IT LIVE" INTERACTIVE MINI DEMO */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 bg-base-surface border border-primary/30 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-md text-left">
              <Badge variant="primary" size="xs">
                Interactive Playground
              </Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-content-primary">
                Experience the instant feedback loop
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                Click a difficulty below to simulate solving a question. Watch your daily target progress ring and consistency streak update in real-time.
              </p>

              {/* Clickable Difficulty Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoSolve('Easy')}
                  className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                >
                  + Log Easy Solve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoSolve('Medium')}
                  className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                >
                  + Log Medium Solve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoSolve('Hard')}
                  className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                >
                  + Log Hard Solve
                </Button>
              </div>
            </div>

            {/* Live Interactive Widget Display */}
            <div className="p-5 bg-base-elevated/70 border border-border-strong rounded-card flex flex-col items-center text-center w-full sm:w-72 shadow-lg">
              <ProgressRing
                value={demoSolved}
                max={demoTarget}
                size={110}
                strokeWidth={9}
                sublabel="Solved Today"
                color="var(--accent-primary)"
              />

              <div className="flex items-center gap-2 mt-4 text-xs font-mono font-bold text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>{demoStreak} Days Streak</span>
              </div>

              {/* Demo recent list */}
              <div className="w-full mt-4 pt-3 border-t border-border-subtle space-y-1.5 text-left">
                <span className="text-[10px] text-content-muted uppercase font-semibold block">
                  Simulated Submissions:
                </span>
                {demoRecent.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-content-primary truncate">{item.title}</span>
                    <Badge variant={item.diff} size="xs">
                      {item.diff}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 6 CORE FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <Badge variant="neutral" size="xs">
            Architecture &amp; Features
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">
            Designed for serious technical preparation
          </h2>
          <p className="text-xs text-sm text-content-secondary">
            Everything you need to systematically crack top tech product engineering interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-base-surface border border-border-subtle rounded-card hover:border-border-strong transition-all">
            <div className="w-10 h-10 rounded-card bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-content-primary mb-1.5">Problem Tracking &amp; Board</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Track LeetCode, GFG, and Codeforces questions with tags, time taken, solution notes, and an interactive Kanban board.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-base-surface border border-border-subtle rounded-card hover:border-border-strong transition-all">
            <div className="w-10 h-10 rounded-card bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-content-primary mb-1.5">Streaks &amp; Contribution Heatmap</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              GitHub-style 52-week activity calendar with hover tooltips, click-to-inspect day panel, and streak-at-risk warnings.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-base-surface border border-border-subtle rounded-card hover:border-border-strong transition-all">
            <div className="w-10 h-10 rounded-card bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-content-primary mb-1.5">Analytics &amp; Topic Depth</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Interactive difficulty donut charts, radar topic coverage, solve velocity ranges, and weakest/strongest topic insights.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 bg-base-surface border border-border-subtle rounded-card hover:border-border-strong transition-all">
            <div className="w-10 h-10 rounded-card bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-content-primary mb-1.5">Spaced Repetition Scheduler</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Automated 1 &rarr; 3 &rarr; 7 &rarr; 14 &rarr; 30 day intervals with full-screen flashcard sessions to test your intuition.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 bg-base-surface border border-border-subtle rounded-card hover:border-border-strong transition-all">
            <div className="w-10 h-10 rounded-card bg-sky-500/10 flex items-center justify-center text-sky-400 mb-4">
              <Command className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-content-primary mb-1.5">Command Palette &amp; Shortcuts</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Power user Cmd/Ctrl+K palette, chord navigation (G &rarr; P), and keyboard shortcuts to fly without reaching for the mouse.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 bg-base-surface border border-border-subtle rounded-card hover:border-border-strong transition-all">
            <div className="w-10 h-10 rounded-card bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-content-primary mb-1.5">Private &amp; Local-First</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Zero backend latency. Data stays in your browser with JSON backups, instant loading, and zero account hurdles.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <Badge variant="neutral" size="xs">
            Simple 3-Step Routine
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">How DevTrack accelerates prep</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-5 bg-base-surface border border-border-subtle rounded-card space-y-2">
            <span className="font-mono text-2xl font-bold text-primary block">01</span>
            <h4 className="font-semibold text-sm text-content-primary">Solve &amp; Log</h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              Solve on LeetCode or GFG, press &ldquo;N&rdquo;, log your time, and capture the core pattern intuition.
            </p>
          </div>

          <div className="p-5 bg-base-surface border border-border-subtle rounded-card space-y-2">
            <span className="font-mono text-2xl font-bold text-amber-400 block">02</span>
            <h4 className="font-semibold text-sm text-content-primary">Maintain Streaks</h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              Hit your daily goal ring to keep consecutive day streaks alive on your contribution heatmap.
            </p>
          </div>

          <div className="p-5 bg-base-surface border border-border-subtle rounded-card space-y-2">
            <span className="font-mono text-2xl font-bold text-emerald-400 block">03</span>
            <h4 className="font-semibold text-sm text-content-primary">Spaced Recall</h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              Review flagged problems in flashcard mode at optimal spaced intervals right before interviews.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-10 sm:p-14 bg-gradient-to-b from-primary/15 via-base-surface to-base-surface border border-primary/30 rounded-2xl space-y-5 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-content-primary">
            Ready to upgrade your DSA preparation?
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary max-w-md mx-auto leading-relaxed">
            Start tracking your algorithmic journey today. No signups, no fees, no lock-in.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/dashboard">
              <Button variant="primary" size="lg">
                Open App Now
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" size="lg">
                Explore Demo Signup
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
