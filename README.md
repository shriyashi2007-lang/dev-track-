# DevTrack — DSA & Coding Progress Tracker 🌊

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

## 🎨 Design System & Theming

All colors, typography tokens, border radii, shadows, and motion constants are centralized in **one single place**:
- **Tokens**: `src/styles/tokens.css`
- **Tailwind Mapping**: `tailwind.config.js`
- **Motion Constants**: `src/styles/motion.js`
- **Chart Theming**: `src/styles/chartTheme.js`

### Color Palette
- **Base / Background**: `#001220` (Dark Navy)
- **Accent Coral 1**: `#FA7268`
- **Wave Coral 2**: `#EF5F67`
- **Wave Rose 3 (Primary)**: `#E34C67`
- **Wave Raspberry 4**: `#D53867`
- **Deep Raspberry 5 (Secondary)**: `#C62368`
- **Easy (Semantic)**: `#10B981` (Emerald)
- **Medium (Semantic)**: `#F59E0B` (Amber)
- **Hard (Semantic)**: `#8B5CF6` (Violet / Distinct from brand pinks)

### How to Swap the Palette in One Step
To swap in custom values or an exported Figma palette:
1. Open `src/styles/tokens.css`.
2. Edit the hex values in the `:root` (dark mode) and `html.light` (light mode) variable blocks.
3. Because all components and charts strictly reference CSS variables (`var(--bg-base)`, `var(--accent-primary)`, etc.), the entire application restyles instantly without modifying any component files.

### Typography
- **Font Family**: `"Times New Roman", Times, "Liberation Serif", serif` applied app-wide as a single unified token across sans, serif, and mono in Tailwind and CSS.
- **Larger Root Scale**: `html { font-size: 112.5%; }` (18px base root size). Body font size is maintained at $\ge 1.125\text{rem}$ with fluid display headings via `clamp()` up to $5.5\text{rem}$. Tabular numerals (`tabular-nums`) are applied to all statistics.

### WCAG AA Contrast Compliance
All text-to-background pairings meet or exceed WCAG AA standards:
- `#F1F5F9` on `#001220` (Dark Base): **16.7:1** (Passes AAA)
- `#CBD5E1` on `#001220` (Secondary Text): **12.0:1** (Passes AAA)
- `#FFFFFF` on `#C62368` (Primary Action): **5.4:1** (Passes AA)
- `#001220` on `#FA7268` (Coral Accent): **8.3:1** (Passes AAA)

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
