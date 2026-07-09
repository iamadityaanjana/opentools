import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import ConvertPage from './pages/ConvertPage';
import { DotsThinking } from './components/Thinking';
import './App.css';

const ToolRunner = lazy(() => import('./pages/ToolRunner'));
const ColorPickerPage = lazy(() => import('./pages/ColorPickerPage'));
const RgbHexPage = lazy(() => import('./pages/RgbHexPage'));
const RenameImagesPage = lazy(() => import('./pages/RenameImagesPage'));
const BatchRenamePage = lazy(() => import('./pages/BatchRenamePage'));
const LivePhotoPage = lazy(() => import('./pages/LivePhotoPage'));
const WatermarkRemoverPage = lazy(() => import('./pages/WatermarkRemoverPage'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/convert" element={<ConvertPage />} />
      {/* Interactive color tools have dedicated pages (not the generic runner). */}
      <Route
        path="/tools/color-picker"
        element={
          <Suspense fallback={<div className="page page--wide"><div className="loading-panel"><DotsThinking label="Loading tool" /></div></div>}>
            <ColorPickerPage />
          </Suspense>
        }
      />
      <Route
        path="/tools/rgb-hex-converter"
        element={
          <Suspense fallback={<div className="page page--wide"><div className="loading-panel"><DotsThinking label="Loading tool" /></div></div>}>
            <RgbHexPage />
          </Suspense>
        }
      />
      {/* Interactive renaming utilities have dedicated table-based pages. */}
      <Route
        path="/tools/rename-images"
        element={
          <Suspense fallback={<div className="page page--wide"><div className="loading-panel"><DotsThinking label="Loading tool" /></div></div>}>
            <RenameImagesPage />
          </Suspense>
        }
      />
      <Route
        path="/tools/batch-rename"
        element={
          <Suspense fallback={<div className="page page--wide"><div className="loading-panel"><DotsThinking label="Loading tool" /></div></div>}>
            <BatchRenamePage />
          </Suspense>
        }
      />
      {/* Interactive Live Photo / motion-photo extractor (frame scrubbing). */}
      <Route
        path="/tools/live-photo-extractor"
        element={
          <Suspense fallback={<div className="page page--wide"><div className="loading-panel"><DotsThinking label="Loading tool" /></div></div>}>
            <LivePhotoPage />
          </Suspense>
        }
      />
      {/* Interactive manual watermark remover (brush + inpaint canvas editor). */}
      <Route
        path="/tools/remove-watermark-manual"
        element={
          <Suspense fallback={<div className="page page--wide"><div className="loading-panel"><DotsThinking label="Loading tool" /></div></div>}>
            <WatermarkRemoverPage />
          </Suspense>
        }
      />
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
