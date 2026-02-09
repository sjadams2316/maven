import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Maven — AI Wealth Intelligence Platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '20%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '20%',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            fontSize: '56px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '24px',
          }}
        >
          M
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          Maven
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          AI Wealth Intelligence Platform
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '24px',
            color: '#9ca3af',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Family-office clarity without the complexity
        </div>

        {/* Beta badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(168, 85, 247, 0.2)',
            borderRadius: '20px',
            border: '1px solid rgba(168, 85, 247, 0.3)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#a855f7',
            }}
          />
          <span style={{ color: '#c4b5fd', fontSize: '18px' }}>Private Beta</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
