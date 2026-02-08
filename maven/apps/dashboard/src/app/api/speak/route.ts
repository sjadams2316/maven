import { NextRequest, NextResponse } from 'next/server';

// Voice options: alloy, echo, fable, onyx, nova, shimmer
const DEFAULT_VOICE = 'nova'; // Warm, professional female voice
const DEFAULT_MODEL = 'tts-1'; // Use tts-1-hd for higher quality

// POST /api/speak - Convert text to speech using OpenAI TTS
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, voice = DEFAULT_VOICE, speed = 1.0 } = body;
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // Limit text length to prevent abuse (OpenAI limit is 4096 chars)
    const truncatedText = text.slice(0, 4000);

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        input: truncatedText,
        voice: voice,
        speed: Math.max(0.25, Math.min(4.0, speed)), // Clamp speed between 0.25 and 4.0
        response_format: 'mp3'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('TTS API error:', error);
      return NextResponse.json(
        { error: 'Speech synthesis failed' },
        { status: 500 }
      );
    }

    // Return audio as binary stream
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}

// GET /api/speak - Check if TTS is available and list voices
export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  return NextResponse.json({
    available: !!apiKey,
    voices: [
      { id: 'nova', name: 'Nova', description: 'Warm, professional female' },
      { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced' },
      { id: 'echo', name: 'Echo', description: 'Warm male' },
      { id: 'fable', name: 'Fable', description: 'Expressive, British' },
      { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative male' },
      { id: 'shimmer', name: 'Shimmer', description: 'Soft, gentle female' },
    ],
    defaultVoice: DEFAULT_VOICE,
    model: DEFAULT_MODEL
  });
}
