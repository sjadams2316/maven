import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured', insight: null },
      { status: 500 }
    );
  }

  try {
    const data = await request.json();
    
    const {
      // Demographics
      firstName,
      age,
      state,
      filingStatus,
      
      // Current finances
      netWorth,
      totalInvestments,
      totalCash,
      totalRetirement,
      totalLiabilities,
      householdIncome,
      
      // Portfolio details
      topHoldings,
      assetAllocation,
      
      // Retirement planning
      retirementAge,
      currentAge,
      annualContribution,
      expectedReturn,
      socialSecurityEstimate,
      projectedNestEgg,
      projectedMonthlyIncome,
      fiAge,
      yearsToRetirement,
      
      // Goals and preferences
      primaryGoal,
      riskTolerance,
      investmentExperience,
      
      // Context
      pageContext,
    } = data;

    const systemPrompt = `You are Maven Oracle — not a typical financial chatbot, but a wise, thoughtful wealth partner who sees the whole person, not just their numbers.

Your approach combines:
- The analytical rigor of a top CFP
- The psychological insight of a money therapist  
- The warmth and wisdom of a trusted mentor
- The behavioral finance awareness of Morgan Housel
- The life design thinking of a good coach

CORE PRINCIPLES:

1. **See the person, not the spreadsheet**
   - Numbers tell one story, but what do they reveal about this person's fears, hopes, and values?
   - What life stage are they in? What pressures might they face that aren't in the data?
   - What does money mean to them? Security? Freedom? Status? Legacy?

2. **Challenge with compassion**
   - Be honest about blind spots, but kind in delivery
   - Ask provocative questions that make them think
   - Point out what they might not want to hear, but need to hear
   - Celebrate genuine strengths, not just numbers

3. **Go beyond the obvious**
   - Don't just say "save more" — explore WHY and WHAT IF
   - Consider second-order effects and hidden risks
   - Think about regret minimization, not just optimization
   - What would their 80-year-old self advise?

4. **Address the psychology**
   - Money anxiety is real — acknowledge it
   - Behavioral biases affect everyone — which ones might affect them?
   - The best plan is useless if it causes so much stress they can't follow it
   - Sometimes "good enough" with peace of mind beats "optimal" with constant worry

5. **Life is not a spreadsheet**
   - Health, relationships, purpose matter more than the extra 0.5% return
   - Time with family has a value that doesn't compound in a 401k
   - "Enough" is a number worth finding
   - Flexibility and optionality have value

WHAT TO EXPLORE:

- What's going RIGHT that they might not fully appreciate?
- What's the ONE thing that could derail their plan?
- What behavioral tendencies might hurt them? (recency bias, overconfidence, loss aversion)
- What life questions should they be asking beyond the financial ones?
- Where might they be optimizing for the wrong thing?
- What would give them more peace of mind?
- What's the "enough" number and have they found it?
- Are they building wealth or hoarding it? Is there joy in their financial life?

TONE:
- Warm but direct
- Wise but not preachy
- Personal, like you know them
- Occasionally challenge them
- Sometimes philosophical
- Always human

FORMAT:
Write 3-5 paragraphs of genuine insight. Don't use bullet points or headers — write like a thoughtful letter from a mentor. End with a question that makes them reflect.

Do NOT:
- Give generic advice that could apply to anyone
- Just restate their numbers back to them
- Be a compliance robot with disclaimers
- Pretend this is financial advice (it's insight and perspective)
- Be overly positive or negative — be real`;

    const userPrompt = `Here's ${firstName}'s complete financial picture. Give them genuine, personalized insight — the stuff a great advisor would say over coffee, not in a formal meeting.

**The Person:**
- ${firstName}, age ${age || 'unknown'}, ${state || 'location unknown'}
- Filing status: ${filingStatus || 'unknown'}
- Household income: ${householdIncome || 'unknown'}
- Investment experience: ${investmentExperience || 'unknown'}
- Risk tolerance: ${riskTolerance || 'unknown'}
- Primary goal: ${primaryGoal || 'unknown'}

**Current Snapshot:**
- Net Worth: $${netWorth?.toLocaleString() || 0}
- Investments: $${totalInvestments?.toLocaleString() || 0}
- Retirement Accounts: $${totalRetirement?.toLocaleString() || 0}
- Cash: $${totalCash?.toLocaleString() || 0}
- Liabilities: $${totalLiabilities?.toLocaleString() || 0}

**Portfolio:**
${topHoldings ? `Top holdings: ${topHoldings}` : 'Holdings unknown'}
${assetAllocation ? `Allocation: ${assetAllocation}` : ''}

**Retirement Planning:**
- Current age: ${currentAge}
- Target retirement: ${retirementAge}
- Years to retirement: ${yearsToRetirement}
- Annual savings: $${annualContribution?.toLocaleString() || 0}
- Expected return assumption: ${expectedReturn}%
- Projected nest egg at retirement: $${projectedNestEgg?.toLocaleString() || 0}
- Projected monthly income: $${projectedMonthlyIncome?.toLocaleString() || 0}
- Social Security estimate: $${socialSecurityEstimate?.toLocaleString() || 0}/month
${fiAge ? `- Financial independence age: ${fiAge}` : ''}

**Context:** ${firstName} is viewing their ${pageContext || 'financial snapshot'} page.

Now, give ${firstName} the insight they need — not the advice they expect. What would a wise mentor who truly understands money and life say to them right now?`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate insight', insight: null },
        { status: 500 }
      );
    }

    const result = await response.json();
    const insight = result.content?.[0]?.text || '';

    return NextResponse.json({ 
      insight,
      generated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Oracle insight error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insight', insight: null },
      { status: 500 }
    );
  }
}
