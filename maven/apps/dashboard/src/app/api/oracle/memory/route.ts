import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// In-memory store for development (replace with Prisma when DB is ready)
const memoryStore = new Map<string, Map<string, any>>();

interface OracleMemory {
  id: string;
  type: 'preference' | 'fact' | 'goal' | 'concern' | 'style' | 'decision';
  key: string;
  value: string;
  context?: string;
  confidence: number;
  useCount: number;
  source: 'conversation' | 'onboarding' | 'profile' | 'inferred';
  createdAt: string;
  updatedAt: string;
}

function getUserMemories(userId: string): Map<string, OracleMemory> {
  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, new Map());
  }
  return memoryStore.get(userId)!;
}

/**
 * GET /api/oracle/memory - Retrieve all memories for the user
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memories = getUserMemories(userId);
    const memoriesArray = Array.from(memories.values());

    return NextResponse.json({
      memories: memoriesArray,
      count: memoriesArray.length
    });
  } catch (error) {
    console.error('Memory GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve memories' }, { status: 500 });
  }
}

/**
 * POST /api/oracle/memory - Store a new memory
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, key, value, context, source = 'conversation' } = body;

    if (!type || !key || !value) {
      return NextResponse.json({ error: 'type, key, and value are required' }, { status: 400 });
    }

    const memories = getUserMemories(userId);
    const existing = memories.get(key);

    const memory: OracleMemory = {
      id: existing?.id || `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      key,
      value,
      context,
      confidence: existing ? Math.min(1.0, existing.confidence + 0.1) : 0.8,
      useCount: existing ? existing.useCount + 1 : 1,
      source,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memories.set(key, memory);

    return NextResponse.json({ memory, updated: !!existing });
  } catch (error) {
    console.error('Memory POST error:', error);
    return NextResponse.json({ error: 'Failed to store memory' }, { status: 500 });
  }
}

/**
 * DELETE /api/oracle/memory - Remove a memory
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }

    const memories = getUserMemories(userId);
    const deleted = memories.delete(key);

    return NextResponse.json({ deleted, key });
  } catch (error) {
    console.error('Memory DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
  }
}

/**
 * Extract memories from a conversation message
 * Called by the chat API to automatically learn from conversations
 */
export function extractMemories(message: string, response: string): Partial<OracleMemory>[] {
  const memories: Partial<OracleMemory>[] = [];
  const lowerMsg = message.toLowerCase();
  const lowerResp = response.toLowerCase();

  // Detect preferences
  if (lowerMsg.includes('i prefer') || lowerMsg.includes('i like') || lowerMsg.includes('i want')) {
    // Extract what comes after "I prefer/like/want"
    const match = message.match(/i (?:prefer|like|want)\s+(.+?)(?:\.|,|$)/i);
    if (match) {
      memories.push({
        type: 'preference',
        key: `preference_${Date.now()}`,
        value: match[1].trim(),
        context: message,
        source: 'conversation'
      });
    }
  }

  // Detect risk tolerance
  if (lowerMsg.includes('risk') && (lowerMsg.includes('conservative') || lowerMsg.includes('aggressive') || lowerMsg.includes('moderate'))) {
    let tolerance = 'moderate';
    if (lowerMsg.includes('conservative') || lowerMsg.includes('low risk')) tolerance = 'conservative';
    if (lowerMsg.includes('aggressive') || lowerMsg.includes('high risk')) tolerance = 'aggressive';
    
    memories.push({
      type: 'preference',
      key: 'risk_tolerance',
      value: tolerance,
      context: message,
      source: 'conversation'
    });
  }

  // Detect retirement goals
  if (lowerMsg.includes('retire') && (lowerMsg.includes('at') || lowerMsg.includes('by') || lowerMsg.includes('when'))) {
    const ageMatch = message.match(/retire\s+(?:at|by|when\s+i'm)\s+(\d{2})/i);
    if (ageMatch) {
      memories.push({
        type: 'goal',
        key: 'target_retirement_age',
        value: ageMatch[1],
        context: message,
        source: 'conversation'
      });
    }
  }

  // Detect concerns
  if (lowerMsg.includes('worried') || lowerMsg.includes('concerned') || lowerMsg.includes('afraid')) {
    const concernMatch = message.match(/(?:worried|concerned|afraid)\s+(?:about|of|that)\s+(.+?)(?:\.|,|$)/i);
    if (concernMatch) {
      memories.push({
        type: 'concern',
        key: `concern_${Date.now()}`,
        value: concernMatch[1].trim(),
        context: message,
        source: 'conversation'
      });
    }
  }

  // Detect spouse/family info
  if (lowerMsg.includes('my wife') || lowerMsg.includes('my husband') || lowerMsg.includes('my spouse')) {
    const spouseMatch = message.match(/my (?:wife|husband|spouse)(?:'s name is|,?\s+)(\w+)/i);
    if (spouseMatch) {
      memories.push({
        type: 'fact',
        key: 'spouse_name',
        value: spouseMatch[1],
        context: message,
        source: 'conversation'
      });
    }
  }

  // Detect kids
  if (lowerMsg.includes('my kid') || lowerMsg.includes('my child') || lowerMsg.includes('my son') || lowerMsg.includes('my daughter')) {
    memories.push({
      type: 'fact',
      key: 'has_children',
      value: 'true',
      context: message,
      source: 'conversation'
    });
  }

  return memories;
}

/**
 * Format memories for Claude's system prompt
 */
export function formatMemoriesForPrompt(memories: OracleMemory[]): string {
  if (memories.length === 0) return '';

  const grouped: Record<string, OracleMemory[]> = {};
  memories.forEach(m => {
    if (!grouped[m.type]) grouped[m.type] = [];
    grouped[m.type].push(m);
  });

  let prompt = '\n\n## What I Remember About This User\n\n';

  if (grouped.fact) {
    prompt += '**Facts:**\n';
    grouped.fact.forEach(m => {
      prompt += `- ${m.key.replace(/_/g, ' ')}: ${m.value}\n`;
    });
  }

  if (grouped.preference) {
    prompt += '\n**Preferences:**\n';
    grouped.preference.forEach(m => {
      prompt += `- ${m.value}\n`;
    });
  }

  if (grouped.goal) {
    prompt += '\n**Goals:**\n';
    grouped.goal.forEach(m => {
      prompt += `- ${m.key.replace(/_/g, ' ')}: ${m.value}\n`;
    });
  }

  if (grouped.concern) {
    prompt += '\n**Concerns:**\n';
    grouped.concern.forEach(m => {
      prompt += `- ${m.value}\n`;
    });
  }

  prompt += '\nUse this information to personalize responses. Reference these naturally when relevant.\n';

  return prompt;
}
