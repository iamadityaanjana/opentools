import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import GroupPage from './pages/GroupPage';
import ConvertPage from './pages/ConvertPage';
import { DotsThinking } from './components/Thinking';
import './App.css';

const ToolRunner = lazy(() => import('./pages/ToolRunner'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/image" element={<GroupPage group="image" />} />
      <Route path="/pdf" element={<GroupPage group="pdf" />} />
      <Route path="/tools" element={<Navigate to="/image" replace />} />
      <Route path="/convert" element={<ConvertPage />} />
      <Route
        path="/tools/:toolId"
        element={
          <Suspense fallback={<div className="page page--wide"><div className="loading-panel"><DotsThinking label="Loading tool" /></div></div>}>
            <ToolRunner />
          </Suspense>
        }
      />
    </Routes>
  );
}
