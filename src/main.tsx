import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import posthog from 'posthog-js'
import { PostHogErrorBoundary, PostHogProvider } from '@posthog/react'
import './index.css'
import App from './App.tsx'

posthog.init('phc_vXZot4ZwCRjk4o95ThkwxjqWEPbSTeZ3CGuxiJNWkavk', {
  api_host: 'https://t.opentools.fun',
  defaults: '2026-05-30',
  capture_performance: {
    web_vitals: true,
    web_vitals_allowed_metrics: ['FCP', 'LCP', 'CLS', 'INP'],
    web_vitals_delayed_flush_ms: 5000,
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <PostHogErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PostHogErrorBoundary>
    </PostHogProvider>
  </StrictMode>,
)
