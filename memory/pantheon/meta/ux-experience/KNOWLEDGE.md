# UX Experience Agent — Knowledge Base

*Last Updated: 2026-02-09*
*Purpose: Continuous UX improvement through persona-based auditing*

---

## Mission

Find friction. Make it seamless.

We are the users' voice inside Maven's development process. We simulate real users encountering real problems and report what's broken, confusing, or could be better.

---

## How to Run UX Audits

### Pre-Audit Setup

1. **Read the persona files** - `maven/test/TEST-PERSONAS.md`
2. **Load the page in a real browser** - Use `browser` tool with `profile="openclaw"`
3. **Test both viewports** - Desktop (1440px) and Mobile (375px)
4. **Clear context** - For "new user" testing, use incognito/fresh session

### Audit Process

1. **First Impression Test (10 seconds)**
   - What do you think this page does?
   - What are you supposed to do next?
   - How does it make you feel?

2. **Per-Persona Walkthrough**
   - Adopt each persona's mindset completely
   - Ask: "What would [persona] find confusing here?"
   - Note friction points, missing elements, emotional responses
   - Score friction 1-5

3. **Task Completion Test**
   - Try the primary action for this page
   - Count steps required
   - Note any dead ends or confusion

4. **Data Integrity Check**
   - Do the numbers add up?
   - Does the visualization match the data?
   - Are insights supported by visible information?

5. **Mobile Check**
   - Resize to 375px viewport
   - Check touch targets, readability, scrolling
   - Verify nothing breaks or overflows

### Post-Audit

1. **Log all issues** using standard format (see template)
2. **Assign severity** (P0-P3) based on impact
3. **Suggest fixes** that are actionable
4. **Update UX-BACKLOG.md** with new issues
5. **Create audit report** in `audits/YYYY-MM-DD-[page].md`

---

## Using Personas Effectively

### The Mindset Shift

Don't just read the persona - **become** the persona:

| Persona | Mindset to Adopt |
|---------|------------------|
| New User | "I've never seen this before. What IS this?" |
| Basic User | "I'm excited but nervous. Am I doing this right?" |
| Power User | "Where's the advanced stuff? Don't waste my time." |
| HNW User | "Is this sophisticated enough for my complex situation?" |
| Retiree | "Is my money safe? Will I run out?" |
| Tech Exec | "I have 5 minutes. Show me what matters." |
| Advisor | "Can I serve my clients efficiently here?" |

### Persona-Specific Questions

**New User (Alex):**
- Can I understand Maven in 30 seconds?
- Is there a clear next step?
- Do empty states help or confuse?

**Basic User (Jordan):**
- Does this feel "for me" or for rich people?
- Am I overwhelmed by advanced features?
- Do I feel encouraged or inadequate?

**Power User (Morgan):**
- Is all my data visible and accurate?
- Can I access advanced features quickly?
- Does performance hold up with lots of data?

**HNW User (Taylor):**
- Is my concentration risk clearly flagged?
- Are tax implications visible?
- Does advice feel sophisticated?

**Retiree (Pat):**
- Is this reassuring or scary?
- Can I read everything comfortably?
- Are retirement-specific features accessible?
- Does it avoid unnecessary jargon?

**Tech Exec (Sam):**
- Can I get key info in 30 seconds?
- Are equity comp tools accessible?
- Is it efficient for busy executives?

**Advisor (Jamie):**
- Can I see all clients efficiently?
- Is compliance documentation visible?
- Can I prepare for meetings quickly?

---

## Prioritization Framework

### Severity Definitions

| Priority | Criteria | Examples |
|----------|----------|----------|
| **P0** | Blocks core functionality, safety/liability risk, data integrity failure | Missing risk warning, broken calculations, security issues |
| **P1** | Major usability issue, affects many users, significant confusion | Misleading visualizations, broken features, confusing navigation |
| **P2** | Noticeable friction, workarounds exist, affects subset | Jargon unexplained, suboptimal defaults, minor UI issues |
| **P3** | Polish, nice-to-have, edge cases | Copy improvements, icon choices, animation timing |

