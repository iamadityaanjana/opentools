'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { PostHogErrorBoundary, PostHogProvider } from '@posthog/react';
import type { PostHog } from 'posthog-js';

const FALLBACK_KEY = 'phc_vXZot4ZwCRjk4o95ThkwxjqWEPbSTeZ3CGuxiJNWkavk';
const FALLBACK_HOST = 'https://t.opentools.fun';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<PostHog | null>(null);

  useEffect(() => {
    let active = true;
    const start = () => {
      void import('posthog-js').then(({ default: posthog }) => {
        if (!active) return;
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? FALLBACK_KEY, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? FALLBACK_HOST,
          defaults: '2026-05-30',
          capture_performance: {
            web_vitals: true,
            web_vitals_allowed_metrics: ['FCP', 'LCP', 'CLS', 'INP'],
            web_vitals_delayed_flush_ms: 5000,
          },
          person_profiles: 'identified_only',
        });
        setClient(posthog);
      });
    };

    let cancel: () => void;
    if (typeof requestIdleCallback === 'function') {
      const idleId = requestIdleCallback(start, { timeout: 2500 });
      cancel = () => cancelIdleCallback(idleId);
    } else {
      const timeoutId = setTimeout(start, 1200);
      cancel = () => clearTimeout(timeoutId);
    }

    return () => {
      active = false;
      cancel();
    };
  }, []);

  if (!client) return children;

  return (
    <PostHogProvider client={client}>
      <PostHogErrorBoundary>{children}</PostHogErrorBoundary>
    </PostHogProvider>
  );
}
