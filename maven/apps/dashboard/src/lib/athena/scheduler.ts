/**
 * Athena Scheduler
 * Enables autonomous, scheduled intelligence tasks
 * 
 * This is the foundation for:
 * - Daily Pulse (morning portfolio scan)
 * - Tax Alpha (continuous harvesting detection)
 * - Client Pulse (market event reactions)
 * - Proactive alerts
 * 
 * The Scheduler invokes Athena on a schedule, stores results,
 * and triggers notifications when action is needed.
 */

import { classifyAndRoute } from './router';
import { chutesQuery, isChutesConfigured, CHUTES_MODELS } from './providers/chutes';
import { groqQuery, isGroqConfigured } from './providers/groq';

// ============================================================================
// TYPES
// ============================================================================

export type TaskType = 
  | 'daily_pulse'      // Morning portfolio scan
  | 'tax_scan'         // Tax-loss harvesting opportunities
  | 'market_alert'     // React to market movements
  | 'client_check'     // Individual client analysis
  | 'custom';          // Ad-hoc scheduled task

export type TaskPriority = 'low' | 'normal' | 'high' | 'critical';

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ScheduledTask {
  id: string;
  type: TaskType;
  name: string;
  description?: string;
  
  // Scheduling
  cronExpression?: string;  // e.g., "0 6 * * 1-5" (6 AM weekdays)
  runAt?: Date;             // One-time execution
  
  // Execution
  query: string;            // The question/task for Athena
  systemPrompt?: string;    // Custom system prompt
  context?: Record<string, unknown>;  // Additional context (client data, etc.)
  
  // Configuration
  priority: TaskPriority;
  timeoutMs?: number;
  retryCount?: number;
  
  // Notification
  notifyOnComplete?: boolean;
  notifyOnFail?: boolean;
  deliverTo?: string[];     // Email, webhook, etc.
}

export interface TaskResult {
  taskId: string;
  status: TaskStatus;
  startedAt: Date;
  completedAt?: Date;
  
  // Athena response
  response?: string;
  confidence?: number;
  sources?: string[];
  
  // Execution metadata
  provider: string;
  model: string;
  latencyMs: number;
  cost: number;
  
  // Errors
  error?: string;
  retryAttempt?: number;
}

export interface TaskSummary {
  task: ScheduledTask;
  result: TaskResult;
  actionItems?: ActionItem[];
}

export interface ActionItem {
  type: 'call_client' | 'review_portfolio' | 'harvest_loss' | 'rebalance' | 'alert';
  priority: TaskPriority;
  clientId?: string;
  clientName?: string;
  description: string;
  suggestedAction: string;
  deadline?: Date;
}

// ============================================================================
// TASK TEMPLATES
// ============================================================================

/**
 * Pre-built task templates for common use cases
 */
