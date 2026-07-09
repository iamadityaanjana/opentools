import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ConvertPage from './pages/ConvertPage';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/convert" element={<ConvertPage />} />
    </Routes>
  );
}
