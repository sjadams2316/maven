import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Maven — The Intelligence Layer for Wealth';
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
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1025 50%, #0f172a 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Gradient orbs - investor/serious look */}
        <div
          style={{
            position: 'absolute',
            top: '5%',
            left: '10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90px',
            height: '90px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            fontSize: '50px',
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
            fontSize: '52px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          The Intelligence Layer for Wealth
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '26px',
            background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          Building the Palantir of Wealth Management
        </div>

        {/* Key metrics/features */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            marginTop: '8px',
          }}
        >
          {[
            { label: 'AI-Native', icon: '🧠' },
            { label: 'Continuous Learning', icon: '📈' },
            { label: 'Enterprise Ready', icon: '🏛️' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 24px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ fontSize: '22px' }}>{item.icon}</span>
              <span style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: 500 }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '18px',
            color: '#6b7280',
          }}
        >
          mavenwealth.ai/pitch
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
