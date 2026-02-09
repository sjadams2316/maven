import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Portfolio Lab — Deep Analysis & Optimization';
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
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #1e1b4b 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Gradient orbs - purple/scientific theme */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '15%',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
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
            background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
            fontSize: '48px',
            marginBottom: '24px',
          }}
        >
          🧪
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
          Portfolio Lab
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: '#c4b5fd',
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          Advisor-Grade Analysis in Seconds
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '8px',
          }}
        >
          {['Stress Test', 'Optimize', 'What-If', 'Rebalance'].map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'rgba(168, 85, 247, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(168, 85, 247, 0.3)',
              }}
            >
              <span style={{ color: '#e9d5ff', fontSize: '18px' }}>{feature}</span>
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
          mavenwealth.ai/portfolio-lab
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
