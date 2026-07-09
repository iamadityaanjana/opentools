import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ToolsPage from './pages/ToolsPage';
import ConvertPage from './pages/ConvertPage';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/tools" element={<ToolsPage />} />
      <Route path="/convert" element={<ConvertPage />} />
    </Routes>
  );
}
