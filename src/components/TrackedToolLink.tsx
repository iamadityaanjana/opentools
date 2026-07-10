'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePostHog } from '@posthog/react';

export function TrackedToolLink({
  href,
  guideSlug,
  toolId,
  children,
}: {
  href: string;
  guideSlug: string;
  toolId: string;
  children: ReactNode;
}) {
  const posthog = usePostHog();
  return (
    <Link
      className="btn btn--dark btn--sm"
      href={href}
      onClick={() => posthog?.capture('guide_tool_clicked', {
        guide_slug: guideSlug,
        tool_id: toolId,
      })}
    >
      {children}
    </Link>
  );
}