export const TASK_TEMPLATES = {
  /**
   * Daily Pulse - Morning intelligence briefing
   * Scans all portfolios and identifies top priorities
   */
  dailyPulse: (advisorId: string): ScheduledTask => ({
    id: `daily-pulse-${advisorId}-${Date.now()}`,
    type: 'daily_pulse',
    name: 'Daily Pulse',
    description: 'Morning portfolio scan and priority identification',
    cronExpression: '0 6 * * 1-5', // 6 AM weekdays
    query: `
      Scan all client portfolios and identify:
      1. Any positions with >5% drift from target allocation
      2. Tax-loss harvesting opportunities (losses >$1,000)
      3. Concentration risk alerts (single position >15%)
      4. Clients with upcoming life events or meetings
      5. Market movements affecting specific holdings
      
      Output the top 3 clients I should contact today and why.
      Be specific with names, numbers, and recommended talking points.
    `,
    systemPrompt: `You are an AI wealth advisor assistant preparing a morning briefing.
Be concise, actionable, and prioritize by impact. Format for quick scanning.
Include specific dollar amounts and percentages.`,
    priority: 'high',
    timeoutMs: 30000,
    notifyOnComplete: true,
  }),

  /**
   * Tax Scan - Continuous tax-loss harvesting detection
   */
  taxScan: (clientId: string, clientName: string, holdings: unknown[]): ScheduledTask => ({
    id: `tax-scan-${clientId}-${Date.now()}`,
    type: 'tax_scan',
    name: `Tax Scan: ${clientName}`,
    description: 'Check for tax-loss harvesting opportunities',
    query: `
      Analyze these holdings for tax-loss harvesting opportunities:
      ${JSON.stringify(holdings, null, 2)}
      
      For each potential harvest:
      1. Current unrealized loss amount
      2. Wash sale risk (any related purchases in last 30 days?)
      3. Recommended replacement security
      4. Estimated tax savings at 32% bracket
      5. Any reasons NOT to harvest
      
      Only report opportunities with >$500 potential tax savings.
    `,
    systemPrompt: `You are a tax-aware wealth advisor. Be precise with numbers.
Flag wash sale risks prominently. Suggest specific replacement securities.`,
    context: { clientId, clientName, holdings },
    priority: 'normal',
    timeoutMs: 20000,
  }),

  /**
   * Market Alert - React to significant market movements
   */
  marketAlert: (marketData: { symbol: string; change: number; changePercent: number }[]): ScheduledTask => ({
    id: `market-alert-${Date.now()}`,
    type: 'market_alert',
    name: 'Market Movement Alert',
    description: 'Analyze market movement impact on clients',
    query: `
      Market just moved significantly:
      ${marketData.map(m => `${m.symbol}: ${m.changePercent > 0 ? '+' : ''}${m.changePercent.toFixed(2)}%`).join('\n')}
      
      Identify:
      1. Which clients are most exposed to this movement?
      2. Who should I call proactively (historically anxious + high exposure)?
      3. Who can wait (resilient + low exposure)?
      4. Key talking points for affected clients
      
      Prioritize by urgency. I need to act fast.
    `,
    systemPrompt: `You are helping an advisor respond to market volatility.
Speed matters. Be decisive. Prioritize the anxious and exposed clients first.`,
    context: { marketData },
    priority: 'critical',
    timeoutMs: 15000,
    notifyOnComplete: true,
  }),

  /**
   * Client Check - Deep analysis for specific client
   */
  clientCheck: (clientId: string, clientName: string, portfolioData: unknown): ScheduledTask => ({
    id: `client-check-${clientId}-${Date.now()}`,
    type: 'client_check',
    name: `Client Check: ${clientName}`,
    description: 'Comprehensive client portfolio analysis',
    query: `
      Perform a comprehensive analysis of ${clientName}'s portfolio:
      ${JSON.stringify(portfolioData, null, 2)}
      
      Analyze:
      1. Asset allocation vs. target (any drift?)
      2. Risk metrics (concentration, volatility, correlation)
      3. Tax efficiency (harvesting opportunities, lot selection)
      4. Performance attribution (what drove returns?)
      5. Upcoming concerns (dividends, maturities, life events)
      
      Conclude with 3 specific action items I should discuss at our next meeting.
    `,
    systemPrompt: `You are a senior wealth advisor preparing for a client meeting.
Be thorough but concise. Lead with the most important insights.
Quantify everything possible.`,
    context: { clientId, clientName, portfolioData },
    priority: 'normal',
    timeoutMs: 45000,
  }),
};

// ============================================================================
// EXECUTION
// ============================================================================

/**
 * Execute a scheduled task through Athena
 */
export async function executeTask(task: ScheduledTask): Promise<TaskResult> {
  const startTime = Date.now();
  const result: TaskResult = {
    taskId: task.id,
    status: 'running',
    startedAt: new Date(),
    provider: 'unknown',
    model: 'unknown',
    latencyMs: 0,
    cost: 0,
  };

  try {
    // Classify and route the query
    const { classification, routing } = await classifyAndRoute(task.query);
    
    // Select provider based on priority and routing
    let response: string;
    let provider: string;
    let model: string;
    
    if (task.priority === 'critical' && isGroqConfigured()) {
      // Critical tasks use Groq for speed
      provider = 'groq';
      model = 'llama-3.3-70b-versatile';
      response = await groqQuery(task.query, {
        systemPrompt: task.systemPrompt,
        maxTokens: 2048,
      });
    } else if (isChutesConfigured()) {
      // Normal tasks use Chutes for cost
      provider = 'chutes';
      model = routing.primaryPath === 'deep' 
        ? CHUTES_MODELS.reasoning 
        : CHUTES_MODELS.balanced;
      response = await chutesQuery(task.query, {
        model,
        systemPrompt: task.systemPrompt,
        maxTokens: 2048,
      });
    } else {
      throw new Error('No AI provider configured');
    }
    
    const latencyMs = Date.now() - startTime;
    
    // Estimate cost
    const cost = provider === 'groq' ? 0 : 0.0002; // Rough estimate
    
    result.status = 'completed';
    result.completedAt = new Date();
    result.response = response;
    result.provider = provider;
    result.model = model;
    result.latencyMs = latencyMs;
    result.cost = cost;
    result.confidence = classification.confidence;
    result.sources = [provider];
    
  } catch (error) {
    result.status = 'failed';
    result.completedAt = new Date();
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.latencyMs = Date.now() - startTime;
  }
  
  return result;
}

