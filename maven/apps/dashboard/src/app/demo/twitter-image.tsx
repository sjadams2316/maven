import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Maven Demo — Try AI Wealth Intelligence Free';
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
            left: '15%',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: '280px',
            height: '280px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            fontSize: '44px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px',
          }}
        >
          M
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
          Interactive Demo
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: '#10b981',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          Try Maven Free — No Signup Required
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '16px',
          }}
        >
          {['Portfolio Analysis', 'Tax Optimization', 'Risk Insights'].map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span style={{ color: '#10b981', fontSize: '18px' }}>✓</span>
              <span style={{ color: '#d1d5db', fontSize: '18px' }}>{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '20px',
            color: '#6b7280',
          }}
        >
          mavenwealth.ai/demo
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