### Prioritization Questions

1. **How many users are affected?** (All > Some > Few)
2. **How severe is the impact?** (Harmful > Confusing > Annoying)
3. **Is there a workaround?** (No > Yes, hard > Yes, easy)
4. **What's the liability risk?** (Legal > Advisory > Reputational > None)

### Quick Win Identification

A quick win is:
- Low effort to fix
- High impact on UX
- No dependencies on other work

Track these separately for fast execution.

---

## Recommended Cadence

### Regular Schedule

| Frequency | Activity |
|-----------|----------|
| **After every deploy** | Quick smoke test of affected pages |
| **Weekly** | Full audit of one major page/feature |
| **Monthly** | Complete audit of critical user flows |
| **Quarterly** | Comprehensive cross-product audit |

### Trigger-Based Audits

Run an audit when:
- New feature launches
- Significant UI change ships
- User complaints spike
- Analytics show drop-off increase
- Before major marketing push

### Priority Order for Audits

1. **Onboarding** - First impression is everything
2. **Dashboard** - Daily touchpoint
3. **Core Features** - Portfolio Lab, Tax Harvesting
4. **Oracle/Chat** - High engagement feature
5. **Settings/Profile** - Low frequency but high frustration potential

---

## Files & Structure

```
memory/pantheon/meta/ux-experience/
├── KNOWLEDGE.md          # This file - how we operate
├── UX-AUDIT-TEMPLATE.md  # Standard template for audits
├── UX-BACKLOG.md         # Prioritized issue list
└── audits/
    ├── 2026-02-09-dashboard.md
    └── [future audits]
```

---

## Integration with Other Teams

### Feeding Dashboard Team
- Issues tagged `DASH-*` go to Dashboard backlog
- Respect layout lock (KNOWLEDGE.md says locked)
- Propose enhancements within structure

### Feeding Dev Agents
- Issues should include suggested fixes
- Link to specific components when possible
- Provide test cases (which persona, what steps)

### Feeding Red Team
- Serious issues (P0) should be flagged for red team review
- Edge cases go to Edge Case Hunter
- UX attacks (confused user paths) logged separately

---

## Anti-Patterns to Avoid

❌ **Theoretical issues** - "This might confuse someone" without evidence
❌ **Personal preference** - "I don't like this color" without user impact
❌ **Scope creep** - "While we're here, let's also redesign..."
❌ **Vague reports** - "The page is confusing" without specifics
❌ **No fix suggested** - Problems without solutions

✅ **Observed friction** - "As [persona], step 3 was unclear because..."
✅ **Data-backed** - "The numbers don't match: shows X, actual is Y"
✅ **Specific elements** - "The 'Tax Harvest' button at line 42..."
✅ **Actionable fixes** - "Add tooltip explaining [term]"
✅ **Persona attribution** - "Found by Retiree persona"

---

## Success Metrics

### Quality Indicators
- Issues found are REAL (not theoretical)
- Issues are ACTIONABLE (clear what to fix)
- Prioritization makes SENSE (P0s are truly critical)
- Framework is REUSABLE (other agents can follow it)

### Tracking Over Time
- Issues found per audit
- Issues resolved per sprint
- Average time-to-fix by priority
- Repeat issues (indicates systemic problems)

---

## Getting Started

If you're a new agent picking up UX work:

1. Read `maven/test/TEST-PERSONAS.md` thoroughly
2. Review recent audits in `audits/` folder
3. Check `UX-BACKLOG.md` for current state
4. Use `UX-AUDIT-TEMPLATE.md` for consistency
5. Start with the highest-priority unaudited page

The goal is simple: **Find the friction. Make it seamless.**

---

*This knowledge base evolves. Update it as we learn what works.*
