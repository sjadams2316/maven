/**
 * Athena Scheduler API
 * 
 * Endpoints for managing and executing scheduled intelligence tasks
 * 
 * POST /api/athena/scheduler - Execute a task
 * GET /api/athena/scheduler - Get queue status
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  executeTask,
  formatTaskSummary,
  parseActionItems,
  getQueueStatus,
  TASK_TEMPLATES,
  type ScheduledTask,
  type TaskType,
} from '@/lib/athena/scheduler';

/**
 * GET - Queue status and available templates
 */
export async function GET() {
  const status = getQueueStatus();
  
  return NextResponse.json({
    status: 'ok',
    queue: status,
    templates: Object.keys(TASK_TEMPLATES),
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST - Execute a scheduled task
 * 
 * Body options:
 * 1. { template: "dailyPulse", advisorId: "..." }
 * 2. { template: "taxScan", clientId: "...", holdings: [...] }
 * 3. { task: { ... full task definition ... } }
 * 4. { query: "...", type: "custom" } - Simple ad-hoc query
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    let task: ScheduledTask;
    
    // Option 1: Use a template
    if (body.template) {
      switch (body.template) {
        case 'dailyPulse':
          task = TASK_TEMPLATES.dailyPulse(body.advisorId || 'default');
          break;
        case 'taxScan':
          if (!body.clientId || !body.holdings) {
            return NextResponse.json(
              { error: 'taxScan requires clientId and holdings' },
              { status: 400 }
            );
          }
          task = TASK_TEMPLATES.taxScan(
            body.clientId,
            body.clientName || 'Client',
            body.holdings
          );
          break;
        case 'marketAlert':
          if (!body.marketData) {
            return NextResponse.json(
              { error: 'marketAlert requires marketData array' },
              { status: 400 }
            );
          }
          task = TASK_TEMPLATES.marketAlert(body.marketData);
          break;
        case 'clientCheck':
          if (!body.clientId || !body.portfolioData) {
            return NextResponse.json(
              { error: 'clientCheck requires clientId and portfolioData' },
              { status: 400 }
            );
          }
          task = TASK_TEMPLATES.clientCheck(
            body.clientId,
            body.clientName || 'Client',
            body.portfolioData
          );
          break;
        default:
          return NextResponse.json(
            { error: `Unknown template: ${body.template}` },
            { status: 400 }
          );
      }
    }
    // Option 2: Full task definition
    else if (body.task) {
      task = body.task as ScheduledTask;
    }
    // Option 3: Simple ad-hoc query
    else if (body.query) {
      task = {
        id: `adhoc-${Date.now()}`,
        type: (body.type as TaskType) || 'custom',
        name: body.name || 'Ad-hoc Query',
        query: body.query,
        systemPrompt: body.systemPrompt,
        priority: body.priority || 'normal',
        timeoutMs: body.timeoutMs || 30000,
      };
    }
    else {
      return NextResponse.json(
        { error: 'Provide template, task, or query' },
        { status: 400 }
      );
    }
    
    // Execute the task
    const result = await executeTask(task);
    
    // Parse action items from response
    const actionItems = result.response 
      ? parseActionItems(result.response, task.type)
      : [];
    
    // Format summary
    const summary = formatTaskSummary(task, result);
    
    return NextResponse.json({
      success: result.status === 'completed',
      task: {
        id: task.id,
        name: task.name,
        type: task.type,
      },
      result: {
        status: result.status,
        response: result.response,
        error: result.error,
        provider: result.provider,
        model: result.model,
        latencyMs: result.latencyMs,
        cost: result.cost,
        confidence: result.confidence,
      },
      actionItems,
      summary,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Scheduler API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
