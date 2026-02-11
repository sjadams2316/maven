# Oracle Team — Knowledge Base

*AI chat, prompt engineering, context injection, voice*

---

## Domain Ownership

The Oracle team owns:
- `/oracle` page (standalone Oracle)
- `/partners/clients/[id]/oracle` (client-specific Oracle)
- `/api/oracle` route (Claude integration)
- MavenChat component
- Voice input/output functionality

---

## Key Files

```
maven/apps/dashboard/src/app/oracle/page.tsx
maven/apps/dashboard/src/app/partners/clients/[id]/oracle/page.tsx
maven/apps/dashboard/src/app/api/oracle/route.ts
maven/apps/dashboard/src/app/components/MavenChat.tsx
```

---

## Architecture

```
User Input
    ↓
MavenChat component
    ↓
POST /api/oracle
    ↓
Build system prompt (with portfolio context)
    ↓
Call Claude API (Anthropic)
    ↓
Stream response back
    ↓
Display in chat UI
```

---

## System Prompt Structure

```typescript
const systemPrompt = `You are Maven Oracle, an AI wealth advisor.

CLIENT CONTEXT:
- Name: ${clientName}
- Net Worth: ${netWorth}
- Holdings: ${holdingsSummary}
- Risk Profile: ${riskProfile}
- Goals: ${goals}

GUIDELINES:
- Be specific to this client's situation
- Reference their actual holdings by ticker
- Provide actionable insights
- Never make up data
- Disclaim you're not a licensed advisor

CURRENT MARKET:
- Date: ${today}
- Market conditions: ${marketSummary}
`;
```

---

## Critical: Context Injection

**The Oracle MUST have client context.** Without it, responses are generic garbage.

```typescript
// WRONG - no context
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  messages: userMessages,
});

// RIGHT - with context
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  system: buildSystemPrompt(clientData, portfolio),
  messages: userMessages,
});
```

---

## Common Issues & Fixes

### Issue: Oracle gives generic responses
**Root cause:** Client context not injected
**Fix:** Always build system prompt with portfolio data

### Issue: Oracle hallucinates holdings
**Root cause:** Context too vague
**Fix:** Include explicit holdings list with tickers and values

### Issue: Voice doesn't work
**Root cause:** Browser permissions or missing Web Speech API
**Fix:** Check `navigator.mediaDevices`, handle gracefully

### Issue: Responses feel robotic
**Root cause:** System prompt too restrictive
**Fix:** Add personality, allow opinions, encourage conversational tone

---

## Testing Checklist

- [ ] Ask a client-specific question → Response references their holdings
- [ ] Ask about a holding they don't own → Oracle says they don't have it
- [ ] Ask tax question → Response uses their bracket
- [ ] Check voice input works (mic permission)
- [ ] Verify streaming works (tokens appear progressively)

---

## Verification Protocol

**UNIQUE QUESTION TEST:**
Ask something that could NOT be hardcoded:
- "What's my largest holding and should I trim it?"
- "If I sold [specific ticker], what's the tax impact?"
- "Compare my allocation to a standard 60/40"

If the response is contextual and correct → Oracle is working.
If the response is generic → Context injection is broken.

---

## Voice Integration

```typescript
// Speech recognition (input)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = true;

// Speech synthesis (output)
const utterance = new SpeechSynthesisUtterance(text);
utterance.voice = voices.find(v => v.name.includes('Samantha')) || voices[0];
window.speechSynthesis.speak(utterance);
```

---

## Learnings Applied

- **L001:** API routes need proper error handling
- **L003:** Structured error responses with codes
- **L008:** Timeout handling for external APIs
- **L020:** Stream responses for better UX

---

## Integration Points

| Integrates With | How |
|-----------------|-----|
| Portfolio Lab | Can trigger "analyze my portfolio" |
| Tax Intelligence | Can answer tax questions with context |
| Client Portal | Embedded chat (future) |
| Partners | Client-specific Oracle with advisor context |

---

*The Oracle is the crown jewel. It must feel intelligent, not scripted.*
