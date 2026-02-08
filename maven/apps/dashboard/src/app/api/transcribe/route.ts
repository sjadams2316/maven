import { NextRequest, NextResponse } from 'next/server';

// POST /api/transcribe - Transcribe audio using OpenAI Whisper
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('Whisper: OPENAI_API_KEY not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    
    if (!audioFile) {
      console.error('Whisper: No audio file in request');
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('Whisper: Received file', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
    });

    // Convert to buffer and create a proper file for the API
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Forward to OpenAI Whisper API
    const whisperFormData = new FormData();
    const blob = new Blob([buffer], { type: audioFile.type || 'audio/webm' });
    whisperFormData.append('file', blob, audioFile.name || 'recording.webm');
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'en');

    console.log('Whisper: Sending to OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Whisper API error:', response.status, error);
      return NextResponse.json(
        { error: 'Transcription failed', details: error },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log('Whisper: Success, text length:', result.text?.length || 0);
    
    return NextResponse.json({
      text: result.text,
      success: true
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/transcribe - Check if Whisper is available
export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  return NextResponse.json({
    available: !!apiKey,
    model: 'whisper-1'
  });
}
