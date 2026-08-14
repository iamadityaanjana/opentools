import { ImageResponse } from 'next/og';
import { CATEGORY_BY_ID, GROUP_LABEL, TOOLS } from '../../../tools/catalog';
import { getToolPageContent } from '../../../content/tool-page-content';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const STATIC_TOOLS = TOOLS.filter((tool) => tool.status === 'live' && tool.route?.startsWith('/tools/'));

export function generateStaticParams() {
  return STATIC_TOOLS.map((tool) => ({ toolId: tool.id }));
}

export default async function ToolOpenGraphImage({ params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = await params;
  const tool = STATIC_TOOLS.find((item) => item.id === toolId);
  const category = tool ? CATEGORY_BY_ID.get(tool.categoryId) : undefined;
  const groupLabel = category ? GROUP_LABEL[category.group] : 'Tools';
  const name = tool?.name ?? 'opentools';
  const blurb = tool
    ? (tool.blurb ?? getToolPageContent(tool).description)
    : 'Private browser-based file tools.';

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
          padding: '68px 72px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 34, fontStyle: 'italic' }}>opentools…</div>
          <div
            style={{
              display: 'flex',
              padding: '10px 22px',
              border: '2px solid #171717',
              borderRadius: 999,
              fontSize: 24,
            }}
          >
            {groupLabel}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', maxWidth: 1000, fontSize: 84, lineHeight: 1.02, fontWeight: 700 }}>
            {name}
          </div>
          <div style={{ display: 'flex', maxWidth: 940, fontSize: 30, lineHeight: 1.35, color: '#4a4844' }}>
            {blurb.length > 130 ? `${blurb.slice(0, 127)}…` : blurb}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 25, color: '#595751' }}>
          Free · no upload · no sign-up · runs in your browser
        </div>
      </div>
    ),
    size,
  );
}
