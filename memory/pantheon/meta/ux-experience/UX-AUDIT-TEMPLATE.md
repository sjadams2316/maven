# UX Audit Template

*Standard framework for auditing any Maven page/feature from multiple user perspectives.*

---

## Audit Metadata

```yaml
audit_id: [PAGE]-[DATE]
page_url: 
audit_date: 
auditor: 
personas_tested: []
overall_friction_score: /5
```

---

## Pre-Audit Checklist

Before starting:
- [ ] Clear browser cache/cookies for "new user" testing
- [ ] Test on mobile viewport (375px) AND desktop (1440px)
- [ ] Have persona profiles open for reference
- [ ] Note the time (for performance observations)

---

## Per-Persona Audit Template

Copy this section for each persona tested:

### Persona: [NAME]

**Context reminder:**
- Age: 
- Net worth: 
- Key concerns: 
- Tech comfort: 

#### First Impression (0-10 seconds)

| Question | Answer | Score (1-5) |
|----------|--------|-------------|
| What do they think this page does? | | |
| Is the value proposition clear? | | |
| Do they know what to do next? | | |
| Does it feel "for them"? | | |

#### Clarity Assessment

| Element | Clear? | Confusing Because... | Friction (1-5) |
|---------|--------|----------------------|----------------|
| Main heading | | | |
| Call to action | | | |
| Navigation | | | |
| Data displayed | | | |
| Terminology used | | | |

#### Emotional Response

For this persona, the page makes them feel:
- [ ] Confident
- [ ] Anxious
- [ ] Overwhelmed
- [ ] Empowered
- [ ] Confused
- [ ] Trusting
- [ ] Skeptical

Why: 

#### Task Completion

| Task | Can Complete? | Steps Required | Friction Points |
|------|---------------|----------------|-----------------|
| Primary task | | | |
| Secondary task | | | |
| Find help/support | | | |

#### Missing Elements

What does this persona need that isn't here?
- 
- 
- 

#### Friction Score: /5

*1 = Seamless, 2 = Minor issues, 3 = Noticeable problems, 4 = Significant barriers, 5 = Unusable*

---

## Issue Logging Format

For each issue found, log in this format:

```yaml
issue_id: [PAGE]-[PERSONA_CODE]-[NUMBER]
severity: P0|P1|P2|P3
persona: 
element: 
problem: |
  
impact: |
  
suggested_fix: |
  
screenshot: (if applicable)
```

**Severity Definitions:**
- **P0 (Critical):** Blocks core functionality, causes data loss, or creates legal/compliance risk
- **P1 (High):** Major usability issue affecting many users, significant confusion or frustration
- **P2 (Medium):** Noticeable friction but workarounds exist, affects subset of users
- **P3 (Low):** Minor polish issues, "nice to have" improvements

---

## Persona-Specific Questions

### For New User (Alex Starting)
- Can they understand Maven in 30 seconds?
- Is there a clear "what to do next"?
- Do empty states guide, not confuse?
- Is the path to entering data obvious?

### For Basic User (Jordan Starter)
- Do they feel like Maven is "for them"?
- Are recommendations appropriate for their simple situation?
- Are they overwhelmed by advanced features?
- Do they feel encouraged, not inadequate?

### For Power User (Morgan Maven)
- Is all their data visible and accurate?
- Can they quickly find advanced features?
- Is performance acceptable with lots of data?
- Are cross-account views working?

### For HNW User (Taylor Techstock)
- Is concentration risk prominently flagged?
- Are equity comp specifics handled?
- Is the advice sophisticated enough?
- Do they feel the tool is "premium"?

### For Retiree (Pat Pension)
- Is the UI reassuring, not scary?
- Is text large enough? Contrast good?
- Are retirement-specific features accessible?
- Does language avoid jargon?
- Are warnings balanced with reassurance?

### For Tech Executive (Sam TechExec)
- Are equity comp tools accessible?
- Is the UI efficient for busy executives?
- Can complex scenarios be modeled?
- Is it sophisticated without being cluttered?

### For Advisor (Jamie Advisor)
- Can they see all clients efficiently?
- Is compliance documentation visible?
- Can they prepare for meetings quickly?
- Are bulk operations available?

---

## Mobile-Specific Checklist

- [ ] Touch targets are at least 44x44px
- [ ] Text is readable without zooming
- [ ] Forms don't require horizontal scrolling
- [ ] Navigation is accessible
- [ ] Charts/graphs render properly
- [ ] Loading performance acceptable on 3G

---

## Accessibility Checklist

- [ ] Screen reader announces content logically
- [ ] All interactive elements keyboard accessible
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Focus states visible
- [ ] No reliance on color alone for meaning
- [ ] Alt text for images/charts

---

## Summary Template

After completing all persona audits:

### Overall Assessment

**Total Issues Found:** 
- P0: 
- P1: 
- P2: 
- P3: 

**Average Friction Score:** /5

**Personas Most Affected:** 

**Quick Wins (easy fixes, high impact):**
1. 
2. 
3. 

**Biggest Barriers:**
1. 
2. 
3. 

**Recommended Priority:**
1. 
2. 
3. 

---

*Use this template for every UX audit. Consistency enables tracking improvement over time.*
