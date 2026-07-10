import { ImageResponse } from 'next/og';

export const alt = 'opentools — private browser-based image and PDF tools';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f7f5ef',
          color: '#171717',
          padding: '72px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 38, fontStyle: 'italic' }}>opentools…</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', maxWidth: 930, fontSize: 72, lineHeight: 1.05 }}>
            Private image and PDF tools, right in your browser.
          </div>
          <div style={{ display: 'flex', fontSize: 27, color: '#595751' }}>
            No account · local file processing · free to use
          </div>
        </div>
      </div>
    ),
    size,
  );
}
