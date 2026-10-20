import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Database,
  CheckCircle2,
  Lock,
  Layers,
  ChevronDown,
  Terminal,
  Sparkles,
} from 'lucide-react'
import { WaveDivider } from '../components/ui/WaveDivider'
import { BubblesCanvas } from '../components/landing/BubblesCanvas'
import { TextEffect } from '../components/motion-primitives/TextEffect'
import { InView } from '../components/motion-primitives/InView'
import { TopicTicker } from '../components/landing/TopicTicker'
import { FeatureCarousel } from '../components/landing/FeatureCarousel'
import { SwipeDeckDemo } from '../components/landing/SwipeDeckDemo'
import { ConnectedHowItWorks } from '../components/landing/ConnectedHowItWorks'
import { HeroPreviewCard } from '../components/landing/HeroPreviewCard'
import { MagneticButton } from '../components/landing/MagneticButton'
import { UnderlineDoodle, WaveSquiggleDoodle } from '../components/landing/HandDrawnDoodle'
import { LandingBentoGrid } from '../components/landing/LandingBentoGrid'
import { TerminalWindow } from '../components/ui/TerminalWindow'
import { useProblems } from '../context/ProblemsContext'

export default function Landing() {
  const navigate = useNavigate()
  const { loadSampleData } = useProblems()

  const handleLoadSampleAndGo = async () => {
    await loadSampleData()
    navigate('/dashboard')
  }

  return (
    <div className="relative overflow-hidden space-y-24 sm:space-y-32">
      {/* 1. HERO SECTION: "DIVE IN" 🌊 */}
      <section className="relative pt-8 sm:pt-16 pb-12 sm:pb-20 overflow-hidden">
        {/* Rising Bubbles Background Canvas */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0">
          <BubblesCanvas className="w-full h-full opacity-65" />
        </div>

        {/* Soft Radial Gradient Aura */}
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-b from-accent-coral/15 via-primary/10 to-transparent blur-3xl pointer-events-none rounded-full"
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Sticker Badge with Em-dash */}
          <div className="inline-flex items-center gap-2">
            <span className="sticker-badge bg-accent-coral text-content-inverse text-xs sm:text-sm -rotate-2 font-display font-bold shadow-sticker">
              <span aria-hidden="true">🌊</span> Track it — then own it
            </span>
            <span className="text-xs text-content-muted uppercase tracking-wider font-display font-semibold hidden sm:inline">
              &bull; Built for BTech Students &amp; Software Engineers
            </span>
          </div>

          {/* Hero Headline with Text Effect & Hard-Stop Accent */}
          <div className="max-w-4xl mx-auto">
            <TextEffect
              as="h1"
              per="word"
              className="hero-headline font-display font-extrabold text-content-primary tracking-tight"
            >
              Dive deep into your DSA consistency.
            </TextEffect>

            {/* Hand-drawn SVG doodle underline accent + hard-stop highlight */}
            <div className="relative inline-block mt-2">
              <span className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold italic text-accent-coral">
                Retain every algorithm — zero interview panic.
              </span>
              <UnderlineDoodle className="h-4 sm:h-5 mt-1 text-accent-coral" />
            </div>
          </div>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-content-secondary leading-relaxed font-sans">
            The private, local-first tracker designed around human memory. Automated spaced repetition intervals, GitHub-style consistency heatmaps, and zero latency—right on your device.
          </p>

          {/* Magnetic Primary CTA & Secondary Demo Trigger with Animated Arrows */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/dashboard" className="group">
              <MagneticButton className="px-7 py-3.5 rounded-button bg-primary text-content-inverse font-display font-bold text-base shadow-glow-rose hover:bg-accent-hover flex items-center gap-2 group transition-all">
                <span>Start Tracking Now</span>
                <span aria-hidden="true">🚀</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
              </MagneticButton>
            </Link>

            <a href="#interactive-demo" className="group">
              <MagneticButton className="px-6 py-3.5 rounded-button bg-base-surface border border-border-strong hover:border-accent-coral text-content-primary font-display font-bold text-base shadow-ambient flex items-center gap-2 transition-all">
                <span>Try Live Sandbox</span>
                <span aria-hidden="true">🃏</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </MagneticButton>
            </a>
          </div>

          {/* Floating Dashboard Preview Card with 3D Tilt */}
          <div className="pt-8">
            <HeroPreviewCard />
          </div>

          {/* Animated Scroll Down Indicator */}
          <div className="pt-6 flex flex-col items-center justify-center text-content-muted">
            <a
              href="#features"
              aria-label="Scroll down to features"
              className="flex flex-col items-center gap-1 hover:text-content-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full p-2"
            >
              <span className="text-[11px] font-display font-medium uppercase tracking-wider">Explore Features</span>
              <ChevronDown className="w-4 h-4 animate-bounce text-accent" />
            </a>
          </div>
        </div>

        {/* Wave Divider at Bottom of Hero */}
        <div className="mt-12">
          <WaveDivider height="h-16 sm:h-24 md:h-28" />
        </div>
      </section>

      {/* 2. SCROLLING TOPIC TICKER */}
      <section className="relative z-10 -mt-16 sm:-mt-24">
        <TopicTicker />
      </section>

      {/* 3. BENTO GRID FEATURES SECTION */}
      <section id="features" className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <InView
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="sticker-badge bg-primary text-content-inverse text-xs rotate-1 font-display font-semibold">
                <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                The Retention Engine — At a Glance
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-content-primary tracking-tight">
              <span className="italic text-accent-coral">Engineered</span> for genuine recall — not cramming.
            </h2>
            <p className="text-sm sm:text-base text-content-secondary font-sans">
              An asymmetric toolkit designed to eliminate the dreaded &ldquo;I solved this a month ago but can&rsquo;t remember the trick&rdquo; feeling.
            </p>
          </div>
        </InView>

        {/* Asymmetric Bento Grid */}
        <LandingBentoGrid />

        {/* Retained Swipeable Feature Carousel for deep inspection */}
        <div className="mt-16 pt-8 border-t border-border-subtle/50">
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-wider font-display font-bold text-accent-coral">
              Deep Dive &bull; Interactive Carousel
            </span>
          </div>
          <FeatureCarousel />
        </div>

        <div className="mt-16">
          <WaveDivider height="h-12 sm:h-20" opacity="opacity-40 dark:opacity-30" />
        </div>
      </section>

      {/* 4. TERMINAL WINDOW CLI DEMO SECTION */}
      <section id="terminal-demo" className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <InView
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="sticker-badge bg-base-elevated border border-border-subtle text-accent-coral text-xs font-display font-semibold">
                <Terminal className="w-3.5 h-3.5 inline mr-1" />
                Developer Ergonomics — 3-Sec Logging
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-content-primary tracking-tight">
              Instant capture — straight from your workflow.
            </h2>
            <p className="text-sm sm:text-base text-content-secondary font-sans">
              Watch DevTrack index problems, schedule SM-2 spaced repetition dates, and update consistency streaks seamlessly.
            </p>
          </div>
        </InView>

        {/* Interactive CLI Terminal Window */}
        <TerminalWindow />

        <div className="mt-16">
          <WaveDivider height="h-12 sm:h-20" opacity="opacity-40 dark:opacity-30" />
        </div>
      </section>

      {/* 5. INTERACTIVE "TRY IT LIVE" SWIPE DECK DEMO */}
      <section id="interactive-demo" className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <InView
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="sticker-badge bg-base-elevated border border-border-subtle text-accent-coral text-xs -rotate-1 font-display font-semibold">
                <span aria-hidden="true">🃏</span> Test Drive the Flashcard Engine
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-content-primary tracking-tight">
              Swipe right if you know it — left if you need a refresh.
            </h2>
            <p className="text-sm sm:text-base text-content-secondary font-sans">
              Fully interactive sandbox. Experience the spaced repetition workflow with realistic interview questions.
            </p>
          </div>
        </InView>

        <SwipeDeckDemo />

        <div className="mt-16">
          <WaveDivider height="h-12 sm:h-20" opacity="opacity-40 dark:opacity-30" />
        </div>
      </section>

      {/* 6. CONNECTED HOW IT WORKS */}
      <section id="how-it-works" className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <InView
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <WaveSquiggleDoodle className="w-16 h-4" />
              <span className="text-xs font-display font-bold uppercase tracking-wider text-accent-coral">
                The Science of Consistency
              </span>
              <WaveSquiggleDoodle className="w-16 h-4 -scale-x-100" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-content-primary tracking-tight">
              <span className="italic text-primary">How</span> you retain 300+ algorithms — without burnout.
            </h2>
            <p className="text-sm sm:text-base text-content-secondary font-sans">
              A continuous, frictionless workflow designed to turn short-term LeetCode grinds into lifelong problem-solving intuition.
            </p>
          </div>
        </InView>

        <ConnectedHowItWorks />
      </section>

      {/* 7. FINAL IMMERSIVE CTA */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-8 sm:p-14 rounded-modal bg-gradient-to-b from-base-surface to-base-elevated border border-border-strong shadow-sticker space-y-6 relative overflow-hidden">
          {/* Ocean aura */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/20 via-accent-coral/15 to-transparent blur-3xl pointer-events-none rounded-full"
          />

          <div className="relative z-10 flex items-center justify-center gap-2">
            <span className="sticker-badge bg-primary text-content-inverse text-xs rotate-1 font-display font-bold">
              <span aria-hidden="true">🌊</span> Ready to Dive In?
            </span>
          </div>

          <h2 className="relative z-10 text-3xl sm:text-5xl font-display font-extrabold text-content-primary leading-tight tracking-tight">
            Stop losing track of your prep. <br />
            <span className="italic text-accent-coral">Start building your streak today — free forever.</span>
          </h2>

          <p className="relative z-10 max-w-xl mx-auto text-sm sm:text-base text-content-secondary leading-relaxed font-sans">
            Free forever. Zero account creation required. All data stored directly in your browser localStorage.
          </p>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/dashboard" className="group">
              <MagneticButton className="px-8 py-4 rounded-button bg-primary text-content-inverse font-display font-bold text-base shadow-glow-rose hover:bg-accent-hover flex items-center gap-2 group transition-all">
                <span>Launch DevTrack</span>
                <span aria-hidden="true">🚀</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
              </MagneticButton>
            </Link>

            <MagneticButton
              onClick={handleLoadSampleAndGo}
              className="px-6 py-4 rounded-button bg-base-surface border border-border-strong hover:border-primary text-content-primary font-display font-bold text-base shadow-ambient flex items-center gap-2 group transition-all"
            >
              <Database className="w-4 h-4 text-accent-coral" />
              <span>Load 25 Sample Questions &amp; Explore</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </MagneticButton>
          </div>

          {/* Privacy & Guarantee Micro-badges */}
          <div className="relative z-10 pt-6 border-t border-border-subtle flex flex-wrap items-center justify-center gap-6 text-xs text-content-muted font-display">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              100% Free &amp; Open Source
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-accent-coral" />
              Local-first Privacy
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              No Account Required
            </span>
          </div>
        </div>
      </section>

      {/* Decorative Wave Divider Leading Smoothly into Footer */}
      <div className="pt-6">
        <WaveDivider height="h-16 sm:h-24 md:h-32" />
      </div>
    </div>
  )
}
