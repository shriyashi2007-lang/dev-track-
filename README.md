git# DevTrack — DSA & Coding Progress Tracker 🌊

A modern, high-performance, developer-focused web application for students and software engineers to track DSA preparation, coding consistency, solved algorithmic problems, and spaced repetition schedules.

Built with **React 19 + Vite**, **JavaScript (JSX)**, **Tailwind CSS**, **Motion Primitives** (`motion/react`), **Recharts**, and **localStorage persistence**.

---

## 🌊 Landing Page Concept: "Dive In"

The landing page takes inspiration from the ocean-depth journey of algorithmic preparation, harmonizing with the owner's Haikei **Layered Waves** art and coral/raspberry color palette.

### Interactive Gadgets & Motion Features
1. **Interactive Rising Bubbles 🫧 (`BubblesCanvas.jsx`)**:
   - Lightweight canvas particle engine rising behind the hero and layered waves (capped to 28 on desktop, 12 on mobile).
   - Gentle cursor-dodging interaction.
   - **Click or tap to POP a bubble** with a mini particle burst effect.
   - Automatically pauses animation when offscreen or when browser tab is hidden (`IntersectionObserver` + `visibilitychange`).
   - `devicePixelRatio` capped to 2 for 60fps performance on standard laptops.
   - Strictly disabled when `prefers-reduced-motion` is active.

2. **Fast Layered Wave-Wipe Route Transition 🌊 (`WaveWipeTransition.jsx`)**:
   - Sweeps across the viewport in the 5 brand wave colors in $\le 320\text{ms}$ upon navigating between routes (`Landing` ↔ `Login/Signup` ↔ `Dashboard`).
   - Smoothly reveals the destination page with staggered wave bars.
   - Automatically degrades to a gentle cross-fade when reduced motion is preferred.

3. **Swipeable Feature Carousel 🎠 (`FeatureCarousel.jsx`)**:
   - Touch/mouse drag with momentum, drag constraints, and card tilt.
   - Full keyboard accessibility (← / → arrow keys).
   - Animated progress indicator and interactive pagination dots.
   - Staggered spring entrance transitions.

4. **Swipe Deck Sandbox Gadget 🃏 (`SwipeDeckDemo.jsx`)**:
   - Interactive stack of sample problem cards (clearly marked as demo sandbox, no user data touched).
   - **Swipe Right** (or click button) = ✅ Mark Solved!
   - **Swipe Left** (or click button) = 🔁 Revise Later.
   - Dynamic stamp overlays, spring physics, live updating demo counters, mini streak ring, and a celebratory burst of confetti.
   - Single-click "Reset Demo Deck" button to restart the interactive demo anytime.

5. **Scrolling Topic Ticker 📊 (`TopicTicker.jsx`)**:
   - Continuous marquee pill ticker showcasing key DSA domains (Arrays, DP, Graphs, Trees, Heaps, Sliding Window...).
   - Pauses on hover; disabled under reduced motion.

6. **Magnetic Primary CTA 🧲 (`MagneticButton.jsx`)**:
   - Subtle cursor attraction and squish press feedback.

7. **Connected How-It-Works 🧠 (`ConnectedHowItWorks.jsx`)**:
   - Scroll-linked animated SVG path connecting the 3 preparation steps as the user navigates down the page.

8. **Hero Preview Card with 3D Tilt 💻 (`HeroPreviewCard.jsx`)**:
   - Interactive 3D mouse perspective tilt with realistic dashboard metrics and floating sticker badges.

---

## 🎨 Design System

The shared design system lives in three places:
- `src/styles/tokens.css` defines both themes, typography, brand and rainbow colors, pastel surfaces, hard-stop gradients, glass surfaces, stripes, shadows, radii, and timing tokens.
- `tailwind.config.js` maps those CSS variables to the utility classes used throughout the app.
- `src/styles/motion.js` defines shared interaction and transition presets, including reduced-motion checks.

### Typography
Inter is self-hosted for body and interface text. Space Grotesk is self-hosted for display headings, navigation, and prominent numbers. The root size is 112.5%, body text starts at 1.125rem, and statistics use tabular numerals.

### Color and surfaces
The dark and light themes share the coral, rose, and raspberry wave palette, extended by amber, mint, sky, blue, and violet. `rainbow-1` through `rainbow-8` support topic badges, charts, heatmaps, and progress visuals; the pastel tokens provide paired surfaces and readable text colors. Hard-stop gradients keep the palette crisp. Cards use semantic left stripes, layered shadows, and 12px, 20px, 28px, or pill radii. Glass surfaces use translucent backgrounds and backdrop blur with a solid-surface fallback.

### Accessibility and motion
Focus rings use the theme focus token. Difficulty and status colors remain distinct in both themes. Shared hover and press effects use short transform, opacity, and color changes, and reduced-motion preferences disable movement. The landing page feature and dashboard overviews use responsive asymmetric bento layouts.

The landing dashboard and CLI views are explicitly labeled sample previews. Sample problems enter the app only through the labeled **Load Sample Data** action.

---
## 🛠️ Tech Stack & Credits

- **Core**: React 19, Vite 8, React Router 7
- **Styling**: Tailwind CSS 3, Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **Data Visualization**: Recharts, Custom Canvas Heatmap
- **Motion & Interactions**: `motion/react` (Motion Primitives components adapted to JSX: `TextEffect`, `AnimatedGroup`, `InView`, `AnimatedNumber`, `AnimatedBackground`)
- **Assets**:
  - Layered Waves SVG by [Haikei](https://app.haikei.app/) placed at `public/assets/backgrounds/layered-waves-haikei.svg`.
  - Palette inspired by [Solus Wellness Template](https://www.figma.com/design/lDolpl1EX5FlbBqPupwYWK/Solus-%E2%80%93-Mental-Health---Wellness-Website-Template--Community-?node-id=2003-633&t=AvEcfTONpr0vuHn3-1).

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Run unit tests
npm test

# Run linter
npm run lint

# Build production bundle
npm run build
```
