import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SalesDashboard from './pages/SalesDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/beranda" replace />} />
        <Route path="/beranda" element={<SalesDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
