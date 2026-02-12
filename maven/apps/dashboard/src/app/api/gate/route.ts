import { NextRequest, NextResponse } from 'next/server';

const SITE_PASSWORD = (process.env.SITE_PASSWORD || 'BanksNavy10').trim();

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password.trim() === SITE_PASSWORD) {
      const response = NextResponse.json({ ok: true });
      response.cookies.set('maven_access', 'authenticated', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        // 30 days
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
