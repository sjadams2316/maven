# What-If Simulator — Gamification Requirements

*Added by Sam 2026-02-09*

## Core Requirement
Make the What-If Trade Simulator feel engaging, not just informational. Side-by-side comparisons with visual feedback.

## Visual Impact Indicators

### Color Coding
- 🟢 **Green glow/highlight** = Trade improves portfolio health
- 🟡 **Yellow caution** = Neutral or minor concern
- 🔴 **Red warning** = Increases risk significantly

### Trade Grade System
| Grade | Meaning | Visual |
|-------|---------|--------|
| **A+** | Great diversifier, reduces risk | Green badge, celebratory |
| **A** | Good addition, improves allocation | Green |
| **B** | Neutral, maintains profile | Blue/neutral |
| **C** | Caution, increases concentration | Yellow |
| **D** | Warning, significant risk increase | Orange |
| **F** | Dangerous, creates major concentration | Red, pulsing |

### Achievement-Style Callouts
- "🎯 This brings you X% closer to your target allocation!"
- "⚠️ [TICKER] would become X% of your portfolio"
- "💰 Adds $X/year in estimated dividends"
- "📉 Increases portfolio volatility by X%"
- "🏆 Great choice! This improves your diversification score"

## Side-by-Side Comparison
- Current Portfolio (left) vs Hypothetical (right)
- Animated transitions when values change
- Highlight the deltas (what changed)
- Mini pie charts for allocation comparison

## Progress Bars
- Distance to target allocation (before/after)
- Concentration risk meter
- Diversification score

## Implementation Notes
- Build base simulator first with calculations
- Add gamification layer as enhancement pass
- Keep it informative, not just flashy — substance over style
- Test with Power User and Retiree personas (different risk tolerances)

---

*This drives engagement and helps users understand the IMPACT of their decisions, not just the numbers.*
