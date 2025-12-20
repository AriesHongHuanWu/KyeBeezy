import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

// Image metadata
export const alt = 'Kye Beezy | Artist, Producer & Streamer';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

// Fonts
// We'd ideally load a font here, but for now we'll rely on system fonts or basic load
// to ensure it works reliably without complex font fetching setups.

export default async function Image() {
    // Use absolute URL for the image if possible, or simple CSS shapes/gradients if fetching is hard in edge.
    // We'll create a code-based design for reliability.

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
                    backgroundColor: 'black',
                    backgroundImage: 'linear-gradient(to bottom right, #000000, #1a0b2e, #2e1065)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Abstract Background Shapes */}
                <div style={{
                    position: 'absolute',
                    top: '-200px',
                    left: '-200px',
                    width: '600px',
                    height: '600px',
                    background: 'rgba(139, 92, 246, 0.2)', // Purple
                    borderRadius: '50%',
                    filter: 'blur(100px)',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-100px',
                    right: '-100px',
                    width: '500px',
                    height: '500px',
                    background: 'rgba(59, 130, 246, 0.2)', // Blue
                    borderRadius: '50%',
                    filter: 'blur(100px)',
                }} />

                {/* Text Content */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 10 }}>
                    <div style={{ fontSize: 130, fontWeight: 900, color: 'white', letterSpacing: '-0.05em', lineHeight: 1, display: 'flex' }}>
                        KYE BEEZY
                    </div>
                    <div
                        style={{
                            fontSize: 40,
                            fontWeight: 500,
                            color: '#a78bfa', // Purple-400
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            display: 'flex',
                        }}
                    >
                        Artist • Producer • Streamer
                    </div>
                </div>

                {/* URL overlay */}
                <div style={{ position: 'absolute', bottom: 40, fontSize: 24, color: '#6b7280', letterSpacing: '0.1em' }}>
                    kyebeezy.com
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
