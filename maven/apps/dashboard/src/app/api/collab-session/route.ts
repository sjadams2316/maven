import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db';

// Generate a human-readable session code
function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars
  let code = 'MAVEN-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET - Fetch session by code or list user's sessions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionCode = searchParams.get('code');
    const sessionId = searchParams.get('id');
    
    // Fetch specific session
    if (sessionCode || sessionId) {
      const session = await prisma.collaborativeSession.findFirst({
        where: sessionCode 
          ? { sessionCode } 
          : { id: sessionId! }
      });
      
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      
      return NextResponse.json(session);
    }
    
    // List user's sessions
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ sessions: [] });
    }
    
    const sessions = await prisma.collaborativeSession.findMany({
      where: {
        OR: [
          { advisorId: user.id },
          { clientId: user.id }
        ],
        status: { not: 'ended' }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    return NextResponse.json({ sessions });
    
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

// POST - Create new session or join existing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, sessionCode, name, role, planningState } = body;
    
    const { userId } = await auth();
    let dbUser = null;
    
    if (userId) {
      dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    }
    
    // Create new session
    if (action === 'create') {
      const code = generateSessionCode();
      
      const session = await prisma.collaborativeSession.create({
        data: {
          sessionCode: code,
          advisorId: dbUser?.id,
          advisorName: name || dbUser?.name || 'Advisor',
          status: 'active',
          planningState: planningState || {
            retirementAge: 65,
            annualContribution: 30000,
            expectedReturn: 7,
            socialSecurityMonthly: 2500,
            socialSecurityStartAge: 67,
            currentAge: 35,
            currentInvestments: 100000
          },
          participants: [{
            id: dbUser?.id || 'host',
            name: name || dbUser?.name || 'Advisor',
            role: 'advisor',
            lastSeen: new Date().toISOString(),
            cursor: null
          }],
          messages: []
        }
      });
      
      return NextResponse.json({ 
        session, 
        sessionCode: code,
        joinUrl: `/collaborate/${code}`
      });
    }
    
    // Join existing session
    if (action === 'join' && sessionCode) {
      const session = await prisma.collaborativeSession.findUnique({
        where: { sessionCode }
      });
      
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      
      if (session.status !== 'active') {
        return NextResponse.json({ error: 'Session is no longer active' }, { status: 400 });
      }
      
      // Add participant
      const participants = session.participants as any[];
      const participantId = dbUser?.id || `guest-${Date.now()}`;
      const participantName = name || dbUser?.name || 'Client';
      
      // Check if already in session
      const existingIndex = participants.findIndex(p => p.id === participantId);
      if (existingIndex >= 0) {
        participants[existingIndex].lastSeen = new Date().toISOString();
      } else {
        participants.push({
          id: participantId,
          name: participantName,
          role: role || 'client',
          lastSeen: new Date().toISOString(),
          cursor: null
        });
      }
      
      const updated = await prisma.collaborativeSession.update({
        where: { id: session.id },
        data: { 
          clientId: dbUser?.id || session.clientId,
          clientName: participantName,
          participants 
        }
      });
      
      return NextResponse.json({ session: updated });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Error in session action:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH - Update session state (real-time sync)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, sessionCode, planningState, message, cursor, participantId } = body;
    
    const session = await prisma.collaborativeSession.findFirst({
      where: sessionId ? { id: sessionId } : { sessionCode }
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    const updates: any = { updatedAt: new Date() };
    
    // Update planning state
    if (planningState) {
      updates.planningState = {
        ...(session.planningState as object),
        ...planningState,
        lastUpdatedBy: participantId,
        lastUpdatedAt: new Date().toISOString()
      };
    }
    
    // Add message
    if (message) {
      const messages = session.messages as any[];
      messages.push({
        ...message,
        timestamp: new Date().toISOString()
      });
      updates.messages = messages;
    }
    
    // Update cursor position
    if (cursor && participantId) {
      const participants = session.participants as any[];
      const idx = participants.findIndex(p => p.id === participantId);
      if (idx >= 0) {
        participants[idx].cursor = cursor;
        participants[idx].lastSeen = new Date().toISOString();
        updates.participants = participants;
      }
    }
    
    // Update participant presence
    if (participantId && !cursor) {
      const participants = session.participants as any[];
      const idx = participants.findIndex(p => p.id === participantId);
      if (idx >= 0) {
        participants[idx].lastSeen = new Date().toISOString();
        updates.participants = participants;
      }
    }
    
    const updated = await prisma.collaborativeSession.update({
      where: { id: session.id },
      data: updates
    });
    
    return NextResponse.json({ session: updated });
    
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

// DELETE - End session
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');
    const sessionCode = searchParams.get('code');
    
    const session = await prisma.collaborativeSession.findFirst({
      where: sessionId ? { id: sessionId } : { sessionCode: sessionCode! }
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    await prisma.collaborativeSession.update({
      where: { id: session.id },
      data: { 
        status: 'ended',
        endedAt: new Date()
      }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
  }
}
