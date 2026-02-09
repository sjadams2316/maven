import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Maven Oracle — AI Financial Assistant';
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
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #1e3a5f 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Gradient orbs - blue/mystical theme */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '15%',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90px',
            height: '90px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            fontSize: '48px',
            marginBottom: '24px',
          }}
        >
          🔮
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          Maven Oracle
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: '#93c5fd',
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          Ask Anything About Your Finances
        </div>

        {/* Example questions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            marginTop: '8px',
          }}
        >
          {[
            '"Should I do a Roth conversion this year?"',
            '"How exposed am I to a market crash?"',
          ].map((question) => (
            <div
              key={question}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <span style={{ color: '#c7d2fe', fontSize: '18px', fontStyle: 'italic' }}>{question}</span>
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
          mavenwealth.ai/oracle
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
