import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HubPage from './pages/HubPage';
import MathPage from './pages/MathPage';
import EnglishPage from './pages/EnglishPage';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <BrowserRouter basename={base}>
      <Routes>
        <Route path="/" element={<HubPage />} />
        <Route path="/math" element={<MathPage />} />
        <Route path="/english" element={<EnglishPage />} />
        <Route path="/english/:tab" element={<EnglishPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