/**
 * Parse task response into action items
 */
export function parseActionItems(response: string, taskType: TaskType): ActionItem[] {
  const items: ActionItem[] = [];
  
  // Simple parsing - look for common patterns
  const lines = response.split('\n');
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Detect call recommendations
    if (lowerLine.includes('call') || lowerLine.includes('contact') || lowerLine.includes('reach out')) {
      // Extract client name if present (simplified)
      const nameMatch = line.match(/(?:call|contact|reach out to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      items.push({
        type: 'call_client',
        priority: lowerLine.includes('urgent') || lowerLine.includes('immediately') ? 'high' : 'normal',
        clientName: nameMatch?.[1],
        description: line.trim(),
        suggestedAction: 'Schedule call',
      });
    }
    
    // Detect tax harvesting
    if (lowerLine.includes('harvest') || lowerLine.includes('tax-loss') || lowerLine.includes('tax loss')) {
      items.push({
        type: 'harvest_loss',
        priority: 'normal',
        description: line.trim(),
        suggestedAction: 'Review and execute harvest',
      });
    }
    
    // Detect rebalancing needs
    if (lowerLine.includes('rebalance') || lowerLine.includes('drift') || lowerLine.includes('allocation')) {
      items.push({
        type: 'rebalance',
        priority: 'normal',
        description: line.trim(),
        suggestedAction: 'Review allocation and rebalance',
      });
    }
  }
  
  return items;
}

/**
 * Format task result for display/notification
 */
export function formatTaskSummary(task: ScheduledTask, result: TaskResult): string {
  if (result.status === 'failed') {
    return `❌ ${task.name} failed: ${result.error}`;
  }
  
  const duration = result.latencyMs > 1000 
    ? `${(result.latencyMs / 1000).toFixed(1)}s` 
    : `${result.latencyMs}ms`;
  
  return `✅ **${task.name}** completed in ${duration}

${result.response}

---
*Provider: ${result.provider} | Cost: $${result.cost.toFixed(4)} | Confidence: ${((result.confidence || 0) * 100).toFixed(0)}%*`;
}

// ============================================================================
// QUEUE MANAGEMENT (Future: Redis-backed)
// ============================================================================

// In-memory queue for now (will move to Redis)
const taskQueue: ScheduledTask[] = [];
const taskResults: Map<string, TaskResult> = new Map();

/**
 * Queue a task for execution
 */
export function queueTask(task: ScheduledTask): string {
  taskQueue.push(task);
  console.log(`[Scheduler] Queued task: ${task.name} (${task.id})`);
  return task.id;
}

/**
 * Get task result
 */
export function getTaskResult(taskId: string): TaskResult | undefined {
  return taskResults.get(taskId);
}

/**
 * Process next task in queue
 */
export async function processNextTask(): Promise<TaskResult | null> {
  const task = taskQueue.shift();
  if (!task) return null;
  
  console.log(`[Scheduler] Processing task: ${task.name} (${task.id})`);
  const result = await executeTask(task);
  taskResults.set(task.id, result);
  
  return result;
}

/**
 * Get queue status
 */
export function getQueueStatus(): { pending: number; completed: number; failed: number } {
  const results = Array.from(taskResults.values());
  return {
    pending: taskQueue.length,
    completed: results.filter(r => r.status === 'completed').length,
    failed: results.filter(r => r.status === 'failed').length,
  };
}
