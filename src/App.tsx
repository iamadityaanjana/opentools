import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import ConvertPage from './pages/ConvertPage';
import { DotsThinking } from './components/Thinking';
import './App.css';

const ToolRunner = lazy(() => import('./pages/ToolRunner'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/convert" element={<ConvertPage />} />
      <Route
        path="/tools/:toolId"
        element={
          <Suspense fallback={<div className="page page--wide"><div className="loading-panel"><DotsThinking label="Loading tool" /></div></div>}>
            <ToolRunner />
          </Suspense>
        }
      />
      {/* Legacy directory routes now redirect to flagship tools. */}
      <Route path="/image" element={<Navigate to="/convert" replace />} />
      <Route path="/pdf" element={<Navigate to="/tools/images-to-pdf" replace />} />
      <Route path="/tools" element={<Navigate to="/convert" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
