/**
 * Oracle Memory System
 * 
 * Persists conversation context across sessions so Oracle feels like it "knows" the user.
 * 
 * Uses the existing Conversation model in Prisma.
 */

import prisma from '@/lib/db';

// How many recent messages to keep per conversation
const RECENT_HISTORY_LIMIT = 30;

// ============================================================================
// Types
// ============================================================================

export interface OracleMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  topics?: string[];
}

export interface ConversationContext {
  conversationId?: string;
  recentMessages: OracleMessage[];
  allTopics: string[];
  totalConversations: number;
}

// ============================================================================
// Memory Operations
// ============================================================================

/**
 * Start a new conversation or get active one
 */
export async function getOrCreateConversation(
  userId: string,
  title?: string
): Promise<string> {
  try {
    // Check for an active conversation (created in last hour)
    const recentConversation = await prisma.conversation.findFirst({
      where: {
        userId,
        updatedAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (recentConversation) {
      return recentConversation.id;
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: title || 'Oracle Conversation',
        messages: [],
      },
    });

    return conversation.id;
  } catch (error) {
    console.error('Failed to get/create conversation:', error);
    return '';
  }
}

/**
 * Add a message to the conversation
 */
export async function addMessageToConversation(
  conversationId: string,
  message: OracleMessage
): Promise<void> {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) return;

    const messages = (conversation.messages as any[]) || [];
    messages.push(message);

    // Trim to limit
    const trimmed = messages.slice(-RECENT_HISTORY_LIMIT);

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        messages: trimmed,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to add message:', error);
  }
}

/**
 * Get conversation context for Oracle
 */
export async function getConversationContext(
  userId: string
): Promise<ConversationContext> {
  try {
    // Get recent conversations
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    if (conversations.length === 0) {
      return {
        recentMessages: [],
        allTopics: [],
        totalConversations: 0,
      };
    }

    // Combine messages from recent conversations
    const allMessages: OracleMessage[] = [];
    const allTopicsSet = new Set<string>();

    for (const conv of conversations) {
      const messages = (conv.messages as any[]) || [];
      allMessages.push(...messages);

      // Extract topics from messages
      for (const msg of messages) {
        if (msg.topics && Array.isArray(msg.topics)) {
          msg.topics.forEach((t: string) => allTopicsSet.add(t));
        }
      }
    }

    // Sort by timestamp and take recent
    const sortedMessages = allMessages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(-RECENT_HISTORY_LIMIT)
      .reverse();

    return {
      conversationId: conversations[0]?.id,
      recentMessages: sortedMessages,
      allTopics: Array.from(allTopicsSet),
      totalConversations: await prisma.conversation.count({ where: { userId } }),
    };
  } catch (error) {
    console.error('Failed to get conversation context:', error);
    return {
      recentMessages: [],
      allTopics: [],
      totalConversations: 0,
    };
  }
}

/**
 * Extract topics from content (simple stock ticker extraction)
 */
export function extractTopics(content: string): string[] {
  const stockPattern = /\b[A-Z]{1,5}\b/g;
  const matches = content.match(stockPattern) || [];
  
  const commonWords = new Set([
    'THE', 'AND', 'FOR', 'YOU', 'ARE', 'NOT', 'BUT', 'ALL', 'ANY', 'CAN',
    'WAS', 'HAS', 'HAD', 'GET', 'LET', 'USE', 'WHO', 'WHAT', 'WHEN', 'WHERE',
    'WHY', 'HOW', 'THIS', 'THAT', 'WITH', 'FROM', 'THEY', 'BEEN', 'WILL',
    'JUST', 'LIKE', 'MORE', 'VERY', 'SOME', 'INTO', 'THEN', 'SO', 'IF',
    'IT', 'IS', 'ON', 'OR', 'MY', 'I', 'TO', 'OF', 'IN', 'BE', 'BY',
    'US', 'WE', 'ME', 'AT', 'AS', 'DO', 'GO', 'NO', 'UP', 'AM', 'AN',
  ]);
  
  return matches.filter((s) => !commonWords.has(s) && s.length >= 2);
}

/**
 * Build context string for LLM
 */
export function buildConversationContext(context: ConversationContext): string {
  if (context.recentMessages.length === 0) {
    return '';
  }

  const history = context.recentMessages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const topicStr = context.allTopics.length > 0
    ? `\n\n[CONTEXT] Topics this user has asked about: ${context.allTopics.join(', ')}`
    : '';

  const convStr = context.totalConversations > 1
    ? `\n\n[CONTEXT] You've had ${context.totalConversations} conversations with this user.`
    : '';

  return `${history}${topicStr}${convStr}`;
}

/**
 * Quick add user message and get context
 */
export async function quickOracleExchange(
  userId: string,
  userMessage: string
): Promise<{ conversationId: string; context: string; topics: string[] }> {
  const conversationId = await getOrCreateConversation(userId, 'Oracle Conversation');
  const topics = extractTopics(userMessage);

  // Add user message
  await addMessageToConversation(conversationId, {
    role: 'user',
    content: userMessage,
    timestamp: new Date(),
    topics,
  });

  // Get context for response
  const context = await getConversationContext(userId);

  return {
    conversationId,
    context: buildConversationContext(context),
    topics,
  };
}

/**
 * Add assistant response to conversation
 */
export async function completeOracleExchange(
  conversationId: string,
  assistantMessage: string,
  topics?: string[]
): Promise<void> {
  await addMessageToConversation(conversationId, {
    role: 'assistant',
    content: assistantMessage,
    timestamp: new Date(),
    topics,
  });
}

/**
 * Clear old conversations (privacy)
 */
export async function clearOracleHistory(userId: string): Promise<void> {
  try {
    await prisma.conversation.deleteMany({
      where: { userId },
    });
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}
