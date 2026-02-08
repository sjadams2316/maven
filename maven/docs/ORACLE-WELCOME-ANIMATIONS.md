# Oracle Welcome Experience — Animation Guide

## The Vision
When users first enter demo mode, they should feel like their life is about to change. Not a warning. Not a dashboard. **A moment.**

## Recommended Lottie Animations

### Primary Options (Free)

1. **Magic Crystal Ball** — https://lottiefiles.com/free-animation/magic-crystal-ball-X3bO89Mis6
   - Purple/pink glow, mystical vibe
   - Perfect for Maven Oracle aesthetic

2. **Crystal Ball by Afif** — https://lottiefiles.com/free-animation/crystal-ball-lEoiXwA1GX
   - Classic fortune teller look
   - Swirling energy inside

3. **Magic Ball Loader** — https://lottiefiles.com/9903-magic-ball-loader
   - Animated orb with sparkles
   - Great for loading states too

4. **Crystal Ball by Workerscout** — https://lottiefiles.com/animation/crystal-ball-12457118
   - Professional quality
   - Glowing effects

### Search More
- https://lottiefiles.com/free-animations/orb
- https://lottiefiles.com/free-animations/magic
- https://lottiefiles.com/free-animations/glow-animation
- https://iconscout.com/lottie-animations/magic-orb (14,000+ options)

## Installation

```bash
npm install lottie-react
# or
yarn add lottie-react
```

## Usage in React

```tsx
import Lottie from 'lottie-react';
import crystalBallAnimation from './animations/crystal-ball.json';

function OracleOrb() {
  return (
    <Lottie 
      animationData={crystalBallAnimation}
      loop={true}
      style={{ width: 200, height: 200 }}
    />
  );
}
```

## Custom CSS Orb (Current Implementation)

The `OracleWelcome.tsx` component uses pure CSS/Framer Motion for the orb:
- Gradient background with glow
- Pulsing box-shadow animation
- 🔮 emoji with brightness filter
- Floating particles

This works great and has zero dependencies, but can be enhanced with a Lottie animation for extra polish.

## Welcome Flow Sequence

```
Stage 0: "Welcome" (fade in)
Stage 1: "Your money has been waiting" (dramatic)
Stage 2: "For someone who understands" (building)
Stage 3: "Maven does." (reveal)
Stage 4: Features list (grounding)
Stage 5: CTA button (action)
```

## Alternative Welcome Messages

### Option A (Current): Emotional
- "Your money has been waiting"
- "For someone who understands"
- "Maven does."

### Option B: Transformational
- "What if you could see everything?"
- "Every hidden fee. Every tax opportunity."
- "Every path to your future."

### Option C: Direct Value
- "You're leaving money on the table."
- "$4,000+ in hidden opportunities."
- "Let Maven show you."

### Option D: Mystical
- "The Oracle sees what others miss."
- "Patterns. Opportunities. Your future."
- "Shall we begin?"

## Integration Points

1. **Landing page "Try Demo" button** → Shows OracleWelcome
2. **First-time dashboard visit** → Shows OracleWelcome
3. **Oracle chat first open** → Shorter welcome animation

## Files

- `src/app/components/OracleWelcome.tsx` — Main welcome component
- `public/animations/` — Store Lottie JSON files here
- `src/app/landing/page.tsx` — Wire up the welcome trigger

## Next Steps

1. [ ] Download preferred Lottie animation
2. [ ] Install lottie-react
3. [ ] Replace CSS orb with Lottie (optional)
4. [ ] Wire OracleWelcome to landing page demo button
5. [ ] A/B test different welcome messages
